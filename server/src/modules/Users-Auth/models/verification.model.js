import pool from "../../../config/db.js";
import logger from "../../../utils/logger.js";

export const VerificationToken = {
    /**
     * Crea un nuevo token de verificación genérico.
     */
    createVerification: async ({
        user_id,
        action_type,
        token_hash,
        payload = null, // JSON object, e.g., { new_email: '...' }
        expires_at,
        ip = null,
        user_agent = null
    }, connection = pool) => {
        try {
            // Convierte el payload a string si es un objeto
            const jsonPayload = payload ? JSON.stringify(payload) : null;
            
            const [result] = await connection.execute(
                `INSERT INTO pending_verifications 
                 (user_id, action_type, token_hash, payload, expires_at, ip, user_agent) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [user_id, action_type, token_hash, jsonPayload, expires_at, ip, user_agent]
            );
            return result.insertId;
        } catch (error) {
            logger.error(`[Model]:VerificationToken:create Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    /**
     * Busca un token válido que no haya sido utilizado ni haya expirado.
     */
    findValidToken: async (token_hash, action_type, connection = pool) => {
        try {
            const [rows] = await connection.execute(
                `SELECT verification_id, user_id, action_type, payload, expires_at, used
                 FROM pending_verifications
                 WHERE token_hash = ? AND action_type = ? AND used = 0
                 LIMIT 1`,
                [token_hash, action_type]
            );
            return rows[0] || null;
        } catch (error) {
            logger.error(`[Model]:VerificationToken:findValidToken Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    /**
     * Marca un token como utilizado.
     */
    markAsUsed: async (verification_id, connection = pool) => {
        try {
            const [result] = await connection.execute(
                `UPDATE pending_verifications SET used = 1 WHERE verification_id = ?`,
                [verification_id]
            );
            return result.affectedRows;
        } catch (error) {
            logger.error(`[Model]:VerificationToken:markAsUsed Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    /**
     * Revoca todos los tokens pendientes de un usuario para una acción específica.
     * Útil cuando solicita uno nuevo.
     */
    revokePendingActions: async (user_id, action_type, connection = pool) => {
        try {
            const [result] = await connection.execute(
                `UPDATE pending_verifications 
                 SET used = 1 
                 WHERE user_id = ? AND action_type = ? AND used = 0`,
                [user_id, action_type]
            );
            return result.affectedRows;
        } catch (error) {
            logger.error(`[Model]:VerificationToken:revokePendingActions Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }
};
