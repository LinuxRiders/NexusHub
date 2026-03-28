import logger from '../utils/logger.js';
import { registerActivityListeners } from '../modules/System-Activity/events/activity.listener.js';
import { registerNotificationListeners } from '../modules/Properties/events/notification.listener.js';
import { registerPropertyListeners } from '../modules/Properties/events/property.listener.js';
import { registerStorageListeners } from '../modules/Storage/events/storage.listener.js';

/**
 * Inicializa todos los listeners de la aplicación.
 * Este cargador permite cumplir con el principio de Mínima Responsabilidad
 * y facilita la expansión del sistema sin saturar app.js.
 */
export const initializeListeners = () => {
    try {
        logger.info('[EventLoader] Initializing Application Listeners...');

        registerActivityListeners();
        registerNotificationListeners();
        registerPropertyListeners();
        registerStorageListeners();

        logger.info('[EventLoader] All Listeners Registered Successfully.');
    } catch (error) {
        logger.error(`[EventLoader] Error during listener registration: ${error.message}`);
        // No lanzamos el error para permitir que el servidor inicie, 
        // pero el log ya capturó la falla.
    }
};
