import pool from '../../../config/db.js';
import logger from '../../../utils/logger.js';

export const ActivityLog = {
  create: async ({ user_id = null, action_type, entity_type, entity_id = null, metadata = null }, connection = pool) => {
    try {
      const [result] = await connection.execute(
        `INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
        [user_id, action_type, entity_type, entity_id, metadata ? JSON.stringify(metadata) : null]
      );
      return result.insertId;
    } catch (error) {
      logger.error(`[Model]:ActivityLog:create Error: ${error.message}`, { stack: error.stack });
      // No arrojamos el error (throw) para que no truene el flujo principal de quien emitió el evento.
    }
  },

  getRecentFeed: async (limit = 15, connection = pool) => {
    try {
      const [rows] = await connection.execute(
        `SELECT id, user_id, action_type, entity_type, entity_id, metadata, created_at
         FROM activity_logs
         ORDER BY created_at DESC
         LIMIT ${limit}`
      );
      return rows;
    } catch (error) {
      logger.error(`[Model]:ActivityLog:getRecentFeed Error: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }
};
