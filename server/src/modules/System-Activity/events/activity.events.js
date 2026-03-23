import { EventEmitter } from 'events';
import logger from '../../../utils/logger.js';

class ActivityEventEmitter extends EventEmitter {}

const activityEvents = new ActivityEventEmitter();

// Opcional: Para evitar advertencias si hay muchos listeners (aunque en este caso solo habrá uno principal)
activityEvents.setMaxListeners(20);

activityEvents.on('error', (err) => {
  logger.error(`[Activity Events] Uncaught Error in Event Emitter: ${err.message}`, { stack: err.stack });
});

export default activityEvents;
