import { Router } from "express";
import {
  getCurrentUser,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";

// Ejemplo: solo Admin puede ver todos los usuarios
// Admin crea usuarios, Staff o Admin pueden ver uno, etc.
const router = Router();

// Aplicar el middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtiene Datos Completos del usuario logueado 
router.get("/me", getCurrentUser);
// router.put("/:id", idParamValidation, validateResults, updateUserById);  // Editar usuario

// ================ Usuario ===============
// router.get("/", getAllUsers);
// router.post("/", createUserValidation, validateResults, createUser);
// router.get("/:id", idParamValidation, validateResults, getUser);
// router.patch("/:id", idParamValidation, validateResults, updateUser);
// router.delete("/:id", authMiddleware, idParamValidation, validateResults, canManageEntity('USER', 'user_id'), deleteUser);


export default router;
