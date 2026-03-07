import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import 'dotenv/config';
import { createServer } from "http"; // Importar para crear el servidor HTTP
import routes from './src/routes/routes.js';
import { errorHandler } from "./src/middlewares/errorHandler.js";

const PORT = process.env.PORT || 4000;

const app = express();

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

// Usar server.listen en lugar de app.listen
server.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});