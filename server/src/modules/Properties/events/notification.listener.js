import eventBus, { EVENTS } from '../../../config/eventBus.js';
import { Notification } from '../models/notification.model.js';
import logger from '../../../utils/logger.js';

export const registerNotificationListeners = () => {
    eventBus.on(EVENTS.NOTIFICATION.SEND, async (data) => {
        try {
            await Notification.create({
                userId: data.user_id,
                title: data.title || 'Notificación del Sistema',
                message: data.message,
                notificationType: data.notification_type || 'SYSTEM_ALERT',
                actionUrl: data.action_url || null
            });
            logger.info(`NotificationListener: Emitted internal push for User ID ${data.user_id}`);
        } catch (error) {
            logger.error(`NotificationListener: Failed to store notification for User ID ${data.user_id} - ${error.message}`);
        }
    });
};
