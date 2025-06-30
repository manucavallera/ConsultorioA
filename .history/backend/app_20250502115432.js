const express = require("express");
const cors = require("cors");
const pacienteRoutes = require("./routes/pacienteRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/pacientes", pacienteRoutes);

module.exports = app;
