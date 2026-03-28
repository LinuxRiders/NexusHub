import path from 'path';
import logger from '../../../utils/logger.js';
import { StorageService } from '../services/storage.service.js';


/**
 * POST /api/storage/upload/video
 * - Recibe el archivo físico, calcula duración y lo guarda seguro.
 * - Retorna la 'key' y 'duration' para que el Front luego llame a PUT /items/:id/video
 */
export const uploadVideo = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
        }

        // Procesar video (Private by default)
        const result = await StorageService.processVideoUpload(req.file, 'private');

        const previewUrl = StorageService.generateSignedUrl(result.key, 'streaming');

        return res.status(201).json({
            message: 'Video procesado correctamente.',
            data: {
                video_key: result.key,
                duration: result.duration,
                size: result.size,
                preview_url: previewUrl,
                visibility: result.visibility // 'private'
            }
        });

    } catch (error) {
        logger.error(`UploadController:uploadVideo Error: ${error.message}`);
        return next(error);
    }
}

/**
 * POST /api/storage/upload/init
 * - Inicia una subida directa (TUS).
 * - Body: { filename, mimetype, size }
 */
export const initUpload = async (req, res, next) => {
    try {
        const { filename, mimetype } = req.body;

        if (!filename || !mimetype) {
            return res.status(400).json({ error: 'Filename and mimetype are required.' });
        }

        const config = await StorageService.initDirectUpload({
            title: filename,
            filetype: mimetype
        });

        return res.status(200).json({
            message: 'Direct upload initialized.',
            data: config
        });

    } catch (error) {
        logger.error(`UploadController:initUpload Error: ${error.message}`);
        return next(error);
    }
};

export const uploadStatic = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
        }

        // Check visibility from body or query (optional), default public
        const visibility = req.body.visibility || 'public';

        const result = await StorageService.processStaticUpload(req.file, visibility);

        const url = StorageService.generateSignedUrl(result.key, 'static');

        return res.status(201).json({
            message: 'Archivo estático subido correctamente.',
            data: {
                key: result.key,
                url: url,
                size: result.size,
                mimetype: result.mimetype,
                visibility: result.visibility
            }
        });

    } catch (error) {
        logger.error(`UploadController:uploadStatic Error: ${error.message}`);
        return next(error);
    }
};

/**
 * GET /api/storage/content
 * - Endpoint "Proxy" que sirve el archivo si la firma es válida.
 * - Query Params: key, expires, token, zone (default: streaming)
 */
export const serveSecureContent = (req, res) => {
    const { key, expires, token, zone } = req.query;

    if (!key || !expires || !token) {
        return res.status(403).json({ error: 'Missing security parameters (key, expires, token)' });
    }

    try {
        // Default to 'streaming' if not provided, but allows 'static' or others.
        const zoneName = zone || 'streaming'; 
        
        // Delegate validation to the Storage Service -> Bucket -> Adapter
        const filePath = StorageService.validateAndGetPath(key, expires, token, zoneName);

        // Serve the file securely
        res.sendFile(path.resolve(filePath));

    } catch (error) {
        logger.error(`[ServeSecureContent] Access Denied: ${error.message}`);
        return res.status(403).json({ error: 'Access Denied or Expired' });
    }
};
