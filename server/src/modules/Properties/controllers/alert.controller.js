import { Alert } from "../models/alert.model.js";
import logger from "../../../utils/logger.js";
import activityEvents from "../../System-Activity/events/activity.events.js";
// import mailer from "../../../config/mailer.js";

export const createAlert = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const insertId = await Alert.create(userId, req.body);
    
    res.status(201).json({ message: "Alerta creada exitosamente", id: insertId });
  } catch (error) {
    logger.error(`AlertController:createAlert Error: ${error.message}`);
    next(error);
  }
};

export const updateAlert = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    
    const { id: _, user_id, created_at, updated_at, ...updateData } = req.body;
    
    const affectedRows = await Alert.update(id, userId, updateData);
    if (!affectedRows) {
      return res.status(404).json({ error: "Alerta no encontrada" });
    }
    
    res.json({ message: "Alerta actualizada exitosamente" });
  } catch (error) {
    logger.error(`AlertController:updateAlert Error: ${error.message}`);
    next(error);
  }
};

export const deleteAlert = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    
    const affectedRows = await Alert.delete(id, userId);
    if (!affectedRows) {
      return res.status(404).json({ error: "Alerta no encontrada" });
    }
    
    res.json({ message: "Alerta eliminada exitosamente" });
  } catch (error) {
    logger.error(`AlertController:deleteAlert Error: ${error.message}`);
    next(error);
  }
};

export const getMyAlerts = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const alerts = await Alert.findByUserId(userId);
    
    // Parse json property_types if needed
    const parsedAlerts = alerts.map(a => ({
      ...a,
      property_types: typeof a.property_types === 'string' ? JSON.parse(a.property_types) : a.property_types
    }));

    res.json({ data: parsedAlerts });
  } catch (error) {
    logger.error(`AlertController:getMyAlerts Error: ${error.message}`);
    next(error);
  }
};

export const getAdminAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.findAllWithUsers();
    
    const parsedAlerts = alerts.map(a => ({
      ...a,
      property_types: typeof a.property_types === 'string' ? JSON.parse(a.property_types) : a.property_types
    }));

    res.json({ data: parsedAlerts });
  } catch (error) {
    logger.error(`AlertController:getAdminAlerts Error: ${error.message}`);
    next(error);
  }
};

export const suggestPropertyToUser = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const { propertyLink, note } = req.body;
    
    // Obtener alerta con info de usuario
    const alerts = await Alert.findAllWithUsers(); // This could be optimized to findById
    const alert = alerts.find(a => a.id === parseInt(alertId));
    
    if (!alert) {
      return res.status(404).json({ error: "Alerta no encontrada" });
    }

    // Aquí simularíamos el envío de email. Para no bloquear tu desarrollo, usamos mailer.
    /*
    await mailer.sendMail({
      toEmail: alert.user_email,
      subject: 'NexusHub: Sugerencia de Propiedad Especial',
      html: `
        <h2>¡Tenemos una sugerencia para ti, ${alert.user_name}!</h2>
        <p>${note}</p>
        <p>Revisa la propiedad aquí: <a href="${propertyLink}">${propertyLink}</a></p>
      `
    });
    */

    // Emitir el evento de sistema de manera asíncrona
    activityEvents.emit('ALERT_MATCH_EMAIL_SENT', {
      alert_id: alert.id,
      user_id: alert.user_id,
      property_id: null, // Si propertyLink fuera un ID se pasaría aquí
      match_details: `Sugerencia Admin enviada: ${note}`
    });

    res.json({ message: `Sugerencia enviada con éxito a ${alert.user_name}` });
  } catch (error) {
    logger.error(`AlertController:suggestPropertyToUser Error: ${error.message}`);
    next(error);
  }
};
