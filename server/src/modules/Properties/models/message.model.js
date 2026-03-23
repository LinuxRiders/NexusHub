import pool from '../../../config/db.js';
import logger from '../../../utils/logger.js';

export const Message = {
    /**
     * Guarda un nuevo mensaje de contacto enviado desde Banner o Footer
     */
    create: async ({ user_id = null, name, email, phone = null, subject = null, message }, connection = pool) => {
        try {
            const [result] = await connection.execute(
                `INSERT INTO contact_messages (user_id, name, email, phone, subject, message) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [user_id, name, email, phone, subject, message]
            );
            return result.insertId;
        } catch (error) {
            logger.error(`[MessageModel]:create Error: ${error.message}`);
            throw error;
        }
    },

    /**
     * Obtiene todos los mensajes para el AdminDashboard
     */
    getAll: async ({ statuses = [], limit = 50, offset = 0 } = {}, connection = pool) => {
        try {
            let query = `
                SELECT id, user_id, name, email, phone, subject, message, status, replied_at, created_at 
                FROM contact_messages
            `;
            const params = [];

            if (statuses.length > 0) {
                const placeholders = statuses.map(() => '?').join(',');
                query += ` WHERE status IN (${placeholders})`;
                params.push(...statuses);
            }

            query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

            const [rows] = await connection.execute(query, params);
            
            // Contar total para paginación si se ocupa
            const [[{ total }]] = await connection.execute(
                `SELECT COUNT(*) as total FROM contact_messages 
                 ${statuses.length > 0 ? `WHERE status IN (${statuses.map(() => '?').join(',')})` : ''}`,
                statuses
            );

            return { messages: rows, total };
        } catch (error) {
            logger.error(`[MessageModel]:getAll Error: ${error.message}`);
            throw error;
        }
    },

    /**
     * Obtiene un mensaje específico por su ID
     */
    getById: async (id, connection = pool) => {
        try {
            const [rows] = await connection.execute(
                `SELECT * FROM contact_messages WHERE id = ?`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            logger.error(`[MessageModel]:getById Error: ${error.message}`);
            throw error;
        }
    },

    /**
     * Actualiza el status (UNREAD, READ, REPLIED)
     */
    updateStatus: async (id, status, connection = pool) => {
        try {
            const updates = ['status = ?'];
            const params = [status];

            if (status === 'REPLIED') {
                updates.push('replied_at = UTC_TIMESTAMP()');
            }

            params.push(id);

            const [result] = await connection.execute(
                `UPDATE contact_messages SET ${updates.join(', ')} WHERE id = ?`,
                params
            );
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`[MessageModel]:updateStatus Error: ${error.message}`);
            throw error;
        }
    },

    /**
     * Elimina el mensaje físicamente de la base de datos
     */
    delete: async (id, connection = pool) => {
        try {
            const [result] = await connection.execute(
                `DELETE FROM contact_messages WHERE id = ?`,
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`[MessageModel]:delete Error: ${error.message}`);
            throw error;
        }
    }
};
