import logger from '../../../utils/logger.js';
import eventBus, { EVENTS } from "../../../config/eventBus.js";
import { storageManager } from '../services/core/StorageManager.js';

/**
 * Registra los listeners del módulo de Storage
 * Escucha eventos de borrado y utilidades de archivos.
 */
export const registerStorageListeners = () => {
    
    /**
     * Evento único de borrado.
     * Soporta un archivo (string) o varios (array).
     * @param {string|string[]} files - Llave(s) o URL(s) del archivo.
     * @param {string} zone - Zona del storage ('static', 'streaming'). Default: 'static'.
     */
    eventBus.on(EVENTS.STORAGE.DELETE, async ({ files, zone = 'static' }) => {
        const fileList = Array.isArray(files) ? files : [files].filter(Boolean);
        if (fileList.length === 0) return;

        const API_URL = process.env.API_URL || 'http://localhost:4000';
        const bucket = storageManager.getBucket(zone);

        logger.info(`[Storage:Listener] Processing deletion for ${fileList.length} items in zone '${zone}'`);

        const promises = fileList.map(async (fileData) => {
            try {
                // Si es una URL, validar que pertenezca a nuestro dominio antes de procesar
                if (fileData.startsWith('http')) {
                    if (!fileData.startsWith(API_URL)) {
                        logger.debug(`[Storage:Listener] Skipping external URL: ${fileData}`);
                        return;
                    }
                    // Extraer solo el nombre del archivo (last part of path)
                    const fileKey = fileData.split('/').pop();
                    await bucket.delete(fileKey);
                } else {
                    // Es una llave directa
                    await bucket.delete(fileData);
                }
            } catch (err) {
                logger.error(`[Storage:Listener] Error deleting ${fileData}: ${err.message}`);
            }
        });

        await Promise.all(promises);
    });

    /**
     * Obtener URL de un recurso.
     */
    eventBus.on(EVENTS.STORAGE.GET_URL, ({ key, response, zone = 'static' }) => {
        if (!key || !response) return;
        try {
            response.url = storageManager.getBucket(zone).getUrl(key);
        } catch (err) {
            logger.error(`[Storage:Listener] Error getting URL for ${key}: ${err.message}`);
            response.url = null;
        }
    });

    logger.info('[Storage:Listener] Storage Events Registry Optimized');
};
