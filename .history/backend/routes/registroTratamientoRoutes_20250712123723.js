import express from "express";
import {
  crearRegistroTratamiento,
  crearMultiplesTratamientos, // NUEVA RUTA
  obtenerRegistrosPorPaciente,
  obtenerRegistrosPorHistorialClinico,
  actualizarRegistroTratamiento,
  eliminarRegistroTratamiento,
  marcarDiaAdministrado, // NUEVA RUTA
} from "../controllers/registroTratamientoController.js";

const router = express.Router();

// Crear un registro de tratamiento individual
router.post("/", crearRegistroTratamiento);

// NUEVA RUTA: Crear múltiples tratamientos en una sola operación
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

// NUEVA RUTA: Marcar día como administrado
// Para tratamiento individual: PUT /tratamientos/:id/dia/:fechaIndex
router.put("/:id/dia/:fechaIndex", (req, res) => {
  req.params.tratamientoIndex = "0"; // Índice dummy para tratamiento individual
  marcarDiaAdministrado(req, res);
});

// Para múltiples tratamientos: PUT /tratamientos/:id/tratamiento/:tratamientoIndex/dia/:fechaIndex
router.put(
  "/:id/tratamiento/:tratamientoIndex/dia/:fechaIndex",
  marcarDiaAdministrado
);

export default router;
