import eventBus, { EVENTS } from '../../../config/eventBus.js';
import { Alert } from '../models/alert.model.js';
import { Notification } from '../models/notification.model.js';
import { mailer } from '../../../config/mailer.js';
import logger from '../../../utils/logger.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const propertyTemplatesDir = path.join(__dirname, '..', 'templates');
const logoPath = path.join(__dirname, '..', '..', 'Users-Auth', 'templates', 'nexus.png');

// Helper para normalizar texto (quitar tildes, mayúsculas, etc)
const normalizeText = (text) => {
  if (!text) return "";
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

/**
 * Módulo de escucha para eventos de Propiedades.
 * Cumple con SRP al separar la lógica de reacción (Matching de Alertas) de la emisión.
 */
export const registerPropertyListeners = () => {
    
    // Listener para el evento de propiedad publicada (Matching Engine)
    eventBus.on(EVENTS.PROPERTY.PUBLISHED, async (propertyData) => {
        logger.info(`[Property Listener] ${EVENTS.PROPERTY.PUBLISHED} triggered for property id=${propertyData.id}`);

        try {
            // 1. Obtener todas las alertas de usuarios que tienen notificaciones activadas
            const activeAlerts = await Alert.findAllActive();
            const matchedUsers = new Map(); // Para no enviar múltiples notificaciones al mismo usuario

            // 2. Ejecutar el motor de matching
            for (const alert of activeAlerts) {
                if (matchedUsers.has(alert.user_id)) continue;

                let match = true;

                // Match por operación (Venta o Alquiler)
                if (alert.is_buy && !alert.is_rent && propertyData.operation_type !== 'COMPRA') match = false;
                if (alert.is_rent && !alert.is_buy && propertyData.operation_type !== 'ALQUILER') match = false;
                if (!alert.is_buy && !alert.is_rent) match = true; 

                // Match por Tipo de propiedad
                if (match && alert.property_types && alert.property_types.length > 0) {
                    if (!alert.property_types.includes(propertyData.property_type)) {
                        match = false;
                    }
                }

                // Match por Precio
                if (match && alert.min_price && Number(propertyData.price) < Number(alert.min_price)) match = false;
                if (match && alert.max_price && Number(propertyData.price) > Number(alert.max_price)) match = false;

                // Match por Superficie (m2)
                if (match && alert.min_mt2 && Number(propertyData.mt2) < Number(alert.min_mt2)) match = false;
                if (match && alert.max_mt2 && Number(propertyData.mt2) > Number(alert.max_mt2)) match = false;

                // Match por Fotografías requeridas
                if (match && alert.requires_photos && (!propertyData.images || propertyData.images.length === 0)) match = false;

                // Match por Habitaciones y Baños
                if (match && alert.rooms && Number(propertyData.rooms) < Number(alert.rooms)) match = false;
                if (match && alert.bathrooms && Number(propertyData.bathrooms) < Number(alert.bathrooms)) match = false;

                // Match por Ubicación
                if (match && alert.location) {
                    const normAlertLoc = normalizeText(alert.location);
                    const normPropCity = normalizeText(propertyData.city_country);
                    const normPropAvenue = normalizeText(propertyData.avenue);

                    if (!normPropCity.includes(normAlertLoc) && !normPropAvenue.includes(normAlertLoc)) {
                        match = false;
                    }
                }

                if (match) {
                    matchedUsers.set(alert.user_id, {
                        email: alert.user_email,
                        username: alert.user_name,
                        alertId: alert.id,
                        sendEmails: Boolean(alert.send_notifications)
                    });
                }
            }

            // 3. Crear registros y despachar envíos de correo
            if (matchedUsers.size > 0) {
                logger.info(`[Property Listener] Found ${matchedUsers.size} matches for property id=${propertyData.id}`);
                
                for (const [userId, userObj] of matchedUsers) {
                    const propertyUrl = `${process.env.APP_URL}/propiedades?id=${propertyData.id}`;

                    // Guardar Notificación In-App en la BD
                    await Notification.create({
                        userId,
                        title: '¡Nueva propiedad que coincide con tu búsqueda!',
                        message: `El inmueble tipo ${propertyData.property_type} en ${propertyData.city_country} por S/ ${propertyData.price} acaba de ser publicado.`,
                        actionUrl: propertyUrl,
                        notificationType: 'ALERT_MATCH'
                    });

                    // Enviar Email solo si el usuario aceptó
                    if (userObj.sendEmails) {
                        await mailer.sendMail({
                            toEmail: userObj.email,
                            subject: 'Nueva propiedad encontrada (NexusHub Alertas)',
                            templateName: 'alert-match.template.html',
                            templateDir: propertyTemplatesDir,
                            variables: {
                                username: userObj.username,
                                property_type: propertyData.property_type,
                                operation_type: propertyData.operation_type,
                                price: propertyData.price,
                                location: `${propertyData.avenue}, ${propertyData.city_country}`,
                                actionUrl: propertyUrl
                            },
                            inlineImages: [{ varName: 'nexusLogo', path: logoPath, cid: 'nexusLogo' }]
                        }).catch(err => {
                            logger.error(`[Property Listener] Error sending email to ${userObj.email}: ${err.message}`);
                        });
                    }
                }
            }

        } catch (error) {
            logger.error(`[Property Listener] Error inside ${EVENTS.PROPERTY.PUBLISHED} handler: ${error.message}`);
        }
    });
};
