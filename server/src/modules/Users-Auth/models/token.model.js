import pool from '../../../config/db.js';
import logger from '../../../utils/logger.js';

export const RefreshToken = {
    // Crea un registro con token_hash (binario)
    create: async ({ user_id, token_hash, expires_at, session_start, refresh_count = 0, ip = null, user_agent = null }, connection = pool) => {
        try {
            const [result] = await connection.execute(
                'INSERT INTO REFRESH_TOKEN (user_id, token_hash, expires_at, session_start, refresh_count, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [user_id, token_hash, expires_at, session_start, refresh_count, ip, user_agent]
            );
            return result.insertId;
        } catch (error) {
            logger.error(`[Model]:RefreshToken:create Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    // Busca token revokado para reuse detection
    findByRevokedToken: async (token_hash, connection = pool) => {
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM REFRESH_TOKEN WHERE token_hash = ? AND revoked_at IS NOT NULL LIMIT 1',
                [token_hash]
            );
            return rows[0] || null;
        } catch (error) {
            logger.error(`[Model]:RefreshToken:findByRevokedToken Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    // Busca un token válido por hash (no revocado y no expirado) con bloqueo FOR UPDATE
    findByToken: async (token_hash, connection = pool) => {
        try {
            const [rows] = await connection.execute(
                `SELECT * 
                FROM REFRESH_TOKEN 
                WHERE token_hash = ? 
                AND revoked_at IS NULL 
                AND expires_at > NOW() 
                LIMIT 1
                FOR UPDATE`,  // 🔒 bloquea la fila mientras dure la transacción (EVITAR RACE CONDITION) (React lanza dos peticiones a la vez - por eso se detecto el race condition)
                [token_hash]
            );
            return rows[0] || null;
        } catch (error) {
            logger.error(`[Model]:RefreshToken:findByToken Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    // Marca como revocado
    revoke: async (token_hash, connection = pool) => {
        try {
            await connection.execute(
                'UPDATE REFRESH_TOKEN SET revoked_at = NOW() WHERE token_hash = ?',
                [token_hash]
            );
        } catch (error) {
            logger.error(`[Model]:RefreshToken:revoke Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    // Revoca todos de un usuario
    revokeAllForUser: async (user_id, connection = pool) => {
        try {
            await connection.execute(
                'UPDATE REFRESH_TOKEN SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL',
                [user_id]
            );
        } catch (error) {
            logger.error(`[Model]:RefreshToken:revokeAllForUser Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    countValidTokensForUser: async (user_id, session_start, connection = pool) => {
        try {
            const [rows] = await connection.execute(
                'SELECT COUNT(*) as count FROM REFRESH_TOKEN WHERE user_id = ? AND revoked_at IS NULL AND expires_at > NOW() AND session_start = ?',
                [user_id, session_start]
            );
            return rows[0].count;
        } catch (error) {
            logger.error(`[Model]:RefreshToken:countValidTokensForUser Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }
};


export const AccountVerification = {
    // Crear el registro del token
    create: async ({ user_id, token_hash, expires_at, ip = null }, connection = pool) => {
        try {
            const sql = `
                INSERT INTO account_verifications (user_id, token_hash, expires_at, ip)
                VALUES (?, ?, ?, ?)
            `;
            // token_hash debe ser un Buffer aquí
            const [result] = await connection.execute(sql, [user_id, token_hash, expires_at, ip]);
            return result.insertId;
        } catch (error) {
            logger.error(`[Model]:AccountVerification:create Error: ${error.message}`);
            throw error;
        }
    },

    // Buscar un token válido (Que coincida hash, usuario y NO esté usado)
    findValidByHash: async (user_id, token_hash, connection = pool) => {
        try {
            const sql = `
                SELECT * FROM account_verifications 
                WHERE user_id = ? 
                  AND token_hash = ? 
                  AND used = 0 
                LIMIT 1
            `;
            const [rows] = await connection.execute(sql, [user_id, token_hash]);
            return rows[0] || null;
        } catch (error) {
            logger.error(`[Model]:AccountVerification:findValidByHash Error: ${error.message}`);
            throw error;
        }
    },

    // Marcar como usado (En lugar de borrar, para mantener auditoría)
    markAsUsed: async (verification_id, connection = pool) => {
        try {
            const sql = `UPDATE account_verifications SET used = 1 WHERE verification_id = ?`;
            await connection.execute(sql, [verification_id]);
        } catch (error) {
            logger.error(`[Model]:AccountVerification:markAsUsed Error: ${error.message}`);
            throw error;
        }
    },

    /**
     * Invalida todos los tokens previos de un usuario.
     * Útil cuando el usuario pide reenviar el correo.
     */
    revokeAllForUser: async (user_id, connection = pool) => {
        try {
            // Opción A: Borrarlos físicamente (Más limpio)
            const sql = `DELETE FROM account_verifications WHERE user_id = ?`;

            // Opción B: Marcarlos como usados (Mejor auditoría)
            // const sql = `UPDATE account_verifications SET used = 1 WHERE user_id = ? AND used = 0`;

            await connection.execute(sql, [user_id]);
        } catch (error) {
            logger.error(`[Model]:AccountVerification:revokeAllForUser Error: ${error.message}`);
            throw error;
        }
    },

    // (Opcional) Borrar tokens expirados o viejos (Mantenimiento)
    delete: async (verification_id, connection = pool) => {
        try {
            await connection.execute('DELETE FROM account_verifications WHERE verification_id = ?', [verification_id]);
        } catch (error) { throw error; }
    }
};


/**
 * Modelo para manejar tokens de reset de contraseña (token opaco + hash en BD).
 */
export const PasswordReset = {
    /**
     * Crea un registro de password reset.
     * @param {object} param0
     * @param {number} param0.user_id
     * @param {binary} param0.token_hash  // SHA-256 hex (o el formato que uses)
     * @param {Date|string} param0.expires_at
     * @param {string|null} param0.ip
     * @param {string|null} param0.user_agent
     * @param {object} connection (opcional) - conexión o pool
     * @returns {number} insertId
     */
    create: async ({ user_id, token_hash, expires_at, ip = null, user_agent = null }, connection = pool) => {
        try {
            const [result] = await connection.execute(
                `INSERT INTO password_reset (user_id, token_hash, expires_at, ip, user_agent)
         VALUES (?, ?, ?, ?, ?)`,
                [user_id, token_hash, expires_at, ip, user_agent]
            );
            return result.insertId;
        } catch (error) {
            logger.error(`[Model]:PasswordReset:create Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    /**
     * Marca como usados (revoca) todos los tokens activos (used = 0) de un usuario.
     * Útil cuando se reenvía email o al confirmar reset.
    */
    revokeAllForUser: async (user_id, connection = pool) => {
        try {
            await connection.execute(
                `UPDATE password_reset SET used = 1 WHERE user_id = ? AND used = 0`,
                [user_id]
            );
        } catch (error) {
            logger.error(`[Model]:PasswordReset:revokeAllForUser Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    /**
     * Busca un token válido por hash para un usuario (no usado).
     * Devuelve la fila completa si existe o null.
     */
    findValidByHash: async (user_id, token_hash, connection = pool) => {
        try {
            const [rows] = await connection.execute(
                `SELECT password_reset_id, user_id, token_hash, expires_at, used, ip, user_agent, created_at
                FROM password_reset
                WHERE user_id = ? AND token_hash = ? AND used = 0
                LIMIT 1`,
                [user_id, token_hash]
            );
            return rows[0] || null;
        } catch (error) {
            logger.error(`[Model]:PasswordReset:findValidByHash Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    /**
     * Marca un token específico como usado (used = 1).
     * @param {number} id - id del registro password_resets
     */
    markUsed: async (id, connection = pool) => {
        try {
            await connection.execute(
                `UPDATE password_reset SET used = 1 WHERE password_reset_id = ?`,
                [id]
            );
        } catch (error) {
            logger.error(`[Model]:PasswordReset:markUsed Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },
};