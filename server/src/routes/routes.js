import { Router } from "express";

import authRoutes from "../modules/Users-Auth/routes/auth.routes.js";
import userRoutes from "../modules/Users-Auth/routes/user.routes.js";
import rolesRoutes from "../modules/Users-Auth/routes/roles.routes.js";

import coursesRoutes from "../modules/Courses/routes/courses.routes.js";
import communicationsRoutes from "../modules/Courses/routes/communication.routes.js";
import storageRoutes from "../modules/Courses/routes/storage.routes.js";

const router = Router();

// ============== Montar rutas de Users & Auth ==============
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", rolesRoutes);

// ============== Montar rutas de Cursos ==============
router.use("/courses", coursesRoutes);
router.use("/communications", communicationsRoutes);
router.use("/storage", storageRoutes);

router.get("/ping", (req, res) => {
  res.send("Conexion Funcional");
});

export default router;
