import { EventEmitter } from 'events';
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

class PropertyEmitter extends EventEmitter {}
const propertyEvents = new PropertyEmitter();

// Helper para normalizar texto (quitar tildes, mayúsculas, etc)
const normalizeText = (text) => {
  if (!text) return "";
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

// Listener para el evento de propiedad publicada
propertyEvents.on('propertyPublished', async (propertyData) => {
  logger.info(`PropertyEvents: propertyPublished triggered for property id=${propertyData.id}`);

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
      if (!alert.is_buy && !alert.is_rent) match = true; // Si no escogió nada, asume ambos

      // Match por Tipo de propiedad (Ej: Departamento, Casa)
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

      // Match por Habitaciones y Baños (Busca mínimo esa cantidad)
      if (match && alert.rooms && Number(propertyData.rooms) < Number(alert.rooms)) match = false;
      if (match && alert.bathrooms && Number(propertyData.bathrooms) < Number(alert.bathrooms)) match = false;

      // Match por Ubicación (Búsqueda inteligente sin tildes)
      if (match && alert.location) {
        const normAlertLoc = normalizeText(alert.location);
        const normPropCity = normalizeText(propertyData.city_country);
        const normPropAvenue = normalizeText(propertyData.avenue);

        if (!normPropCity.includes(normAlertLoc) && !normPropAvenue.includes(normAlertLoc)) {
          match = false;
        }
      }

      // Si hace match perfecto, registramos al usuario para enviarle la alerta
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
      logger.info(`PropertyEvents: Found ${matchedUsers.size} matches for property id=${propertyData.id}`);
      
      const propertyUrl = `${process.env.APP_URL}/propiedades/${propertyData.id}`;

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
            logger.error(`PropertyEvents: Error sending email to ${userObj.email}: ${err.message}`);
          });
        }
      }
    }

  } catch (error) {
    logger.error(`PropertyEvents: Error inside propertyPublished listener: ${error.message}`);
  }
});

export default propertyEvents;
