import express from "express";
import {
  crearSolicitud,
  listarSolicitudesPorPaciente,
  obtenerSolicitud,
} from "../controllers/solicitudAnalisisController.js";

const router = express.Router();

// Crear nueva solicitud de análisis (sin archivo)
router.post("/", crearSolicitud);

// Listar solicitudes por paciente
router.get("/paciente/:pacienteId", listarSolicitudesPorPaciente);

// Obtener una solicitud por ID
router.get("/:id", obtenerSolicitud);

export default router;
