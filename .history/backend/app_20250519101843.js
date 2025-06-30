import express from "express";
import cors from "cors";
import pacienteRoutes from "./routes/pacienteRoutes.js"; // Rutas para pacientes
import historialClinicoRoutes from "./routes/historialClinicoRoutes.js"; // Rutas para historial clínico
import registroTratamientoRoutes from "./routes/registroTratamientoRoutes.js"; // Rutas para tratamientos
import estudioLaboratorioRoutes from "./routes/estudioLaboratorio.js"; // Rutas para estudios de laboratorio

const app = express();

// Middlewares
app.use(cors()); // Habilita CORS para permitir solicitudes de diferentes dominios
app.use(express.json()); // Permite recibir y procesar datos en formato JSON

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

// Rutas de pacientes
app.use("/pacientes", pacienteRoutes);

// Rutas de historial clínico
app.use("/historial", historialClinicoRoutes);

// Rutas de tratamientos
app.use("/tratamientos", registroTratamientoRoutes);

// Rutas de estudios de laboratorio
app.use("/estudios", estudioLaboratorioRoutes);

export default app; // Exporta la instancia de app
