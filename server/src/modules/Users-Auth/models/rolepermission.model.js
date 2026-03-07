import pool from '../../../config/db.js';
import logger from '../../../utils/logger.js';

export const Role = {
    create: async ({ name, description, created_by = null }, connection = pool) => {
        try {
            const [result] = await connection.execute(
                `INSERT INTO roles (name, description, created_by) VALUES (?, ?, ?)`,
                [name, description, created_by]
            );
            return result.insertId;
        } catch (error) {
            logger.error(`[Model]:Role:create Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    findById: async (role_id, connection = pool) => {
        try {
            const [rows] = await connection.execute(
                `SELECT * FROM roles WHERE role_id = ? AND deleted_at IS NULL LIMIT 1`,
                [role_id]
            );
            return rows[0] || null;
        } catch (error) {
            logger.error(`[Model]:Role:findById Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    // Buscar por id con lock FOR UPDATE (para usar en transacciones de escritura)
    findByIdForUpdate: async (role_id, connection = pool) => {
        try {
            const [rows] = await connection.execute(
                `SELECT * FROM roles WHERE role_id = ? AND deleted_at IS NULL LIMIT 1 FOR UPDATE`,
                [role_id]
            );
            return rows[0] || null;
        } catch (error) {
            logger.error(`[Model]:Role:findByIdForUpdate Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    /**
   * Buscar rol por name y creator (retorna objeto o null).
   * connection opcional para que se pueda usar dentro de transacciones.
   */
    findByNameAndCreator: async ({ name, created_by }, connection = pool) => {
        try {
            const [rows] = await connection.execute(
                `SELECT role_id, name, description, created_by, created_at, updated_at 
                FROM roles
                WHERE name = ? AND created_by <=> ? AND deleted_at IS NULL
                LIMIT 1`,
                [name, created_by]
            );
            return rows[0] || null;
        } catch (error) {
            logger.error(`[Model]:Role:findByNameAndCreator Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },


    findAll: async (connection = pool) => {
        try {
            const [rows] = await connection.execute(`SELECT * FROM roles WHERE deleted_at IS NULL`);
            return rows;
        } catch (error) {
            logger.error(`[Model]:Role:findAll Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    update: async ({ role_id, updated_by }, fields, connection = pool) => {
        try {
            const keys = Object.keys(fields);
            if (keys.length === 0) {
                throw new Error("No hay campos para actualizar.");
            }

            const values = Object.values(fields);
            const setClause = keys.map((k) => `${k} = ?`).join(", ");
            values.push(updated_by);
            values.push(role_id);

            const [result] = await connection.execute(
                `UPDATE roles 
                SET ${setClause}, updated_at = NOW(), updated_by = ? 
                WHERE role_id = ? AND deleted_at IS NULL`,
                values
            );

            return result.affectedRows;
        } catch (error) {
            logger.error(`[Model]:Role:update Error: ${error.message}`, {
                stack: error.stack,
            });
            throw error;
        }
    },


    softDelete: async (role_id, updated_by = null, connection = pool) => {
        try {
            await connection.execute(
                `UPDATE roles SET deleted_at = NOW(), updated_by = ? WHERE role_id = ?`,
                [updated_by, role_id]
            );
        } catch (error) {
            logger.error(`[Model]:Role:softDelete Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    // ya tendrás create/findById; añadimos findByCreator
    findByCreator: async (created_by, connection = pool) => {
        try {
            const [rows] = await connection.execute(
                `SELECT role_id, name, description, created_by, created_at, updated_at
                 FROM roles
                 WHERE created_by = ? AND (deleted_at IS NULL)
                 ORDER BY created_at DESC`,
                [created_by]
            );
            return rows;
        } catch (error) {
            logger.error(`[Model]:Role:findByCreator Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    /**
     * findByCreators([creatorIds]) -> obtiene todos los roles creados por cualquiera de los creatorIds
    */
    findByCreators: async (creatorIds = [], connection = pool) => {
        try {
            if (!Array.isArray(creatorIds) || creatorIds.length === 0) return [];
            const placeholders = creatorIds.map(() => '?').join(',');
            const [rows] = await connection.execute(
                `SELECT role_id, name, description, created_by, created_at, updated_at
                 FROM roles
                 WHERE created_by IN (${placeholders}) AND deleted_at IS NULL`,
                creatorIds
            );
            return rows;
        } catch (error) {
            logger.error(`[Model]:Role:findByCreators Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },
};

export const UserRole = {
    assign: async ({ user_id, role_id, created_by = null }, connection = pool) => {
        try {
            await connection.execute(
                `INSERT IGNORE INTO user_roles (user_id, role_id, created_by) VALUES (?, ?, ?)`,
                [user_id, role_id, created_by]
            );
        } catch (error) {
            logger.error(`[Model]:UserRole:assign Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    remove: async (user_id, role_id, connection = pool) => {
        try {
            await connection.execute(
                `DELETE FROM user_roles WHERE user_id = ? AND role_id = ?`,
                [user_id, role_id]
            );
        } catch (error) {
            logger.error(`[Model]:UserRole:remove Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    findRolesByUser: async (user_id, connection = pool) => {
        try {
            const [rows] = await connection.execute(
                `SELECT r.* 
                 FROM roles r 
                 INNER JOIN user_roles ur ON ur.role_id = r.role_id 
                 WHERE ur.user_id = ? AND r.deleted_at IS NULL`,
                [user_id]
            );
            return rows;
        } catch (error) {
            logger.error(`[Model]:UserRole:findRolesByUser Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    /**
 * findRolesByUsers(userIds)
 * Retorna filas con user_id + datos del role asignado
 * [{ user_id, role_id, name, description, created_by, created_at, ... }, ...]
 */
    findRolesByUsers: async (userIds = [], connection = pool) => {
        try {
            if (!Array.isArray(userIds) || userIds.length === 0) return [];
            const placeholders = userIds.map(() => '?').join(',');
            const [rows] = await connection.execute(
                `SELECT ur.user_id, r.role_id, r.name, r.description, r.created_by, r.created_at
                FROM user_roles ur
                INNER JOIN roles r ON r.role_id = ur.role_id AND r.deleted_at IS NULL
                WHERE ur.user_id IN (${placeholders})`,
                userIds
            );
            return rows;
        } catch (error) {
            logger.error(`[Model]:UserRole:findRolesByUsers Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    /**
     * Asigna varios roles a un usuario en batch (INSERT IGNORE para idempotencia).
     * rolesIds: array de role_id
     */
    assignBulk: async ({ user_id, rolesIds = [], created_by = null }, connection = pool) => {
        try {
            if (!Array.isArray(rolesIds) || rolesIds.length === 0) return 0;
            const placeholders = rolesIds.map(() => '(?, ?, ?)').join(',');
            const params = [];
            for (const rid of rolesIds) {
                params.push(user_id, rid, created_by);
            }
            const sql = `INSERT IGNORE INTO user_roles (user_id, role_id, created_by) VALUES ${placeholders}`;
            const [result] = await connection.execute(sql, params);
            return result.affectedRows || 0;
        } catch (error) {
            logger.error(`[Model]:UserRole:assignBulk Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    /**
     * Remueve varios roles de un usuario en batch (DELETE WHERE user_id = ? AND role_id IN (...))
     */
    removeBulk: async ({ user_id, rolesIds = [] }, connection = pool) => {
        try {
            if (!Array.isArray(rolesIds) || rolesIds.length === 0) return 0;
            const placeholders = rolesIds.map(() => '?').join(',');
            const sql = `DELETE FROM user_roles WHERE user_id = ? AND role_id IN (${placeholders})`;
            const params = [user_id, ...rolesIds];
            const [result] = await connection.execute(sql, params);
            return result.affectedRows || 0;
        } catch (error) {
            logger.error(`[Model]:UserRole:removeBulk Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },
};

export const Permission = {
    create: async ({ module, action, description = null, created_by = null }, connection = pool) => {
        try {
            const [result] = await connection.execute(
                `INSERT INTO permissions (module, action, description, created_by) VALUES (?, ?, ?, ?)`,
                [module, action, description, created_by]
            );
            return result.insertId;
        } catch (error) {
            logger.error(`[Model]:Permission:create Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    findById: async (id, connection = pool) => {
        try {
            const [rows] = await connection.execute(
                `SELECT * FROM permissions WHERE permission_id = ? AND deleted_at IS NULL LIMIT 1`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            logger.error(`[Model]:Permission:findById Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    /**
   * findByIds(arrayIds) -> devuelve array de permisos completos para los ids indicados
   * connection opcional.
   */
    findByIds: async (ids = [], connection = pool) => {
        if (!Array.isArray(ids) || ids.length === 0) return [];
        try {
            const placeholders = ids.map(() => '?').join(',');
            const [rows] = await connection.execute(
                `SELECT permission_id, module, action, description, created_by, created_at
                FROM permissions
                WHERE permission_id IN (${placeholders}) AND deleted_at IS NULL`,
                ids
            );
            return rows;
        } catch (error) {
            logger.error(`[Model]:Permission:findByIds Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    findAll: async (connection = pool) => {
        try {
            const [rows] = await connection.execute(`SELECT * FROM permissions WHERE deleted_at IS NULL`);
            return rows;
        } catch (error) {
            logger.error(`[Model]:Permission:findAll Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    findByModule: async (module, connection = pool) => {
        try {
            const [rows] = await connection.execute(
                `SELECT * FROM permissions WHERE module = ? AND deleted_at IS NULL`,
                [module]
            );
            return rows;
        } catch (error) {
            logger.error(`[Model]:Permission:findByModule Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

     findByModuleAction: async (module, action, connection = pool) => {
        const [rows] = await connection.execute(
        `SELECT * FROM permissions WHERE module = ? AND action = ? AND deleted_at IS NULL LIMIT 1`,
        [module, action]
        );
        return rows[0] || null;
    },

    delete: async (id, updated_by = null, connection = pool) => {
        try {
            await connection.execute(
                `UPDATE permissions SET deleted_at = NOW(), updated_by = ? WHERE permission_id = ?`,
                [updated_by, id]
            );
        } catch (error) {
            logger.error(`[Model]:Permission:delete Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    softDeleteByModulePrefix: async (modulePrefix, updated_by = null, connection = pool) => {
        // uso: modulePrefix = 'congress:21:' -> borra permisos que empiezan con ese prefijo
        await connection.execute(
        `UPDATE permissions SET deleted_at = NOW(), updated_by = ? WHERE module LIKE ?`,
        [updated_by, `${modulePrefix}%`]
        );
    }
};

export const RolePermission = {
    assign: async ({ role_id, permission_id, created_by = null }, connection = pool) => {
        try {
            await connection.execute(
                `INSERT IGNORE INTO role_permissions (role_id, permission_id, created_by) VALUES (?, ?, ?)`,
                [role_id, permission_id, created_by]
            );
        } catch (error) {
            logger.error(`[Model]:RolePermission:assign Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    remove: async ({ role_id, permission_id }, connection = pool) => {
        try {
            await connection.execute(
                `DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?`,
                [role_id, permission_id]
            );
        } catch (error) {
            logger.error(`[Model]:RolePermission:remove Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    findByRole: async (role_id, connection = pool) => {
        try {
            const [rows] = await connection.query(
                `SELECT permission_id FROM role_permissions WHERE role_id = ? AND deleted_at IS NULL`,
                [role_id]
            );

            return rows;
        } catch (error) {
            logger.error(`[Model]:RolePermission:findByRole Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    findByRoles: async (role_ids = [], connection = pool) => {
        try {
            if (role_ids.length === 0) return []; // Evita query vacía

            const placeholders = role_ids.map(() => '?').join(', ');
            const [rows] = await connection.execute(
                `
                SELECT DISTINCT p.* 
                FROM permissions p 
                INNER JOIN role_permissions rp ON rp.permission_id = p.permission_id 
                WHERE rp.role_id IN (${placeholders})
                AND p.deleted_at IS NULL
                `,
                role_ids
            );

            return rows;
        } catch (error) {
            logger.error(`[Model]:RolePermission:findByRoles Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },

    /**
   * findPermissionsMapByRoleIds
   * --------------------------------------
   * Devuelve todas las relaciones (role_id, permission_id)
   * de un conjunto de roles, útil para mapear roles → permisos.
   *
   * @param {number[]} roleIds - IDs de roles a consultar.
   * @param {object} connection - Conexión activa de MySQL (transacción).
   * @returns {Promise<Array<{ role_id: number, permission_id: number }>>}
   */
    findPermissionsMapByRoleIds: async (roleIds = [], connection = pool) => {
        try {
            if (!Array.isArray(roleIds) || roleIds.length === 0) return [];

            const placeholders = roleIds.map(() => "?").join(",");
            const [rows] = await connection.execute(
                `
                SELECT 
                role_id,
                permission_id
                FROM role_permissions
                WHERE 
                role_id IN (${placeholders})
                AND deleted_at IS NULL
                `,
                roleIds
            );

            return rows;
        } catch (error) {
            logger.error(
                `[Model]:RolePermission:findPermissionsMapByRoleIds Error: ${error.message}`,
                { stack: error.stack }
            );
            throw error;
        }
    },

    /**
   * removeFromRoles(roleIds, permissionIds, connection)
   * Borra (DELETE) role_permissions para la combinación roleIds x permissionIds en batch.
   */
    removeFromRoles: async (roleIds = [], permissionIds = [], connection = pool) => {
        if (!Array.isArray(roleIds) || roleIds.length === 0 || !Array.isArray(permissionIds) || permissionIds.length === 0) {
            return { affectedRows: 0 };
        }
        try {
            const placeholdersRoles = roleIds.map(() => '?').join(',');
            const placeholdersPerms = permissionIds.map(() => '?').join(',');
            const params = [...roleIds, ...permissionIds];

            const [result] = await connection.execute(
                `DELETE FROM role_permissions WHERE role_id IN (${placeholdersRoles}) AND permission_id IN (${placeholdersPerms})`,
                params
            );
            return result;
        } catch (error) {
            logger.error(`[Model]:RolePermission:removeFromRoles Error: ${error.message}`, { stack: error.stack });
            throw error;
        }
    },
};
