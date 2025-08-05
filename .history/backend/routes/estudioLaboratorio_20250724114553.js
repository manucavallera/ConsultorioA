import express from "express";
import upload from "../config/multer.js";
import {
  // Funciones originales (las que ya tienes)
  subirEstudio,
  listarEstudiosPorSolicitud,
  listarEstudiosPorPaciente,

  // Nuevas funciones para fotos antes/después
  subirFoto,
  obtenerFotosPaciente,
  obtenerComparacion,
  obtenerEstadisticasFotos,
  eliminarArchivo,
  actualizarArchivo,
} from "../controllers/estudioLaboratorioController.js";

const router = express.Router();

// ============================================
// RUTAS ORIGINALES (las que ya tienes funcionando)
// ============================================

// Subir un archivo de resultado de estudio asociado a una solicitud
router.post("/", upload.single("archivo"), subirEstudio);

// Listar estudios por solicitud (para mostrar archivos subidos a una solicitud)
router.get("/solicitud/:solicitudId", listarEstudiosPorSolicitud);

// Listar todos los estudios (archivos) de un paciente
router.get("/paciente/:pacienteId", listarEstudiosPorPaciente);

// ============================================
// NUEVAS RUTAS PARA FOTOS ANTES/DESPUÉS
// ============================================

// Subir foto antes/después
router.post("/foto", upload.single("foto"), subirFoto);

// Obtener fotos de un paciente
router.get("/fotos/paciente/:pacienteId", obtenerFotosPaciente);

// Obtener comparación antes/después de un paciente
router.get("/fotos/comparacion/:pacienteId", obtenerComparacion);

// Obtener estadísticas de fotos de un paciente
router.get("/fotos/estadisticas/:pacienteId", obtenerEstadisticasFotos);

// Actualizar datos de cualquier archivo
router.put("/:id", actualizarArchivo);

// Eliminar cualquier archivo (estudio o foto)
router.delete("/:id", eliminarArchivo);

export default router;
