/**
 * @interface
 * Base class for all storage adapters.
 * Adapters are responsible for the physical storage of files (move bytes).
 */
export class StorageAdapter {
    constructor() {
        if (this.constructor === StorageAdapter) {
            throw new Error('StorageAdapter is an abstract class and cannot be instantiated.');
        }
    }

    /**
     * Uploads a file to the storage provider.
     * @param {Object} file - The file object (Multer)
     * @param {string} path - The destination path/key
     * @param {Object} options - Extra options (e.g. mimeType, caching)
     * @returns {Promise<import('../core/StorageBucket').FileResult>}
     */
    async put(file, path, options = {}) {
        throw new Error('Method "put()" must be implemented.');
    }

    /**
     * Deletes a file from the storage provider.
     * @param {string} path - The path/key to delete
     * @returns {Promise<void>}
     */
    async delete(path) {
        throw new Error('Method "delete()" must be implemented.');
    }

    /**
     * Gets a public URL for the file.
     * @param {string} path
     * @returns {string}
     */
    getPublicUrl(path) {
        throw new Error('Method "getPublicUrl()" must be implemented.');
    }

    /**
     * Gets a signed/private URL for the file.
     * @param {string} path
     * @param {number} expiresIn - Seconds until expiration
     * @returns {string}
     */
    getSignedUrl(path, expiresIn) {
        throw new Error('Method "getSignedUrl()" must be implemented.');
    }

    /**
     * (Optional) Validates and returns local path if applicable.
     * @param {string} path 
     * @param {number} [expires] 
     * @param {string} [signature] 
     */
    validateAndGetPath(path, expires, signature) {
        throw new Error('Method "validateAndGetPath()" is not implemented by this adapter.');
    }

    /**
     * Generates configuration for Direct Upload (TUS/Multipart).
     * This method MUST be implemented by all adapters to support the unified upload architecture.
     * @param {Object} metadata - { title, filetype, size, ... }
     * @returns {Promise<Object>} - { endpoint, headers, videoId, ... }
     */
    async getDirectUploadConfig(metadata) {
        throw new Error('Method "getDirectUploadConfig()" must be implemented by this adapter.');
    }
}
