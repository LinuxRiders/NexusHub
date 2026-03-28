import crypto from 'crypto';
import fs from 'fs';
import { promisify } from 'util';
import logger from '../../../../utils/logger.js';
import { StorageAdapter } from './storage.interface.js';
import { parseFile } from 'music-metadata';

const unlinkAsync = promisify(fs.unlink);

// Configuración Bunny
const API_KEY = process.env.BUNNY_API_KEY;
const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const PULL_ZONE = process.env.BUNNY_PULL_ZONE; // e.g., "vz-1234.b-cdn.net"
const SECURITY_KEY = process.env.BUNNY_SECURITY_KEY;

const BASE_URL = `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`;

export class BunnyAdapter extends StorageAdapter {

    constructor() {
        super();
        this.checkConfig();
    }

    checkConfig() {
        if (!API_KEY || !LIBRARY_ID || !PULL_ZONE) {
            logger.warn('[BunnyAdapter] Missing configuration (API_KEY, LIBRARY_ID, or PULL_ZONE). Bunny storage might fail.');
        }
        if (!SECURITY_KEY) {
            logger.warn('[BunnyAdapter] Missing BUNNY_SECURITY_KEY. Private videos will not be accessible.');
        }
    }

    /**
     * @param {Object} file 
     * @param {string} proposedKey - Ignored for Bunny Stream as it generates its own GUID
     * @param {Object} options 
     */
    async put(file, proposedKey, options = {}) {
        const tempPath = file.path;
        let videoId = null;

        try {
            // 0. Obtener duración
            const metadata = await parseFile(tempPath);
            const duration = metadata.format.duration || 0;

            // 1. Crear Video en Bunny
            const createResponse = await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'AccessKey': API_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ title: file.originalname }) // Use original name as title
            });

            if (!createResponse.ok) {
                const err = await createResponse.text();
                throw new Error(`Failed to create video in Bunny: ${err}`);
            }

            const videoData = await createResponse.json();
            videoId = videoData.guid;

            // 2. Subir el archivo físico
            const stats = fs.statSync(tempPath);
            const fileStream = fs.createReadStream(tempPath);

            const uploadResponse = await fetch(`${BASE_URL}/${videoId}`, {
                method: 'PUT',
                headers: {
                    'AccessKey': API_KEY,
                    'Content-Type': 'application/octet-stream',
                    'Content-Length': stats.size 
                },
                body: fileStream,
                duplex: 'half'
            });

            if (!uploadResponse.ok) {
                const err = await uploadResponse.text();
                throw new Error(`Failed to upload video content to Bunny: ${err}`);
            }

            // 3. Borrar archivo temporal
            await unlinkAsync(tempPath).catch(() => { });

            // 4. Retornar datos
            return {
                key: videoId, // Bunny GUID is the key
                duration: Math.round(duration),
                size: stats.size,
                mimetype: 'application/x-mpegURL' // HLS
            };

        } catch (error) {
            await unlinkAsync(tempPath).catch(() => { });

            if (videoId) {
                logger.warn(`[BunnyAdapter] Rolling back incomplete upload: ${videoId}`);
                await this.delete(videoId).catch(err => {
                    logger.error(`[BunnyAdapter] Failed to rollback video ${videoId}: ${err.message}`);
                });
            }

            logger.error(`[BunnyAdapter] Error uploading: ${error.message}`);
            throw error;
        }
    }

    async delete(key) {
        if (!key) return;
        try {
            const response = await fetch(`${BASE_URL}/${key}`, {
                method: 'DELETE',
                headers: { 'AccessKey': API_KEY }
            });

            if (!response.ok && response.status !== 404) {
                const err = await response.text();
                throw new Error(`Failed to delete video from Bunny: ${err}`);
            }

            logger.info(`[BunnyAdapter] Deleted video: ${key}`);
        } catch (error) {
            logger.error(`[BunnyAdapter] Error deleting video: ${error.message}`);
        }
    }

    getPublicUrl(key) {
        return `https://${PULL_ZONE}/${key}/playlist.m3u8`;
    }

    getSignedUrl(key, expiresIn = 3600) {
        if (!SECURITY_KEY) {
            return this.getPublicUrl(key);
        }

        const expires = Math.floor(Date.now() / 1000) + expiresIn;
        const path = `/${key}/`; 
        const params = `token_path=${path}`; 

        const stringToSign = SECURITY_KEY + path + expires + params;

        const token = crypto.createHash('sha256')
            .update(stringToSign)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        return `https://${PULL_ZONE}/${key}/playlist.m3u8?token=${token}&expires=${expires}&${params}`;
    }

    /**
     * Generates TUS Direct Upload configuration.
     * 1. Creates video in Bunny to get GUID.
     * 2. Generates SHA256 signature for TUS.
     */
    async getDirectUploadConfig(metadata) {
        const title = metadata.title || 'Untitled Video';
        
        // 1. Create Video Object in Bunny
        const createResponse = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'AccessKey': API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ title }) 
        });

        if (!createResponse.ok) {
            const err = await createResponse.text();
            throw new Error(`Failed to create video in Bunny: ${err}`);
        }

        const videoData = await createResponse.json();
        const videoId = videoData.guid;

        // 2. Generate TUS Signature
        // Signature = SHA256(library_id + api_key + expiration_time + video_id)
        const expirationTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours
        
        const stringToSign = `${LIBRARY_ID}${API_KEY}${expirationTime}${videoId}`;
        const signature = crypto.createHash('sha256').update(stringToSign).digest('hex');

        return {
            endpoint: 'https://video.bunnycdn.com/tusupload',
            headers: {
                'AuthorizationSignature': signature,
                'AuthorizationExpire': expirationTime,
                'VideoId': videoId,
                'LibraryId': LIBRARY_ID,
            },
            videoId: videoId,
            metadata: {
                filetype: metadata.filetype,
                title: title
            }
        };
    }

    /**
     * Fetches video details from Bunny API to get Duration, etc.
     */
    async getVideoDetails(videoId) {
        try {
            const response = await fetch(`${BASE_URL}/${videoId}`, {
                method: 'GET',
                headers: {
                   'AccessKey': API_KEY,
                   'Accept': 'application/json' 
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch video details: ${response.statusText}`);
            }

            const data = await response.json();
            return data; // contains duration, status, etc.
        } catch (error) {
            logger.error(`[BunnyAdapter] Error fetching video details for ${videoId}: ${error.message}`);
            return null;
        }
    }
}
