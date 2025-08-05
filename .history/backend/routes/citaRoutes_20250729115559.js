import express from "express";
import {
  crearCita,
  obtenerCitas,
  obtenerCitasPorFecha,
  obtenerCitasPorPaciente,
  obtenerCitaPorId,
  actualizarCita,
  cambiarEstadoCita,
  eliminarCita,
  obtenerDisponibilidad,
  obtenerEstadisticasCitas,
  crearPlanPagos,
  generarLinkMercadoPago,
  confirmarPago,
  enviarAlertaWhatsApp,
  obtenerAlertasPendientes,
  obtenerEstadisticasPagos,
} from "../controllers/citaController.js";

const router = express.Router();

// ===============================
// RUTAS ESPECÍFICAS PRIMERO
// (ANTES de rutas con parámetros dinámicos)
// ===============================

// Rutas de consulta específicas
router.get("/fecha/rango", obtenerCitasPorFecha); // GET /citas/fecha/rango?fechaInicio=...&fechaFin=...
router.get("/disponibilidad/horarios", obtenerDisponibilidad); // GET /citas/disponibilidad/horarios?fecha=...
router.get("/estadisticas/resumen", obtenerEstadisticasCitas); // GET /citas/estadisticas/resumen

// Rutas de alertas y estadísticas de pagos
router.get("/alertas-pendientes", obtenerAlertasPendientes); // GET /citas/alertas-pendientes
router.get("/estadisticas-pagos", obtenerEstadisticasPagos); // GET /citas/estadisticas-pagos

// Rutas por paciente específico
router.get("/paciente/:pacienteId", obtenerCitasPorPaciente); // GET /citas/paciente/:pacienteId

// ===============================
// RUTAS CRUD PRINCIPALES
// ===============================

router.post("/", crearCita); // POST /citas
router.get("/", obtenerCitas); // GET /citas
router.get("/:id", obtenerCitaPorId); // GET /citas/:id
router.put("/:id", actualizarCita); // PUT /citas/:id
router.delete("/:id", eliminarCita); // DELETE /citas/:id

// ===============================
// RUTAS DE ACCIONES ESPECÍFICAS
// ===============================

router.patch("/:id/estado", cambiarEstadoCita); // PATCH /citas/:id/estado

// ===============================
// RUTAS DE PAGOS
// ===============================

router.post("/:citaId/pagos", crearPlanPagos); // POST /citas/:citaId/pagos
router.post("/:citaId/pagos/:numeroPago/mercadopago", generarLinkMercadoPago); // POST /citas/:citaId/pagos/:numeroPago/mercadopago
router.patch("/:citaId/pagos/:numeroPago/confirmar", confirmarPago); // PATCH /citas/:citaId/pagos/:numeroPago/confirmar
router.post("/:citaId/pagos/:numeroPago/alerta", enviarAlertaWhatsApp); // POST /citas/:citaId/pagos/:numeroPago/alerta

export default router;
