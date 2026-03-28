import { Router } from 'express';
import { handleBunnyWebhook } from '../controllers/webhook.controller.js';

const router = Router();

// POST /api/storage/webhook/bunny
// Public endpoint (no auth middleware, but should have signature validation logic inside controller)
router.post('/bunny', handleBunnyWebhook);

export default router;
