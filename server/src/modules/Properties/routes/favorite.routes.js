import { Router } from "express";
import { toggleFavorite, getMyFavorites, getTopFavorites } from "../controllers/favorite.controller.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { requireRole } from "../../../middlewares/permissions.middleware.js";

const router = Router();

router.use(authMiddleware); // Todas las rutas requieren login

router.get("/me", getMyFavorites);
router.post("/toggle/:propertyId", toggleFavorite);

// Dashboard Admin
router.get("/top", requireRole(["admin", "dev"]), getTopFavorites);

export default router;
