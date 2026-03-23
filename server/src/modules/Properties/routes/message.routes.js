import express from 'express';
import { submitMessage, getMessages, updateMessageStatus, replyMessage, deleteMessage } from '../controllers/message.controller.js';
import { authMiddleware, optionalAuthMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireRole } from '../../../middlewares/permissions.middleware.js';

const router = express.Router();

/**
 * RUTAS PÚBLICAS / OPCIONALES
 */
// Crear un nuevo mensaje de contacto. Usa authMiddleware opcional para capturar si hay usuario.
router.post('/', optionalAuthMiddleware, submitMessage);

/**
 * RUTAS PROTEGIDAS PARA ADMINISTRADORES
 */

// Listar todos los mensajes
router.get('/admin', authMiddleware, requireRole(['dev', 'admin']), getMessages);

// Actualizar el estado (UNREAD, READ) de un mensaje 
router.patch('/admin/:id/status', authMiddleware, requireRole(['dev', 'admin']), updateMessageStatus);

// Responder un mensaje (envía correo y notifica si corresponde)
router.post('/admin/:id/reply', authMiddleware, requireRole(['dev', 'admin']), replyMessage);

// Borrar mensaje (opcional, si se soporta frontend)
router.delete('/admin/:id', authMiddleware, requireRole(['dev', 'admin']), deleteMessage);

export default router;
