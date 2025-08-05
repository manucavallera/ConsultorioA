import express from "express";
import upload from "../config/multer.js";
import {
  subirFoto,
  obtenerFotosPaciente,
  obtenerComparacion,
  obtenerEstadisticas,
  eliminarFoto,
  actualizarFoto,
} from "../controllers/FotoAntesDepuesController.js";

const router = express.Router();

// ============================================
// RUTAS PARA FOTOS ANTES/DESPUÉS
// ============================================

// Subir foto antes o después
router.post("/", upload.single("archivo"), subirFoto);

// Obtener todas las fotos de un paciente
// ?tipo=antes|despues&limite=20
router.get("/paciente/:pacienteId", obtenerFotosPaciente);

// Obtener comparación antes/después de un paciente
router.get("/comparacion/:pacienteId", obtenerComparacion);

// Obtener estadísticas de fotos de un paciente
router.get("/estadisticas/:pacienteId", obtenerEstadisticas);

// Eliminar una foto específica
router.delete("/:id", eliminarFoto);

// Actualizar metadatos de una foto (descripción, notas, etc.)
router.put("/:id", actualizarFoto);

export default router;
