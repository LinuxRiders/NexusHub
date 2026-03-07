import { Router } from 'express';
import { uploadVideo, serveSecureContent } from '../controllers/upload.controller.js';
import { uploadVideoMiddleware } from '../middlewares/upload.middleware.js';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireRole } from '../../../middlewares/permissions.middleware.js';
// Importar rate limiter si tienes uno

const router = Router();

// Endpoint de "CDN" Privado (Público pero protegido por Firma: la autenticación es la propia firma en la URL)
// GET /api/storage/content?key=...&signature=...
router.get('/content', serveSecureContent);

router.use(authMiddleware);

// ==========================================
// RUTAS DE ALMACENAMIENTO (STORAGE)
// ==========================================

// Endpoint de Subida (Solo Editores/Admin)
// POST /api/storage/upload/video
router.post('/upload/video', requireRole('dev'), uploadVideoMiddleware.single('video'), uploadVideo);


export default router;