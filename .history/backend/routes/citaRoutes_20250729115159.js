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
} from "../controllers/citaController.js";
const router = express.Router();

// Rutas principales CRUD
router.post("/", crearCita); // POST /citas
router.get("/", obtenerCitas); // GET /citas
router.get("/:id", obtenerCitaPorId); // GET /citas/:id
router.put("/:id", actualizarCita); // PUT /citas/:id
router.delete("/:id", eliminarCita); // DELETE /citas/:id

// Rutas específicas (IMPORTANTE: estas van ANTES de /:id)
router.get("/fecha/rango", obtenerCitasPorFecha); // GET /citas/fecha/rango?fechaInicio=...&fechaFin=...
router.get("/paciente/:pacienteId", obtenerCitasPorPaciente); // GET /citas/paciente/:pacienteId
router.get("/disponibilidad/horarios", obtenerDisponibilidad); // GET /citas/disponibilidad/horarios?fecha=...
router.get("/estadisticas/resumen", obtenerEstadisticasCitas); // GET /citas/estadisticas/resumen

// Rutas de acciones específicas
router.patch("/:id/estado", cambiarEstadoCita); // PATCH /citas/:id/estado

// Agregar estas rutas al final de citaRoutes.js

// RUTAS DE PAGOS
router.post("/:citaId/pagos", crearPlanPagos); // POST /citas/:citaId/pagos
router.post("/:citaId/pagos/:numeroPago/mercadopago", generarLinkMercadoPago); // POST /citas/:citaId/pagos/:numeroPago/mercadopago
router.patch("/:citaId/pagos/:numeroPago/confirmar", confirmarPago); // PATCH /citas/:citaId/pagos/:numeroPago/confirmar
router.post("/:citaId/pagos/:numeroPago/alerta", enviarAlertaWhatsApp); // POST /citas/:citaId/pagos/:numeroPago/alerta

// RUTAS DE ESTADÍSTICAS Y ALERTAS
router.get("/alertas-pendientes", obtenerAlertasPendientes); // GET /citas/alertas-pendientes
router.get("/estadisticas-pagos", obtenerEstadisticasPagos); // GET /citas/estadisticas-pagos

export default router;
