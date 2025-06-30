import express from "express";
import upload from "../config/multer.js";
import {
  subirEstudio, // Nuevo nombre para el controlador de subida a Cloudinary
  listarEstudiosPorSolicitud,
  listarEstudiosPorPaciente,
} from "../controllers/estudioLaboratorioController.js";

const router = express.Router();

// Subir un archivo de resultado de estudio asociado a una solicitud
router.post("/", upload.single("archivo"), subirEstudio);

// Listar estudios por solicitud (para mostrar archivos subidos a una solicitud)
router.get("/solicitud/:solicitudId", listarEstudiosPorSolicitud);

// Listar todos los estudios (archivos) de un paciente
router.get("/paciente/:pacienteId", listarEstudiosPorPaciente);

export default router;
