import { body } from 'express-validator';

export const updateProfileValidation = [
    body('username')
        .optional()
        .trim()
        .notEmpty().withMessage('El username no puede estar vacío.')
        .isLength({ min: 3, max: 100 }).withMessage('El username debe tener entre 3 y 100 caracteres.'),
    body('nombres')
        .optional()
        .trim()
        .notEmpty().withMessage('Los nombres no pueden estar vacíos.')
        .isLength({ max: 100 }).withMessage('Los nombres deben tener máximo 100 caracteres.'),
    body('apellidos')
        .optional()
        .trim()
        .notEmpty().withMessage('Los apellidos no pueden estar vacíos.')
        .isLength({ max: 100 }).withMessage('Los apellidos deben tener máximo 100 caracteres.'),
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Debes ingresar un correo electrónico válido.')
        .normalizeEmail({ gmail_remove_dots: false }),
    body('telefono')
        .optional()
        .trim()
        .isLength({ max: 20 }).withMessage('El teléfono no debe superar los 20 caracteres.'),
    body('pais')
        .optional()
        .trim()
        .isLength({ max: 30 }).withMessage('El país no debe superar los 30 caracteres.')
];
