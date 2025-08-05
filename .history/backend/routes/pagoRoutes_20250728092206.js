import express from "express";
import {
  crearPago,
  obtenerPagos,
  obtenerPagoPorId,
  actualizarPago,
  eliminarPago,
  obtenerPagosPorPaciente,
  obtenerPagosPorFecha,
  obtenerEstadisticasPagos,
  obtenerAlertasPendientes,
  buscarPagos,
  procesarMercadoPago,
  verificarTransferencia,
  registrarEfectivo,
  enviarAlertaWhatsApp,
  marcarPagosVencidos,
} from "../controllers/pagosController.js";

const router = express.Router();

// Rutas principales CRUD
router.post("/", crearPago); // POST /pagos
router.get("/", obtenerPagos); // GET /pagos
router.get("/:id", obtenerPagoPorId); // GET /pagos/:id
router.put("/:id", actualizarPago); // PUT /pagos/:id
router.delete("/:id", eliminarPago); // DELETE /pagos/:id

// Rutas específicas (IMPORTANTE: estas van ANTES de /:id)
router.get("/fecha/rango", obtenerPagosPorFecha); // GET /pagos/fecha/rango?fechaInicio=...&fechaFin=...
router.get("/paciente/:pacienteId", obtenerPagosPorPaciente); // GET /pagos/paciente/:pacienteId
router.get("/estadisticas/resumen", obtenerEstadisticasPagos); // GET /pagos/estadisticas/resumen
router.get("/alertas/pendientes", obtenerAlertasPendientes); // GET /pagos/alertas/pendientes
router.get("/buscar/termino", buscarPagos); // GET /pagos/buscar/termino?q=...

// Rutas de acciones específicas - Métodos de pago
router.patch("/:id/mercado-pago", procesarMercadoPago); // PATCH /pagos/:id/mercado-pago
router.patch("/:id/transferencia", verificarTransferencia); // PATCH /pagos/:id/transferencia
router.patch("/:id/efectivo", registrarEfectivo); // PATCH /pagos/:id/efectivo

// Rutas de acciones específicas - Alertas
router.post("/:id/whatsapp", enviarAlertaWhatsApp); // POST /pagos/:id/whatsapp
router.patch("/vencidos/marcar", marcarPagosVencidos); // PATCH /pagos/vencidos/marcar

export default router;
