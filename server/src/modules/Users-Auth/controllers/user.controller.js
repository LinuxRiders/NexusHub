import { User } from "../models/user.model.js";
import logger from "../../../utils/logger.js";
import pool from "../../../config/db.js";
import { UserRole } from "../models/rolepermission.model.js";
import { VerificationToken } from '../models/verification.model.js';
import { generateResetToken, hashTokenToBuffer } from '../../../utils/token.js';
import { comparePassword, hashPassword } from '../../../utils/password.js';
import { mailer } from '../../../config/mailer.js';
import eventBus, { EVENTS } from '../../../config/eventBus.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const created_by = req.user?.sub ?? null;

    const existing = await User.findByEmail(email);

    if (existing) {
      logger.warn(
        `UserController:createUser Email already exists: ${username}`
      );
      return res.status(409).json({ error: "Email already exists" });
    }

    const password_hash = await hashPassword(password);
    const userId = await User.create({ username, email, password_hash, created_by });
    const user = await User.findById({id: userId});

    logger.info(`UserController: createUser User created: user_id=${userId}`);
    res.status(201).json({ data: user });
  } catch (error) {
    logger.error(`UserController: createUser Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  const created_by = req.user?.sub ?? null;

  try {
    const users = await User.getAll(true); // : await User.getChildren(created_by); cuando haya hijos de un usuario

    // Obtener roles de todos los usuarios
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const roles = await UserRole.findRolesByUser(user.user_id);
        return { ...user, roles };
      })
    );

    logger.info(`UserController:getAllUsers Retrieved ${usersWithRoles.length} users`);
    res.json({ data: usersWithRoles });
  } catch (error) {
    logger.error(`UserController:getAllUsers Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const includeAdmins = req.query.includeAdmins === 'true';
    
    // Delegar los cálculos de agregación directamente a la base de datos
    const stats = await User.getStats(includeAdmins);

    res.json({
      data: {
        totalUsers: Number(stats.totalUsers) || 0,
        activeUsers: Number(stats.activeUsers) || 0,
        inactiveUsers: Number(stats.inactiveUsers) || 0,
        googleUsers: Number(stats.googleUsers) || 0
      }
    });
  } catch (error) {
    logger.error(`UserController:getUserStats Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};



export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById({id: req.params.id});

    if (!user) {
      logger.warn(`UserController:getUser Not found user_id=${req.params.id}`);
      return res.status(404).json({ error: "User not found" });
    }

    // Obtener los roles del usuario
    const roles = await UserRole.getRolesByUser(user?.user_id);


    // Respuesta con los datos combinados
    res.json({
      data: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        status: user.status,
        roles,
      },
    });
  } catch (error) {
    logger.error(`UserController:getUser Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};


export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById({id: req.params.id});

    if (!user) {
      logger.warn(
        `UserController:updateUser Not found user_id=${req.params.id}`
      );
      return res.status(404).json({ error: "User not found" });
    }

    const updates = {};

    // Si hay una contraseña nueva, actualízala (opcional)
    if (req.body.password) {
      updates.password_hash = await hashPassword(req.body.password);
    }

    // Si hay un nuevo status, actualízalo
    if (req.body.status) {
      updates.status = req.body.status;
    }

    // Agregar validación y actualización para otros campos como username y email
    if (req.body.username) {
      updates.username = req.body.username;
    }
    if (req.body.email) {
      updates.email = req.body.email;
    }

    // Aquí puedes agregar más campos si es necesario (roles, etc.)
    if (Object.keys(updates).length > 0) {
      await User.update({ id: req.params.id, updated_by: req.user?.sub }, updates);
    }

    const updatedUser = await User.findById({id: req.params.id});

    logger.info(
      `UserController:updateUser User updated user_id=${req.params.id}`
    );
    res.json({ data: updatedUser });
  } catch (error) {
    logger.error(`UserController:updateUser Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};


export const deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findById({id});

    if (!user) {
      logger.warn(
        `UserController:deleteUser Not found user_id=${id}`
      );
      return res.status(404).json({ error: "User not found" });
    }

    const deletedRows = await User.softDelete(id);
    if (!deletedRows) return res.status(404).json({ error: "Could not delete" });

    logger.info(`UserController:deleteUser User soft deleted user_id=${id}`);
    res.status(204).json({ message: "User soft deleted successfully" });
  } catch (error) {
    logger.error(`UserController:deleteUser Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

/**
 * Obtiene la información del usuario autenticado
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.sub ?? null; // Asumiendo que el middleware de autenticación pone la info del usuario en req.user

    // fetch con includeUserData = true
    const user = await User.findById({id: userId, includeUserData: true});
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = {
      id: user.user_id,
      username: user.username,
      email: user.email,
      nombres: user.nombres,
      apellidos: user.apellidos,
      telefono: user.telefono,
      pais: user.pais
    };

    logger.info(`UserController:getCurrentUser user_id=${userId}`);
    res.json({ data: userData });
  } catch (error) {
    logger.error(`UserController:getCurrentUser Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

const sendVerificationEmail = async ({
  userId,
  actionType,
  payload,
  expiresInMs,
  req,
  connection,
  toEmail,
  subject,
  templateName,
  verifyTypeParam,
  nombre
}) => {
  await VerificationToken.revokePendingActions(userId, actionType, connection);

  const verifyToken = generateResetToken();
  const tokenHash = hashTokenToBuffer(verifyToken);
  const expiresAt = new Date(Date.now() + expiresInMs);

  await VerificationToken.createVerification({
    user_id: userId,
    action_type: actionType,
    token_hash: tokenHash,
    payload,
    expires_at: expiresAt,
    ip: req.ip,
    user_agent: req.headers['user-agent']
  }, connection);

  const verifyLink = `${process.env.APP_URL}/reset-mail?token=${encodeURIComponent(verifyToken)}${verifyTypeParam ? `&type=${verifyTypeParam}` : ''}`;
  
  await mailer.sendMail({
    toEmail,
    subject,
    templateName,
    variables: {
      nombre,
      verify_url: verifyLink,
      time: Math.round(expiresInMs / 60000),
      anio: new Date().getFullYear()
    },
    inlineImages: [
      { path: 'src/modules/Users-Auth/templates/nexus.png', cid: 'logo' }
    ]
  });
};

export const updateMyProfile = async (req, res, next) => {
  const userId = req.user?.sub ?? null;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { username, email, nombres, apellidos, telefono, pais, currentPassword, newPassword } = req.body;
  
  const userFields = {};
  if (username !== undefined) userFields.username = username;

  const userDataFields = {};
  if (nombres !== undefined) userDataFields.nombres = nombres;
  if (apellidos !== undefined) userDataFields.apellidos = apellidos;
  if (telefono !== undefined) userDataFields.telefono = telefono;
  if (pais !== undefined) userDataFields.pais = pais;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await User.updateProfile({ id: userId, updated_by: userId }, userFields, userDataFields, connection);

    let emailMessage = '';
    let passwordMessage = '';

    if (email || (currentPassword && newPassword)) {
      const baseUser = await User.findById({ id: userId }, connection);
      const currentUser = await User.findByEmail(baseUser.email, connection);

      if (email && currentUser.email !== email) {
        const existingEmail = await User.findByEmail(email, connection);
        if (existingEmail && existingEmail.user_id !== userId) {
          await connection.rollback();
          return res.status(409).json({ error: "El correo electrónico ya está en uso." });
        }

        await sendVerificationEmail({
          userId,
          actionType: 'change_email',
          payload: { new_email: email },
          expiresInMs: 24 * 60 * 60 * 1000,
          req,
          connection,
          toEmail: currentUser.email,
          subject: 'Confirmación de Cambio de Correo Electrónico',
          templateName: 'change-email.template.html',
          nombre: currentUser.username
        });

        emailMessage = ' Se ha enviado un enlace a tu correo actual para confirmar el cambio de dirección.';
      }

      if (currentPassword && newPassword) {
        const match = await comparePassword(currentPassword, currentUser.password_hash);
        if (!match) {
          await connection.rollback();
          return res.status(401).json({ error: "La contraseña actual es incorrecta." });
        }

        const new_password_hash = await hashPassword(newPassword);

        await sendVerificationEmail({
          userId,
          actionType: 'change_password',
          payload: { new_password_hash },
          expiresInMs: 2 * 60 * 60 * 1000,
          req,
          connection,
          toEmail: currentUser.email,
          subject: 'Confirmación de Cambio de Contraseña',
          templateName: 'change-password.template.html',
          verifyTypeParam: 'password',
          nombre: currentUser.username
        });

        passwordMessage = ' Se ha enviado un enlace de confirmación a tu correo para hacer efectivo el cambio de contraseña.';
      }
    }

    await connection.commit();
    logger.info(`UserController:updateMyProfile User updated profile user_id=${userId}`);
    
    // Devolver data fresca
    const updatedUser = await User.findById({id: userId, includeUserData: true});
    
    res.json({ 
      message: `Perfil actualizado correctamente.${emailMessage}${passwordMessage}`, 
      data: {
        id: updatedUser.user_id,
        username: updatedUser.username,
        email: updatedUser.email,
        nombres: updatedUser.nombres,
        apellidos: updatedUser.apellidos,
        telefono: updatedUser.telefono,
        pais: updatedUser.pais
      } 
    });

  } catch (error) {
    await connection.rollback();
    logger.error(`UserController:updateMyProfile Error: ${error.message}`, { stack: error.stack });
    next(error);
  } finally {
    connection.release();
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id; // Obtener el ID del usuario desde los parámetros de la URL

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Obtener información básica del usuario
    const user = await User.findById({id: userId});
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Obtener roles del usuario
    const roles = await UserRole.getRolesByUser(userId);
    const roleNames = roles.map((role) => role.name);


    // Construir la respuesta
    const userData = {
      id: user.user_id,
      username: user.username,
      email: user.email,
      roles: roleNames,
    };

    logger.info(`UserController:getUserById user_id=${userId}`);
    res.json({ data: userData });
  } catch (error) {
    logger.error(`UserController:getUserById Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};


export const updateUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { username, email, status } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Actualizar datos del usuario
    const user = await User.findByIdAndUpdate(userId, { username, email, status }, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    logger.error(`UserController:updateUserById Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

/**
 * Envía un correo a una lista de usuarios (o a todos).
 * Body: { userIds: [1, 2, ...], subject, message }
 */
export const sendUserEmail = async (req, res, next) => {
  const { userIds, subject, message } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "Debes seleccionar al menos un usuario." });
  }

  try {
    // 1. Obtener emails y nombres de los usuarios seleccionados
    const users = await User.findByIds(userIds);

    if (users.length === 0) {
      return res.status(404).json({ error: 'No se encontraron usuarios válidos.' });
    }

    // 2. Enviar correos
    const emailPromises = users.map(user => {

      return mailer.sendMail({
        toEmail: user.email,
        subject: subject || 'Notificación de NexusHub',
        templateName: 'message.template.html',
        variables: {
          username: user.username,
          message_subject: subject || 'Notificación de NexusHub',
          message_body: message ? message.replace(/\n/g, '<br>') : '',
          original_message_html: '',
          action_button: '',
          year: new Date().getFullYear()
        },
        inlineImages: [
          { path: 'src/modules/Users-Auth/templates/nexus.png', cid: 'logo' }
        ]
      }).catch(err => {
        logger.error(`sendUserEmail failed for ${user.email}: ${err.message}`);
        return null;
      });
    });

    await Promise.all(emailPromises);

    // 3. Crear las notificaciones internas de manera desacoplada vía Eventos
    users.forEach(user => {
      eventBus.emit(EVENTS.NOTIFICATION.SEND, {
        user_id: user.user_id,
        title: subject || 'Notificación del Sistema',
        message: message ? message.substring(0, 200) : 'Tienes una nueva notificación de un administrador.',
        notification_type: 'ADMIN_MESSAGE'
      });
    });

    res.status(200).json({
      message: `Mensaje enviado a ${users.length} usuarios.`
    });

  } catch (error) {
    logger.error(`UserController:sendUserEmail Error: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};



