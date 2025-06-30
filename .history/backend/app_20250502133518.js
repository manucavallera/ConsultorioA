const express = require("express");
const cors = require("cors");
const pacienteRoutes = require("./routes/pacienteRoutes.js"); // Importa las rutas

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

// Rutas de pacientes (sin prefijo)
app.use("/pacientes", pacienteRoutes); // Agrega las rutas sin el prefijo /api

module.exports = app;
