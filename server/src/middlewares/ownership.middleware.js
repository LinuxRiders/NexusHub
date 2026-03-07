import logger from '../utils/logger.js';
import pool from '../config/db.js';
import { User } from '../modules/Users-Auth/models/user.model.js';

/**
 * Middleware genérico para validar si el usuario autenticado (req.user.sub)
 * tiene permiso "de hecho" sobre una entidad basada en:
 *  - comparación directa con un campo (por defecto `created_by`)
 *  - opcional verificación por descendencia (usar User.getDescendantIds)
 *  - soporte para comparar distintos campos (ej: comparar owner con created_by o user_id)
 *
 * Diseño y decisiones:
 * - No abre transacciones. El middleware solo *consulta* y decide acceso.
 * - Permite pasar:
 *    - getEntity: async (req) => entity  OR
 *    - model + idParam: { model: Role, idParam: 'id', idField: 'role_id' }
 * - Parámetros de comportamiento para optimizar (evitar obtener descendientes si no necesario).
 * - Añade req.entity (o req.targetEntity) para que el controller reuse el resultado.
 *
 * Uso típico:
 *  router.put('/:id', verifyOwnership({
 *     model: Role,
 *     idParam: 'id',
 *     idField: 'role_id',           // optional: name of PK field
 *     ownerFieldToCompare: 'created_by', // campo en la entidad que indica owner
 *     descendantCompareField: 'created_by', // si provided -> buscar descendantIds e incluir check
 *     checkDescendants: true        // default true | false
 *  }), editRol);
 *
 * ------------------------------------------------------------------------------------------
 * @param {Object} options - Configuración del middleware
 * @param {Function} [options.getEntity] - async fn(req) => entity. Si se provee, tiene prioridad.
 * @param {Object} [options.model] - modelo con método findById / findByIdForUpdate que acepta (id, connection)
 * @param {string} [options.idParam='id'] - nombre del param en req.params que contiene el id
 * @param {string} [options.idField] - nombre del campo PK en la entidad (ej 'role_id'). Opcional.
 * @param {string} [options.ownerFieldToCompare='created_by'] - campo en entity a comparar con actor (ej created_by).
 * @param {string|null} [options.descendantCompareField=null] - campo en entity que se usará para comparar con descendantIds.
 *        Si null, se usa ownerFieldToCompare para la comparación de descendencia.
 * @param {boolean} [options.checkDescendants=true] - si true buscará descendientes; false solo verifica propiedad directa.
 * @param {Function} [options.getDescendants] - async fn(actorId) => [ids], por defecto User.getDescendantIds
 * @param {boolean} [options.attachAs='entity'] - nombre de la prop a adjuntar en req (req.entity o req.targetUser)
 *
 * @returns express middleware (req,res,next)
 */

export const verifyOwnership = (options = {}) => {
    const {
        getEntity = null,
        model = null,
        idParam = 'id',
        idField = null,
        ownerFieldToCompare = 'created_by',
        descendantCompareField = null,
        checkDescendants = true,
        getDescendants = (actorId, connection = pool) => User.getDescendantIds(actorId, connection),
        attachAs = 'entity',
    } = options;

    // helper: obtiene entidad usando getEntity o model + idParam
    const fetchEntity = async (req) => {
        if (typeof getEntity === 'function') {
            return await getEntity(req);
        }
        if (model) {
            const idVal = req.params?.[idParam];
            if (typeof model.findById === 'function') {
                return await model.findById(idVal);
            }
            // fallback: try generic find
            const [rows] = await pool.query(`SELECT * FROM ${model.tableName} WHERE ${idField || 'id'} = ? LIMIT 1`, [idVal]);
            return rows[0] || null;
        }
        throw new Error('verifyOwnership: no getEntity nor model provided');
    };

    return async (req, res, next) => {
        try {
            const actor = req.user?.sub ?? null;
            if (!actor) return res.status(401).json({ message: 'No autenticado' });

            const entity = await fetchEntity(req);
            if (!entity) return res.status(404).json({ message: 'Entidad no encontrada' });

            // comparación directa
            const ownerValue = entity[ownerFieldToCompare];
            const ownerMatchesActor = (String(ownerValue) === String(actor));

            // decidir si chequear descendientes
            let isDescendantMatch = false;
            if (checkDescendants) {
                // campo a comparar contra la lista de descendantIds
                const compareField = descendantCompareField || ownerFieldToCompare;
                // obtener lista de descendant ids del actor
                const descendantIds = await getDescendants(actor);
                // comparar (map to string to avoid type issues)
                isDescendantMatch = Array.isArray(descendantIds) && descendantIds.map(String).includes(String(entity[compareField]));
            }

            if (!ownerMatchesActor && !isDescendantMatch) {
                return res.status(403).json({ message: 'No tienes permiso para operar esta entidad.' });
            }

            // adjuntar la entidad en req para evitar re-query en controller
            req[attachAs] = entity;
            return next();
        } catch (err) {
            logger.error(`[Middleware]:verifyOwnership Error: ${err.message}`, { stack: err.stack });
            return next(err);
        }
    };
};
