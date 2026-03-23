import pool from "../../../config/db.js";
import logger from "../../../utils/logger.js";

export const Favorite = {
  toggle: async (userId, propertyId, connection = pool) => {
    try {
      // Verificar si existe
      const [rows] = await connection.execute(
        `SELECT * FROM user_favorites WHERE user_id = ? AND property_id = ?`,
        [userId, propertyId]
      );

      if (rows.length > 0) {
        // Eliminar
        await connection.execute(
          `DELETE FROM user_favorites WHERE user_id = ? AND property_id = ?`,
          [userId, propertyId]
        );
        logger.info(`FavoriteModel:toggle Removed favorite user_id=${userId} prop_id=${propertyId}`);
        return { isFavorite: false };
      } else {
        // Añadir
        await connection.execute(
          `INSERT INTO user_favorites (user_id, property_id) VALUES (?, ?)`,
          [userId, propertyId]
        );

        // Fetch property address para el Event Emitter
        const [[prop]] = await connection.execute(
          `SELECT avenue FROM properties WHERE id = ?`,
          [propertyId]
        );

        logger.info(`FavoriteModel:toggle Added favorite user_id=${userId} prop_id=${propertyId}`);
        return { isFavorite: true, property_address: prop?.avenue || 'Unknown' };
      }
    } catch (error) {
      logger.error(`FavoriteModel:toggle Error: ${error.message}`);
      throw error;
    }
  },

  findByUserId: async (userId, connection = pool) => {
    try {
      const [rows] = await connection.execute(
        `SELECT p.* 
         FROM properties p
         INNER JOIN user_favorites f ON p.id = f.property_id
         WHERE f.user_id = ? AND p.status = 'PUBLICADO'
         ORDER BY f.created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      logger.error(`FavoriteModel:findByUserId Error: ${error.message}`);
      throw error;
    }
  },

  getTopFavorites: async (connection = pool) => {
    try {
      const [rows] = await connection.execute(
        `SELECT p.*, COUNT(f.user_id) as favoritesCount
         FROM properties p
         INNER JOIN user_favorites f ON p.id = f.property_id
         GROUP BY p.id
         ORDER BY favoritesCount DESC`
      );
      return rows;
    } catch (error) {
      logger.error(`FavoriteModel:getTopFavorites Error: ${error.message}`);
      throw error;
    }
  }
};
