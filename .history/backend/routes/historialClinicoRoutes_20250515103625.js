import express from "express";
import {
  crearHistorialClinico,
  obtenerHistorialPorPaciente,
  actualizarHistorialClinico,
  eliminarHistorialClinico,
  obtenerHistorialPorId, // Importar la nueva función
} from "../controllers/historialClinicoController.js";

const router = express.Router();

// Crear un historial clínico
router.post("/", crearHistorialClinico);

// Obtener un historial clínico por su ID (ruta más específica)
router.get("/historial/:id", obtenerHistorialPorId);

// Obtener todos los historiales clínicos de un paciente (ruta más general)
router.get("/:pacienteId", obtenerHistorialPorPaciente);

// Actualizar un historial clínico
router.put("/:id", actualizarHistorialClinico);

// Eliminar un historial clínico
router.delete("/:id", eliminarHistorialClinico);

export default router;
