import express from "express";
import {
  crearRegistroTratamiento,
  crearMultiplesTratamientos, // 👈 AGREGAR ESTA LÍNEA
  obtenerRegistrosPorPaciente,
  obtenerRegistrosPorHistorialClinico,
  actualizarRegistroTratamiento,
  eliminarRegistroTratamiento,
} from "../controllers/registroTratamientoController.js";

const router = express.Router();

// Crear un registro de tratamiento individual
router.post("/", crearRegistroTratamiento);

// 👈 AGREGAR ESTA RUTA NUEVA
router.post("/multiples", crearMultiplesTratamientos);

// Obtener registros por paciente
router.get("/paciente/:pacienteId", obtenerRegistrosPorPaciente);

// Obtener registros por historial clínico
router.get(
  "/historial/:historialClinicoId",
  obtenerRegistrosPorHistorialClinico
);

// Actualizar un registro de tratamiento
router.put("/:id", actualizarRegistroTratamiento);

// Eliminar un registro de tratamiento
router.delete("/:id", eliminarRegistroTratamiento);

export default router;
