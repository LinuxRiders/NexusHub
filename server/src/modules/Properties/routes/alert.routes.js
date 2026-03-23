import { Router } from "express";
import {
  createAlert,
  updateAlert,
  deleteAlert,
  getMyAlerts,
  getAdminAlerts,
  suggestPropertyToUser
} from "../controllers/alert.controller.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { requireRole } from "../../../middlewares/permissions.middleware.js";
import { validateCreateAlert, validateUpdateAlert } from "../middlewares/alert.validation.js";

const router = Router();

// Rutas Usuario
router.get("/me", authMiddleware, getMyAlerts);
router.post("/", authMiddleware, validateCreateAlert, createAlert);
router.put("/:id", authMiddleware, validateUpdateAlert, updateAlert);
router.delete("/:id", authMiddleware, deleteAlert);

// Rutas Admin
router.get("/admin/all", authMiddleware, requireRole(["admin", "dev"]), getAdminAlerts);
router.post("/suggest/:alertId", authMiddleware, requireRole(["admin", "dev"]), suggestPropertyToUser);

export default router;
