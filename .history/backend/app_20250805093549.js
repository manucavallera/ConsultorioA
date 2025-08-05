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

// ✅ CORS con logs
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

// ✅ Log de todas las peticiones
app.use((req, res, next) => {
  console.log(
    `📡 ${new Date().toISOString()} - ${req.method} ${
      req.path
    } - Origin: ${req.get("Origin")}`
  );
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    console.log(`✅ OPTIONS request handled for ${req.path}`);
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// ✅ Ruta de prueba con log
app.get("/", (req, res) => {
  console.log("🏠 GET / - Ruta raíz accedida");
  res.json({
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
    cors: "habilitado",
  });
});

// ✅ Rutas con logs
console.log("🔄 Registrando rutas...");

try {
  app.use("/pacientes", pacienteRoutes);
  console.log("✅ Ruta /pacientes registrada");
} catch (error) {
  console.error("❌ Error en ruta pacientes:", error.message);
}

try {
  app.use("/historial", historialClinicoRoutes);
  console.log("✅ Ruta /historial registrada");
} catch (error) {
  console.error("❌ Error en ruta historial:", error.message);
}

try {
  app.use("/tratamientos", registroTratamientoRoutes);
  console.log("✅ Ruta /tratamientos registrada");
} catch (error) {
  console.error("❌ Error en ruta tratamientos:", error.message);
}

try {
  app.use("/solicitudes", solicitudAnalisisRoutes);
  console.log("✅ Ruta /solicitudes registrada");
} catch (error) {
  console.error("❌ Error en ruta solicitudes:", error.message);
}

try {
  app.use("/estudios", estudioLaboratorioRoutes);
  console.log("✅ Ruta /estudios registrada");
} catch (error) {
  console.error("❌ Error en ruta estudios:", error.message);
}

try {
  app.use("/citas", citaRoutes);
  console.log("✅ Ruta /citas registrada");
} catch (error) {
  console.error("❌ Error en ruta citas:", error.message);
}

try {
  app.use("/fotos", fotoAntesDepuesRoutes);
  console.log("✅ Ruta /fotos registrada");
} catch (error) {
  console.error("❌ Error en ruta fotos:", error.message);
}

console.log("✅ Todas las rutas registradas");

// ✅ Middleware 404
app.use("*", (req, res) => {
  console.log(`❌ 404 - Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Ruta no encontrada",
    method: req.method,
    url: req.originalUrl,
  });
});

export default app;
