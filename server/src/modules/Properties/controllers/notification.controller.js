import { Notification } from "../models/notification.model.js";
import logger from "../../../utils/logger.js";

export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { unreadOnly } = req.query; // Poner a true para contar no leídos
    
    const notifications = await Notification.findByUserId(userId, unreadOnly === 'true');
    res.json({ data: notifications });
  } catch (error) {
    logger.error(`NotificationController:getMyNotifications Error: ${error.message}`);
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    
    const affectedRows = await Notification.markAsRead(id, userId);
    if (!affectedRows) {
      return res.status(404).json({ error: "Notificación no encontrada o ya leída" });
    }
    
    res.json({ message: "Notificación marcada como leída" });
  } catch (error) {
    logger.error(`NotificationController:markAsRead Error: ${error.message}`);
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    
    const affectedRows = await Notification.markAllAsRead(userId);
    res.json({ message: "Notificaciones marcadas como leídas", updated: affectedRows });
  } catch (error) {
    logger.error(`NotificationController:markAllAsRead Error: ${error.message}`);
    next(error);
  }
};
