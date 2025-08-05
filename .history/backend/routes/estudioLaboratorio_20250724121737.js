import express from "express";
import upload from "../config/multer.js";
import {
  // ✅ Funciones originales (las que ya tienes)
  subirEstudio,
  listarEstudiosPorSolicitud,
  listarEstudiosPorPaciente,

  // ➕ Nuevas funciones para fotos antes/después
  subirFoto,
  obtenerFotosPaciente,
  obtenerComparacion,
  obtenerEstadisticasFotos,
  eliminarArchivo,
  actualizarArchivo,
} from "../controllers/estudioLaboratorioController.js";

const router = express.Router();

// ============================================
// 🔒 RUTAS ORIGINALES (las que ya funcionan)
// ============================================

// Subir un archivo de resultado de estudio asociado a una solicitud
router.post("/", upload.single("archivo"), subirEstudio);

// Listar estudios por solicitud (para mostrar archivos subidos a una solicitud)
router.get("/solicitud/:solicitudId", listarEstudiosPorSolicitud);

// Listar todos los estudios (archivos) de un paciente
router.get("/paciente/:pacienteId", listarEstudiosPorPaciente);

// ============================================
// ➕ NUEVAS RUTAS PARA FOTOS ANTES/DESPUÉS
// ============================================

// Subir foto antes/después
// Body: { pacienteId, tipoArchivo: "foto_antes" | "foto_despues", descripcion }
router.post("/foto", upload.single("foto"), subirFoto);

// Obtener fotos de un paciente
// Query params: ?tipo=antes | ?tipo=despues
// Ej: GET /estudios/fotos/paciente/123?tipo=antes
router.get("/fotos/paciente/:pacienteId", obtenerFotosPaciente);

// Obtener comparación antes/después de un paciente
// Ej: GET /estudios/fotos/comparacion/123
router.get("/fotos/comparacion/:pacienteId", obtenerComparacion);

// Obtener estadísticas de fotos de un paciente
// Ej: GET /estudios/fotos/estadisticas/123
router.get("/fotos/estadisticas/:pacienteId", obtenerEstadisticasFotos);

// Actualizar datos de cualquier archivo (estudio o foto)
// Body: { descripcion, visible }
// Ej: PUT /estudios/123
router.put("/:id", actualizarArchivo);

// Eliminar cualquier archivo (estudio o foto)
// Ej: DELETE /estudios/123
router.delete("/:id", eliminarArchivo);

export default router;
