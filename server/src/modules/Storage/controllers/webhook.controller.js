
import pool from '../../../config/db.js';
import logger from '../../../utils/logger.js';
import { storageManager } from '../services/core/StorageManager.js';

export const handleBunnyWebhook = async (req, res) => {
    // Bunny sends keys in PascalCase usually, but check documentation. 
    // Common fields: VideoGuid, Status, Duration (in seconds, integer or float)
    let { VideoGuid, Status, Duration } = req.body;

    // logger.info(`[Webhook] Full Payload: ${JSON.stringify(req.body)}`);
    logger.info(`[Webhook] Received Bunny event for ${VideoGuid}, Status: ${Status}`);

    if (!VideoGuid) {
        return res.status(400).json({ error: 'Missing VideoGuid' });
    }

    // SI NO LLEGA LA DURACIÓN Y EL VIDEO ESTÁ LISTO (3) O ENCODEADO (4), CONSULTAR API
    if ((Status === 3 || Status === 4) && !Duration) {
        try {
            // Asumimos que usamos el bucket 'streaming' para Bunny
            const bucket = storageManager.getBucket('streaming');
            if (bucket && bucket.adapter && typeof bucket.adapter.getVideoDetails === 'function') {
                 logger.info(`[Webhook] Fetching explicit details for ${VideoGuid} from Bunny API...`);
                 const videoDetails = await bucket.adapter.getVideoDetails(VideoGuid);
                 if (videoDetails && videoDetails.length) {
                     // Bunny devuelve duración en segundos (int)
                     Duration = videoDetails.length;
                     logger.info(`[Webhook] Recovered Duration from API: ${Duration}`);
                 }
            }
        } catch (err) {
            logger.error(`[Webhook] Failed to fetch details from adapter: ${err.message}`);
        }
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Status codes (Bunny): 3 = Finished, 5 = Failed
        let newStatus = null;
        let durationToUpdate = null;

        if (Status === 3 || Status === 4) {
            newStatus = 'ready';
            // Only update duration if positive
            if (Duration && Duration > 0) {
                durationToUpdate = Math.round(Number(Duration));
            }
        } else if (Status === 5 || Status === 6) { 
            // 5=Failed, 6=Captions Failed (maybe treat as ready but warning? treating as error for now)
            newStatus = 'error';
        }

        if (newStatus) {
            // Construir query dinámica
            let query = `UPDATE course_videos SET status = ?`;
            const params = [newStatus];

            if (durationToUpdate !== null) {
                query += `, duration = ?`;
                params.push(durationToUpdate);
            }

            query += ` WHERE video_url = ?`;
            params.push(VideoGuid);

            const [result] = await connection.execute(query, params);

            if (result.affectedRows > 0) {
                logger.info(`[Webhook] Updated video ${VideoGuid} -> Status: ${newStatus}, Duration: ${durationToUpdate ?? 'unchanged'}`);
            } else {
                logger.warn(`[Webhook] Video ${VideoGuid} not found in DB`);
            }
        }

        await connection.commit();
        return res.status(200).send('OK');

    } catch (error) {
        await connection.rollback();
        logger.error(`[Webhook] Error processing event: ${error.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        connection.release();
    }
};
