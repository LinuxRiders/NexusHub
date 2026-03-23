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





