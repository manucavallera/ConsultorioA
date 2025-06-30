import express from "express";
import cors from "cors";
import pacienteRoutes from "./routes/pacienteRoutes.js"; // Asegúrate de que la ruta sea correcta

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

// Rutas de pacientes
app.use("/pacientes", pacienteRoutes); // Asegúrate de que esto esté correcto

export default app;
