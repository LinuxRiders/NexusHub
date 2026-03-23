import pool from "../../../config/db.js";
import logger from "../../../utils/logger.js";

export const Notification = {
  create: async ({ userId, title, message, actionUrl = null, notificationType = 'ALERT_MATCH' }, connection = pool) => {
    try {
      const [result] = await connection.execute(
        `INSERT INTO user_notifications (user_id, title, message, action_url, notification_type) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, title, message, actionUrl, notificationType]
      );
      logger.info(`NotificationModel:create Created notification for user_id=${userId}`);
      return result.insertId;
    } catch (error) {
      logger.error(`NotificationModel:create Error: ${error.message}`);
      throw error;
    }
  },

  findByUserId: async (userId, unreadOnly = false, connection = pool) => {
    try {
      let query = `SELECT * FROM user_notifications WHERE user_id = ?`;
      const params = [userId];

      if (unreadOnly) {
        query += ` AND is_read = 0`;
      }

      query += ` ORDER BY created_at DESC LIMIT 50`; // 50 más recientes

      const [rows] = await connection.execute(query, params);
      return rows;
    } catch (error) {
      logger.error(`NotificationModel:findByUserId Error: ${error.message}`);
      throw error;
    }
  },

  markAsRead: async (id, userId, connection = pool) => {
    try {
      const [result] = await connection.execute(
        `UPDATE user_notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
        [id, userId]
      );
      return result.affectedRows;
    } catch (error) {
      logger.error(`NotificationModel:markAsRead Error: ${error.message}`);
      throw error;
    }
  },

  markAllAsRead: async (userId, connection = pool) => {
    try {
      const [result] = await connection.execute(
        `UPDATE user_notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
        [userId]
      );
      return result.affectedRows;
    } catch (error) {
      logger.error(`NotificationModel:markAllAsRead Error: ${error.message}`);
      throw error;
    }
  }
};
