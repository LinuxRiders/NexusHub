import eventBus, { EVENTS } from '../../../config/eventBus.js';
import { ActivityLog } from '../models/activity.model.js';
import logger from '../../../utils/logger.js';

/**
 * Módulo suscrito (Listener) que opera en segundo plano y completamente
 * desacoplado del loop principal de Request/Response de la API de Express.
 */
export const registerActivityListeners = () => {
    
    // Al registrar un nuevo usuario en la app
    eventBus.on(EVENTS.AUTH.REGISTERED, async ({ user_id, username, email }) => {
        try {
            await ActivityLog.create({
                user_id: user_id, // Fue el propio usuario quien lo disparó
                action_type: 'USER_REGISTERED',
                entity_type: 'user',
                entity_id: user_id,
                metadata: {
                    name: username,
                    email: email
                }
            });
            logger.info(`[Activity Listener] Logged USER_REGISTERED event for user_id=${user_id}`);
        } catch (error) {
            logger.error(`[Activity Listener] Error writing USER_REGISTERED log: ${error.message}`);
        }
    });

    // Alguien marcó como Favorito una propiedad
    eventBus.on(EVENTS.PROPERTY.FAVORITED, async ({ user_id, user_name, property_id, property_address }) => {
        try {
            await ActivityLog.create({
                user_id: user_id,
                action_type: 'PROPERTY_FAVORITED',
                entity_type: 'property',
                entity_id: property_id,
                metadata: {
                    user_name: user_name, // Juan Perez
                    address: property_address // Av España 123
                }
            });
            logger.info(`[Activity Listener] Logged PROPERTY_FAVORITED for user_id=${user_id} prop=${property_id}`);
        } catch (error) {
            logger.error(`[Activity Listener] Error writing PROPERTY_FAVORITED log: ${error.message}`);
        }
    });

    // El servidor disparó autométicamente un correo de "nueva propiedad match alertas" 
    eventBus.on(EVENTS.EMAIL.ALERT_MATCH_SENT, async ({ alert_id, user_id, property_id, match_details }) => {
        try {
            await ActivityLog.create({
                user_id: null, // Acción originada por la Computadora/Cronjob, no intervinó un humano
                action_type: 'ALERT_MATCH_EMAIL_SENT',
                entity_type: 'email_match',
                entity_id: alert_id,
                metadata: {
                    target_user: user_id,
                    target_property: property_id,
                    notes: match_details // ej. "Enviadas 12 propiedades" 
                }
            });
            logger.info(`[Activity Listener] Logged ALERT_MATCH_EMAIL_SENT for alert=${alert_id}`);
        } catch (error) {
            logger.error(`[Activity Listener] Error writing ALERT_MATCH_EMAIL_SENT log: ${error.message}`);
        }
    });
};
