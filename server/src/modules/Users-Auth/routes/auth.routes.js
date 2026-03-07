import { Router } from 'express';
import { login, refresh, logout, requestPasswordReset, resetPassword, register, verifyAccount, resendVerificationEmail, } from '../controllers/auth.controller.js';
import { forgotPasswordValidation, loginValidation, registerValidation, resendValidation, resetPasswordValidation, verifyValidation } from '../validations/auth.validation.js';
import { validateResults } from '../../../middlewares/validationResult.js';
import { rateLimiter } from '../../../middlewares/rate.middleware.js';

const router = Router();

router.post('/login', rateLimiter('15m', 5, 'login'), loginValidation, validateResults, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

router.post('/register', rateLimiter('1h', 5, 'auth_register', 'Has excedido el límite de registros.'), registerValidation, validateResults, register); // Registro normal 
router.post('/resend-verification', rateLimiter('1h', 3, 'auth_resend'), resendValidation, validateResults, resendVerificationEmail); // (3 reenvíos por hora para evitar spam de emails)
router.get('/verify-account', rateLimiter('1m', 10, 'auth_verify'), verifyValidation, validateResults, verifyAccount);

// Token aleatorio opaco, hasheado en BD, con expiración corta y uso único.
router.post('/forgot-password', rateLimiter('1h', 5, 'forgot'), forgotPasswordValidation, validateResults, requestPasswordReset);
router.post('/reset-password', rateLimiter('15m', 10, 'reset'), resetPasswordValidation, validateResults, resetPassword);

export default router;
