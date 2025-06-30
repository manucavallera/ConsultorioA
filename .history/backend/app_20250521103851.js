import express from "express";
import cors from "cors";
import pacienteRoutes from "./routes/pacienteRoutes.js";
import historialClinicoRoutes from "./routes/historialClinicoRoutes.js";
import registroTratamientoRoutes from "./routes/registroTratamientoRoutes.js";
import estudioLaboratorioRoutes from "./routes/estudioLaboratorio.js";
import solicitudAnalisisRoutes from "./routes/solicitudAnalisisRoutes.js"; // <-- NUEVO

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

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

// Rutas de solicitudes de análisis (NUEVO)
app.use("/solicitudes", solicitudAnalisisRoutes);

// Rutas de estudios de laboratorio (con archivo)
app.use("/estudios", estudioLaboratorioRoutes);

export default app;
