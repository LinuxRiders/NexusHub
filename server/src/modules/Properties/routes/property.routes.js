import { Router } from "express";
import {
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertiesPublic,
  getPropertiesAdmin,
  getPropertyById,
  getDashboardStats,
  getLocations
} from "../controllers/property.controller.js";
import { authMiddleware, optionalAuthMiddleware } from "../../../middlewares/auth.middleware.js";
import { requireRole } from "../../../middlewares/permissions.middleware.js";
import { validateCreateProperty, validateUpdateProperty } from "../middlewares/property.validation.js";

const router = Router();

// Rutas Públicas
router.get("/locations", getLocations);
router.get("/", optionalAuthMiddleware, getPropertiesPublic);
router.get("/:id", optionalAuthMiddleware, getPropertyById);

// Rutas Admin
router.get("/admin/dashboard", authMiddleware, requireRole(["admin", "dev"]), getDashboardStats);
router.get("/admin/all", authMiddleware, requireRole(["admin", "dev"]), getPropertiesAdmin);
router.post("/", authMiddleware, requireRole(["admin", "dev"]), validateCreateProperty, createProperty);
router.put("/:id", authMiddleware, requireRole(["admin", "dev"]), validateUpdateProperty, updateProperty);
router.delete("/:id", authMiddleware, requireRole(["admin", "dev"]), deleteProperty);

export default router;
