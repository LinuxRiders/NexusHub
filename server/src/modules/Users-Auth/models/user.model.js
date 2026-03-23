import pool from "../../../config/db.js";
import logger from "../../../utils/logger.js";

export const User = {

  /**
   * Crea un nuevo usuario en la base de datos.
   * Por defecto, un usuario nuevo nace NO verificado (0).
   */
  create: async ({
    username,
    email,
    password_hash,
    status = 'active',
    is_verified = 0,
    created_by = null
  }, connection = pool) => {
    try {
      const [result] = await connection.execute(
        `INSERT INTO USER (username, email, password_hash, status, is_verified, created_by) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [username, email, password_hash, status, is_verified, created_by]
      );
      return result.insertId;
    } catch (error) {
      logger.error(
        `[Model]:User:create Error inserting user: ${error.message}`,
        { stack: error.stack }
      );
      throw error;
    }
  },

  /**
   * Crea un registro en la tabla userdata. 
   * Usado principalmente despues de crear un usuario.
   */
  createUserData: async ({
    user_id,
    nombres,
    apellidos,
    telefono = null,
    pais = null,
    created_by = null
  }, connection = pool) => {
    try {
      const [result] = await connection.execute(
        `INSERT INTO userdata (user_id, nombres, apellidos, telefono, pais, created_by) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, nombres, apellidos, telefono, pais, created_by]
      );
      return result.insertId;
    } catch (error) {
      logger.error(`[Model]:User:createUserData Error: ${error.message}`, { stack: error.stack });
      throw error;
    }
  },

  findById: async ({id, includeUserData = false}, connection = pool) => {
    try {
      let query = `SELECT u.user_id, u.username, u.email, u.status, u.is_verified, u.password_changed_at, u.created_at, u.created_by, u.updated_at 
                   FROM USER u WHERE u.user_id = ? AND u.deleted_at IS NULL`;
                   
      if (includeUserData) {
        query = `SELECT u.user_id, u.username, u.email, u.status, u.is_verified, u.password_changed_at, u.created_at, u.created_by, u.updated_at,
                        ud.nombres, ud.apellidos, ud.telefono, ud.pais
                 FROM USER u
                 LEFT JOIN userdata ud ON u.user_id = ud.user_id 
                 WHERE u.user_id = ? AND u.deleted_at IS NULL`;
      }

      const [rows] = await connection.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`[Model]:User:findById Error: ${error.message}`, {
        stack: error.stack,
      });
      throw error;
    }
  },

  findByIds: async (ids = [], connection = pool) => {
    try {
      if (!Array.isArray(ids) || ids.length === 0) return [];
      const placeholders = ids.map(() => '?').join(',');

      // Agregamos is_verified
      const [rows] = await connection.execute(
        `SELECT user_id, username, email, status, is_verified, created_by, created_at
         FROM \`USER\`
         WHERE user_id IN (${placeholders}) AND deleted_at IS NULL`,
        ids
      );
      return rows;
    } catch (error) {
      logger.error(`[Model]:User:findByIds Error: ${error.message}`, { stack: error.stack });
      throw error;
    }
  },

  findByIdForUpdate: async (id, connection = pool) => {
    try {
      // Vital incluir password_changed_at aquí para validaciones de sesión críticas
      const [rows] = await connection.execute(
        `SELECT user_id, username, email, status, is_verified, password_changed_at, created_at, created_by, updated_at
          FROM \`USER\` WHERE user_id = ? AND deleted_at IS NULL LIMIT 1 FOR UPDATE`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error(`[Model]:User:findByIdForUpdate Error: ${error.message}`, { stack: error.stack });
      throw error;
    }
  },

  findByEmail: async (email, connection = pool) => {
    try {
      // SELECT * traerá automáticamente las nuevas columnas.
      // Es útil mantenerlo así para el login, ya que necesitamos el password_hash.
      const [rows] = await connection.execute(
        "SELECT * FROM USER WHERE email = ? AND deleted_at IS NULL",
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error(`[Model]:User:findByEmail Error: ${error.message}`, {
        stack: error.stack,
      });
      throw error;
    }
  },

  // UPDATE: No requiere cambios estructurales gracias a tu lógica dinámica.
  // Solo asegúrate de pasar { is_verified: 1 } o { password_changed_at: new Date() } en 'fields'.
  update: async ({ id, updated_by }, fields, connection = pool) => {
    try {
      const keys = Object.keys(fields);
      // Validación de seguridad: si no hay campos, no hacemos nada
      if (keys.length === 0) return 0;

      const values = Object.values(fields);
      const setClause = keys.map((k) => `${k} = ?`).join(", ");

      values.push(updated_by);
      values.push(id);

      const [result] = await connection.execute(
        `UPDATE USER SET ${setClause}, updated_at = NOW(), updated_by = ? WHERE user_id = ?`,
        values
      );
      return result.affectedRows;
    } catch (error) {
      logger.error(`[Model]:User:update Error: ${error.message}`, {
        stack: error.stack,
      });
      throw error;
    }
  },

  /**
   * Actualización dinámica del Perfil (USER y userdata).
   * @param {Object} param0 Identificadores del usuario y quien actualiza
   * @param {Object} userFields Campos a actualizar en tabla USER
   * @param {Object} userDataFields Campos a actualizar en tabla userdata
   * @param {Object} connection (Opcional) Conexión para transacciones
   */
  updateProfile: async ({ id, updated_by }, userFields = {}, userDataFields = {}, connection = pool) => {
    try {
      const userKeys = Object.keys(userFields);
      const userDataKeys = Object.keys(userDataFields);

      if (userKeys.length === 0 && userDataKeys.length === 0) return 0;

      let affectedRows = 0;

      // 1. Actualizar tabla USER si hay campos
      if (userKeys.length > 0) {
        const userValues = Object.values(userFields);
        const setClause = userKeys.map((k) => `\`${k}\` = ?`).join(", ");
        userValues.push(updated_by, id);

        const [userResult] = await connection.execute(
          `UPDATE USER SET ${setClause}, updated_at = NOW(), updated_by = ? WHERE user_id = ?`,
          userValues
        );
        affectedRows += userResult.affectedRows;
      }

      // 2. Actualizar tabla userdata si hay campos
      if (userDataKeys.length > 0) {
        const userDataValues = Object.values(userDataFields);
        const setClauseUD = userDataKeys.map((k) => `\`${k}\` = ?`).join(", ");
        userDataValues.push(updated_by, id);

        const [udResult] = await connection.execute(
          `UPDATE userdata SET ${setClauseUD}, updated_at = NOW(), updated_by = ? WHERE user_id = ?`,
          userDataValues
        );
        affectedRows += udResult.affectedRows;
      }

      return affectedRows;
    } catch (error) {
      logger.error(`[Model]:User:updateProfile Error: ${error.message}`, { stack: error.stack });
      throw error;
    }
  },

  softDelete: async (id, updated_by = null, connection = pool) => {
    try {
      const [result] = await connection.execute(
        "UPDATE USER SET deleted_at = NOW(), updated_by = ?, status = 'inactive' WHERE user_id = ?",
        [updated_by, id]
      );
      return result.affectedRows;
    } catch (error) {
      logger.error(`[Model]:User:softDelete Error: ${error.message}`, { stack: error.stack });
      throw error;
    }
  },

  getAll: async (includeUserData = false, connection = pool) => {
    try {
      let query = "SELECT user_id, username, email, status, is_verified, created_at, updated_at FROM USER WHERE deleted_at IS NULL";
      
      if (includeUserData) {
        query = `SELECT u.user_id, u.username, u.email, u.status, u.is_verified, u.created_at, u.updated_at,
                 ud.*
                 FROM USER u
                 LEFT JOIN userdata ud ON u.user_id = ud.user_id
                 WHERE u.deleted_at IS NULL`;
      }
      
      const [rows] = await connection.execute(query);
      return rows;
    } catch (error) {
      logger.error(`[Model]:User:getAll Error: ${error.message}`, {
        stack: error.stack,
      });
      throw error;
    }
  },

  getStats: async (includeAdmins = false, connection = pool) => {
    try {
      const adminFilter = includeAdmins ? "" : `
        AND user_id NOT IN (
          SELECT ur.user_id FROM user_roles ur
          JOIN roles r ON ur.role_id = r.role_id WHERE r.name IN ('admin', 'dev')
        )`;

      const [rows] = await connection.execute(`
        SELECT 
          COUNT(DISTINCT user_id) as totalUsers,
          SUM(status = 'active') as activeUsers,
          SUM(status = 'inactive') as inactiveUsers,
          0 as googleUsers
        FROM USER 
        WHERE deleted_at IS NULL ${adminFilter}
      `);

      return rows[0];
    } catch (error) {
      logger.error(`[Model]:User:getStats Error: ${error.message}`, { stack: error.stack });
      throw error;
    }
  },

  /**
   * getChildren(user_id) -> usuarios cuya columna created_by = user_id
   */
  getChildren: async (user_id, connection = pool) => {
    try {
      const [rows] = await connection.execute(
        `SELECT user_id, username, email, status, is_verified, created_by
         FROM USER
         WHERE created_by = ? AND (deleted_at IS NULL)`,
        [user_id]
      );
      return rows;
    } catch (error) {
      logger.error(`[Model]:User:getChildren Error: ${error.message}`, { stack: error.stack });
      throw error;
    }
  },

  /**
   * getDescendantIds(user_id) -> devuelve array de user_id descendientes (BFS en model)
   */
  getDescendantIds: async (userId, connection = pool) => {
    const descendants = new Set();
    const queue = [userId];
    try {
      while (queue.length > 0) {
        const cur = queue.shift();
        const [rows] = await connection.execute(
          `SELECT user_id FROM USER WHERE created_by = ? AND (deleted_at IS NULL)`,
          [cur]
        );
        for (const r of rows) {
          if (!descendants.has(r.user_id) && r.user_id !== userId) {
            descendants.add(r.user_id);
            queue.push(r.user_id);
          }
        }
      }
      return Array.from(descendants);
    } catch (error) {
      logger.error(`[Model]:User:getDescendantIds Error: ${error.message}`, { stack: error.stack });
      throw error;
    }
  },
};
