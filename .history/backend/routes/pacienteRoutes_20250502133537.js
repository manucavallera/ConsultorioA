import express from "express";
import {
  crearPaciente,
  obtenerPacientes,
  obtenerPacientePorId,
  actualizarPaciente,
  eliminarPaciente,
} from "../controllers/pacienteController.js";

const router = express.Router();

// Rutas para pacientes
router.post("/", crearPaciente); // Crear un nuevo paciente
router.get("/", obtenerPacientes); // Obtener todos los pacientes
router.get("/:id", obtenerPacientePorId); // Obtener un paciente por ID
router.put("/:id", actualizarPaciente); // Actualizar un paciente
router.delete("/:id", eliminarPaciente); // Eliminar un paciente

export default router;
