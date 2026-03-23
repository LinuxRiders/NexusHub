import { body, query } from 'express-validator';

export const loginValidation = [
    // body('email').isEmail().notEmpty(), TODO: revisar si es necesario normalizarEmail
    body('email').notEmpty(),
    body('password').isString().notEmpty()
];

export const registerValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('El nombre de usuario es obligatorio')
        .isLength({ min: 3, max: 50 }).withMessage('El usuario debe tener entre 3 y 50 caracteres')
        .escape(), // Prevenir XSS
    body('email')
        .trim()
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/\d/).withMessage('Debe contener un número') // Descomentar para más seguridad
        .matches(/[A-Z]/).withMessage('Debe contener una mayúscula')
        .trim()
];

export const verifyActionValidation = [
    query('token')
        .notEmpty().withMessage('El token es obligatorio')
        .isHexadecimal().withMessage('Formato de token inválido') 
        .trim(),
    query('action_type')
        .notEmpty().withMessage('El tipo de acción es obligatorio')
        .isString()
        .trim()
];


export const resendValidation = [
    body('email')
        .trim()
        .isEmail().withMessage('Email inválido')
        .normalizeEmail()
];


export const forgotPasswordValidation = [
    body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail()
];

export const resetPasswordValidation = [
    body('token').notEmpty().withMessage('Token requerido'),
    body('newPassword')
        .isString()
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
        .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
        .matches(/\d/).withMessage('La contraseña debe contener al menos un número')
        .matches(/[\W_]/).withMessage('La contraseña debe contener al menos un carácter especial')
];