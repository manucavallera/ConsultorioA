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

// ✅ CONFIGURACIÓN DE CORS CON SOPORTE PARA NETLIFY PREVIEWS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000", // Por si cambias el puerto local
  "https://consultorioal.netlify.app",
  "https://consultorio-a.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("🔍 Origin recibido:", origin); // Para debug

      // Permitir requests sin origin (como Postman, apps móviles, etc.)
      if (!origin) return callback(null, true);

      // ✅ PERMITIR URLs DE NETLIFY (incluyendo previews y deploys)
      const isNetlifyUrl = origin.includes("netlify.app");
      const isAllowedOrigin = allowedOrigins.indexOf(origin) !== -1;

      if (isAllowedOrigin || isNetlifyUrl) {
        console.log("✅ CORS permitido para:", origin);
        callback(null, true);
      } else {
        console.log("❌ CORS bloqueado para origen:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cache-Control",
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ MIDDLEWARE DE DEBUG MEJORADO
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Ruta de prueba mejorada
app.get("/", (req, res) => {
  res.json({
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
  });
});

// ✅ RUTA DE HEALTH CHECK
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "Consultorio API" });
});

// Rutas principales - COMENTAR TODAS PARA ENCONTRAR EL ERROR
// app.use("/pacientes", pacienteRoutes);
app.use("/historial", historialClinicoRoutes);
app.use("/citas", citaRoutes);
app.use("/estudios", estudioLaboratorioRoutes);
app.use("/tratamientos", registroTratamientoRoutes);
app.use("/solicitudes", solicitudAnalisisRoutes);
app.use("/fotos", fotoAntesDepuesRoutes);

// ✅ MIDDLEWARE DE ERROR 404
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl,
    method: req.method,
  });
});

// ✅ MIDDLEWARE DE MANEJO DE ERRORES
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    error: "Error interno del servidor",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

export default app;
