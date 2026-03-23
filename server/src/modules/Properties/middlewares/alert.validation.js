import { check } from 'express-validator';
import { validateResults } from '../../../middlewares/validationResult.js';

export const validateCreateAlert = [
  check('title').notEmpty().withMessage('El título es requerido'),
  check('is_buy').optional().isBoolean(),
  check('is_rent').optional().isBoolean(),
  check('min_price').optional({ checkFalsy: true }).isNumeric().withMessage('Mínimo precio inválido'),
  check('max_price').optional({ checkFalsy: true }).isNumeric().withMessage('Máximo precio inválido'),
  check('min_mt2').optional({ checkFalsy: true }).isNumeric(),
  check('max_mt2').optional({ checkFalsy: true }).isNumeric(),
  (req, res, next) => validateResults(req, res, next)
];

export const validateUpdateAlert = [
  check('title').optional().notEmpty().withMessage('El título no puede estar vacío'),
  check('min_price').optional({ checkFalsy: true }).isNumeric(),
  check('max_price').optional({ checkFalsy: true }).isNumeric(),
  (req, res, next) => validateResults(req, res, next)
];
