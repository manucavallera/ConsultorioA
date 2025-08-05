import express from "express";
import {
  crearSolicitud,
  listarSolicitudesPorPaciente,
  obtenerSolicitud,
  eliminarSolicitud,
  editarSolicitud,
  actualizarValoresAnalisis, // NUEVA FUNCIÓN
} from "../controllers/solicitudAnalisisController.js";

const router = express.Router();

// Crear nueva solicitud de análisis (sin archivo)
router.post("/", crearSolicitud);

// Listar solicitudes por paciente
router.get("/paciente/:pacienteId", listarSolicitudesPorPaciente);

// Obtener una solicitud por ID
router.get("/:id", obtenerSolicitud);

// Eliminar una solicitud por ID
router.delete("/:id", eliminarSolicitud);

// Editar (actualizar) una solicitud por ID
router.put("/:id", editarSolicitud);

// NUEVA RUTA: Actualizar solo los valores de los análisis
router.patch("/:id/valores", actualizarValoresAnalisis);

export default router;
