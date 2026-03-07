import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';
config();

export const pool = createPool({ // Elimina "new" - createPool ya es una función que retorna el pool
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    timezone: 'Z', // IMPORTANTE: Configura UTC desde la conexión
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default pool;

// Middleware para manejar errores de conexión
pool.on("error", (err) => {
    console.error("Error en el pool de conexiones MySQL", err);
});

// Evento para manejar conexiones exitosas
pool.on("acquire", (connection) => {
    console.log(`Conexión ${connection.threadId} adquirida del pool`);
});

// Verificar que la configuración UTC esté aplicada
(async () => {
    try {
        const conn = await pool.getConnection();

        // Forzar UTC explícitamente
        await conn.query("SET time_zone = '+00:00'");

        const [rows] = await conn.query("SELECT @@session.time_zone as tz, NOW() as hora_actual, UTC_TIMESTAMP() as hora_utc");
        console.log("=== Configuración de Zona Horaria ===");
        console.log("Zona horaria de sesión:", rows[0].tz);
        console.log("NOW() (zona de sesión):", rows[0].hora_actual);
        console.log("UTC_TIMESTAMP():", rows[0].hora_utc);

        // Comparar como timestamps
        const sonIguales = new Date(rows[0].hora_actual).getTime() === new Date(rows[0].hora_utc).getTime();
        console.log("¿Están iguales?", sonIguales ? "✅ SÍ - UTC configurado correctamente" : "❌ NO - Revisar configuración");

        conn.release();
    } catch (error) {
        console.error("Error verificando timezone:", error);
    }
})();