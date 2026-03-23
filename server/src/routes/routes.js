import { Router } from "express";

import authRoutes from "../modules/Users-Auth/routes/auth.routes.js";
import userRoutes from "../modules/Users-Auth/routes/user.routes.js";
import propertyRoutes from "../modules/Properties/routes/property.routes.js";
import favoriteRoutes from "../modules/Properties/routes/favorite.routes.js";
import alertRoutes from "../modules/Properties/routes/alert.routes.js";
import notificationRoutes from "../modules/Properties/routes/notification.routes.js";
import activityRoutes from "../modules/System-Activity/routes/activity.routes.js";
import messageRoutes from "../modules/Properties/routes/message.routes.js";

const router = Router();

// ============== Montar rutas de Users & Auth ==============
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// ============== Montar rutas de Properties ==============
router.use("/properties", propertyRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/alerts", alertRoutes);
router.use("/notifications", notificationRoutes);
router.use("/messages", messageRoutes);

// ============== Montar rutas de Sistema ==============
router.use("/system/activity", activityRoutes);

// ============== Montar rutas de Cursos ==============
// router.use("/communications", communicationsRoutes);

router.get("/ping", (req, res) => {
  res.send("Conexion Funcional");
});

export default router;
