import express from "express";
import upload from "../config/multer.js";
import {
  subirEstudio,
  listarEstudiosPorSolicitud,
  listarEstudiosPorPaciente,
  eliminarArchivo, // ← AGREGAR esta importación
} from "../controllers/estudioLaboratorioController.js";

const router = express.Router();

// Subir un archivo de resultado de estudio asociado a una solicitud
router.post("/", upload.single("archivo"), subirEstudio);

// Listar estudios por solicitud (para mostrar archivos subidos a una solicitud)
router.get("/solicitud/:solicitudId", listarEstudiosPorSolicitud);

// Listar todos los estudios (archivos) de un paciente
router.get("/paciente/:pacienteId", listarEstudiosPorPaciente);

// ← AGREGAR esta ruta nueva para eliminar
router.delete("/:id", eliminarEstudio);

export default router;
