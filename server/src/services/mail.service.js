// src/services/MailService.js
import nodemailer from 'nodemailer';
import path from 'path';
import { replaceTemplateVariables, readTemplateFile } from '../utils/email.utils.js';
import logger from '../utils/logger.js';
import dotenv from "dotenv";

dotenv.config();

/**
 * MailService
 * - Modular: acepta templateDir por instancia o por llamada.
 * - Funciones principales:
 *    - sendMail(params): envía HTML usando plantilla + variables + attachments + inlineImages
 *
 * inlineImages: [{ varName: 'logo', path, filename? , content?, cid? }]
 * attachments: [{ path?, content?, filename?, contentType? }]
 *
 * Nota: ahora soporta 3 modos de inserción de imágenes inline (inlineImagesAs):
 *   → 'img'  → Inserta etiqueta <img src="cid:...">
 *   → 'src'  → Reemplaza variable con "cid:..." (para usar en <img src="{{qr}}">)
 *   → 'data' → Inserta directamente el Base64 data URI (para CSS inline o HTML embebido)
 */
export default class MailService {
    constructor({ templateDir = null, transporterOptions = null } = {}) {
        this.templateDir = templateDir;

        const transportCfg = transporterOptions || {
            host: 'cicass.com.pe',
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        };

        this.transporter = nodemailer.createTransport(transportCfg);

        this.transporter.verify()
            .then(() => logger.info('MailService: transporter verificado OK'))
            .catch(err => logger.warn('MailService: transporter verify failed', { error: err.message }));
    }

    /**
     * Envía un correo usando plantilla HTML y reemplazo de variables dinámicas
     */
    async sendMail({
        toEmail,
        subject = '',
        templateName = null,
        variables = {},
        attachments = [],
        inlineImages = [],
        inlineImagesAs = 'img',
        templateDir = null,
        from = null
    } = {}) {
        if (!toEmail) throw new Error('sendMail: toEmail es requerido');

        // 1️⃣ Leer plantilla
        let htmlContent = '';
        if (templateName) {
            const dir = templateDir || this.templateDir;
            try {
                htmlContent = readTemplateFile(dir, templateName);
            } catch (err) {
                logger.error('MailService:template-read-failed', { templateName, error: err.message });
                throw new Error(`Plantilla no encontrada o inaccesible: ${templateName}`);
            }
        }

        // 2️⃣ Preparar inline images
        const mailAttachments = Array.isArray(attachments) ? [...attachments] : [];
        const variablesWithImages = { ...variables };

        if (Array.isArray(inlineImages) && inlineImages.length > 0) {
            let idx = 0;
            for (const img of inlineImages) {
                idx++;
                const { att, value } = this._processInlineImage(img, idx, inlineImagesAs);
                if (att) mailAttachments.push(att);
                if (img.varName) variablesWithImages[img.varName] = value;
            }
        }

        // 3️⃣ Reemplazar variables en plantilla
        if (htmlContent) {
            htmlContent = replaceTemplateVariables(htmlContent, variablesWithImages);
        }

        // 4️⃣ Preparar opciones para nodemailer
        const fromAddress = from || process.env.MAIL_FROM || `"CICASS WEB" <${process.env.MAIL_USER}>`;
        const mailOptions = {
            from: fromAddress,
            to: toEmail,
            subject,
            html: htmlContent || undefined,
            text: htmlContent ? this._htmlToText(htmlContent) : undefined,
            attachments: mailAttachments.length > 0 ? mailAttachments : undefined
        };

        // 5️⃣ Enviar
        try {
            const info = await this.transporter.sendMail(mailOptions);
            logger.info('MailService: email sent', { toEmail, messageId: info.messageId || info.response });
            return info;
        } catch (err) {
            logger.error('MailService: sendMail failed', { error: err.message, toEmail });
            throw err;
        }
    }

    /**
     * 🔧 Maneja la generación de attachments y el valor a inyectar en la plantilla
     */
    _processInlineImage(img, index, mode = 'img') {
        const cid = img.cid || `cid_${Date.now()}_${index}`;
        const att = {
            cid,
            filename: img.filename || (img.path ? path.basename(img.path) : `image_${index}`)
        };

        if (img.path) att.path = img.path;
        else if (img.content) att.content = img.content;
        if (img.contentType) att.contentType = img.contentType;

        let value = '';

        switch (mode) {
            case 'src':
                // 👉 para usar <img src="{{qr}}">
                value = `cid:${cid}`;
                break;

            case 'data':
                try {
                    let buf;
                    if (img.content) {
                        buf = Buffer.isBuffer(img.content)
                            ? img.content
                            : Buffer.from(String(img.content));
                    } else if (img.path) {
                        buf = fs.readFileSync(img.path);
                    }
                    const b64 = buf?.toString('base64') || '';
                    const ctype = img.contentType || 'image/png';
                    value = `data:${ctype};base64,${b64}`;
                } catch (e) {
                    logger.warn('MailService:data-uri generation failed', { varName: img.varName, error: e.message });
                    value = '';
                }
                break;

            default:
                // 👉 modo 'img' (legacy)
                value = `<img src="cid:${cid}" alt="${img.varName || 'image'}" />`;
        }

        return { att, value };
    }

    // Simple HTML → texto plano fallback
    _htmlToText(html) {
        return String(html)
            .replace(/<\/?[^>]+(>|$)/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
}