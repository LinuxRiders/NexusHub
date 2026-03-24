import pool from "../../../config/db.js";
import logger from "../../../utils/logger.js";

export const Property = {
  create: async (propertyData, connection = pool) => {
    try {
      const {
        avenue,
        city_country = 'Trujillo, Perú',
        property_type,
        operation_type,
        price,
        rooms = 0,
        bathrooms = 0,
        levels = 1,
        mt2 = 0,
        images = [],
        status = 'BORRADOR',
        created_by
      } = propertyData;

      const [result] = await connection.execute(
        `INSERT INTO properties 
        (avenue, city_country, property_type, operation_type, price, rooms, bathrooms, levels, mt2, images, status, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [avenue, city_country, property_type, operation_type, price, rooms, bathrooms, levels, mt2, JSON.stringify(images), status, created_by, created_by]
      );

      logger.info(`PropertyModel:create New property created id=${result.insertId}`);
      return result.insertId;
    } catch (error) {
      logger.error(`PropertyModel:create Error: ${error.message}`);
      throw error;
    }
  },

  findById: async (id, userId = null, connection = pool) => {
    try {
      let query = `SELECT p.*`;
      const params = [];

      if (userId) {
        query += `, IF(f.property_id IS NOT NULL, true, false) as isFavorite`;
      }

      query += ` FROM properties p`;

      if (userId) {
        query += ` LEFT JOIN user_favorites f ON p.id = f.property_id AND f.user_id = ?`;
        params.push(userId);
      }

      query += ` WHERE p.id = ?`;
      params.push(id);

      const [rows] = await connection.execute(query, params);
      // isFavorite from db might be 1 or 0, convert to boolean if exists
      if (rows[0] && rows[0].hasOwnProperty('isFavorite')) {
        rows[0].isFavorite = Boolean(rows[0].isFavorite);
      }
      return rows[0] || null;
    } catch (error) {
      logger.error(`PropertyModel:findById Error: ${error.message}`);
      throw error;
    }
  },

  findAll: async ({ status, operation_type, property_type, userId } = {}, connection = pool) => {
    try {
      let query = `SELECT p.*`;
      const params = [];

      if (userId) {
        query += `, IF(f.property_id IS NOT NULL, true, false) as isFavorite`;
      }

      query += ` FROM properties p`;

      if (userId) {
        query += ` LEFT JOIN user_favorites f ON p.id = f.property_id AND f.user_id = ?`;
        params.push(userId);
      }

      query += ` WHERE 1=1`;

      if (status) {
        query += ` AND p.status = ?`;
        params.push(status);
      }
      if (operation_type) {
        query += ` AND p.operation_type = ?`;
        params.push(operation_type);
      }
      if (property_type) {
        query += ` AND p.property_type = ?`;
        params.push(property_type);
      }

      query += ` ORDER BY p.created_at DESC`;

      const [rows] = await connection.execute(query, params);
      
      // format isFavorite to boolean representation
      if (userId) {
        rows.forEach(row => {
          row.isFavorite = Boolean(row.isFavorite);
        });
      }
      
      return rows;
    } catch (error) {
      logger.error(`PropertyModel:findAll Error: ${error.message}`);
      throw error;
    }
  },

  update: async (id, updateData, updated_by, connection = pool) => {
    try {
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          if (key === 'images') {
             values.push(JSON.stringify(value));
          } else {
             values.push(value);
          }
        }
      }

      if (fields.length === 0) return 0;

      fields.push(`updated_by = ?`);
      values.push(updated_by);
      values.push(id);

      const query = `UPDATE properties SET ${fields.join(", ")} WHERE id = ?`;
      
      const [result] = await connection.execute(query, values);
      
      // logger.info(`PropertyModel:update Property updated id=${id}`);
      return result.affectedRows;
    } catch (error) {
      logger.error(`PropertyModel:update Error: ${error.message}`);
      throw error;
    }
  },

  getUniqueLocations: async (connection = pool) => {
    try {
      const [rows] = await connection.execute(
        `SELECT DISTINCT city_country FROM properties WHERE city_country IS NOT NULL AND city_country != '' ORDER BY city_country ASC`
      );
      return rows.map(r => r.city_country);
    } catch (error) {
      logger.error(`PropertyModel:getUniqueLocations Error: ${error.message}`);
      throw error;
    }
  },

  delete: async (id, connection = pool) => {
    try {
      const [result] = await connection.execute(
        `DELETE FROM properties WHERE id = ?`,
        [id]
      );
      logger.info(`PropertyModel:delete Property deleted id=${id}`);
      return result.affectedRows;
    } catch (error) {
      logger.error(`PropertyModel:delete Error: ${error.message}`);
      throw error;
    }
  },

  getDashboardStats: async (connection = pool) => {
    try {
      // Usuarios totales
      const [[{ userCount }]] = await connection.query(`SELECT COUNT(*) as userCount FROM USER WHERE status = 'active'`);
      
      // Inmuebles
      const [[{ propertyCount }]] = await connection.query(`SELECT COUNT(*) as propertyCount FROM properties`);
      
      // Categorías de inmuebles (Portafolio Etiquetas)
      const [typeCounts] = await connection.query(`
        SELECT 
          SUM(property_type = 'Departamento') as dptoCount,
          SUM(property_type = 'Casa') as casaCount,
          SUM(property_type = 'Terreno') as terrenoCount,
          SUM(property_type = 'Oficina') as oficinaCount
        FROM properties
      `);
      
      // Operaciones (Venta o Alquiler) Counts
      const [[{ saleCount }]] = await connection.query(`SELECT COUNT(*) as saleCount FROM properties WHERE operation_type = 'COMPRA'`);
      const [[{ rentCount }]] = await connection.query(`SELECT COUNT(*) as rentCount FROM properties WHERE operation_type = 'ALQUILER'`);
      
      // Mensajes (Contactos No Respondidos)
      const [[{ unreadMessageCount }]] = await connection.query(`SELECT COUNT(*) as unreadMessageCount FROM contact_messages WHERE status = 'UNREAD'`);

      // Alertas (Mensajes/Intenciones) faltaban
      // Función auxiliar para calcular tendencia
      const calcTrend = (current, previous) => {
        if (previous === 0) return { trend: current > 0 ? '+100%' : '+0%', isUp: true };
        const diff = current - previous;
        const percentage = Math.round((diff / previous) * 100);
        return {
          trend: `${percentage > 0 ? '+' : ''}${percentage}%`,
          isUp: percentage >= 0
        };
      };

      // Propiedades Creadas Este Mes y Mes Pasado
      const [[{ propThisMonth }]] = await connection.query(`SELECT COUNT(*) as propThisMonth FROM properties WHERE created_at >= DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-01')`);
      const [[{ propLastMonth }]] = await connection.query(`SELECT COUNT(*) as propLastMonth FROM properties WHERE created_at >= DATE_FORMAT(UTC_TIMESTAMP() - INTERVAL 1 MONTH, '%Y-%m-01') AND created_at < DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-01')`);
      const propTrend = calcTrend(propThisMonth, propLastMonth);

      // Mensajes Recibidos Esta Semana y Semana Pasada (Últimos 7 días vs previos 7 días)
      const [[{ msgThisWeek }]] = await connection.query(`SELECT COUNT(*) as msgThisWeek FROM contact_messages WHERE created_at >= UTC_TIMESTAMP() - INTERVAL 7 DAY`);
      const [[{ msgLastWeek }]] = await connection.query(`SELECT COUNT(*) as msgLastWeek FROM contact_messages WHERE created_at >= UTC_TIMESTAMP() - INTERVAL 14 DAY AND created_at < UTC_TIMESTAMP() - INTERVAL 7 DAY`);
      const msgTrend = calcTrend(msgThisWeek, msgLastWeek);

      return {
        usuarios: { total: userCount },
        propiedades: { total: propertyCount, trend: propTrend.trend, isUp: propTrend.isUp },
        mensajes: { total: unreadMessageCount, trend: msgTrend.trend, isUp: msgTrend.isUp },
        operaciones: { total: saleCount + rentCount, trend: '+0%', isUp: true },
        portfolio: {
          ventas: saleCount,
          alquileres: rentCount,
          types: {
            departamentos: typeCounts[0].dptoCount || 0,
            casas: typeCounts[0].casaCount || 0,
            terrenos: typeCounts[0].terrenoCount || 0,
            oficinas: typeCounts[0].oficinaCount || 0
          }
        }
      };
    } catch (error) {
      logger.error(`PropertyModel:getDashboardStats Error: ${error.message}`);
      throw error;
    }
  }
};
