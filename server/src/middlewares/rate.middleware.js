import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

/**
 * Helper para convertir strings de tiempo (ej: '15m', '1h') a milisegundos.
 * Soporta: s (segundos), m (minutos), h (horas), d (días).
 * Si recibe un número, asume que ya son ms.
 */
const parseDuration = (duration) => {
    if (typeof duration === 'number') return duration;

    if (typeof duration === 'string') {
        const match = duration.match(/^(\d+)([smhd])$/);
        if (match) {
            const value = parseInt(match[1], 10);
            const unit = match[2];
            switch (unit) {
                case 's': return value * 1000;
                case 'm': return value * 60 * 1000;
                case 'h': return value * 60 * 60 * 1000;
                case 'd': return value * 24 * 60 * 60 * 1000;
            }
        }
    }
    // Fallback: Si el formato no se entiende, devolvemos 1 minuto por seguridad o lanzamos error
    logger.warn(`RateLimiter: Formato de tiempo inválido '${duration}', usando 1m por defecto.`);
    return 60 * 1000;
};

/**
 * Middleware Factory: routeLimiter
 * @param {string|number} timeWindow - Tiempo de ventana (ej: '15m', '1h' o ms numéricos)
 * @param {number} max - Máximo de intentos permitidos
 * @param {string} [actionName='generic_route']
 * @param {string} [message]
 */
export const rateLimiter = (
    timeWindow,
    max,
    actionName = 'generic_route',
    message = 'Demasiadas solicitudes, por favor intenta más tarde.'
) => {
    // Convertimos el string (ej: "15m") a milisegundos reales
    const windowMs = parseDuration(timeWindow);

    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn(`RateLimit Exceeded [${actionName}]: IP=${req.ip} has reached the limit.`);
            return res.status(429).json({ error: message });
        }
    });
};

// // --- Exportación de las instancias ---

// // 1. Limiter para "Olvide mi contraseña" (1 hora, 5 intentos)
// export const forgotLimiter = createLimiter({
//     windowMs: 60 * 60 * 1000,
//     max: 5,
//     actionName: 'forgot'
// });

// // 2. Limiter para "Resetear contraseña" (15 minutos, 10 intentos)
// export const resetLimiter = createLimiter({
//     windowMs: 15 * 60 * 1000,
//     max: 10,
//     actionName: 'reset'
// });