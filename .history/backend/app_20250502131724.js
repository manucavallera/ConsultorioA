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

// Rutas de pacientes
app.use("/api/pacientes", pacienteRoutes); // Agrega el prefijo a las rutas

module.exports = app;
