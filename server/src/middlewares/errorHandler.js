import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
    logger.error(`ErrorHandler: ${err.message}`, { stack: err.stack, route: req.originalUrl });
    res.status(500).json({ error: 'Internal Server Error' });
};
