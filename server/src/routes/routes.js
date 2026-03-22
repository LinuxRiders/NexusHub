import { Router } from "express";

import authRoutes from "../modules/Users-Auth/routes/auth.routes.js";
import userRoutes from "../modules/Users-Auth/routes/user.routes.js";

// import communicationsRoutes from "../modules/Courses/routes/communication.routes.js";

const router = Router();

// ============== Montar rutas de Users & Auth ==============
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// ============== Montar rutas de Cursos ==============
// router.use("/communications", communicationsRoutes);

router.get("/ping", (req, res) => {
  res.send("Conexion Funcional");
});

export default router;
