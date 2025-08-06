import express from "express";
import {
  crearHistorialClinico,
  obtenerHistorialPorPaciente,
  actualizarHistorialClinico,
  eliminarHistorialClinico,
  obtenerHistorialPorId,
} from "../controllers/historialClinicoController.js";

const router = express.Router();

// Crear un historial clínico
router.post("/", crearHistorialClinico);

// ✅ CORREGIDO - Quitar el "/historial" duplicado
router.get("/detalle/:id", obtenerHistorialPorId); // Cambié la ruta

// Obtener todos los historiales clínicos de un paciente
router.get("/:pacienteId", obtenerHistorialPorPaciente);

// Actualizar un historial clínico
router.put("/:id", actualizarHistorialClinico);

// Eliminar un historial clínico
router.delete("/:id", eliminarHistorialClinico);

export default router;
