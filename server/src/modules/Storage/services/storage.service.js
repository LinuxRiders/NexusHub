import logger from '../../../utils/logger.js';
import { storageManager } from './core/StorageManager.js';
import { StorageBucket } from './core/StorageBucket.js';
import { BunnyAdapter } from './adapters/bunny.adapter.js';
import { LocalStreamAdapter } from './adapters/local.stream.adapter.js';
import { LocalStaticAdapter } from './adapters/local.static.adapter.js';

// --- INITIALIZATION ---

const API_URL = process.env.API_URL || 'http://localhost:4000';

// 1. Streaming Zone (Bunny vs Local)
const streamingProvider = process.env.STORAGE_PROVIDER || 'bunny';
let streamingAdapter;

if (streamingProvider.toLowerCase() === 'bunny') {
    logger.info('[StorageService] Using Bunny.net for Streaming Zone');
    streamingAdapter = new BunnyAdapter();
} else {
    logger.info('[StorageService] Using Local Stream Adapter (HLS Emulation)');
    streamingAdapter = new LocalStreamAdapter({
        rootDir: 'uploads/stream'
    });
}

// Register 'streaming' bucket
storageManager.registerBucket('streaming', new StorageBucket({
    adapter: streamingAdapter,
    pathPrefix: '', 
    security: { signedUrl: true }, // Always signed for streaming
    constraints: { allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-matroska', 'application/octet-stream'] }
}));

// 2. Static Zone (Local)
logger.info('[StorageService] Using Local Static Adapter');
const staticAdapter = new LocalStaticAdapter({
    rootDir: 'uploads/static',
    publicUrl: `${API_URL}/uploads`
});

// Register 'static' bucket
storageManager.registerBucket('static', new StorageBucket({
    adapter: staticAdapter,
    pathPrefix: '',
    security: { isPublic: true }, // Default public
    constraints: { maxSize: 50 * 1024 * 1024 } // 50MB
}));


export const StorageService = {
    
    manager: storageManager,

    /**
     * Procesa la subida del video usando la zona 'streaming'.
     */
    processVideoUpload: async (file, visibility = 'private') => {
        // Visibility is handled by the bucket policy mostly, 
        // but we can pass it if adapter needs it.
        // For Bunny, everything is private/public based on library setting, but we treat as signed.
        const result = await storageManager.getBucket('streaming').upload(file, { visibility });
        return { ...result, visibility };
    },

    /**
     * Sube un archivo estático (imagen, pdf).
     */
    processStaticUpload: async (file, visibility = 'public') => {
        const bucket = storageManager.getBucket('static');
        const result = await bucket.upload(file, { visibility });
        return { ...result, visibility };
    },

    /**
     * Genera URL de acceso.
     */
    generateSignedUrl: (key, zoneName = 'streaming') => {
        try {
            return storageManager.getBucket(zoneName).getUrl(key);
        } catch (error) {
            logger.error(`[StorageService] Error generating URL for ${key} in ${zoneName}: ${error.message}`);
            return null;
        }
    },

    /**
     * Elimina el archivo.
     */
    deleteFile: async (key, zoneName = 'streaming') => {
        return storageManager.getBucket(zoneName).delete(key);
    },

    /**
     * Validate and Get Path (Local only)
     */
    validateAndGetPath: (key, expires, token, zoneName = 'streaming') => {
        try {
            return storageManager.getBucket(zoneName).validateAndGetPath(key, expires, token);
        } catch (error) {
            throw new Error(`Access Denied in zone '${zoneName}': ${error.message}`);
        }
    },

    /**
     * Inicia el proceso de Direct Upload (TUS).
     * Delega al adaptador la creación del recurso y firma.
     * @param {Object} metadata - { title, filetype, size }
     * @param {string} zoneName - 'streaming' default
     */
    initDirectUpload: async (metadata, zoneName = 'streaming') => {
        const bucket = storageManager.getBucket(zoneName);
        if (!bucket.adapter.getDirectUploadConfig) {
             throw new Error(`The adapter for zone '${zoneName}' does not support Direct Upload.`);
        }
        return bucket.adapter.getDirectUploadConfig(metadata);
    }
};
