import express from "express";
import {
  crearEstudioLaboratorio,
  obtenerEstudiosPorPaciente,
  obtenerEstudioPorId,
  eliminarEstudioLaboratorio,
} from "../controllers/estudioLaboratorioController.js";

const router = express.Router();

// Crear nuevo estudio/laboratorio
router.post("/", crearEstudioLaboratorio);

// Listar estudios por paciente
router.get("/paciente/:pacienteId", obtenerEstudiosPorPaciente);

// Ver estudio individual por ID
router.get("/:id", obtenerEstudioPorId);

// Eliminar estudio
router.delete("/:id", eliminarEstudioLaboratorio);

export default router;
