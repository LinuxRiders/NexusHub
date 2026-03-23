import { Message } from '../models/message.model.js';
import { User } from '../../Users-Auth/models/user.model.js';
import { mailer } from '../../../config/mailer.js';
import logger from '../../../utils/logger.js';
import activityEvents from '../../System-Activity/events/activity.events.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const submitMessage = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        
        // Si hay token autenticado, anexamos el usuario invocando al .sub del JWT. Si no, queda en null.
        const userId = req.user?.sub ?? null;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email and message are required fields' });
        }

        const messageId = await Message.create({
            user_id: userId,
            name,
            email,
            phone,
            subject,
            message
        });

        res.status(201).json({
            message: 'Message sent successfully',
            data: { id: messageId }
        });

    } catch (error) {
        logger.error(`MessageController:submitMessage Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to submit message' });
    }
};

export const getMessages = async (req, res) => {
    try {
        const statuses = req.query.statuses ? req.query.statuses.split(',') : [];
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const data = await Message.getAll({ statuses, limit, offset });
        res.json({ message: 'Messages fetched successfully', data });
    } catch (error) {
        logger.error(`MessageController:getMessages Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

export const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['UNREAD', 'READ', 'REPLIED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status provided' });
        }

        const currentMsg = await Message.getById(id);
        if (!currentMsg) {
            return res.status(404).json({ error: 'Message not found' });
        }

        await Message.updateStatus(id, status);

        res.json({ message: `Message status updated to ${status}` });
    } catch (error) {
        logger.error(`MessageController:updateMessageStatus Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to update message status' });
    }
};

export const replyMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { reply_text, subject } = req.body;

        if (!reply_text) {
            return res.status(400).json({ error: 'Reply text is required' });
        }

        const msg = await Message.getById(id);
        if (!msg) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // 1. Enviar Correo Usando Plantilla
        const emailSubject = subject || `Respuesta a tu consulta: ${msg.subject || 'NexusHub'}`;
        
        await mailer.sendMail({
            toEmail: msg.email,
            subject: emailSubject,
            templateName: 'message.template.html',
            variables: {
                username: msg.name,
                message_subject: emailSubject,
                message_body: reply_text.replace(/\n/g, '<br/>'),
                original_message_html: `<div style="background-color: rgba(255, 255, 255, 0.05); border-left: 4px solid #90caf9; padding: 15px; margin: 30px 0; text-align: left; font-size: 14px; color: rgba(255, 255, 255, 0.8);"><strong>Tu consulta original del ${new Date(msg.created_at).toLocaleDateString("es-ES")}:</strong><br><br>${msg.message.replace(/\n/g, '<br/>')}</div>`,
                action_button: '',
                year: new Date().getFullYear()
            },
            inlineImages: [
                { path: 'src/modules/Users-Auth/templates/nexus.png', cid: 'logo' }
            ]
        });

        // 2. Si el mensaje pende de un usuario de sistema, mandarle Notificación vía Eventos (Decoupled)
        if (msg.user_id) {
            activityEvents.emit('SEND_USER_NOTIFICATION', {
                user_id: msg.user_id,
                title: 'Respuesta de Soporte',
                message: 'Hemos respondido a tu formulario de contacto. Revisa tu bandeja de entrada de correo.',
                notification_type: 'SUPPORT_REPLY'
            });
        }

        // 3. Marcar como respondido y guardar
        await Message.updateStatus(id, 'REPLIED');

        // Optional: Loggear Actividad
        activityEvents.emit('ALERT_MATCH_EMAIL_SENT', { // Podemos reusar o crear un evento genérico de email disparado
            alert_id: id,
            user_id: msg.user_id,
            property_id: null,
            match_details: `Respondió al mensaje #${id} de ${msg.email}`
        });

        res.json({ message: 'Reply sent successfully and message marked as REPLIED' });

    } catch (error) {
        logger.error(`MessageController:replyMessage Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to reply to message' });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Message.delete(id);
        if (!success) return res.status(404).json({ error: 'Message not found' });

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        logger.error(`MessageController:deleteMessage Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to delete message' });
    }
};
