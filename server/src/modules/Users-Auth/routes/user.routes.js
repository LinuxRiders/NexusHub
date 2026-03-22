import { Router } from "express";
import {
  getCurrentUser,
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  sendUserEmail
} from "../controllers/user.controller.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { requireRole } from "../../../middlewares/permissions.middleware.js";

// Ejemplo: solo Admin puede ver todos los usuarios
// Admin crea usuarios, Staff o Admin pueden ver uno, etc.
const router = Router();

// Aplicar el middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtiene Datos Completos del usuario logueado 
router.get("/me", getCurrentUser);

// ================ Usuario ===============
router.post("/message", requireRole('dev'), sendUserEmail); // Nueva ruta para enviar mensajes

router.get("/", requireRole('dev'), getAllUsers); // Por si acaso
router.post("/", requireRole('dev'), createUser); // createUserValidation, validateResults
router.get("/:id", requireRole('dev'), getUser); // idParamValidation, validateResults
router.patch("/:id", requireRole(['dev', 'user']), updateUser); // idParamValidation, validateResults
router.delete("/:id", requireRole('dev'), deleteUser); // authMiddleware, idParamValidation, validateResults

export default router;
