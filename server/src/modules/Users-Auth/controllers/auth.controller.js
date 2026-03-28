import { User } from '../models/user.model.js';
import { RefreshToken } from '../models/token.model.js';
import { VerificationToken } from '../models/verification.model.js';
import { comparePassword, hashPassword } from '../../../utils/password.js';
import { generateRefreshTokenPair, generateResetToken, hashTokenToBuffer, parseDuration } from '../../../utils/token.js';
import logger from '../../../utils/logger.js';
import pool from '../../../config/db.js';
import dotenv from 'dotenv';
import { UserRole } from '../models/rolepermission.model.js';
import { mailer } from '../../../config/mailer.js';
import eventBus, { EVENTS } from '../../../config/eventBus.js';

dotenv.config();

const MAX_REFRESH_COUNT = parseInt(process.env.MAX_REFRESH_COUNT, 10) || 10;

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true si usas HTTPS (debería serlo en prod)
    sameSite: "Lax",
    path: '/',  // scope mínimo
};

/**
 * dataToken(user)
 * - Retorna objeto listo para payload JWT:
 *   {
 *     sub: user_id,
 *     roles: [{ role_id, name }],
 *     permissions: [{ module, action }]
 *   }
 * - Todo en lowercase.
 */
export const dataToken = async (user) => {
    if (!user || !user.user_id) {
        throw new Error('Invalid user for token payload');
    }

    const connection = await pool.getConnection();
    try {
        // No necesitamos transaction para esto; solo lecturas
        // 1) Obtener roles asignados al usuario (roles directos)
        const userRoles = await UserRole.findRolesByUser(user.user_id, connection); // [{ role_id, name, ... }, ...]
        const roles = (userRoles || []).map(r => ({
            role_id: r.role_id,
            name: (String(r.name || '')).toLowerCase()
        }));

        // 2) Obtener permisos por roles en batch (role_ids)
        // const roleIds = userRoles.map(r => r.role_id).filter(Boolean);
        // let permissions = [];

        // if (roleIds.length > 0) {

        //     const permRows = await RolePermission.findByRoles(roleIds, connection); // [{permission_id}, ...]
        //     // Mapear a { module, action } en lowercase y deduplicar
        //     const seen = new Set();
        //     for (const p of permRows) {
        //         const moduleLower = String(p.module || '').toLowerCase();
        //         const actionLower = String(p.action || '').toLowerCase();
        //         const key = `${moduleLower}::${actionLower}`;
        //         if (!seen.has(key) && moduleLower !== '' && actionLower !== '') {
        //             seen.add(key);
        //             permissions.push({ module: moduleLower, action: actionLower });
        //         }
        //     }
        // }

        // Payload JWT
        return {
            sub: user.user_id,
            roles
            // permissions
        };
    } finally {
        connection.release();
    }
};

// =============== CONTROLLERS ================

const VERIFY_EXPIRES_HOURS = 24; // Expiración token verificación email

// ----------------------------------------------------------------------
//   REGISTRO (Enviar correo de verificación)
// ----------------------------------------------------------------------
export const register = async (req, res, next) => {
    const { username, email, password, nombres, apellidos, telefono = null, pais = null } = req.body;
    const connection = await pool.getConnection();

    console.log(email);
    
    try {
        await connection.beginTransaction();
        
        // 1. Verificar existencia
        const existingUser = await User.findByEmail(email, connection);
        if (existingUser) {
            await connection.commit();
            // Si ya existe y está verificado -> Error 409
            // Si existe y NO está verificado -> Podríamos reenviar, pero por seguridad retornamos conflicto
            return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
        }

        // 2. Crear Usuario (PENDING)
        const password_hash = await hashPassword(password);
        const userId = await User.create({
            username,
            email,
            password_hash,
            is_verified: 0, // Explícito
        }, connection);

        // 2.1 Asignar rol "user" por defecto
        await UserRole.assign({ user_id: userId, role_id: 2 }, connection);

        // 2.2 Guardar datos adicionales en userdata
        await User.createUserData({
            user_id: userId,
            nombres,
            apellidos,
            telefono,
            pais
        }, connection);

        // 3. Generar Token
        const verifyToken = generateResetToken(); // String aleatorio (hex)
        const tokenHash = hashTokenToBuffer(verifyToken);
        const expiresAt = new Date(Date.now() + VERIFY_EXPIRES_HOURS * 60 * 60 * 1000);

        // 4. Guardar Token
        await VerificationToken.createVerification({
            user_id: userId,
            action_type: 'verify_account',
            token_hash: tokenHash,
            payload: null,
            expires_at: expiresAt,
            ip: req.ip
        }, connection);

        // 5. Enviar Email
        const verifyLink = `${process.env.APP_URL}/verify-account?token=${encodeURIComponent(verifyToken)}`;

        await mailer.sendMail({
            toEmail: email,
            subject: 'Bienvenido - Verifica tu cuenta',
            templateName: 'verify.template.html', 
            variables: {
                nombre: username,
                verify_url: verifyLink,
                anio: new Date().getFullYear()
            },
            inlineImages: [
                { path: 'src/modules/Users-Auth/templates/nexus.png', cid: 'logo' }
            ]
            // Opcional: Si quieres mandar logo inline
            /*
            inlineImages: [
                { varName: 'logo', path: 'src/assets/logo.png' } 
            ]
            */
        });

        await connection.commit();
        logger.info(`AuthController:register User created id=${userId}, email=${email}`);

        // [Activity Logging (Desacoplado)] Reportamos que ha ingresado un nuevo usuario a un hilo de segundo plano.
        eventBus.emit(EVENTS.AUTH.REGISTERED, { 
            user_id: userId, 
            username, 
            email 
        });

        return res.status(201).json({
            message: 'Usuario registrado. Se ha enviado un enlace de verificación a tu correo.'
        });

    } catch (error) {
        await connection.rollback();
        logger.error(`AuthController:register Error: ${error.message}`, { stack: error.stack });
        next(error);
    } finally {
        connection.release();
    }
};


//  REENVIAR VERIFICACIÓN
// ----------------------------------------------------------------------
export const resendVerificationEmail = async (req, res, next) => {
    const { email } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const user = await User.findByEmail(email, connection);

        // Protección contra Enumeration Attacks: 
        // Si no existe, devolvemos 200 OK igual (o un mensaje genérico).
        if (!user || user.is_verified) {
            await connection.commit();
            // Mensaje ambiguo a propósito
            return res.status(200).json({ message: 'Si el correo es válido y no está verificado, recibirás un nuevo enlace.' });
        }

        // 1. Revocar tokens viejos (CRÍTICO)
        await VerificationToken.revokePendingActions(user.user_id, 'verify_account', connection);

        // 2. Crear nuevo token
        const verifyToken = generateResetToken();
        const tokenHash = hashTokenToBuffer(verifyToken);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await VerificationToken.createVerification({
            user_id: user.user_id,
            action_type: 'verify_account',
            token_hash: tokenHash,
            payload: null,
            expires_at: expiresAt,
            ip: req.ip
        }, connection);

        // 3. Reenviar Email
        const verifyLink = `${process.env.APP_URL}/verify-account?token=${encodeURIComponent(verifyToken)}`;

        await mailer.sendMail({
            toEmail: email,
            subject: 'Reenvío - Verifica tu cuenta',
            templateName: 'verify.template.html',
            variables: {
                nombre: user.username,
                verify_url: verifyLink,
                anio: new Date().getFullYear()
            },
            inlineImages: [
                { path: 'src/modules/Users-Auth/templates/nexus.png', cid: 'logo' }
            ]
        });

        await connection.commit();
        logger.info(`AuthController:resend Resent to email=${email}`);

        return res.status(200).json({ message: 'Si el correo es válido y no está verificado, recibirás un nuevo enlace.' });

    } catch (error) {
        await connection.rollback();
        logger.error(`AuthController:resend Error: ${error.message}`);
        next(error);
    } finally {
        connection.release();
    }
};

export const adminRegister = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        console.log(username);

        const user = await User.findByEmail(email);
        if (user) {
            return res.status(409).json({ error: 'Usuario ya existe' });
        }

        const password_hash = await hashPassword(password);

        const newUser = await User.create({ username, email, password_hash })

        logger.info(`AuthController:register User ${newUser} created`);
        res.status(200).json({ message: 'User Created' });

    } catch (error) {
        logger.error(`AuthController:register Error: ${error.message}`, { stack: error.stack });
        next(error);
    }

}

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Verificar que el usario ya esté verificado o este activo
        if (user.is_verified === 0 || user.status !== 'active') {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const match = await comparePassword(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Generar par de tokens con info generada
        const TokenPair = generateRefreshTokenPair(await dataToken(user));

        // Guardar el refresh token en la base de datos
        await RefreshToken.create({
            user_id: user.user_id,
            token_hash: TokenPair.refreshTokenHash,
            expires_at: TokenPair.expiresAt,
            session_start: TokenPair.sessionStart,
            ip: req.ip,  // ip del usuario
            user_agent: req.headers['user-agent'] // dispositivo del usuario
        });

        logger.info(`AuthController:login User ${user.user_id} logged in, tokens issued`);

        // Enviar refresh en cookie httpOnly
        res.cookie('refresh_token', TokenPair.refreshToken, {
            ...cookieOptions,
            maxAge: TokenPair.expiresAt.getTime() - Date.now(),
        });

        // Enviar access para almacenar en memoria o localStorage
        res.json({ access_token: TokenPair.accessToken });
    } catch (error) {
        logger.error(`AuthController:login Error: ${error.message}`, { stack: error.stack });
        next(error);
    }
};

export const refresh = async (req, res, next) => {
    const { refresh_token } = req.cookies || req.body; // Prefer cookie

    // console.log(refresh_token);

    if (!refresh_token) {
        // logger.warn(`AuthController:refresh Missing refresh_token`);
        return res.status(400).json({ error: 'Missing refresh_token' });
    }
    const refresh_token_hash = hashTokenToBuffer(refresh_token);

    const connection = await pool.getConnection(); // Obtener una conexión de la pool
    try {
        await connection.beginTransaction(); // Iniciar Transaccion

        // Buscar el refresh token en la base de datos
        const storedRefreshToken = await RefreshToken.findByToken(refresh_token_hash, connection);
        if (!storedRefreshToken) {
            // Si llega un token ya revocado → revoca toda la sesión. (reuse detection)
            // const any = await RefreshToken.findByRevokedToken(refresh_token_hash, connection);
            // if (any) await RefreshToken.revokeAllForUser(any.user_id, connection);  // DESACTIVADO POR RACE CONDITION OBLIGADA POR REACT (Envio de dos solicitudes a la vez)

            await connection.commit();
            // logger.warn(`AuthController:refresh Invalid or revoked refresh_token`);
            return res.status(401).json({ error: 'Invalid or revoked refresh token' });
        }

        const user = await User.findById({id: storedRefreshToken.user_id }, connection);
        if (!user) {
            await connection.rollback();
            // logger.warn(`AuthController:refresh User not found for refresh_token`);
            return res.status(404).json({ error: 'User not found' });
        }

        // Verificar la vigencia de la sesión
        const storedSessionStart = storedRefreshToken.session_start;
        const sessionMaxAge = parseDuration(process.env.JWT_SESSION_MAX_AGE); // convierte en ms
        if (Date.now() - storedSessionStart.getTime() > sessionMaxAge) {
            // La sesión ha excedido el tiempo máximo permitido
            await RefreshToken.revoke(refresh_token_hash, connection);

            await connection.commit();
            logger.warn(`AuthController:refresh Session expired for user_id=${user.user_id}`);
            return res.status(401).json({ error: 'Session expired. Please login again.' });
        }

        // Verificar el límite de renovaciones
        if (storedRefreshToken.refresh_count >= MAX_REFRESH_COUNT) {
            // Excedió el número máximo de renovaciones
            await RefreshToken.revoke(refresh_token_hash, connection);

            await connection.commit();
            logger.warn(`AuthController:refresh Maximum refresh attempts exceeded for user_id=${user.user_id}`);
            return res.status(401).json({ error: 'Maximum session renewals exceeded. Please login again.' });
        }

        // Rotar refresh token: revocar el viejo, crear uno nuevo
        const newTokenPair = generateRefreshTokenPair(await dataToken(user)); // Generar nuevo par de tokens con info generada

        // Crear nuevo refresh token con refresh_count incrementado
        await RefreshToken.create({
            user_id: user.user_id,
            token_hash: newTokenPair.refreshTokenHash,
            expires_at: newTokenPair.expiresAt,
            session_start: storedSessionStart, // Mantener Session Start anterior
            refresh_count: storedRefreshToken.refresh_count + 1,
            ip: req.ip,
            user_agent: req.headers['user-agent']
        }, connection);

        // Revocar el refresh token antiguo
        await RefreshToken.revoke(refresh_token_hash, connection);

        // Confirmar la transacción si todo es exitoso
        await connection.commit();

        logger.info(`AuthController:refresh Tokens refreshed for user_id=${user.user_id}`);


        res.cookie('refresh_token', newTokenPair.refreshToken, {
            ...cookieOptions,
            maxAge: newTokenPair.expiresAt.getTime() - Date.now(),
        });
        res.json({ access_token: newTokenPair.accessToken });
    } catch (error) {
        // Si ocurre un error, revertimos la transacción
        await connection.rollback();

        logger.error(`AuthController:refresh Error: ${error.message}`, { stack: error.stack });
        next(error);
    } finally {
        connection.release(); // Liberar la conexión
    }
};

export const logout = async (req, res, next) => {
    const { refresh_token } = req.cookies || req.body; // Prefer cookie
    const refresh_token_hash = hashTokenToBuffer(refresh_token);

    try {
        if (!refresh_token) {
            // logger.warn(`AuthController:logout Missing refresh_token`);
            return res.status(400).json({ error: 'Missing refresh_token' });
        }

        const storedToken = await RefreshToken.findByToken(refresh_token_hash);
        if (!storedToken) {
            // Si llega un token ya revocado → revoca toda la sesión. (reuse detection)
            // const any = await RefreshToken.findByRevokedToken(refresh_token_hash);
            // if (any) await RefreshToken.revokeAllForUser(any.user_id);

            logger.warn(`AuthController:logout Attempt to revoke a non-existent or already revoked token`);
            return res.status(401).json({ error: 'Logout Attempt to revoke a non-existent or already revoked token.' });
        }

        // Revocar el refresh token
        await RefreshToken.revoke(refresh_token_hash);
        logger.info(`AuthController:logout Refresh token revoked: ${refresh_token}`);

        // Limpiar Cookie 
        res.clearCookie('refresh_token', { path: '/' });
        res.status(204).json({ message: 'Logged out successfully' });
    } catch (error) {
        logger.error(`AuthController:logout Error: ${error.message}`, { stack: error.stack });
        next(error);
    }
};

// --------------- RECUPERACION DE CONTRASEÑAS -------------------

// Token aleatorio opaco, hasheado en BD, con expiración corta y uso único.
const RESET_EXPIRES_MIN = Number(process.env.RESET_EXPIRES_MIN || 10);

// Solicitud para cambiar Contraseña (tambien para reenvía email)
export const requestPasswordReset = async (req, res, next) => {
    const { email } = req.body;
    const generic = { message: 'Si existe una cuenta asociada, recibirás un correo con instrucciones.' };

    // if (!email) return res.status(200).json(generic); // Devolver Generic Message al validar (express-validator) Protección contra enumeration

    const connection = await pool.getConnection(); // Obtener una conexión de la pool
    try {
        await connection.beginTransaction(); // Iniciar Transaccion

        // BUSCAR USUARIO 
        const user = await User.findByEmail(email, connection);
        if (!user) {
            await connection.commit();
            return res.status(200).json(generic);
        }

        const userId = user.user_id;

        // Revocar tokens anteriores (si existen)
        await VerificationToken.revokePendingActions(userId, 'reset_password', connection);

        // Generar token y guardar hash
        const reset_token = generateResetToken();
        const tokenHash = hashTokenToBuffer(reset_token);
        const expiresAt = new Date(Date.now() + RESET_EXPIRES_MIN * 60 * 1000);

        await VerificationToken.createVerification({
            user_id: userId,
            action_type: 'reset_password',
            token_hash: tokenHash,
            payload: null,
            expires_at: expiresAt,
            ip: req.ip,
            user_agent: req.headers['user-agent'] || null
        }, connection);

        // ===== Enviar Email  (token crudo en link) ===== TODO: Arreglar servicio email
        const resetLink = `${process.env.APP_URL}/reset-password?token=${encodeURIComponent(reset_token)}`;
        await mailer.sendMail({
            toEmail: email,
            subject: 'Recuperación de Contraseña',
            templateName: 'recover.template.html',
            variables: {
                nombre: user.username,
                reset_url: resetLink,
                time: RESET_EXPIRES_MIN,
                anio: new Date().getFullYear()
            },
            inlineImages: [
                { path: 'src/modules/Users-Auth/templates/nexus.png', cid: 'logo' }
            ]
        });

        // Confirmar la transacción si todo es exitoso
        await connection.commit();

        // logger.info(`AuthController:requestPasswordReset send to: ${email}`);  // Quitar ruido de logs  
        return res.status(200).json(generic); // Protección contra enumeration (no revelar nada al responder, en rutas publicas)
    } catch (error) {
        // Si ocurre un error, revertimos la transacción
        await connection.rollback();

        logger.error(`AuthController:requestPasswordReset Error: ${error.message}`, { stack: error.stack });
        return res.status(200).json(generic); // respuesta genérica
    } finally {
        connection.release(); // Liberamos la conexion
    }
};

// Cambiar Contraseña verificando autenticidad
export const resetPassword = async (req, res, next) => {
    const { token, newPassword } = req.body;

    const tokenHash = hashTokenToBuffer(token);

    const connection = await pool.getConnection(); // Obtener una conexión de la pool
    try {
        await connection.beginTransaction(); // Iniciar Transaccion

        // Buscar token válido primero
        const tokenRow = await VerificationToken.findValidToken(tokenHash, 'reset_password', connection);
        if (!tokenRow) {
            // intento de uso de token inválido
            await connection.commit();
            logger.warn(`AuthController:resetPassword Invalid or used token`);
            return res.status(400).json({ error: 'Token Reset inválido o expirado.' });
        }
        
        const userId = tokenRow.user_id;

        // Verificar expiración
        if (new Date(tokenRow.expires_at).getTime() <= Date.now()) {
            await VerificationToken.markAsUsed(tokenRow.verification_id, connection);

            await connection.commit();
            return res.status(400).json({ error: 'Token expirado.' });
        }

        // ---------- CAMBIO DE CONTRASEÑA ------------

        // Hashear nueva contraseña y actualizar en BD, Activar usuario si es que no lo estaba
        const password_hash = await hashPassword(newPassword);
        await User.update({ id: userId, updated_by: null }, { password_hash: password_hash, password_changed_at: new Date() }, connection);

        // Invalidar tokens: 
        await RefreshToken.revokeAllForUser(userId, connection);
        await VerificationToken.markAsUsed(tokenRow.verification_id, connection);
        await VerificationToken.revokePendingActions(userId, 'reset_password', connection);

        // Logout global: revocar todos los refresh tokens para el usuario
        // (usa tu modelo RefreshToken que ya tiene revokeAllForUser)
        await RefreshToken.revokeAllForUser(userId, connection);

        // Confirmar la transacción si todo es exitoso
        await connection.commit();

        // Notificación (no bloquear respuesta si falla)
        // sendResetNotificationEmail(email).catch(e => logger.error(`AuthController:resetPassword notify mail failed: ${e.message}`, { stack: e.stack }));

        logger.info(`AuthController:resetPassword Password changed for user_id=${userId}`);
        return res.status(200).json({ message: 'Contraseña cambiada correctamente.' });
    } catch (error) {
        // Si ocurre un error, revertimos la transacción
        await connection.rollback();

        logger.error(`AuthController:resetPassword Error: ${error.message}`, { stack: error.stack });
        next(error);
    } finally {
        connection.release(); // Liberamos la conexion
    }
};

// HELPERS PARA ACCIONES ESPECÍFICAS
const handleVerifyAccount = async (tokenRow, connection) => {
    const user = await User.findById({ id: tokenRow.user_id }, connection);
    if (!user) throw new Error("Usuario no encontrado");
    if (user.is_verified) return { message: 'Tu cuenta ya está verificada. Puedes iniciar sesión.' };

    await User.update({ id: tokenRow.user_id, updated_by: null }, { is_verified: 1 }, connection);
    return { message: '¡Cuenta verificada con éxito! Ya puedes iniciar sesión.' };
};

const handleChangeEmail = async (tokenRow, connection) => {
    const { new_email } = tokenRow.payload || {};
    if (!new_email) throw new Error("Datos de actualización corruptos.");

    const existingEmail = await User.findByEmail(new_email, connection);
    if (existingEmail && existingEmail.user_id !== tokenRow.user_id) {
        throw new Error("El nuevo correo ya está en uso. Solicitud cancelada.");
    }

    await User.update({ id: tokenRow.user_id, updated_by: null }, { email: new_email }, connection);
    
    await RefreshToken.revokeAllForUser(tokenRow.user_id, connection);
    
    return { message: 'El cambio de correo se ha confirmado con éxito. Por favor inicia sesión.' };
};

const handleChangePassword = async (tokenRow, connection) => {
    const { new_password_hash } = tokenRow.payload || {};
    if (!new_password_hash) throw new Error("Datos de actualización corruptos.");

    await User.update({ id: tokenRow.user_id, updated_by: null }, { password_hash: new_password_hash, password_changed_at: new Date() }, connection);
    
    await RefreshToken.revokeAllForUser(tokenRow.user_id, connection);
    
    return { message: 'Tu nueva contraseña se ha guardado exitosamente. Por favor inicia sesión.' };
};

// ----------------------------------------------------------------------
//  ACCIÓN DE VERIFICACIÓN GENÉRICA (e.g. Cambio de Email)
// ----------------------------------------------------------------------
export const verifyAction = async (req, res, next) => {
    const { token, action_type } = req.query; // Esperamos ?token=...&action_type=...
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const tokenHash = hashTokenToBuffer(token);
        const tokenRow = await VerificationToken.findValidToken(tokenHash, action_type, connection);

        if (!tokenRow) {
            await connection.commit();
            return res.status(400).json({ error: 'El enlace es inválido o ha expirado.' });
        }

        if (new Date(tokenRow.expires_at).getTime() <= Date.now()) {
            await VerificationToken.markAsUsed(tokenRow.verification_id, connection);
            await connection.commit();
            return res.status(400).json({ error: 'El enlace es inválido o ha expirado.' });
        }

        let resultMessage = { message: 'Acción completada con éxito.' };

        // EJECUTAR ACCIÓN SEGÚN TIPO 
        switch (action_type) {
            case 'verify_account':
                resultMessage = await handleVerifyAccount(tokenRow, connection);
                break;
            case 'change_email':
                resultMessage = await handleChangeEmail(tokenRow, connection);
                break;
            case 'change_password':
                resultMessage = await handleChangePassword(tokenRow, connection);
                break;
            default:
                await connection.rollback();
                return res.status(400).json({ error: 'Acción no soportada.' });
        }

        // Marcar token usado
        await VerificationToken.markAsUsed(tokenRow.verification_id, connection);

        await connection.commit();
        logger.info(`AuthController:verifyAction Success for action_type=${action_type}, user_id=${tokenRow.user_id}`);

        return res.status(200).json(resultMessage);
    } catch (error) {
        await connection.rollback();
        logger.error(`AuthController:verifyAction Error: ${error.message}`);
        next(error);
    } finally {
        connection.release();
    }
};