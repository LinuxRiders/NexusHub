import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import ffmpeg from 'fluent-ffmpeg';
import logger from '../../../../utils/logger.js';
import { StorageAdapter } from './storage.interface.js';
import { UrlSigner } from '../../utils/signer.js';

const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);
const statAsync = promisify(fs.stat);

const STORAGE_SECRET = process.env.STORAGE_SECRET || 'super_secret_key_change_me';
const HOST = process.env.API_URL || 'http://localhost:4000';

export class LocalStreamAdapter extends StorageAdapter {
    constructor(config) {
        super();
        this.rootDir = config.rootDir || 'uploads/stream';
        
        if (!fs.existsSync(this.rootDir)) {
            fs.mkdirSync(this.rootDir, { recursive: true });
        }
    }

    /**
     * Uploads and transcodes video to HLS.
     * key is usually a UUID from Bucket.
     */
    async put(file, key) {
        // Output directory: uploads/stream/{key}/
        const outputDir = path.join(this.rootDir, key);
        await mkdirAsync(outputDir, { recursive: true });

        const outputPath = path.join(outputDir, 'playlist.m3u8');
        
        logger.info(`[LocalStreamAdapter] Transcoding started for ${key}...`);

        return new Promise((resolve, reject) => {
            ffmpeg(file.path)
                .outputOptions([
                    '-profile:v baseline', // Compatibility
                    '-level 3.0',
                    '-start_number 0',
                    '-hls_time 10', // 10 second segments
                    '-hls_list_size 0', // Keep all segments
                    '-f hls'
                ])
                .output(outputPath)
                .on('end', async () => {
                    logger.info(`[LocalStreamAdapter] Transcoding finished: ${key}`);
                    
                    // Cleanup temp uploaded file
                    await unlinkAsync(file.path).catch(() => {});
                    
                    // Get folder size (approximate)
                    const size = await this._getDirSize(outputDir);

                    // We return the GUID (UUID) as the key, mimicking Bunny
                    resolve({
                        key, 
                        size,
                        mimetype: 'application/x-mpegURL',
                        duration: 0 // TODO: Extract if needed
                    });
                })
                .on('error', async (err) => {
                    logger.error(`[LocalStreamAdapter] Transcoding failed: ${err.message}`);
                    await unlinkAsync(file.path).catch(() => {});
                    // Cleanup output dir
                    fs.rm(outputDir, { recursive: true, force: true }, () => {});
                    reject(err);
                })
                .run();
        });
    }

    /**
     * Generates configuration for Direct Upload (TUS/Multipart).
     * For Local Stream, we might NOT support TUS yet, or we could redirect to a local TUS server.
     * For now, we throw a descriptive error or return a mock if needed.
     */
    async getDirectUploadConfig(metadata) {
        // TODO: Implement a local TUS server or handle via standard Multipart if needed.
        // For now, we strictly follow the interface but indicate partial support.
        throw new Error('Direct Upload (TUS) is not yet supported for LocalStreamAdapter.');
    }

    async delete(key) {
        if (!key) return;
        const dirPath = path.join(this.rootDir, key);
        try {
            await fs.promises.rm(dirPath, { recursive: true, force: true });
            logger.info(`[LocalStreamAdapter] Deleted folder: ${key}`);
        } catch (error) {
            logger.error(`[LocalStreamAdapter] Delete failed: ${error.message}`);
        }
    }

    getPublicUrl(key) {
        // Not really supported for streams usually, but logic is same
        return `${HOST}/uploads/stream/${key}/playlist.m3u8`;
    }

    getSignedUrl(key, expiresIn = 3600) {
        const expiration = Math.floor(Date.now() / 1000) + expiresIn;
        
        // key is the UUID (folder). The resource to request is usually key/playlist.m3u8
        // We sign the key (UUID) effectively acting as a folder token if validated loosely,
        // OR we sign the full path "uuid/playlist.m3u8".
        // Let's sign the "uuid/playlist.m3u8" to be specific.
        
        const resourcePath = `${key}/playlist.m3u8`;
        const token = UrlSigner.generateToken(resourcePath, STORAGE_SECRET, expiration);
        
        return `${HOST}/api/storage/content?key=${encodeURIComponent(resourcePath)}&token=${token}&expires=${expiration}&zone=streaming`;
    }

    validateAndGetPath(key, expires, token) {
        // key comes from query: "uuid/playlist.m3u8" or "uuid/segment.ts"
        
        // 1. Sanitize
        const safeKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, '');
        
        // 2. Token Validation Logic
        // If requesting playlist.m3u8, we expect token signature to match exactly.
        // If requesting segment.ts, standard HLS doesn't pass token. 
        // BUT our serveSecureContent proxy receives ?token=... so the player MUST pass it.
        // Assuming the player (e.g. Video.js) propagates the token query params to segments.
        
        // We validate the token against the requested KEY.
        // Note: If I generated token for "uuid/playlist.m3u8", I cannot use it for "uuid/segment0.ts".
        // This is a limitation of simple token signing.
        // To fix this for HLS, we often sign the "Directory" (UUID).
        
        // Extract folder (UUID)
        const parts = safeKey.split(path.sep);
        const videoId = parts[0]; // Request: "uuid/playlist.m3u8" -> videoId = uuid
        
        // Try validating exact match first
        let isValid = UrlSigner.validateToken(token, key, STORAGE_SECRET, expires);
        
        if (!isValid) {
            // If exact match failed, try checking if token is valid for the "playlist" but we are requesting a segment?
            // Actually, best "Bunny-like" practice:
            // The token is often generated for the "path" or "directory".
            
            // Workaround: We allow access if the token is valid for "{videoId}/playlist.m3u8" 
            // AND we are requesting a file inside that {videoId}.
            // This is "Session-like" scope.
            
            const playlistKey = `${videoId}/playlist.m3u8`;
            const isPlaylistToken = UrlSigner.validateToken(token, playlistKey, STORAGE_SECRET, expires);
            
            if (isPlaylistToken && safeKey.startsWith(videoId)) {
                isValid = true;
            }
        }

        if (!isValid) throw new Error('Invalid or expired token');

        const filePath = path.join(this.rootDir, safeKey);
        if (!fs.existsSync(filePath)) throw new Error('File not found');
        
        return filePath;
    }

    async _getDirSize(dir) {
        const files = await fs.promises.readdir(dir);
        const stats = await Promise.all(
            files.map(file => statAsync(path.join(dir, file)))
        );
        return stats.reduce((acc, { size }) => acc + size, 0);
    }
}
