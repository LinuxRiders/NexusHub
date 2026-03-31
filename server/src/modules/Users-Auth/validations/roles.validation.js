import { body, param, query } from 'express-validator';

/**
 * Validación para crear un Rol
 * Campos requeridos: name (string no vacío), description (string opcional)
 */
export const createRolValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre del rol es obligatorio')
        .isString().withMessage('El nombre del rol debe ser una cadena de texto')
        .isLength({ max: 100 }).withMessage('El nombre del rol no debe superar los 100 caracteres'),

    body('description')
        .optional({ nullable: true })
        .isString().withMessage('La descripción debe ser una cadena de texto')
        .isLength({ max: 255 }).withMessage('La descripción no debe superar los 255 caracteres'),
];

/**
 * Validaciones para:
 * PUT /roles/childuser/:id
 * Body:
 *   - rolesIds: array obligatorio de enteros (IDs de roles)
 *   - action: opcional, 'assign' | 'remove'
 */
export const asignRolToUserValidation = [
    // Validar rolesIds
    body('rolesIds')
        .exists().withMessage('El campo "rolesIds" es obligatorio.')
        .bail()
        .isArray({ min: 1 }).withMessage('"rolesIds" debe ser un array no vacío.')
        .bail()
        .custom((arr) => arr.every((n) => Number.isInteger(n) && n > 0))
        .withMessage('Todos los valores de "rolesIds" deben ser enteros positivos.'),

    // Validar action
    body('action')
        .optional()
        .isString().withMessage('"action" debe ser una cadena.')
        .bail()
        .isIn(['assign', 'remove'])
        .withMessage('"action" debe ser uno de los siguientes valores: assign | remove')
];

/**
 * Validación para listar roles creados por el usuario (GET /roles/mine?depth=5)
 */
export const getRolesValidation = [
    query('depth')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('El parámetro depth debe ser un entero entre 1 y 50'),
];


/**
 * Validación para crear un usuario hijo
 * Campos requeridos: username, email, password
 */
export const createChildUserValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('El nombre de usuario es obligatorio')
        .isString().withMessage('El nombre de usuario debe ser una cadena de texto')
        .isLength({ min: 3, max: 50 }).withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres'),

    body('email')
        .trim()
        .notEmpty().withMessage('El correo electrónico es obligatorio')
        .isEmail().withMessage('Debe proporcionar un correo electrónico válido')
        .isLength({ max: 100 }).withMessage('El correo electrónico no debe superar los 100 caracteres')
        .normalizeEmail({ gmail_remove_dots: false }),

    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
        .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
        .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número'),
];

/**
 * Validación para listar usuarios creados por el usuario autenticado
 * (GET /users/mine?depth=5)
 */
export const getUsersValidation = [
    query('depth')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('El parámetro depth debe ser un entero entre 1 y 50'),
];



/**
 * Validaciones para:
 * POST /roles/:id/permissions
 * Body: { permissionIds: [1,2,3], action: 'assign' | 'remove' }
 */
export const asignPermissionsToRoleValidation = [
    // Validar array de permissionIds
    body('permissionIds')
        .exists().withMessage('El campo "permissionIds" es obligatorio.')
        .bail()
        .isArray({ min: 1 }).withMessage('"permissionIds" debe ser un array no vacío.')
        .bail()
        .custom((arr) => arr.every(Number.isInteger))
        .withMessage('Todos los valores de "permissionIds" deben ser enteros.'),

    // Validar campo action
    body('action')
        .optional()
        .isIn(['assign', 'remove'])
        .withMessage('"action" debe ser uno de los siguientes valores: assign | remove')
];

/**
 * Validaciones para:
 * GET /roles/permissions/me
 * Query Params:
 *   - grouped: boolean opcional ('true' | 'false')
 *   - mode: opcional ('map' | 'tree' | 'flat')
 */
export const getMyPermissionsValidation = [
    // Validar grouped
    query('grouped')
        .optional()
        .isString().withMessage('"grouped" debe ser una cadena.')
        .bail()
        .custom((value) => {
            const val = value.toLowerCase();
            return val === 'true' || val === 'false';
        })
        .withMessage('"grouped" debe ser "true" o "false".'),

    // Validar mode
    query('mode')
        .optional()
        .isString().withMessage('"mode" debe ser una cadena.')
        .bail()
        .isIn(['map', 'tree', 'flat'])
        .withMessage('"mode" debe ser uno de los siguientes valores: map | tree | flat')
];


/**
 * Validaciones para:
 * GET /roles/permissions
 * Query Params:
 *   - include_children: boolean opcional ('true' | 'false')
 *   - grouped: boolean opcional ('true' | 'false')
 *   - mode: opcional ('map' | 'tree' | 'flat')
 */
export const getMyRolesWithPermissionsValidation = [
    // Validar include_children
    query('include_children')
        .optional()
        .isString().withMessage('"include_children" debe ser una cadena.')
        .bail()
        .custom((value) => {
            const val = value.toLowerCase();
            return val === 'true' || val === 'false';
        })
        .withMessage('"include_children" debe ser "true" o "false".'),

    // Validar grouped
    query('grouped')
        .optional()
        .isString().withMessage('"grouped" debe ser una cadena.')
        .bail()
        .custom((value) => {
            const val = value.toLowerCase();
            return val === 'true' || val === 'false';
        })
        .withMessage('"grouped" debe ser "true" o "false".'),

    // Validar mode
    query('mode')
        .optional()
        .isString().withMessage('"mode" debe ser una cadena.')
        .bail()
        .isIn(['map', 'tree', 'flat'])
        .withMessage('"mode" debe ser uno de los siguientes valores: map | tree | flat')
];


/**
 * Validaciones para:
 * GET /roles/:id/permissions
 * Query Params:
 *   - grouped: boolean opcional ('true' | 'false')
 *   - mode: opcional ('map' | 'tree' | 'flat')
 */
export const getPermissionsByRoleValidation = [
    // Validar grouped
    query('grouped')
        .optional()
        .isString().withMessage('"grouped" debe ser una cadena.')
        .bail()
        .custom((value) => {
            const val = value.toLowerCase();
            return val === 'true' || val === 'false';
        })
        .withMessage('"grouped" debe ser "true" o "false".'),

    // Validar mode
    query('mode')
        .optional()
        .isString().withMessage('"mode" debe ser una cadena.')
        .bail()
        .isIn(['map', 'tree', 'flat'])
        .withMessage('"mode" debe ser uno de los siguientes valores: map | tree | flat')
];


/**
 * Validaciones para:
 * GET /roles/childuser
 * Query params:
 *   - include_children: opcional, debe ser 'true' o 'false'
 *   - depth: opcional, entero entre 1 y 10
 */
export const getChildusersValidation = [
    // include_children: opcional, true o false
    query('include_children')
        .optional()
        .isString().withMessage('"include_children" debe ser una cadena.')
        .bail()
        .custom((value) => ['true', 'false'].includes(value.toLowerCase()))
        .withMessage('"include_children" debe ser "true" o "false".'),

    // depth: opcional, entero entre 1 y 10
    query('depth')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('"depth" debe ser un número entero entre 1 y 10.')
];


/**
 * Validaciones para:
 * GET /roles/childuser/:id
 * Query params:
 *   - include_children: opcional, debe ser 'true' o 'false'
 *   - depth: opcional, entero entre 1 y 10
 */
export const getChilduseByIdValidation = [
    // include_children: opcional ('true' o 'false')
    query('include_children')
        .optional()
        .isString().withMessage('"include_children" debe ser una cadena.')
        .bail()
        .custom((value) => ['true', 'false'].includes(value.toLowerCase()))
        .withMessage('"include_children" debe ser "true" o "false".'),

    // depth: opcional, entero entre 1 y 10
    query('depth')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('"depth" debe ser un número entero entre 1 y 10.')
];