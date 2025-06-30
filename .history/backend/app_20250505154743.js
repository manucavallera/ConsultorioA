import express from "express";
import cors from "cors";
import pacienteRoutes from "./routes/pacienteRoutes.js"; // Rutas para pacientes
import historialClinicoRoutes from "./routes/historialClinicoRoutes.js"; // Rutas para historial clínico

const app = express();

// Middleware
app.use(cors()); // Habilita CORS
app.use(express.json()); // Permite recibir datos en formato JSON

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

// Rutas de pacientes
app.use("/pacientes", pacienteRoutes);

// Rutas de historial clínico
app.use("/historial", historialClinicoRoutes);

//app

export default app; // Exporta la instancia de app
