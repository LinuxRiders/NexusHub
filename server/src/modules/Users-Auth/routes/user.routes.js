import { Router } from "express";
import {
  getCurrentUser,
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  sendUserEmail,
  updateMyProfile,
  getUserStats
} from "../controllers/user.controller.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { requireRole } from "../../../middlewares/permissions.middleware.js";
import { validateResults } from '../../../middlewares/validationResult.js';
import { rateLimiter } from '../../../middlewares/rate.middleware.js';
import { updateProfileValidation } from '../validations/user.validation.js';

// Ejemplo: solo Admin puede ver todos los usuarios
// Admin crea usuarios, Staff o Admin pueden ver uno, etc.
const router = Router();

// Aplicar el middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtiene Datos Completos del usuario logueado 
router.get("/me", getCurrentUser);

// Actualiza los datos del usuario logueado
router.patch("/me", rateLimiter('15m', 15, 'update_profile'), updateProfileValidation, validateResults, updateMyProfile);

// ================ Usuario ===============
router.post("/message", requireRole(['admin', 'dev']), sendUserEmail); // Nueva ruta para enviar mensajes

router.get("/stats", requireRole(['admin', 'dev']), getUserStats); // Métricas Generales
router.get("/", requireRole(['admin', 'dev']), getAllUsers); // Por si acaso
// router.post("/", requireRole(['admin', 'dev']), createUser); // createUserValidation, validateResults
router.get("/:id", requireRole(['admin', 'dev']), getUser); // idParamValidation, validateResults
router.patch("/:id", requireRole(['admin', 'dev']), updateUser); // idParamValidation, validateResults
router.delete("/:id", requireRole(['admin', 'dev']), deleteUser); // authMiddleware, idParamValidation, validateResults

export default router;
