import express from "express";
import {
  crearPaciente,
  obtenerPacientes,
  obtenerPacientePorId,
  actualizarPaciente,
  eliminarPaciente,
  crearPacienteConHistorial,
} from "../controllers/pacienteController.js";

const router = express.Router();

// Rutas para pacientes
router.post("/", crearPaciente);
router.get("/", obtenerPacientes);
router.get("/:id", obtenerPacientePorId);
router.put("/:id", actualizarPaciente);
router.delete("/:id", eliminarPaciente);

// NUEVA RUTA - Agregar esta línea
router.post("/con-historial", crearPacienteConHistorial);

export default router;
