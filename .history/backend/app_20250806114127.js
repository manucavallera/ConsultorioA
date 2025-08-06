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

// ✅ CORS CORREGIDO - INCLUYENDO NETLIFY
app.use(
  cors({
    origin: ["http://localhost:5173", "https://consultorioal.netlify.app"], // ✅ AGREGAR NETLIFY
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ ESPECÍFICO, NO "*"
  })
);

// ✅ MIDDLEWARE ADICIONAL ESPECÍFICO
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://consultorioal.netlify.app",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
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
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "Servidor funcionando correctamente" });
});

// Rutas
app.use("/pacientes", pacienteRoutes);
app.use("/historial", historialClinicoRoutes);
app.use("/tratamientos", registroTratamientoRoutes);
app.use("/solicitudes", solicitudAnalisisRoutes);
app.use("/estudios", estudioLaboratorioRoutes);
app.use("/citas", citaRoutes);
app.use("/fotos", fotoAntesDepuesRoutes);

export default app;
