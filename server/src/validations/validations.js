import { param, body } from 'express-validator';

// 1) Validar parámetro ":id" como entero positivo
export const idParamValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El id debe ser un entero positivo')
];
