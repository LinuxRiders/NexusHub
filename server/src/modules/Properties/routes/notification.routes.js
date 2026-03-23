import { Router } from 'express';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller.js';
import { authMiddleware } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get('/me', getMyNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

export default router;
