import { Router } from 'express';
import { getSystemActivityFeed } from '../controllers/activity.controller.js';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireRole } from '../../../middlewares/permissions.middleware.js';

const router = Router();

// Endpoint solo accesible para dev y admins
router.get('/', authMiddleware, requireRole(['dev', 'admin']), getSystemActivityFeed);

export default router;
