import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const { verify } = jwt;

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        logger.warn(`AuthMiddleware: No token provided on route ${req.originalUrl}`);
        return res.status(401).json({ error: 'No token provided' });
    }

    const [scheme, token] = authHeader.split(' ');
    if (!token || !/^Bearer$/i.test(scheme)) {
        logger.warn(`AuthMiddleware: Invalid token format on route ${req.originalUrl}`);
        return res.status(401).json({ error: 'Invalid token format' });
    }

    try {
        const decoded = verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        logger.info(`AuthMiddleware: User authenticated user_id=${decoded.sub} roles=${decoded.roles}`);
        next();

    } catch (error) {
        logger.error(`AuthMiddleware: Invalid token: ${error.message}`, { stack: error.stack });
        return res.status(401).json({ error: 'Invalid token' });
    }
};

