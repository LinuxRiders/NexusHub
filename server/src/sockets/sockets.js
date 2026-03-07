import reservaSocket from "../modules/vehicles/sockets/reserva.sockets.js";

export default function socketManager(io) {
    io.on("connection", (socket) => {
        console.log(`Cliente conectado: ${socket.id}`);

        // Llamar a cada módulo de sockets
        reservaSocket(io, socket);

        socket.on("disconnect", () => {
            console.log(`Cliente desconectado: ${socket.id}`);
        });
    });
}