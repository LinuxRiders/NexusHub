import { validationResult } from 'express-validator';

// Middleware para validar los datos de entrada usando express-validator
export const validateResults = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    // Si hay errores de validación, devolver una respuesta con los errores
    return res.status(422).json({
        statusCode: 422,
        error: errors.array()
    });
};



