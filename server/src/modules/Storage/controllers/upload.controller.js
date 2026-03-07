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

        // Procesar video (Storage Service se encarga de todo)
        const result = await StorageService.processVideoUpload(req.file);

        // --- DEBUG: Generar URL firmada temporal para probar en frontend ---
        // Esto normalmente lo hace el getSecureContent, pero lo necesitamos aquí
        // para verificar que el flujo completo funciona sin crear un curso entero.
        const previewUrl = StorageService.generateSignedUrl(result.key);

        // Retornamos los datos necesarios para que el Frontend continue el flujo
        return res.status(201).json({
            message: 'Video procesado correctamente.',
            data: {
                video_key: result.key, // La llave para la BD
                duration: result.duration, // Duración calculada automáticamente
                size: result.size,
                preview_url: previewUrl // Debug URL firmada temporal
            }
        });

    } catch (error) {
        logger.error(`UploadController:uploadVideo Error: ${error.message}`);
        return next(error);
    }
};

/**
 * GET /api/storage/content
 * - Endpoint "Proxy" que sirve el archivo si la firma es válida.
 * - Query Params: key, expires, signature
 */
export const serveSecureContent = (req, res) => {
    const { key, expires, signature } = req.query;

    if (!key || !expires || !signature) {
        return res.status(403).json({ error: 'Missing security parameters' });
    }

    try {
        // Validar firma
        const filePath = StorageService.validateAndGetPath(key, expires, signature);


        // Servir archivo como stream (mejor rendimiento para videos)
        // Express 'res.sendFile' maneja streams y rangos (video seeking) automáticamente
        res.sendFile(path.resolve(filePath));

    } catch (error) {
        // No damos detalles del error por seguridad
        return res.status(403).json({ error: 'Access Denied or Expired', error });
    }
};