import express from "express";
import {
  crearRegistroTratamiento,
  obtenerRegistrosPorPaciente,
  actualizarRegistroTratamiento,
  eliminarRegistroTratamiento,
} from "../controllers/tratamientoController.js";

const router = express.Router();

// Ruta para crear un nuevo registro de tratamiento
router.post("/", crearRegistroTratamiento);

// Ruta para obtener todos los registros de tratamiento por paciente
router.get("/paciente/:pacienteId", obtenerRegistrosPorPaciente);

// Ruta para actualizar un registro de tratamiento existente
router.put("/:id", actualizarRegistroTratamiento);

// Ruta para eliminar un registro de tratamiento
router.delete("/:id", eliminarRegistroTratamiento);

export default router;
