// services/googleAuthService.js
import { google } from "googleapis";
import crypto from "crypto";
import dotenv from "dotenv";
import logger from "../../../utils/logger.js";
import { GoogleTokens, GoogleOauthPending } from "../models/google.model.js";

dotenv.config();

/**
 * ERROR SEMÁNTICO usado por BaseGoogleService para saber que
 * el flujo requiere que el usuario autorice en Google. (se devuelve authUrl + state).
 */
class AuthRequiredError extends Error {
    constructor(authUrl, state, message = "AUTH_REQUIRED") {
        super(message);
        this.name = "AuthRequiredError";
        this.authUrl = authUrl;
        this.state = state;
    }
}

/**
 * SimpleMutex
 * Mutex simple basado en encadenado de Promises para serializar
 * tareas asíncronas por usuario dentro del mismo proceso.
 */
class SimpleMutex {
    constructor() {
        this._tail = Promise.resolve();
    }

    /**
    * runExclusive(fn)
    * Ejecuta fn() asegurando que no haya ejecuciones concurrentes:
    * - fn puede ser async/Promise-returning.
    * - devuelve la promesa con el resultado de fn.
    */
    runExclusive(fn) {
        const run = async () => {
            try {
                return await fn();
            } catch (e) {
                throw e;
            }
        };
        const result = this._tail.then(run, run);
        // Mantener la cadena incluso si hay rechazo para no romper la queue
        this._tail = result.catch(() => { });
        return result;
    }
}

/**
 * normalizeScopes(scopes)
 * - Acepta: string (espacio-separado), array, o falsy.
 * - Retorna un array único de scopes limpios (sin elementos vacíos).
 */
function normalizeScopes(scopes) {
    if (!scopes) return [];

    // Si viene en string tipo JSON, intenta parsearlo
    if (typeof scopes === "string") {
        try {
            const parsed = JSON.parse(scopes);
            if (Array.isArray(parsed)) scopes = parsed;
            else scopes = [String(scopes)];
        } catch {
            scopes = scopes.split(/\s+/);
        }
    }

    // Asegurar que quede un array limpio
    return Array.from(new Set(scopes.map(s => String(s).trim()).filter(Boolean)));
}

/**
 * unionScopes(a, b)
 * - Une dos arrays de scopes y devuelve una lista única.
 */
function unionScopes(a, b) {
    return Array.from(new Set([...(a || []), ...(b || [])]));
}

/**
 * GoogleAuthService 
 *
 * Responsabilidades (resumen):
 * - Inicializa OAuth2 client por userId (usando refresh_token de DB si existe).
 * - Si no hay refresh válido -> genera authUrl y persiste pending state en DB.
 * - Maneja pendingOps en memoria (operaciones que esperan autorización).
 * - Guarda refresh_token cifrado en GOOGLE_TOKENS.
 *
 * Nota: el mutex es intra-proceso. Para cluster/scale horizontal usar Redlock/Redis.
 */
class GoogleAuthService {
    constructor() {
        // Map userId -> oauth2Client (cached in-memory)
        this.authInstances = new Map();

        // Map userId -> SimpleMutex
        this.mutexes = new Map();

        // Validar llave de cifrado en startup
        this._validateEncryptionKey();

        // Limpiar estados expirados en DB periódicamente (cada 5 min)
        this._pendingStateCleanupInterval = setInterval(
            () => this._cleanupPendingStatesDb(),
            5 * 60 * 1000
        );
    }

    /**
    * _validateEncryptionKey()
    * Verifica que TOKEN_ENC_KEY esté definido y tenga 32 bytes en hex (64 chars).
    * Lanza Error si no es válido.
    */
    _validateEncryptionKey() {
        const keyHex = process.env.TOKEN_ENC_KEY || "";
        if (keyHex.length !== 64) {
            const msg = "TOKEN_ENC_KEY must be 32 bytes hex (64 hex chars)";
            logger.error("googleAuth:cryptoKeyInvalid", { length: keyHex.length, msg });
            throw new Error(msg);
        }
    }

    /** Obtiene/crea el mutex para un userId */
    _getMutex(userId) {
        if (!this.mutexes.has(userId)) this.mutexes.set(userId, new SimpleMutex());
        return this.mutexes.get(userId);
    }

    /** Helper para crear OAuth2 client con redirect configurado */
    _createOAuth2Client() {
        return new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.APP_API_URL}/api/auth/google/callback`
        );
    }

    // ---------- CORE: initialize ----------
    /**
    * initialize(userId, scopes)
    * 
    * Flujo:
    * 1) Si existe instancia cached y es válida -> devolverla.
    * 2) Si hay pending state persistido que cubre los scopes -> lanzar AuthRequiredError con authUrl cached.
    * 3) Si existe pending pero falta scopes -> generar nuevo authUrl (union scopes) y reemplazar pending -> AuthRequiredError.
    * 4) Si hay refresh_token en DB y válido:
    *      - si cumple scopes solicitados -> devolver oauth2Client.
    *      - si faltan scopes -> crear pending con union scopes -> AuthRequiredError.
    * 5) Si no hay token válido -> generar authUrl, persistir pending y lanzar AuthRequiredError.
    *
    * Retorna: oauth2Client si hay token válido; en caso contrario lanza AuthRequiredError.
    */
    async initialize(userId, scopes = []) {
        let reqScopes = normalizeScopes(scopes);

        // Serializamos por usuario en este proceso para evitar refreshes concurrentes
        return await this._getMutex(userId).runExclusive(async () => {
            // 1) instancia cacheada
            //      Si hay instancia cacheada -> comprobar scopes (usar metadata si existe) ---
            const cached = this.authInstances.get(userId);
            if (cached) {
                // Preferimos metadata (de google) en memoria para evitar I/O
                let cachedScopes = normalizeScopes(cached.setCredentials?.scope?.split(/\s+/)) || null;

                if (cachedScopes && reqScopes.every(s => cachedScopes.includes(s))) {
                    try {
                        // getAccessToken() fuerza refresh si es necesario en googleapis
                        await cached.getAccessToken();
                        logger.info("authGoogle:init:cached-valid", { userId });
                        return cached;
                    } catch (err) {
                        logger.warn("authGoogle:init:cached-invalid, clearing", { userId, err: err.message });
                        // continuar a borrar instance
                    }
                } else {
                    // cached existe pero no cubre scopes requeridos 
                    logger.info("authGoogle:init:cached-missing-scopes", { userId, cachedScopes, reqScopes });
                }

                this.authInstances.delete(userId); // eliminar y continuar
            }

            // 2) pending state persistido
            //      si hay pending state persistido para el user -> devolver la misma authUrl
            const existingPending = await GoogleOauthPending.findLatestByUser(userId);
            if (existingPending) {
                // si el pending ya cubre los scopes necesarios -> reuse
                const pendingScopes = normalizeScopes(existingPending.scopes || []);

                if (reqScopes.every(s => pendingScopes.includes(s))) {
                    logger.info("authGoogle:init:using-existing-pending", { userId, state: existingPending.state });
                    // lanzamos AuthRequiredError con authUrl persistido
                    throw new AuthRequiredError(existingPending.auth_url, existingPending.state);
                }

                // falta scopes -> generar nueva authUrl con union y REEMPLAZAR el pending state
                const newScopes = unionScopes(pendingScopes, reqScopes);

                const oauth2ClientTemp = this._createOAuth2Client();

                const newState = crypto.randomBytes(16).toString("hex");
                const newAuthUrl = oauth2ClientTemp.generateAuthUrl({
                    access_type: "offline",
                    scope: newScopes,
                    prompt: "consent select_account",
                    include_granted_scopes: true,
                    state: newState,
                });

                const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
                await GoogleOauthPending.updateForUser({
                    user_id: userId,
                    newState,
                    newAuthUrl,
                    newScopes,
                    newExpiresAt: expiresAt
                });

                logger.info("auth:init:updated-pending-with-union-scopes", { userId, oldState: existingPending.state, newState });
                throw new AuthRequiredError(newAuthUrl, newState);
            }

            // 3) intentar cargar refresh_token + scopes de DB  y validar 
            const savedToken = await this._getRefreshTokenFromDB(userId); // obtener refresh token desencriptado (si existe)
            if (savedToken) {
                const { scopes: savedScopes = [] } = await GoogleTokens.findByUserId(userId);
                const savedScopesNorm = normalizeScopes(savedScopes);
                // Si savedScopes cumplen
                if (reqScopes.every(s => savedScopesNorm.includes(s))) {

                    // construir oauth2Client y setear refresh_token
                    const oauth2Client = this._createOAuth2Client();
                    oauth2Client.setCredentials({ refresh_token: savedToken });

                    try {
                        await oauth2Client.getAccessToken(); // valida refresh_token y genera access_token
                        this.authInstances.set(userId, oauth2Client);
                        logger.info("authGoogle:init:from-db", { userId });
                        return oauth2Client;
                    } catch (err) {
                        logger.warn("authGoogle:init:db-token-invalid", { userId, err: err.message });
                        // continuar al flujo de login (scopes acumulados)
                    }
                }

                // Faltan scopes -> solicitar union
                reqScopes = unionScopes(savedScopesNorm, reqScopes)
                // Continuar al flujo de login con scopes acumulados (include_granted_scopes:true)
            }


            // 4) No hay token válido -> generar authUrl con scopes acumulados y persistir estado en DB
            const oauth2Client = this._createOAuth2Client();

            const state = crypto.randomBytes(16).toString("hex");
            const scopesToRequest = reqScopes.length ? reqScopes : [];
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: "offline",
                scope: scopesToRequest,
                prompt: "consent select_account",
                include_granted_scopes: true,
                state,
            });

            // Persiste el estado para que otras peticiones/instancias puedan leer la misma authUrl
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min de validez
            await GoogleOauthPending.create({
                state,
                user_id: userId,
                auth_url: authUrl,
                scopes: scopesToRequest,
                expires_at: expiresAt
            });

            logger.info("authGoogle:init:authUrl-generated", { userId, state }); // NO loguear authUrl completo en prod
            throw new AuthRequiredError(authUrl, state);
        });
    }

    // ---------- Manejo de callback ----------
    /**
    * handleOAuthCallback(code, state)
    *
    * - Intercambia el code por tokens (getToken).
    * - Guarda refresh_token cifrado en DB si viene.
    * - Borra pending state en DB.
    * - Setea authInstance en memoria y drena pendingOps (operaciones en espera).
    *
    * Retorna: oauth2Client ya configurado.
    */
    async handleOAuthCallback(code, state) {
        // recuperar pending desde DB (por seguridad multi-instancia)
        const pending = await GoogleOauthPending.findByState(state);
        if (!pending) {
            logger.warn("authGoogle:callback:invalid-or-expired-state", { state });
            throw new Error("Estado OAuth inválido o expirado");
        }

        const { user_id: userId } = pending;
        logger.info("authGoogle:callback:start", { userId, state });

        // Crear oauth2Client y obtener tokens
        const oauth2Client = this._createOAuth2Client();

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // determinar granted scopes: prefer tokens.scope, else fallback a pending.scopes
        let grantedScopes = [];
        if (tokens.scope) grantedScopes = normalizeScopes(tokens.scope.split(/\s+/));
        else grantedScopes = normalizeScopes(pending.scopes || []);

        // console.log("SCOPEs-GOOGLE: ", tokens.scope);
        // console.log("SCOPEs-PENDINGSTATE: ", pending.scopes);

        // Guardar refresh_token si existe (puede venir sólo la primera vez)
        if (tokens.refresh_token) {
            await this._saveRefreshTokenToDB(userId, tokens.refresh_token, grantedScopes);
        } else {
            // Si no vino refresh_token, el cliente quizá ya tenía uno; warn para auditoría
            logger.warn("authGoogle:callback:no-refresh-token", { userId });
        }

        // Bloque crítico: setear instancia
        await this._getMutex(userId).runExclusive(async () => {
            this.authInstances.set(userId, oauth2Client);

            // Borrar pending state en DB
            await GoogleOauthPending.deleteByState(state);

            logger.info("authGoogle:callback:set-instance", { userId });
        });

        return oauth2Client;
    }

    // ---------- DB helpers: refresh token encrypt/decrypt ----------

    /**
    * _getRefreshTokenFromDB(userId)
    * - Recupera la fila en GoogleTokens y desencripta el token (AES-256-GCM)
    * - Retorna el refresh token en texto o null si no existe.
    *
    * Observación: actualmente lanza si la desencriptación falla (decipher.final()).
    * Recomendación: podríamos atrapar el error y devolver null para robustez.
    */
    async _getRefreshTokenFromDB(userId) {
        const row = await GoogleTokens.findByUserId(userId);
        if (!row) return null;

        const key = Buffer.from(process.env.TOKEN_ENC_KEY, "hex");
        const iv = Buffer.from(row.iv, "hex");
        const tag = Buffer.from(row.tag, "hex");
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(tag);
        let decrypted = decipher.update(row.token, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }

    /**
    * _saveRefreshTokenToDB(userId, refreshToken)
    * - Cifra refreshToken con AES-256-GCM (iv 12 bytes) y guarda token/iv/tag en DB.
    */
    async _saveRefreshTokenToDB(userId, refreshToken, scopes = []) {
        const key = Buffer.from(process.env.TOKEN_ENC_KEY, "hex");
        const iv = crypto.randomBytes(12); // 12 bytes recommended for AES-GCM
        const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
        let encrypted = cipher.update(refreshToken, "utf8", "hex");
        encrypted += cipher.final("hex");
        const tag = cipher.getAuthTag().toString("hex");

        await GoogleTokens.createOrUpdate({
            user_id: userId,
            token: encrypted,
            iv: iv.toString("hex"),
            tag,
            scopes
        });

        logger.info("authGoogle:token-saved-db", { userId });
    }

    // ----------------- cleanup pending states DB -----------------
    /** Limpia estados expirados en DB */
    async _cleanupPendingStatesDb() {
        try {
            await GoogleOauthPending.cleanupExpired();
            // opcion: logear cuántas filas removidas si quieres monitoreo
        } catch (err) {
            logger.error("authGoogle:cleanup-pending-states-failed", { error: err.message });
        }
    }

    /** Cerrar interval (testing / shutdown) */
    stop() {
        if (this._pendingStateCleanupInterval) clearInterval(this._pendingStateCleanupInterval);
    }

    // ---------- Utility ----------
    /** Forzar limpieza del auth cache para un usuario (serializado) */
    async clearAuthForUser(userId) {
        await this._getMutex(userId).runExclusive(async () => {
            this.authInstances.delete(userId);
        });
    }
}

export { AuthRequiredError };
export default new GoogleAuthService();
