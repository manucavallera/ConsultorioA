import express from "express";
import upload from "../config/multer.js";
import {
  crearEstudioLaboratorio,
  obtenerEstudiosPorPaciente,
  obtenerEstudioPorId,
  eliminarEstudioLaboratorio,
} from "../controllers/estudioLaboratorioController.js";

const router = express.Router();

// Crear un estudio con archivo (usa Multer y Cloudinary)
router.post("/", upload.single("archivo"), crearEstudioLaboratorio);

// Obtener estudios por paciente
router.get("/paciente/:pacienteId", obtenerEstudiosPorPaciente);

// Obtener estudio individual por ID
router.get("/:id", obtenerEstudioPorId);

// Eliminar estudio
router.delete("/:id", eliminarEstudioLaboratorio);

export default router;
