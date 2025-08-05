import express from "express";
import cors from "cors";
import pacienteRoutes from "./routes/pacienteRoutes.js";
import historialClinicoRoutes from "./routes/historialClinicoRoutes.js";
import registroTratamientoRoutes from "./routes/registroTratamientoRoutes.js";
import estudioLaboratorioRoutes from "./routes/estudioLaboratorio.js";
import solicitudAnalisisRoutes from "./routes/solicitudAnalisisRoutes.js";
import citaRoutes from "./routes/citaRoutes.js";
import fotoAntesDepuesRoutes from "./routes/fotoAntesDepuesRoutes.js";

const app = express();

// ✅ CORS PERMISIVO PARA DEBUG
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ MIDDLEWARE MANUAL ADICIONAL
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  console.log(`📡 ${req.method} ${req.path} - Origin: ${req.get("Origin")}`); // ✅ LOG PARA DEBUG

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Middleware para parsear JSON
app.use(express.json());

// ✅ RUTA DE PRUEBA MÁS EXPLÍCITA
app.get("/", (req, res) => {
  console.log("🏠 Accediendo a ruta raíz");
  res.status(200).json({
    message: "✅ Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
    cors: "habilitado",
    routes: [
      "/pacientes",
      "/historial",
      "/tratamientos",
      "/solicitudes",
      "/estudios",
      "/citas",
      "/fotos",
    ],
  });
});

// ✅ RUTA DE PRUEBA PARA PACIENTES
app.get("/test", (req, res) => {
  console.log("🧪 Accediendo a ruta de prueba");
  res.status(200).json({
    message: "Ruta de prueba funcionando",
    cors: "OK",
  });
});

// Rutas principales
app.use("/pacientes", pacienteRoutes);
app.use("/historial", historialClinicoRoutes);
app.use("/tratamientos", registroTratamientoRoutes);
app.use("/solicitudes", solicitudAnalisisRoutes);
app.use("/estudios", estudioLaboratorioRoutes);
app.use("/citas", citaRoutes);
app.use("/fotos", fotoAntesDepuesRoutes);

// ✅ MIDDLEWARE DE ERROR PARA RUTAS NO ENCONTRADAS
app.use("*", (req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Ruta no encontrada",
    method: req.method,
    url: req.originalUrl,
    availableRoutes: [
      "/",
      "/test",
      "/pacientes",
      "/historial",
      "/tratamientos",
      "/solicitudes",
      "/estudios",
      "/citas",
      "/fotos",
    ],
  });
});

export default app;
