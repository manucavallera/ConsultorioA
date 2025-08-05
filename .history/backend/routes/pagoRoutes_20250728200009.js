import express from "express";
import {
  crearPago,
  obtenerPagos,
  actualizarPago, // ← NUEVO
  eliminarPago, // ← NUEVO
  anexarCita,
  crearPreferenciaMercadoPago,
  confirmarPago,
  obtenerAlertasPendientes,
  enviarAlerta,
  obtenerEstadisticas,
  marcarPagosVencidos,
} from "../controllers/pagoController.js";

const router = express.Router();

// RUTAS PRINCIPALES
router.post("/", crearPago); // POST /pagos
router.get("/", obtenerPagos); // GET /pagos
router.put("/:id", actualizarPago); // PUT /pagos/:id ← NUEVO
router.delete("/:id", eliminarPago); // DELETE /pagos/:id ← NUEVO

// RUTAS ESPECÍFICAS (antes de /:id)
router.get("/estadisticas", obtenerEstadisticas); // GET /pagos/estadisticas
router.get("/alertas", obtenerAlertasPendientes); // GET /pagos/alertas
router.patch("/vencidos", marcarPagosVencidos); // PATCH /pagos/vencidos

// RUTAS DE ACCIONES
router.patch("/:pagoId/anexar-cita", anexarCita); // PATCH /pagos/:pagoId/anexar-cita
router.post("/:pagoId/mercadopago", crearPreferenciaMercadoPago); // POST /pagos/:pagoId/mercadopago
router.patch("/:pagoId/confirmar", confirmarPago); // PATCH /pagos/:pagoId/confirmar
router.post("/:pagoId/alerta", enviarAlerta); // POST /pagos/:pagoId/alerta

export default router;
