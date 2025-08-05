import express from "express";
import cors from "cors";
import pacienteRoutes from "./routes/pacienteRoutes.js";
import historialClinicoRoutes from "./routes/historialClinicoRoutes.js";
import registroTratamientoRoutes from "./routes/registroTratamientoRoutes.js";
import estudioLaboratorioRoutes from "./routes/estudioLaboratorio.js";
import solicitudAnalisisRoutes from "./routes/solicitudAnalisisRoutes.js";
import citaRoutes from "./routes/citaRoutes.js";
import fotoAntesDepuesRoutes from "./routes/fotoAntesDepuesRoutes.js";
// import pagoRoutes from "./routes/pagoRoutes.js"; // ❌ COMENTADO - Los pagos van integrados en citas

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

// Rutas de solicitudes de análisis
app.use("/solicitudes", solicitudAnalisisRoutes);

// Rutas de estudios de laboratorio
app.use("/estudios", estudioLaboratorioRoutes);

// Rutas de citas (incluye sistema de pagos integrado)
app.use("/citas", citaRoutes);

// Rutas de fotos antes/después
app.use("/fotos", fotoAntesDepuesRoutes);

// ❌ COMENTADO: Los pagos ahora van integrados en /citas
// app.use("/pagos", pagoRoutes);

export default app;
