import express from "express";
import {
  crearHistorialClinico,
  obtenerHistorialPorPaciente,
  actualizarHistorialClinico,
  eliminarHistorialClinico,
} from "../controllers/historialClinicoController.js"; // Asegúrate de que este archivo exista y tenga estas funciones

const router = express.Router();

// Crear un historial clínico
router.post("/", crearHistorialClinico);

// Obtener todos los historiales clínicos de un paciente
router.get("/:pacienteId", obtenerHistorialPorPaciente);

// Actualizar un historial clínico
router.put("/:id", actualizarHistorialClinico);

// Eliminar un historial clínico
router.delete("/:id", eliminarHistorialClinico);

export default router;
