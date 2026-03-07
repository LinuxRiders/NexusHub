import logger from "../../../utils/logger.js";
import { Permission, Role, RolePermission, UserRole } from "../models/rolepermission.model.js";
import pool from "../../../config/db.js";
import { User } from "../models/user.model.js";
import { hashPassword } from "../../../utils/password.js";


/**
 * Helper: buildPermissionTree
 * Construye una estructura jerárquica (árbol o mapa) a partir de permisos con módulos tipo 'users:profile:edit'.
 * 
 * @param {Array} permissions - Lista de permisos [{ permission_id, module, action, ... }]
 * @param {Object} options - Configuración
 * @param {'tree'|'map'|'flat'} [options.mode='tree'] - Formato de salida
 * @returns {Object|Array}
 */
export function buildPermissionTree(permissions = [], { mode = 'tree' } = {}) {

  if (!Array.isArray(permissions) || permissions.length === 0) {
    return mode === 'tree' ? [] : mode === 'map' ? {} : [];
  }

  // --- Modo plano ---
  if (mode === 'flat') return permissions;

  // --- Construcción base en modo 'map' ---
  const map = {};

  for (const perm of permissions) {
    const { permission_id, module, action } = perm;
    if (!module) continue;

    const parts = module.split(':');
    let current = map;

    parts.forEach((part, idx) => {
      if (!current[part]) current[part] = { _permissions: [], _children: {} };

      // Si estamos en el último nivel, asignar permiso
      if (idx === parts.length - 1) {
        current[part]._permissions.push(perm);
      }

      // descender al siguiente nivel
      current = current[part]._children;
    });
  }

  // --- Si el modo solicitado es 'map' retornamos el objeto estructurado ---
  if (mode === 'map') return map;

  // --- Convertir el mapa a árbol (para frontend) ---
  const mapToTree = (obj) =>
    Object.entries(obj).map(([name, data]) => ({
      name,
      permissions: data._permissions,
      children: mapToTree(data._children),
    }));

  return mapToTree(map);
}



/**
 * POST /roles
 * Crea un rol identificado por su creador. No permite duplicados por (name, created_by).
 * Body: { name, description }
 */
export const createRol = async (req, res, next) => {
  const { name, description } = req.body;
  const created_by = req.user?.sub ?? null;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1) Verificar existencia por name + creator (usa la misma conexión)
    const existing = await Role.findByNameAndCreator({ name, created_by }, connection);
    if (existing) {
      await connection.rollback();
      logger.warn(`RoleController:createRol RolName already exists for creator=${created_by}: ${name}`);
      return res.status(409).json({ error: 'role_name already exists for this creator' });
    }

    // 2) Crear rol (si entre la verificación y el insert alguien más creó el rol con mismo name+creator,
    //    el INSERT fallará con ER_DUP_ENTRY y lo manejamos en el catch)
    const newRoleId = await Role.create({ name, description, created_by }, connection);

    // 3) Obtener rol insertado para respuesta
    const role = await Role.findById(newRoleId, connection);

    await connection.commit();

    logger.info(`RoleController:createRol Role created: role_id=${role?.role_id}, created_by=${created_by}`);
    return res.status(201).json({ data: role });

  } catch (error) {
    // Manejo explícito de duplicado por concurrent insert (race)
    if (error && error.code === 'ER_DUP_ENTRY') {
      try { await connection.rollback(); } catch (_) { }
      logger.warn(`RoleController:createRol ER_DUP_ENTRY name=${name} created_by=${created_by}`);
      return res.status(409).json({ error: 'role_name already exists for this creator' });
    }

    try { await connection.rollback(); } catch (_) { }
    logger.error(`RoleController:createRol Error: ${error.message}`, { stack: error.stack });
    return next(error);
  } finally {
    connection.release();
  }
};

/**
 * PUT /roles/:id
 * Editar un rol (name, description). Solo si el rol pertenece al actor o a alguno de sus descendientes.
 * Body: { name, description }
 */
export const editRol = async (req, res, next) => {
  const performed_by = req.user?.sub ?? null
  const { id: role_id } = req.params;
  const { name, description } = req.body;

  const targetRole = req.entity;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Si se cambió el nombre, validar unicidad (name + created_by)
    if (typeof name === 'string' && name.trim() !== '' && name.trim() !== targetRole.name) {
      const existing = await Role.findByNameAndCreator({ name: name.trim(), created_by: targetRole.created_by }, connection);
      if (existing) {
        await connection.rollback();
        return res.status(409).json({ message: 'El nombre ya existe para este creador.' });
      }
    }

    // Ejecutar update (actualiza name y/o description y updated_by)
    const updates = {};
    if (typeof name === 'string' && name.trim() !== '') updates.name = name.trim();
    if (typeof description !== 'undefined') updates.description = description;

    if (Object.keys(updates).length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Nada para actualizar.' });
    }

    await Role.update({ role_id, updated_by: performed_by }, updates, connection);

    const roleUpdated = await Role.findById(role_id, connection);

    await connection.commit();

    logger.info(`RoleController: editRol user=${performed_by} updated role_id=${role_id}`);

    return res.status(200).json({
      message: 'Rol actualizado correctamente.',
      data: roleUpdated,
      meta: {
        role_id,
        updated_by: performed_by,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    await connection.rollback();

    logger.error(`RoleController: editRol Error: ${error.message}`, { stack: error.stack });
    return next(error);
  } finally {
    connection.release();
  }
};

/**
 * DELETE /roles/:id
 * Soft delete de un rol (marcar deleted_at + updated_by).
 * Solo si el rol pertenece al actor.
 */
export const deleteRol = async (req, res, next) => {
  const performed_by = req.user?.sub ?? null;
  const { id: role_id } = req.params;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Soft delete
    await Role.softDelete(role_id, performed_by, connection);

    await connection.commit();

    logger.info(`RoleController: deleteRol user=${performed_by} soft-deleted role_id=${role_id}`);

    return res.status(200).json({
      message: 'Rol eliminado (soft) correctamente.',
      meta: {
        role_id,
        deleted_by: performed_by,
        deleted_at: new Date().toISOString()
      }
    });

  } catch (error) {
    await connection.rollback();

    logger.error(`RoleController: deleteRol Error: ${error.message}`, { stack: error.stack });
    return next(error);
  } finally {
    connection.release();
  }
};


// ================ PERMISSIONS ===========================

/**
 * PUT /roles/:id/permissions
 * Body: { permissionIds: [1,2,3], action: 'assign' | 'remove' }
 *
 * Reglas:
 * - Solo se pueden asignar/quitar permisos que el usuario autenticado posee (union de permisos directos de sus roles).
 * - Al QUITAR permisos: se elimina el permiso del role objetivo y además se propaga la eliminación recursivamente
 *   a los roles creados por los subusuarios (usuarios descendientes del usuario autenticado).
 */
export const asignPermissionsToRole = async (req, res, next) => {
  const { id: role_id } = req.params;
  const { permissionIds = [], action = 'assign' } = req.body;
  const user_id = req.user?.sub ?? null;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1) obtener roles del usuario autenticado
    const userRoles = await UserRole.findRolesByUser(user_id, connection);
    if (!userRoles || userRoles.length === 0) {
      await connection.rollback();
      return res.status(403).json({ message: 'El usuario no tiene roles asignados.' });
    }
    const roleIds = userRoles.map(r => r.role_id);

    // 2) obtener todos los permisos directos asociados a esos roles (batch)
    //    -> retorna rows con permission_id
    const userPermissionsRows = await RolePermission.findByRoles(roleIds, connection);
    const allowedPermissions = new Set(userPermissionsRows.map(p => p.permission_id));

    // 3) filtrar permisos solicitados por los que realmente puede operar el usuario
    const validPermissions = permissionIds.filter(pid => allowedPermissions.has(pid));

    if (validPermissions.length === 0) {
      await connection.rollback();
      return res.status(403).json({ message: 'No tienes permisos suficientes para operar sobre los permisos solicitados.' });
    }

    // 4) ejecutar acción
    const assigned = [];
    const skippedAssign = [];
    const removed = [];
    const propagatedRemoved = []; // { role_id, removed_permissions: [] }

    if (action === 'assign') {
      // asignar: validar existencia de permiso y luego insertar (idempotente por model)
      for (const pid of validPermissions) {
        const perm = await Permission.findById(pid, connection);
        if (!perm) {
          skippedAssign.push(pid);
          continue;
        }
        await RolePermission.assign({ role_id, permission_id: pid, created_by: user_id }, connection);
        assigned.push(pid);
      }

      await connection.commit();
      logger.info(`RoleController: assignPermissionsToRole - Usuario ${user_id} asignó permisos [${assigned.join(',')}] al rol ${role_id}`);

      return res.status(201).json({
        message: 'Permisos asignados correctamente.',
        role_id,
        assigned,
        skipped: skippedAssign
      });

    } else {
      // remove:

      // 4.a) Remover de role objetivo
      await RolePermission.removeFromRoles([role_id], validPermissions, connection);
      removed.push(...validPermissions);

      // 4.b) Propagación recursiva: obtener todos los user_ids descendientes (subusuarios) del usuario autenticado
      //      Usamos User.getDescendantIds (model) para obtener la lista completa de subusuarios.
      const descendantUserIds = await User.getDescendantIds(user_id, connection); // array de user_id
      if (descendantUserIds && descendantUserIds.length > 0) {
        // Obtener roles creados por esos usuarios en batch (usamos findByCreator en loop (menos óptimo))
        let descendantRoleIds = [];

        // fallback: loop por creador
        for (const uId of descendantUserIds) {
          const rs = await Role.findByCreator(uId, connection);
          if (rs && rs.length > 0) descendantRoleIds.push(...rs.map(r => r.role_id));
        }

        if (descendantRoleIds.length > 0) {
          // eliminar permisos en todos esos roles (bulk)
          await RolePermission.removeFromRoles(descendantRoleIds, validPermissions, connection);

          // para respuesta, agrupar por role (opcional: podemos consultar qué se borró exactamente)
          propagatedRemoved.push({
            affected_role_count: descendantRoleIds.length,
            role_ids: descendantRoleIds,
            removed_permissions: validPermissions
          });
        }
      }

      await connection.commit();

      logger.info(`RoleController: assignPermissionsToRole (remove) - Usuario ${user_id} removió permisos [${removed.join(',')}] del rol ${role_id} y propagó a ${propagatedRemoved.length ? 'subusuarios' : 'ninguno'}`);

      return res.status(200).json({
        message: 'Permisos removidos correctamente.',
        role_id,
        removed,
        propagated: propagatedRemoved
      });
    }
  } catch (error) {
    await connection.rollback();
    logger.error(`RoleController: asignPermissionsToRole Error: ${error.message}`, { stack: error.stack });
    return next(error);
  } finally {
    connection.release();
  }
};


/**
 * GET /roles/permissions/me
 * - data: permisos que YO poseo según mis roles asignados
 * - meta: información adicional para el frontend
 * 
 * Query params:
 * - ?grouped=true (agrupa por módulos)
 * - ?mode=map|tree|flat (define formato de salida)
 */
export const getMyPermissions = async (req, res, next) => {
  const performed_by = req.user?.sub ?? null;

  const grouped = req.query.grouped === 'true';
  const mode = req.query.mode || (grouped ? 'tree' : 'flat');

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Roles asignados al usuario
    const myUserRoles = await UserRole.findRolesByUser(performed_by, connection);
    const myRoleIds = myUserRoles.map(r => r.role_id).filter(Boolean);

    // Permisos combinados de todos sus roles (union)
    let myPermissionIds = [];
    if (myRoleIds.length > 0) {
      const rows = await RolePermission.findByRoles(myRoleIds, connection);
      myPermissionIds = Array.from(new Set(rows.map(r => r.permission_id)));
    }

    const myPermissions = myPermissionIds.length > 0
      ? await Permission.findByIds(myPermissionIds, connection)
      : [];

    // Construir estructura jerárquica si es necesario
    const structured = grouped
      ? { moduleTree: buildPermissionTree(myPermissions, { mode }) }
      : myPermissions;

    await connection.commit();

    return res.status(200).json({
      message: 'Permisos del usuario obtenidos correctamente.',
      data: structured,
      meta: {
        total_permissions: myPermissions.length,
        role_count: myRoleIds.length,
        grouped,
        mode,
        fetched_by: performed_by,
        fetched_at: new Date().toISOString()
      }
    });

  } catch (err) {
    await connection.rollback();
    logger.error(`PermissionController:getMyPermissions Error: ${err.message}`, { stack: err.stack });
    return next(err);
  } finally {
    connection.release();
  }
};

/**
 * GET /roles/permissions
 * - myRoles: roles que YO creé con sus permisos
 * - childRoles: roles creados por mis subusuarios con sus permisos y owner info
 * - meta: counts y timestamp
 * 
 * Query params:
 * - ?include_children=true (incluye roles creados por mis subusuarios con sus permisos)
 * - ?grouped=true (agrupa por módulos)
 * - ?mode=map|tree|flat (define formato de salida)
 */
export const getMyRolesWithPermissions = async (req, res, next) => {
  const performed_by = req.user?.sub ?? null;

  const includeChildren = String(req.query.include_children || '').toLowerCase() === 'true';

  const grouped = String(req.query.grouped || '').toLowerCase() === 'true';
  const mode = ['tree', 'map', 'flat'].includes(req.query.mode) ? req.query.mode : 'tree';

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 🔹 Helper interno reutilizable
    const fetchRolesWithPermissionsByCreators = async (creatorIds = []) => {
      if (!Array.isArray(creatorIds) || creatorIds.length === 0) return {};

      const roles = await Role.findByCreators(creatorIds, connection);
      if (!roles || roles.length === 0) return {};

      const roleIds = roles.map(r => r.role_id);
      const rpRows = await RolePermission.findPermissionsMapByRoleIds(roleIds, connection);

      // Map roles → permisos
      const roleToPermIds = {};
      for (const r of rpRows) {
        const rid = String(r.role_id);
        roleToPermIds[rid] = roleToPermIds[rid] || new Set();
        roleToPermIds[rid].add(r.permission_id);
      }

      // Obtener permisos únicos
      const allPermIdsSet = new Set();
      Object.values(roleToPermIds).forEach(set => set.forEach(pid => allPermIdsSet.add(pid)));
      const allPermIds = Array.from(allPermIdsSet);
      const allPermDetails = allPermIds.length > 0 ? await Permission.findByIds(allPermIds, connection) : [];
      const permById = new Map(allPermDetails.map(p => [p.permission_id, p]));

      // 🔹 Construir salida
      const map = {};
      for (const role of roles) {
        const rid = String(role.role_id);
        const creator = String(role.created_by);
        const permSet = roleToPermIds[rid] || new Set();
        const perms = Array.from(permSet).map(pid => permById.get(pid)).filter(Boolean);

        // ✅ Aplicar buildPermissionTree según modo si grouped=true
        const formattedPerms = grouped ? buildPermissionTree(perms, { mode }) : perms;

        const roleOut = {
          role_id: role.role_id,
          name: role.name,
          description: role.description,
          created_by: role.created_by,
          created_at: role.created_at,
          permissions: formattedPerms
        };

        map[creator] = map[creator] || [];
        map[creator].push(roleOut);
      }

      return map;
    };

    // 🔹 Roles del usuario actual
    const myRolesMap = await fetchRolesWithPermissionsByCreators([performed_by]);
    const myRoles = myRolesMap[String(performed_by)] || [];

    // 🔹 Roles hijos (subusuarios)
    let childRoles = [];
    if (includeChildren) {
      const descendantIds = await User.getDescendantIds(performed_by, connection);
      const descendantUnique = Array.from(new Set(descendantIds || [])).filter(id => String(id) !== String(performed_by));

      if (descendantUnique.length > 0) {
        const descendantsMap = await fetchRolesWithPermissionsByCreators(descendantUnique);

        // Obtener info de los dueños
        const ownersIds = Object.keys(descendantsMap);
        const owners = ownersIds.length > 0 ? await User.findByIds(ownersIds, connection) : [];
        const userById = new Map(owners.map(u => [String(u.user_id), u]));

        // Mapear roles hijos con su owner
        for (const creatorId of ownersIds) {
          const creatorRoles = descendantsMap[creatorId] || [];
          const owner = userById.get(String(creatorId)) || { user_id: creatorId };

          creatorRoles.forEach(r => {
            childRoles.push({
              ...r,
              owner: {
                user_id: owner.user_id,
                username: owner.username ?? null,
                email: owner.email ?? null,
                status: owner.status ?? null
              }
            });
          });
        }
      }
    }

    await connection.commit();

    // 🔹 Meta info segura
    const allPermsSet = new Set();

    const extractPermissionIds = (permissions) => {
      if (!permissions) return;

      // Modo plano
      if (Array.isArray(permissions)) {
        for (const p of permissions) {
          if (p?.permission_id) allPermsSet.add(p.permission_id);
        }
        return;
      }

      // Modo 'map' → recorrer recursivamente los objetos
      if (typeof permissions === "object") {
        for (const key of Object.keys(permissions)) {
          const node = permissions[key];
          if (Array.isArray(node._permissions)) {
            node._permissions.forEach(p => allPermsSet.add(p.permission_id));
          }
          if (node._children && Object.keys(node._children).length > 0) {
            extractPermissionIds(node._children);
          }
        }
      }
    };

    // Recorrer roles principales e hijos
    for (const r of myRoles) extractPermissionIds(r.permissions);
    for (const r of childRoles) extractPermissionIds(r.permissions);

    const meta = {
      my_roles_count: myRoles.length,
      child_roles_count: childRoles.length,
      unique_permissions: allPermsSet.size,
      grouped,
      mode,
      include_children: includeChildren,
      fetched_by: performed_by,
      fetched_at: new Date().toISOString(),
    };

    return res.status(200).json({
      message: 'Roles y permisos obtenidos correctamente.',
      data: {
        myRoles,
        childRoles
      },
      meta
    });

  } catch (err) {
    await connection.rollback();
    logger.error(`RoleController:getMyRolesWithPermissions Error: ${err.message}`, { stack: err.stack });
    return next(err);
  } finally {
    connection.release();
  }
};

/**
 * GET /roles/:id/permissions
 * - Lista permisos actuales del rol indicado
 * - Sólo si el rol fue creado por el usuario autenticado o por alguno de sus subusuarios (descendientes)
 * - meta: total de permisos del rol, fetched_by
* 
 * Query params:
 * - ?grouped=true (agrupa por módulos)
 * - ?mode=map|tree|flat (define formato de salida)
 */
export const getPermissionsByRole = async (req, res, next) => {
  const performed_by = req.user?.sub ?? null;
  const { id: role_id } = req.params;
  const targetRole = req.entity;

  const grouped = String(req.query.grouped || "").toLowerCase() === "true";
  const mode = ["tree", "map", "flat"].includes(req.query.mode)
    ? req.query.mode
    : "tree";

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1) Obtener permisos asociados al rol
    const rolePermRows = await RolePermission.findByRole(role_id, connection);
    const permIds = Array.from(new Set(rolePermRows.map((r) => r.permission_id)));
    const permissions =
      permIds.length > 0 ? await Permission.findByIds(permIds, connection) : [];

    // ✅ Aplicar buildPermissionTree si grouped=true
    const formattedPermissions = grouped
      ? buildPermissionTree(permissions, { mode })
      : permissions;

    await connection.commit();

    return res.status(200).json({
      message: "Permisos del rol obtenidos correctamente.",
      data: {
        role: {
          role_id: targetRole.role_id,
          name: targetRole.name,
          description: targetRole.description,
          created_by: targetRole.created_by,
          created_at: targetRole.created_at,
        },
        permissions: formattedPermissions,
      },
      meta: {
        total_permissions: permissions.length,
        grouped,
        mode,
        fetched_by: performed_by,
        fetched_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    await connection.rollback();
    logger.error(
      `PermissionController:getPermissionsByRole Error: ${err.message}`,
      { stack: err.stack }
    );
    return next(err);
  } finally {
    connection.release();
  }
};




// ================ CHILD-USERS ===========================

/**
 * POST /roles/childuser
 * Crea un usuario identificado por su creador. No permite duplicados por (email).
 * Body: { username, email, password }
 */
export const createChildUser = async (req, res, next) => {
  const created_by = req.user?.sub ?? null;
  const { username, email, password } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const existing = await User.findByEmail(email);

    if (existing) {
      await connection.rollback();
      logger.warn(
        `UserController:createUser Email already exists: ${username}`
      );
      return res.status(409).json({ error: "Email already exists" });
    }

    const password_hash = await hashPassword(password);
    const userId = await User.create({ username, email, password_hash, created_by }, connection);
    
    // Asignar rol 'ADMIN' (system role) - creado por sistema (created_by IS NULL)
    const sysRole = await Role.findByNameAndCreator({ name: 'ADMIN', created_by: null }, connection);
    if (!sysRole) {
      await connection.rollback();
      return res.status(500).json({ error: 'Rol de sistema ADMIN no encontrado' });
    }
    await UserRole.assign({ user_id: userId, role_id: sysRole.role_id, created_by: null }, connection);
    
    await connection.commit();

    const user = await User.findById(userId);

    logger.info(`UserController: createChildUser User created: user_id=${userId}`);
    res.status(201).json({ data: user });

  } catch (error) {
    try { await connection.rollback();} catch (_){} // Ignorar error rollback
    logger.error(`RoleController: createChildUser Error: ${error.message}`, { stack: error.stack, });
    return next(error);
  } finally {
    connection.release();
  }
};


/**
 * PUT /childuser/:id
 * Editar un child user. Solo si el child user pertenece al actor o a alguno de sus descendientes.
 * Body permitido: { username?, email?, status? }
 */
export const editChildUser = async (req, res, next) => {
  const performed_by = req.user?.sub ?? null;
  const { id: targetUserId } = req.params;
  const { username, email, status } = req.body;

  const target = req.entity;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1) validar cambios: al menos un campo
    const updates = {};
    if (typeof username === 'string' && username.trim() !== '') updates.username = username.trim();
    if (typeof status === 'string' && status.trim() !== '') updates.status = status.trim();

    // Si cambian email, validar unicidad (excluir al propio target)
    if (typeof email === 'string' && email.trim() !== '') {
      const emailLower = email.trim().toLowerCase();
      const existing = await User.findByEmail(emailLower, connection);
      if (existing && String(existing.user_id) !== String(target.user_id)) {
        await connection.rollback();
        return res.status(409).json({ message: 'El email ya está en uso.' });
      }
      updates.email = emailLower;
    }

    if (Object.keys(updates).length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Nada para actualizar.' });
    }

    // 2) aplicar update (User.update recibe ({id, updated_by}, fields, connection))
    await User.update({ id: target.user_id, updated_by: performed_by }, updates, connection);

    const updated = await User.findById(target.user_id, connection);

    await connection.commit();

    logger.info(`UserController: editChildUser user=${performed_by} updated child_user=${target.user_id}`);

    return res.status(200).json({
      message: 'Usuario actualizado correctamente.',
      data: updated,
      meta: {
        updated_by: performed_by,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    await connection.rollback();
    logger.error(`UserController: editChildUser Error: ${error.message}`, { stack: error.stack });
    return next(error);
  } finally {
    connection.release();
  }
};



/**
 * DELETE /childuser/:id
 * Soft delete de un usuario hijo (solo si eres ancestro).
 */
export const deleteChildUser = async (req, res, next) => {
  const performed_by = req.user?.sub ?? null;
  const { id: targetUserId } = req.params;

  const target = req.entity;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1) soft delete (marcar deleted_at y updated_by)
    await User.softDelete(target.user_id, performed_by, connection);

    // 2) (opcional) revocar tokens / limpiar relaciones - aquí no lo hago para mantener separación de responsabilidades
    // TODO: Si quieres que al borrar un usuario también se revoken refresh tokens, podemos llamar RefreshToken.revokeAllForUser(target.user_id, connection)

    await connection.commit();

    logger.info(`UserController: deleteChildUser user=${performed_by} soft-deleted child_user=${target.user_id}`);

    return res.status(200).json({
      message: 'Usuario eliminado (soft) correctamente.',
      meta: {
        deleted_by: performed_by,
        deleted_at: new Date().toISOString()
      }
    });
  } catch (error) {
    await connection.rollback();
    logger.error(`UserController: deleteChildUser Error: ${error.message}`, { stack: error.stack });
    return next(error);
  } finally {
    connection.release();
  }
};


/**
 * PUT /roles/childuser/:id
 * Asignar/Quitar roles a un usuario, solo si:
 *  - los roles fueron creados por el usuario autenticado
 *  - el usuario destino fue creado por el usuario autenticado
 *
 * Body esperada: { rolesIds: [1,2,3], action: 'assign' | 'remove' }
 */
export const asignRolToUser = async (req, res, next) => {
  const performed_by = req.user?.sub ?? null;
  const { id: user_id } = req.params;
  const { rolesIds = [], action = 'assign' } = req.body;

  const targetUser = req.entity;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1) Obtener roles CREADOS por el usuario autenticado
    const actorRolesRows = await Role.findByCreator(performed_by, connection); // [{role_id, ...}, ...]
    const actorRoleIds = (actorRolesRows || []).map(r => Number(r.role_id)).filter(Boolean);
    const actorRoleSet = new Set(actorRoleIds);

    // 2) Filtrar requested roles por los que el actor realmente posee
    const uniqueRequested = Array.from(new Set(rolesIds.map(r => Number(r)).filter(Boolean)));
    const allowed = uniqueRequested.filter(rid => actorRoleSet.has(rid));
    const disallowed = uniqueRequested.filter(rid => !actorRoleSet.has(rid));

    if (allowed.length === 0) {
      await connection.rollback();
      return res.status(403).json({
        message: 'No tienes permisos para operar sobre los roles solicitados.',
        meta: { requested: uniqueRequested.length, allowed: 0, disallowed }
      });
    }

    // 3) Ejecutar acción en batch
    let affected = 0;
    if (action === 'assign') {
      // assignBulk retorna affectedRows (insertadas)
      affected = await UserRole.assignBulk({ user_id: targetUser.user_id, rolesIds: allowed, created_by: performed_by }, connection);
    } else {
      // removeBulk retorna affectedRows (eliminadas)
      affected = await UserRole.removeBulk({ user_id: targetUser.user_id, rolesIds: allowed }, connection);
    }

    await connection.commit();

    const meta = {
      performed_by,
      target_user_id: targetUser.user_id,
      requested_count: uniqueRequested.length,
      allowed_count: allowed.length,
      disallowed_count: disallowed.length,
      acted_count: affected,
      action,
      timestamp: new Date().toISOString()
    };

    logger.info(`RoleController: assignOrRemoveRolesToChildUser user=${performed_by} action=${action} target=${targetUser.user_id} requested=${uniqueRequested.length} allowed=${allowed.length} affected=${affected}`);

    return res.status(200).json({
      message: action === 'assign' ? 'Roles asignados correctamente.' : 'Roles removidos correctamente.',
      data: {
        target_user_id: targetUser.user_id,
        requested_roles: uniqueRequested,
        allowed_roles: allowed,
        disallowed_roles: disallowed
      },
      meta
    });

  } catch (error) {
    await connection.rollback();

    logger.error(`RoleController: assignOrRemoveRolesToChildUser Error: ${error.message}`, { stack: error.stack });
    return next(error);
  } finally {
    connection.release();
  }
};


/**
 * GET /roles/childuser
 *  - Lista subusuarios que yo creé con sus roles actuales 
 *  - Si include_children=true, también incluye los usuarios creados por esos hijos (descendientes) con recursión hasta ?depth=n 
 * 
 * Query params:
 * - ?include_children=true
 * - ?depth=<number>  (profundidad máxima de recursión)
 */
export const getChildusers = async (req, res, next) => {
  const performed_by = req.user?.sub ?? null;

  const includeChildren = String(req.query.include_children || '').toLowerCase() === 'true';
  const depth = parseInt(req.query.depth, 10);
  const maxDepth = isNaN(depth) ? 1 : Math.max(1, Math.min(depth, 10)); // máximo permitido: 10 niveles

  const connection = await pool.getConnection();

  /**
   * 🔁 Función recursiva para obtener usuarios con roles
   * @param {number|string} parentId - ID del usuario raíz actual
   * @param {number} currentDepth - nivel actual
   * @param {number} maxDepth - nivel máximo de recursión
   * @param {object} connection - conexión MySQL
   * @returns {Promise<Array>} lista de usuarios con roles y children
   */
  const fetchUsersWithRolesRecursive = async (parentId, currentDepth, maxDepth, connection) => {
    // 1️⃣ obtener hijos directos
    const children = await User.getChildren(parentId, connection);
    if (!children || children.length === 0) return [];

    const childIds = children.map(u => u.user_id);

    // 2️⃣ obtener roles asignados a esos hijos
    const roles = await UserRole.findRolesByUsers(childIds, connection);
    const rolesByUser = new Map();
    for (const r of roles) {
      const uid = String(r.user_id);
      if (!rolesByUser.has(uid)) rolesByUser.set(uid, []);
      rolesByUser.get(uid).push({
        role_id: r.role_id,
        name: r.name,
        description: r.description,
        created_by: r.created_by,
        created_at: r.created_at
      });
    }

    // 3️⃣ construir estructura de usuario con roles
    const usersWithRoles = [];
    for (const user of children) {
      const u = {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        status: user.status,
        created_by: user.created_by,
        roles: rolesByUser.get(String(user.user_id)) || []
      };

      // 4️⃣ si no se ha alcanzado el límite → recursión
      if (includeChildren && currentDepth < maxDepth) {
        u.children = await fetchUsersWithRolesRecursive(user.user_id, currentDepth + 1, maxDepth, connection);
      } else {
        u.children = [];
      }

      usersWithRoles.push(u);
    }

    return usersWithRoles;
  };

  try {
    await connection.beginTransaction();

    // 🔹 nivel raíz (usuario actual)
    const rootUsers = await fetchUsersWithRolesRecursive(performed_by, 1, maxDepth, connection);

    await connection.commit();

    // 🔹 Meta
    const flatten = (arr) => {
      let out = [];
      for (const u of arr) {
        out.push(u);
        if (u.children && u.children.length > 0) {
          out = out.concat(flatten(u.children));
        }
      }
      return out;
    };
    const allUsers = flatten(rootUsers);
    const totalRoles = new Set();
    allUsers.forEach(u => u.roles.forEach(r => totalRoles.add(r.role_id)));

    const meta = {
      root_user: performed_by,
      total_users: allUsers.length,
      total_roles: totalRoles.size,
      include_children: includeChildren,
      depth_used: maxDepth,
      fetched_at: new Date().toISOString()
    };

    return res.status(200).json({
      message: 'Subusuarios y roles obtenidos correctamente.',
      data: rootUsers,
      meta
    });

  } catch (error) {
    await connection.rollback();
    logger.error(`UserController:getChildusers Error: ${error.message}`, { stack: error.stack });
    return next(error);
  } finally {
    connection.release();
  }
};



/**
 * POST /congress/:id/register
 * - Registra o actualiza un usuario y sus datos personales (USER + USERDATA) 
 *   y lo inscribe en un congreso específico.
 * - Crea el usuario si no existe (por email), con contraseña = dni (hash).
 * - Si ya existe, actualiza campos básicos y sus datos personales.
 * - Asigna automáticamente el rol del sistema "USER" (created_by IS NULL).
 * - Crea la inscripción (REGISTRATION) asegurando unicidad por transacción (race-safe).
 * - Genera codQR único basado en registrationId + email + id de congreso.
 *
 * Body:
 * {
 *   user: { email, username? },
 *   userdata: { dni, nombres, apellidos, telefono?, ciudad?, centro_estudios? },
 *   tariff_id?: number
 * }
 *
 * Respuesta:
 *  - user creado/actualizado
 *  - userdata asociada
 *  - rol asignado
 *  - inscripción creada (con codQR único)
 *
 * Meta:
 *  - performed_by: ID del usuario autenticado
 *  - codqr generado
 *  - timestamp de creación
 */
export const getChilduseById = async (req, res, next) => {
  const performed_by = req.user?.sub ?? null;
  const { id: childId } = req.params;

  const targetUser = req.entity;

  const includeChildren = String(req.query.include_children || '').toLowerCase() === 'true';
  const depth = parseInt(req.query.depth, 10);
  const maxDepth = isNaN(depth) ? 1 : Math.max(1, Math.min(depth, 10)); // límite razonable 10

  const connection = await pool.getConnection();

  /**
   * Función recursiva (devuelve ARRAY de usuarios con roles y children) para partir desde un parentId.
   * Nota: esta función devuelve LOS HIJOS del parentId (no incluye al parent).
   */
  const fetchUsersWithRolesRecursive = async (parentId, currentDepth, maxDepth, connection) => {
    // obtener hijos directos
    const children = await User.getChildren(parentId, connection);
    if (!children || children.length === 0) return [];

    const childIds = children.map(u => u.user_id);

    // obtener roles para estos hijos en batch
    const rolesRows = await UserRole.findRolesByUsers(childIds, connection); // [{ user_id, role_id, name, ... }, ...]
    const rolesByUser = new Map();
    for (const r of rolesRows) {
      const uid = String(r.user_id);
      if (!rolesByUser.has(uid)) rolesByUser.set(uid, []);
      rolesByUser.get(uid).push({
        role_id: r.role_id,
        name: r.name,
        description: r.description,
        created_by: r.created_by,
        created_at: r.created_at
      });
    }

    // armar nodos
    const usersWithRoles = [];
    for (const user of children) {
      const node = {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        status: user.status,
        created_by: user.created_by,
        roles: rolesByUser.get(String(user.user_id)) || []
      };

      if (includeChildren && currentDepth < maxDepth) {
        node.children = await fetchUsersWithRolesRecursive(user.user_id, currentDepth + 1, maxDepth, connection);
      } else {
        node.children = [];
      }
      usersWithRoles.push(node);
    }

    return usersWithRoles;
  };

  try {
    await connection.beginTransaction();

    // 1) Obtener roles del target en batch (aunque sea 1 id usamos misma función)
    const rolesRows = await UserRole.findRolesByUsers([targetUser.user_id], connection); // puede devolver [] si no tiene roles
    const roles = (rolesRows || []).map(r => ({
      role_id: r.role_id,
      name: r.name,
      description: r.description,
      created_by: r.created_by,
      created_at: r.created_at
    }));

    // 2) Obtener children recursivos a partir del target (si aplica)
    let children = [];
    if (includeChildren && maxDepth > 0) {
      // empezamos recursión desde nivel 1
      children = await fetchUsersWithRolesRecursive(targetUser.user_id, 1, maxDepth, connection);
    }

    await connection.commit();

    // 3) Meta: flatten para conteos
    const flatten = (nodes) => {
      const out = [];
      for (const n of nodes) {
        out.push(n);
        if (n.children && n.children.length > 0) out.push(...flatten(n.children));
      }
      return out;
    };
    const allReturnedUsers = [{
      user_id: targetUser.user_id,
      username: targetUser.username,
      email: targetUser.email,
      status: targetUser.status,
      created_by: targetUser.created_by,
      roles
    }, ...flatten(children)];

    const totalUniqueRoleIds = new Set();
    allReturnedUsers.forEach(u => (u.roles || []).forEach(r => totalUniqueRoleIds.add(r.role_id)));

    const meta = {
      requested_child_id: String(childId),
      root_owner: performed_by,
      total_users_returned: allReturnedUsers.length,
      total_unique_roles: totalUniqueRoleIds.size,
      include_children: includeChildren,
      depth_used: maxDepth,
      fetched_by: performed_by,
      fetched_at: new Date().toISOString()
    };

    // 4) Respuesta
    return res.status(200).json({
      message: 'Subusuario obtenido correctamente.',
      data: {
        user: {
          user_id: targetUser.user_id,
          username: targetUser.username,
          email: targetUser.email,
          status: targetUser.status,
          created_by: targetUser.created_by,
          roles,
          children
        }
      },
      meta
    });

  } catch (error) {
    await connection.rollback();
    logger.error(`UserController:getChilduseById Error: ${error.message}`, { stack: error.stack });
    return next(error);
  } finally {
    connection.release();
  }
};


// ================== OPCIONALES ========================

/**
 * GET /roles?depth=5
 * Lista roles que yo creé y en childRoles un árbol con roles creados por mis usuarios hijos recursivamente.
 */
export const getRoles = async (req, res, next) => {
  const performed_by = req.user?.sub ?? null;

  // depth opcional para limitar recursión (por seguridad / perf). Valor por defecto 10.
  const maxDepth = Math.max(1, parseInt(req.query.depth || '10', 10));

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1) Roles que YO creé
    const rolesMyCreated = await Role.findByCreator(performed_by, connection);

    // 2) Construir árbol de usuarios hijos recursivo y obtener roles creados por cada usuario
    const buildUserTree = async (userId, depthLeft) => {
      if (depthLeft <= 0) return [];

      // obtener hijos directos (usuarios creados por userId)
      const children = await User.getChildren(userId, connection);
      if (!children || children.length === 0) return [];

      const result = [];
      for (const child of children) {
        // roles que este child creó
        const childRoles = await Role.findByCreator(child.user_id, connection);

        // recursivamente obtener sub-children
        const subChildRoles = await buildUserTree(child.user_id, depthLeft - 1);

        result.push({
          user_id: child.user_id,
          username: child.username ?? null,
          email: child.email ?? null,
          status: child.status ?? null,
          roles: childRoles,
          childRoles: subChildRoles
        });
      }
      return result;
    };

    const childRolesTree = await buildUserTree(performed_by, maxDepth);

    await connection.commit();

    return res.status(200).json({
      message: 'Roles obtenidos correctamente.',
      data: {
        myRoles: rolesMyCreated,
        childRoles: childRolesTree
      }
    });
  } catch (err) {
    await connection.rollback();
    logger.error(`RoleController:getRoles Error: ${err.message}`, { stack: err.stack });
    return next(err);
  } finally {
    connection.release();
  }
};


/**
 * GET /users?depth=5
 * Retorna: usuarios que YO creé (direct children) y en cada uno su childUsers recursivo.
 */
export const getUsers = async (req, res, next) => {
  const performed_by = req.user?.sub ?? null;

  // Limitar profundidad para evitar recorridos infinitos o caros. Default 10.
  const maxDepth = Math.max(1, parseInt(req.query.depth || '10', 10));

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1) Obtener usuarios creados directamente por el usuario autenticado
    const myDirectChildren = await User.getChildren(performed_by, connection);

    // 2) Función recursiva (orquestación) para construir childUsers
    const buildChildTree = async (userId, depthLeft) => {
      if (depthLeft <= 0) return [];

      const children = await User.getChildren(userId, connection);
      if (!children || children.length === 0) return [];

      const result = [];
      for (const child of children) {
        // Para cada child, obtenemos sus hijos recursivamente
        const grandchildren = await buildChildTree(child.user_id, depthLeft - 1);

        result.push({
          user_id: child.user_id,
          username: child.username ?? null,
          email: child.email ?? null,
          status: child.status ?? null,
          created_by: child.created_by ?? null,
          childUsers: grandchildren
        });
      }
      return result;
    };

    // Construir árbol para cada usuario creado por mí
    const usersWithChildren = [];
    for (const u of myDirectChildren) {
      const nested = await buildChildTree(u.user_id, maxDepth - 1); // -1 porque el nivel 1 ya son direct children
      usersWithChildren.push({
        user_id: u.user_id,
        username: u.username ?? null,
        email: u.email ?? null,
        status: u.status ?? null,
        created_by: u.created_by ?? null,
        childUsers: nested
      });
    }

    await connection.commit();

    return res.status(200).json({
      message: 'Usuarios obtenidos correctamente.',
      data: {
        myUsers: usersWithChildren,
      }
    });
  } catch (err) {
    await connection.rollback();
    logger.error(`UserController:getUsers Error: ${err.message}`, { stack: err.stack });
    return next(err);
  } finally {
    connection.release();
  }
};

