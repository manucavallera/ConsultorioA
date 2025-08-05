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

// ✅ CONFIGURACIÓN CORS ESPECÍFICA
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev server
      "http://127.0.0.1:5173", // Alternativa localhost
      "http://localhost:3000", // Por si usas Create React App
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200, // Para navegadores legacy
  })
);

// ✅ MIDDLEWARE ADICIONAL PARA PREFLIGHT REQUESTS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middlewares
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    message: "Servidor funcionando correctamente",
    cors: "habilitado",
    timestamp: new Date().toISOString(),
  });
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
