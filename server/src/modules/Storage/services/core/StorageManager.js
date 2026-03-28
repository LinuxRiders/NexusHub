import logger from '../../../../utils/logger.js';

class StorageManager {
    constructor() {
        this.buckets = new Map();
    }

    /**
     * Registers a storage bucket.
     * @param {string} alias - Unique name (e.g. 'avatars', 'courses')
     * @param {import('./StorageBucket').StorageBucket} bucket 
     */
    registerBucket(alias, bucket) {
        if (this.buckets.has(alias)) {
            logger.warn(`[StorageManager] Overwriting bucket '${alias}'`);
        }
        this.buckets.set(alias, bucket);
        logger.info(`[StorageManager] Registered bucket '${alias}'`);
    }

    /**
     * Retrieves a bucket by alias.
     * @param {string} alias 
     * @returns {import('./StorageBucket').StorageBucket}
     */
    getBucket(alias) {
        const bucket = this.buckets.get(alias);
        if (!bucket) {
            throw new Error(`Storage Bucket '${alias}' not found.`);
        }
        return bucket;
    }

    /**
     * Helper to list registered buckets.
     */
    listBuckets() {
        return Array.from(this.buckets.keys());
    }
}

// Export Singleton
export const storageManager = new StorageManager();
