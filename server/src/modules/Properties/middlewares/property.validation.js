import { check } from 'express-validator';
import { validateResults } from '../../../middlewares/validationResult.js';

export const validateCreateProperty = [
  check('property_type').notEmpty().withMessage('El tipo de inmueble es requerido'),
  check('operation_type').isIn(['COMPRA', 'ALQUILER']).withMessage('Tipo de operación inválido'),
  check('price').isNumeric().withMessage('El precio debe ser un número'),
  check('rooms').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Habitaciones debe ser un entero'),
  check('bathrooms').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Baños debe ser un entero'),
  check('mt2').optional({ checkFalsy: true }).isNumeric().withMessage('Metros cuadrados debe ser número'),
  check('images').optional().isArray().withMessage('Las imágenes deben ser una lista de enlaces'),
  check('status').optional().isIn(['BORRADOR', 'PUBLICADO']).withMessage('Estado inválido'),
  (req, res, next) => validateResults(req, res, next)
];

export const validateUpdateProperty = [
  check('property_type').optional().notEmpty().withMessage('El tipo de inmueble no puede estar vacío'),
  check('operation_type').optional().isIn(['COMPRA', 'ALQUILER']).withMessage('Tipo de operación inválido'),
  check('price').optional({ checkFalsy: true }).isNumeric().withMessage('El precio debe ser un número'),
  check('images').optional().isArray().withMessage('Las imágenes deben ser una lista de enlaces'),
  check('status').optional().isIn(['BORRADOR', 'PUBLICADO']).withMessage('Estado inválido'),
  (req, res, next) => validateResults(req, res, next)
];
