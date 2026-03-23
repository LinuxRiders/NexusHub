import { ActivityLog } from '../models/activity.model.js';
import logger from '../../../utils/logger.js';

export const getSystemActivityFeed = async (req, res, next) => {
    try {
        const limitParam = parseInt(req.query.limit) || 15;
        // Impedimos abusos en la cantidad de registros por seguridad.
        const limit = Math.min(limitParam, 50);

        const logs = await ActivityLog.getRecentFeed(limit);

        res.json({ data: logs });
    } catch (error) {
        logger.error(`[Controller]:Activity:getSystemActivityFeed Error: ${error.message}`, { stack: error.stack });
        next(error);
    }
};
