import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import 'dotenv/config';
import { createServer } from "http"; // Importar para crear el servidor HTTP
import routes from './src/routes/routes.js';
import { errorHandler } from "./src/middlewares/errorHandler.js";
import { registerActivityListeners } from "./src/modules/System-Activity/events/activity.listener.js";
import { registerNotificationListeners } from "./src/modules/Properties/events/notification.listener.js";

const PORT = process.env.PORT || 4000;

const app = express();

// Confiar en el proxy si está detrás de un Load Balancer / Nginx
// Esto soluciona problemas con el rate limiter y las IPs de los clientes.
app.set('trust proxy', 1);

const server = createServer(app); // Crear el servidor HTTP

// Configuración dinámica de CORS
const allowedOrigins = ["http://localhost:5173", "https://tu-dominio.com"];
const corsOptions = {
    origin: (origin, callback) => {
        if (origin) {
            callback(null, origin); // Permite cualquier origen
        } else {
            callback(null, '*'); // Permite solicitudes sin origen (como Postman)
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser()); // Permitir req.cookies

// Usa el router en el prefijo /api
app.use('/api/', (req, res, next) => {
    next();
}, routes); // Rutas generales

// Middleware de manejo de errores
app.use(errorHandler);

// Inicializar módulos Background / Event Workers
registerActivityListeners();
registerNotificationListeners();

// Usar server.listen en lugar de app.listen
server.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});