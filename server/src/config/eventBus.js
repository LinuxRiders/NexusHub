import { EventEmitter } from 'events';
import logger from '../utils/logger.js';

/**
 * EventBus Centralizado
 * Sigue el patrón Pub/Sub para desacoplar módulos.
 * 
 * Basado en los principios de:
 * - Mínima Responsabilidad: Solo se encarga de transportar mensajes.
 * - Desacoplamiento: Los emisores no conocen a los receptores.
 * - Abierto/Cerrado: Fácilmente extensible con nuevos eventos sin modificar el bus.
 */
class AppEventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(20);
        
        // Manejador de errores global para eventos asíncronos
        this.on('error', (err) => {
            logger.error(`[EventBus] Uncaught Error: ${err.message}`, { stack: err.stack });
        });
    }
}

const eventBus = new AppEventBus();

/**
 * Diccionario de Eventos (Single Source of Truth)
 * Uso: eventBus.emit(EVENTS.AUTH.REGISTERED, data)
 */
export const EVENTS = {
    AUTH: {
        REGISTERED: 'AUTH:REGISTERED',
    },
    PROPERTY: {
        PUBLISHED: 'PROPERTY:PUBLISHED',
        FAVORITED: 'PROPERTY:FAVORITED',
    },
    NOTIFICATION: {
        SEND: 'NOTIFICATION:SEND',
    },
    EMAIL: {
        ALERT_MATCH_SENT: 'EMAIL:ALERT_MATCH_SENT',
    },
    STORAGE: {
        DELETE: 'STORAGE:DELETE',
        GET_URL: 'STORAGE:GET_URL'
    }
};

export default eventBus;
