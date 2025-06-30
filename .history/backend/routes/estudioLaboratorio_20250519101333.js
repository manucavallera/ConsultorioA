import express from "express";
import upload from "../config/multer.js";
import {
  crearEstudioLaboratorio,
  obtenerEstudiosPorPaciente,
  obtenerEstudioPorId,
  eliminarEstudioLaboratorio,
} from "../controllers/estudioLaboratorioController.js";

const router = express.Router();

// Crear nuevo estudio/laboratorio (con archivo)
router.post("/", upload.single("archivo"), crearEstudioLaboratorio);

// Listar estudios por paciente
router.get("/paciente/:pacienteId", obtenerEstudiosPorPaciente);

// Ver estudio individual por ID
router.get("/:id", obtenerEstudioPorId);

// Eliminar estudio
router.delete("/:id", eliminarEstudioLaboratorio);

export default router;
