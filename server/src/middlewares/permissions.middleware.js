import logger from '../utils/logger.js';


/**
 * Helper: resolver placeholder
 * Soporta:
 *   {:paramName} => req.params.paramName
 *   {:query.name} => req.query.name
 *   {:body.field} => req.body.field
 * Si no encuentra valor, devuelve null para la variable.
 */
const resolvePlaceholder = (pattern, req) => {
  // pattern sin llaves, ejemplo "id" o "query.page"
  const parts = String(pattern || '').split('.');
  if (parts.length === 1) {
    return req.params?.[parts[0]] ?? null;
  }
  if (parts[0] === 'query') return req.query?.[parts[1]] ?? null;
  if (parts[0] === 'body') return req.body?.[parts[1]] ?? null;
  // fallback a params
  return req.params?.[parts[parts.length - 1]] ?? null;
};

/**
 * Sustituye placeholders en una cadena:
 * "congress:{:id}:registrar:see" -> "congress:21:registrar:see" (si req.params.id === 21)
 */
const interpolatePermissionString = (permString, req) => {
  if (!permString || typeof permString !== 'string') return permString;
  return permString.replace(/\{\:\s*([^\}]+)\s*\}/g, (m, p1) => {
    const val = resolvePlaceholder(p1.trim(), req);
    return (typeof val === 'undefined' || val === null) ? '__MISSING__' : String(val);
  });
};

/**
 * parsePermString:
 * Perm string formato: "module:sub:sub:action" o "module:sub:sub:action"
 * Después de interpolar, la última porción es action; las previas forman module.
 * Devuelve { module, action }.
 */
const parsePermString = (raw) => {
  const s = String(raw || '').trim().toLowerCase();
  const parts = s.split(':').map(x => x.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const action = parts.pop();
  const module = parts.join(':');
  return { module, action };
};


/**
 * Middleware: requirePermission
 * 
 * - Valida si el usuario autenticado posee los permisos requeridos según el modo.
 * - Formato esperado del JWT:
 *     req.user = {
 *        sub: user_id,
 *        roles: [{ role_id, name }],
 *        permissions: [{ module, action }]
 *     }
 * 
 * @param {string|string[]} requiredPerms - Ej: 'users:read' o ['module:submodule:action', 'roles:assign']  (puede incluir placeholders {:id})
 * @param {'OR'|'AND'} mode - Lógica de validación. OR = basta uno, AND = todos los permisos
 */
export const requirePermission = (requiredPerms, mode = 'OR') => {
    // Normaliza a array
    const permsRequested = Array.isArray(requiredPerms) ? requiredPerms : [requiredPerms];

    if (!permsRequested.length) throw new Error('requirePermission necesita al menos un permiso válido');

    const modeUpper = String(mode || 'OR').toUpperCase();
    if (!['OR','AND'].includes(modeUpper)) throw new Error('requirePermission: mode debe ser "OR" o "AND"');

    return (req, res, next) => {
        try {
            const user = req.user;

            if (!user || !Array.isArray(user.permissions)) {
                logger.warn(`RequirePermission: usuario no autenticado o sin permisos en ruta ${req.originalUrl}`);
                return res.status(403).json({ error: 'Acceso denegado' });
            }

            // Primero interpolar placeholders en permisos requeridos (usando req)
            const resolvedReqPerms = permsRequested.map(p => interpolatePermissionString(p, req));

            // Parsear a estructuras {module, action}
            const parsedReqPerms = resolvedReqPerms
                .map(r => parsePermString(r))
                .filter(Boolean);

            // Normalizar permisos del usuario (desde JWT): { module, action } en lowercase
            const normalizedUserPerms = user.permissions
                .map(p => ({
                module: String((p.module || '')).trim().toLowerCase(),
                action: String((p.action || '')).trim().toLowerCase()
                }))
                .filter(p => p.module && p.action);

            // Helper: chequea si un permiso requerido lo satisface ANY permiso del usuario
            const satisfies = (reqPerm) => {
                // si interp falló y dejó __MISSING__ -> no puede cumplirse
                if (String(reqPerm.module).includes('__missing__') || String(reqPerm.action).includes('__missing__')) return false;
                return normalizedUserPerms.some(up => up.module === reqPerm.module && up.action === reqPerm.action);
            };

            let hasPermission = false;
            if (modeUpper === 'OR') {
                hasPermission = parsedReqPerms.some(satisfies);
            } else {
                hasPermission = parsedReqPerms.every(satisfies);
            }

            if (!hasPermission) {
                logger.info(`RequirePermission: Permiso insuficiente user=${user.sub} ruta=${req.originalUrl} modo=${modeUpper} req=${JSON.stringify(resolvedReqPerms)}`);
                return res.status(403).json({ error: 'Permiso insuficiente' });
            }

            return next();

        } catch (err) {
            logger.error(`RequirePermission: Error interno en ruta ${req.originalUrl} - ${err.message}`, { stack: err.stack });
            return res.status(500).json({ error: 'Error interno al validar permisos' });
        }
    };
};


/**
 * Middleware: requireRole
 *
 * - Verifica si el usuario autenticado tiene al menos uno de los roles requeridos.
 * - Formato esperado del JWT:
 *   req.user = {
 *      sub: user_id,
 *      roles: [{ role_id, name }],
 *      permissions: [{ module, action }]
 *   }
 *
 * @param {string|string[]} requiredRoles - Ej: 'admin' o ['admin', 'editor']
 */
export const requireRole = (requiredRoles) => {
    // Normalizamos y convertimos todo a lowercase
    const parsedRoles = (Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles])
        .map(r => String(r || '').trim().toLowerCase())
        .filter(Boolean);

    if (parsedRoles.length === 0) {
        throw new Error('requireRole necesita al menos un rol válido');
    }

    return async (req, res, next) => {
        try {
            const user = req.user;

            if (!user || !Array.isArray(user.roles)) {
                logger.warn(`RequireRole: usuario no autenticado o sin roles en ruta ${req.originalUrl}`);
                return res.status(403).json({ error: 'Acceso denegado' });
            }

            // Validación tipo OR: basta con tener uno de los roles requeridos
            const hasRole = user.roles.some(role =>
                parsedRoles.includes(String(role.name || '').toLowerCase())
            );

            if (!hasRole) {
                logger.info(
                    `RequireRole: Rol insuficiente user=${user.sub} ruta=${req.originalUrl}`,
                    { required: parsedRoles, userRoles: user.roles.map(r => r.name) }
                );
                return res.status(403).json({ error: 'Rol insuficiente' });
            }

            next();

        } catch (err) {
            logger.error(`RequireRole: Error interno en ruta ${req.originalUrl} - ${err.message}`, { stack: err.stack });
            return res.status(500).json({ error: 'Error interno al validar rol' });
        }
    };
};