import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requireRole } from '../../../middlewares/permissions.middleware.js';
import { uploadStatic } from '../controllers/upload.controller.js';
import { uploadStaticMiddleware } from '../middlewares/upload.middleware.js';

// Importar rate limiter si tienes uno

const router = Router();

// Webhooks (Bunny.net)
// router.use("/webhooks", webhookRoutes);

// Endpoint de "CDN" Privado (Público pero protegido por Firma: la autenticación es la propia firma en la URL)
// GET /api/storage/content?key=...&signature=...
// router.get('/content', serveSecureContent);

router.use(authMiddleware);

// ==========================================
// RUTAS DE ALMACENAMIENTO (STORAGE)
// ==========================================

// Endpoint de Inicialización de Subida (TUS Direct Upload)
// POST /api/storage/upload/init
// router.post('/upload/init', requireRole('dev'), initUpload);

// Endpoint de Subida Proxy (Legacy/Fallback)
// POST /api/storage/upload/video
// router.post('/upload/video', requireRole('dev'), uploadVideoMiddleware.single('video'), uploadVideo);

// Endpoint de Subida Estática (Solo Editores/Admin)
// POST /api/storage/upload/static
router.post('/upload/static', requireRole(["admin", "dev"]), uploadStaticMiddleware.single('file'), uploadStatic);


export default router;