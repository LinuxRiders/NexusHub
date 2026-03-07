import fs, { statSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';
// import ffmpeg from 'fluent-ffmpeg';
import { parseFile } from 'music-metadata';
import logger from '../../../utils/logger.js';

// Convertimos funciones de fs a promesas para usar async/await
const unlinkAsync = promisify(fs.unlink);
const renameAsync = promisify(fs.rename);
const statAsync = promisify(fs.stat);

// Configuración
const UPLOAD_DIR = 'uploads/private'; // Carpeta protegida (NO poner en public)
const STORAGE_SECRET = process.env.STORAGE_SECRET || 'super_secret_key_change_me';
const HOST = 'http://localhost:4000';

// Asegurar que existe el directorio
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const StorageService = {
    /**
     * Mueve el archivo de temp a storage privado y calcula duración.
     * Retorna: { key, duration, size }
     */
    processVideoUpload: async (file) => {
        const tempPath = file.path;
        const fileExt = path.extname(file.originalname);
        // Generamos una KEY única (similar a S3 object key)
        const key = `videos/${crypto.randomUUID()}${fileExt}`;
        const targetPath = path.join(UPLOAD_DIR, key);

        // Asegurar subdirectorios
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        try {
            // // 1. Calcular Duración usando FFmpeg
            // const duration = await new Promise((resolve, reject) => {
            //     ffmpeg.ffprobe(tempPath, (err, metadata) => {
            //         if (err) return reject(err);
            //         resolve(metadata.format.duration); // Duración en segundos
            //     });
            // });

            // ---------------------------------------------------------
            // 2. NUEVA FORMA DE CALCULAR DURACIÓN (Sin FFmpeg)
            // ---------------------------------------------------------
            // 'parseFile' lee la cabecera del archivo temporal
            const metadata = await parseFile(tempPath);

            // Obtenemos la duración (puede venir undefined si el archivo está corrupto)
            const duration = metadata.format.duration || 0;

            // ---------------------------------------------------------

            // 2. Mover archivo a su destino final
            await renameAsync(tempPath, targetPath);

            return {
                key: key, // Esto es lo que guardas en BD
                duration: Math.round(duration),
                size: file.size,
                mimetype: file.mimetype
            };

        } catch (error) {
            // Si falla, borrar archivo temporal
            await unlinkAsync(tempPath).catch(() => { });
            logger.error(`[StorageService] Error processing video: ${error.message}`);
            throw error;
        }
    },

    /**
     * Genera una URL firmada (Signed URL) local.
     * Imita a S3: /api/storage/proxy?key=...&expires=...&signature=...
     */
    generateSignedUrl: (key, expiresInSeconds = 3600) => {
        // En S3 real, aquí usarías: s3.getSignedUrl('getObject', ...)

        const expires = Date.now() + (expiresInSeconds * 1000);

        // Crear firma HMAC
        // Data a firmar: key + expiration
        const dataToSign = `${key}:${expires}`;
        const signature = crypto
            .createHmac('sha256', STORAGE_SECRET)
            .update(dataToSign)
            .digest('hex');

        // Retornamos la URL completa a nuestro endpoint "Proxy"
        return `${HOST}/api/storage/content?key=${encodeURIComponent(key)}&expires=${expires}&signature=${signature}`;
    },

    /**
     * Valida la firma y retorna el path físico del archivo.
     * Esto NO existirá cuando migres a S3 (S3 lo hace internamente).
     */
    validateAndGetPath: (key, expires, signature) => {
        // 1. Verificar expiración
        if (Date.now() > parseInt(expires)) {
            throw new Error('URL expired');
        }

        // 2. Recrear firma y comparar
        const dataToSign = `${key}:${expires}`;
        const expectedSignature = crypto
            .createHmac('sha256', STORAGE_SECRET)
            .update(dataToSign)
            .digest('hex');

        // 3. Comparar firmas de forma segura
        // Convertimos a Buffer para comparar bits.
        const signatureBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSignature);

        // crypto.timingSafeEqual:
        // Evita "Timing Attacks". Si usas '==', un hacker puede adivinar la clave midiendo
        // cuántos milisegundos tarda el servidor en rechazar la firma.
        // Manejo básico de longitudes diferentes
        if (signatureBuffer.length !== expectedBuffer.length ||
            !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
            throw new Error('Invalid signature');
        }

        // 4. Retornar path seguro (evitando Directory Traversal)
        // Evita que alguien ponga "../../../etc/passwd" en la key para leer archivos del sistema.
        const safeKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, '');
        const filePath = path.join(UPLOAD_DIR, safeKey);

        // Verificar si el archivo realmente existe en disco
        if (!fs.existsSync(filePath)) {
            throw new Error('File not found');
        }

        return filePath;
    },

    deleteFile: async (key) => {
        if (!key) return;
        try {
            // Normalización de seguridad para evitar borrar archivos del sistema
            const safeKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, '');
            const filePath = path.join(UPLOAD_DIR, safeKey);

            // Verificar si existe antes de intentar borrar
            await fs.promises.access(filePath, fs.constants.F_OK);
            await fs.promises.unlink(filePath);
            logger.info(`[Storage] Deleted file: ${key}`);
        } catch (error) {
            // Si el archivo no existe, no es un error crítico, solo logueamos warn
            if (error.code === 'ENOENT') {
                logger.warn(`[Storage] File not found for deletion: ${key}`);
            } else {
                logger.error(`[Storage] Error deleting file: ${error.message}`);
                throw error;
            }
        }
    }
};