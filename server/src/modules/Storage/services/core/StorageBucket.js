import path from 'path';
import crypto from 'crypto';
import logger from '../../../../utils/logger.js';

/**
 * @typedef {Object} BucketConfig
 * @property {import('../adapters/storage.interface').StorageAdapter} adapter - The storage adapter
 * @property {string} pathPrefix - Root folder for this bucket (e.g. 'avatars')
 * @property {Object} constraints
 * @property {number} [constraints.maxSize] - Max size in bytes
 * @property {string[]} [constraints.allowedMimeTypes] - List of allowed mime types
 * @property {Object} security
 * @property {boolean} [security.isPublic] - If true, getUrl returns public URL
 * @property {boolean} [security.signedUrl] - If true, getUrl returns signed URL
 */

/**
 * @typedef {Object} FileResult
 * @property {string} key - The stored key
 * @property {string} url - The access URL
 * @property {number} size - Size in bytes
 * @property {string} mimetype - Mime type
 */

export class StorageBucket {
    /**
     * @param {BucketConfig} config 
     */
    constructor(config) {
        this.adapter = config.adapter;
        this.pathPrefix = config.pathPrefix || '';
        this.constraints = config.constraints || {};
        this.security = config.security || { isPublic: false };
    }

    /**
     * Uploads a file to this bucket.
     * @param {Object} file - Multer file object
     * @param {Object} options - Additional options
     * @returns {Promise<FileResult>}
     */
    async upload(file, options = {}) {
        // 1. Validation
        this._validate(file);

        // 2. Path/Key Generation
        const key = this._generateKey(file);

        // 3. Upload via Adapter
        logger.info(`[StorageBucket] Uploading to ${this.pathPrefix}: ${key}`);
        
        // Pass metadata to adapter if needed
        const uploadOptions = {
            mimetype: file.mimetype,
            size: file.size,
            ...options
        };

        const result = await this.adapter.put(file, key, uploadOptions);

        // Start formatting the result.
        // If the adapter returns a key (like Bunny GUID), we use that.
        // If the adapter returns null key, we use the one we generated.
        const finalKey = result?.key || key;

        return {
            key: finalKey,
            url: this.getUrl(finalKey),
            size: file.size,
            mimetype: file.mimetype,
            ...result // Merge extra data from adapter (e.g. duration)
        };
    }

    /**
     * Generates a URL for the given key based on bucket security policies.
     * @param {string} key 
     * @returns {string}
     */
    getUrl(key) {
        if (this.security.isPublic) {
            return this.adapter.getPublicUrl(key);
        }
        
        if (this.security.signedUrl) {
            // Default expiration: 1 hour
            // TODO: Allow customizing expiration
            return this.adapter.getSignedUrl(key, 3600);
        }

        // Fallback or error? For now, public.
        return this.adapter.getPublicUrl(key);
    }

    /**
     * Deletes a file from this bucket.
     * @param {string} key 
     */
    async delete(key) {
        logger.info(`[StorageBucket] Deleting from ${this.pathPrefix}: ${key}`);
        return this.adapter.delete(key);
    }

    /**
     * Internal: Validate file against constraints.
     */
    _validate(file) {
        // Size validation
        if (this.constraints.maxSize && file.size > this.constraints.maxSize) {
            throw new Error(`File too large. Max allowed: ${this.constraints.maxSize} bytes.`);
        }

        // MimeType validation
        if (this.constraints.allowedMimeTypes && 
            !this.constraints.allowedMimeTypes.includes(file.mimetype)) {
            throw new Error(`Invalid file type: ${file.mimetype}. Allowed: ${this.constraints.allowedMimeTypes.join(', ')}`);
        }
    }

    /**
     * Internal: Generate a unique key for the file.
     * Format: {prefix}/{uuid}{ext}
     */
    _generateKey(file) {
        const uuid = crypto.randomUUID();
        const ext = path.extname(file.originalname);
        
        // Sanitize pathPrefix (remove leading/trailing slashes)
        const prefix = this.pathPrefix.replace(/^\/+|\/+$/g, '');
        
        if (prefix) {
            return `${prefix}/${uuid}${ext}`;
        }
        return `${uuid}${ext}`;
    }

    /**
     * Delegate verification to adapter (for local serving)
     */
    validateAndGetPath(key, expires, token) {
        if (typeof this.adapter.validateAndGetPath !== 'function') {
            throw new Error('This bucket does not support local validation.');
        }
        return this.adapter.validateAndGetPath(key, expires, token);
    }
}
