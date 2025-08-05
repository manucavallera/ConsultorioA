import express from "express";
import cors from "cors";

// ===============================
// IMPORTACIÓN DE RUTAS
// ===============================

// Rutas principales del sistema
import pacienteRoutes from "./routes/pacienteRoutes.js";
import citaRoutes from "./routes/citaRoutes.js";
import historialClinicoRoutes from "./routes/historialClinicoRoutes.js";

// Rutas de tratamientos y estudios
import registroTratamientoRoutes from "./routes/registroTratamientoRoutes.js";
import estudioLaboratorioRoutes from "./routes/estudioLaboratorio.js";
import solicitudAnalisisRoutes from "./routes/solicitudAnalisisRoutes.js";

// Rutas de multimedia
import fotoAntesDepuesRoutes from "./routes/fotoAntesDepuesRoutes.js";

// ===============================
// CONFIGURACIÓN DE LA APP
// ===============================

const app = express();

// ===============================
// MIDDLEWARES
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// RUTA DE PRUEBA
// ===============================

app.get("/", (req, res) => {
  res.json({
    mensaje: "🏥 API Sistema Médico funcionando correctamente",
    version: "1.0.0",
    endpoints: [
      "GET  /pacientes",
      "GET  /citas (incluye sistema de pagos integrado)",
      "GET  /historial",
      "GET  /tratamientos",
      "GET  /estudios",
      "GET  /solicitudes",
      "GET  /fotos",
    ],
  });
});

// ===============================
// CONFIGURACIÓN DE RUTAS
// ===============================

// Rutas principales del sistema (más utilizadas)
app.use("/pacientes", pacienteRoutes);
app.use("/citas", citaRoutes);
app.use("/historial", historialClinicoRoutes);

// Rutas de tratamientos y análisis
app.use("/tratamientos", registroTratamientoRoutes);
app.use("/solicitudes", solicitudAnalisisRoutes);
app.use("/estudios", estudioLaboratorioRoutes);

// Rutas de multimedia
app.use("/fotos", fotoAntesDepuesRoutes);

export default app;
