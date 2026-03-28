import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import logger from '../../../../utils/logger.js';
import { StorageAdapter } from './storage.interface.js';
import { UrlSigner } from '../../utils/signer.js';

const unlinkAsync = promisify(fs.unlink);
const renameAsync = promisify(fs.rename);
const mkdirAsync = promisify(fs.mkdir);

const STORAGE_SECRET = process.env.STORAGE_SECRET || 'super_secret_key_change_me';
const HOST = process.env.API_URL || 'http://localhost:4000';

export class LocalStaticAdapter extends StorageAdapter {
    constructor(config) {
        super();
        this.rootDir = config.rootDir || 'uploads/static';
        this.publicUrl = config.publicUrl || `${HOST}/uploads`; // Default pointing to express.static

        if (!fs.existsSync(this.rootDir)) {
            fs.mkdirSync(this.rootDir, { recursive: true });
        }
    }

    async put(file, key) {
        const targetPath = path.join(this.rootDir, key);
        const targetDir = path.dirname(targetPath);

        await mkdirAsync(targetDir, { recursive: true });

        try {
            await renameAsync(file.path, targetPath);
            return {
                key, 
                size: file.size,
                mimetype: file.mimetype
            };
        } catch (error) {
            await unlinkAsync(file.path).catch(() => {});
            logger.error(`[LocalStaticAdapter] Upload failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generates configuration for Direct Upload.
     */
    async getDirectUploadConfig(metadata) {
         throw new Error('Direct Upload is not yet supported for LocalStaticAdapter.');
    }

    async delete(key) {
        if (!key) return;
        const filePath = path.join(this.rootDir, key);
        try {
            await fs.promises.unlink(filePath);
            logger.info(`[LocalStaticAdapter] Deleted: ${key}`);
        } catch (error) {
            if (error.code !== 'ENOENT') logger.error(`[LocalStaticAdapter] Delete failed: ${error.message}`);
        }
    }

    getPublicUrl(key) {
        const normalizedKey = key.replace(/\\/g, '/');
        const baseUrl = this.publicUrl.replace(/\/$/, '');
        const pathPart = normalizedKey.replace(/^\//, '');
        return `${baseUrl}/${pathPart}`;
    }

    getSignedUrl(key, expiresIn = 3600) {
        const expiration = Math.floor(Date.now() / 1000) + expiresIn;
        const token = UrlSigner.generateToken(key, STORAGE_SECRET, expiration);
        return `${HOST}/api/storage/content?key=${encodeURIComponent(key)}&token=${token}&expires=${expiration}&zone=static`;
    }

    validateAndGetPath(key, expires, token) {
        const isValid = UrlSigner.validateToken(token, key, STORAGE_SECRET, expires);
        if (!isValid) throw new Error('Invalid or expired token');

        // Sanitize
        const safeKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, '');
        const filePath = path.join(this.rootDir, safeKey);
        
        if (!fs.existsSync(filePath)) throw new Error('File not found');
        return filePath;
    }
}
