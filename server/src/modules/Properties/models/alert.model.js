import pool from "../../../config/db.js";
import logger from "../../../utils/logger.js";

export const Alert = {
  create: async (userId, alertData, connection = pool) => {
    try {
      const {
        title,
        is_buy = false,
        is_rent = false,
        rooms = null,
        bathrooms = null,
        min_price = null,
        max_price = null,
        min_mt2 = null,
        max_mt2 = null,
        requires_photos = false,
        location = null,
        property_types = [],
        send_notifications = false
      } = alertData;

      const [result] = await connection.execute(
        `INSERT INTO user_alerts 
        (user_id, title, is_buy, is_rent, rooms, bathrooms, min_price, max_price, min_mt2, max_mt2, requires_photos, location, property_types, send_notifications)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, title, is_buy, is_rent, rooms, bathrooms, min_price, max_price, min_mt2, max_mt2, requires_photos, location, JSON.stringify(property_types), send_notifications]
      );

      logger.info(`AlertModel:create New alert created id=${result.insertId} user_id=${userId}`);
      return result.insertId;
    } catch (error) {
      logger.error(`AlertModel:create Error: ${error.message}`);
      throw error;
    }
  },

  findByUserId: async (userId, connection = pool) => {
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM user_alerts WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      logger.error(`AlertModel:findByUserId Error: ${error.message}`);
      throw error;
    }
  },

  findAllActive: async (connection = pool) => {
    try {
      // Used by matching engine to find all alerts
      const [rows] = await connection.execute(
        `SELECT a.*, u.email as user_email, u.username as user_name 
         FROM user_alerts a
         JOIN USER u ON a.user_id = u.user_id`
      );
      return rows;
    } catch (error) {
      logger.error(`AlertModel:findAllActive Error: ${error.message}`);
      throw error;
    }
  },

  findAllWithUsers: async (connection = pool) => {
    try {
      // Used by Admin Dashboard to see all intentions
      const [rows] = await connection.execute(
        `SELECT a.*, u.email as user_email, u.username as user_name 
         FROM user_alerts a
         JOIN USER u ON a.user_id = u.user_id
         ORDER BY a.created_at DESC`
      );
      return rows;
    } catch (error) {
      logger.error(`AlertModel:findAllWithUsers Error: ${error.message}`);
      throw error;
    }
  },

  update: async (id, userId, updateData, connection = pool) => {
    try {
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          // Si es JSON array
          values.push(Array.isArray(value) ? JSON.stringify(value) : value);
        }
      }

      if (fields.length === 0) return 0;

      values.push(id, userId);
      const query = `UPDATE user_alerts SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`;
      
      const [result] = await connection.execute(query, values);
      return result.affectedRows;
    } catch (error) {
      logger.error(`AlertModel:update Error: ${error.message}`);
      throw error;
    }
  },

  delete: async (id, userId, connection = pool) => {
    try {
      const [result] = await connection.execute(
        `DELETE FROM user_alerts WHERE id = ? AND user_id = ?`,
        [id, userId]
      );
      logger.info(`AlertModel:delete Alert deleted id=${id} user_id=${userId}`);
      return result.affectedRows;
    } catch (error) {
      logger.error(`AlertModel:delete Error: ${error.message}`);
      throw error;
    }
  }
};
