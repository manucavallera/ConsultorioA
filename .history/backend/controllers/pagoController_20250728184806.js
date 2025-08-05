import mongoose from "mongoose";
import Pago from "../models/Pago.js";
import Paciente from "../models/Paciente.js";
import Cita from "../models/Cita.js";

// 🆕 CREAR PAGO
export const crearPago = async (req, res) => {
  try {
    const { pacienteId, tipoTratamiento, monto, metodoPago, descripcion } =
      req.body;

    // Validar que el paciente existe
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente) {
      return res.status(404).json({ mensaje: "Paciente no encontrado" });
    }

    const nuevoPago = new Pago({
      pacienteId,
      tipoTratamiento,
      monto,
      metodoPago,
      descripcion,
    });

    await nuevoPago.save();

    const pagoCompleto = await Pago.findById(nuevoPago._id).populate(
      "pacienteId",
      "nombre apellido dni telefono"
    );

    res.status(201).json(pagoCompleto);
  } catch (error) {
    console.error("Error creando pago:", error);
    res
      .status(500)
      .json({ mensaje: "Error al crear el pago", error: error.message });
  }
};

// 📋 OBTENER PAGOS
export const obtenerPagos = async (req, res) => {
  try {
    const { pacienteId, estado, tipo } = req.query;

    let filtros = {};
    if (pacienteId) filtros.pacienteId = pacienteId;
    if (estado) filtros.estado = estado;
    if (tipo) filtros.tipoTratamiento = tipo;

    const pagos = await Pago.find(filtros)
      .populate("pacienteId", "nombre apellido dni telefono")
      .populate("citaId", "fecha hora estado")
      .sort({ fechaCreacion: -1 });

    res.json(pagos);
  } catch (error) {
    console.error("Error obteniendo pagos:", error);
    res.status(500).json({ mensaje: "Error al obtener pagos", error });
  }
};

// 🔗 ANEXAR CITA A PAGO
export const anexarCita = async (req, res) => {
  try {
    const { pagoId } = req.params;
    const { citaId } = req.body;

    // Verificar que el pago existe y está pagado
    const pago = await Pago.findById(pagoId);
    if (!pago) {
      return res.status(404).json({ mensaje: "Pago no encontrado" });
    }

    if (pago.estado !== "pagado") {
      return res
        .status(400)
        .json({ mensaje: "El pago debe estar confirmado para anexar citas" });
    }

    if (!pago.puedeUsarSesion()) {
      return res
        .status(400)
        .json({ mensaje: "No quedan sesiones disponibles en este pago" });
    }

    // Verificar que la cita existe
    const cita = await Cita.findById(citaId);
    if (!cita) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }

    // Usar una sesión
    await pago.usarSesion();

    // Actualizar la cita con el pago
    await Cita.findByIdAndUpdate(citaId, { pagoId: pagoId });

    const pagoActualizado = await Pago.findById(pagoId).populate(
      "pacienteId",
      "nombre apellido dni telefono"
    );

    res.json(pagoActualizado);
  } catch (error) {
    console.error("Error anexando cita:", error);
    res.status(500).json({ mensaje: "Error al anexar la cita", error });
  }
};

// 💳 CREAR PREFERENCIA DE MERCADO PAGO
export const crearPreferenciaMercadoPago = async (req, res) => {
  try {
    const { pagoId } = req.params;

    const pago = await Pago.findById(pagoId).populate(
      "pacienteId",
      "nombre apellido email telefono"
    );

    if (!pago) {
      return res.status(404).json({ mensaje: "Pago no encontrado" });
    }

    // SIMULACIÓN - Reemplazar con SDK real de MP
    const mockPreferenceId = `PREF_${Date.now()}_${pago._id}`;
    const mockPaymentUrl = `https://checkout.mercadopago.com.ar/preferences/${mockPreferenceId}`;

    // Guardar datos de MP en el pago
    pago.mercadoPago.preferenceId = mockPreferenceId;
    pago.mercadoPago.paymentUrl = mockPaymentUrl;
    await pago.save();

    res.json({
      preferenceId: mockPreferenceId,
      paymentUrl: mockPaymentUrl,
      pago: pago,
    });
  } catch (error) {
    console.error("Error creando preferencia MP:", error);
    res
      .status(500)
      .json({ mensaje: "Error al crear preferencia de pago", error });
  }
};

// ✅ CONFIRMAR PAGO (webhook o manual)
export const confirmarPago = async (req, res) => {
  try {
    const { pagoId } = req.params;
    const { paymentId, status } = req.body;

    const pago = await Pago.findById(pagoId);
    if (!pago) {
      return res.status(404).json({ mensaje: "Pago no encontrado" });
    }

    if (status === "approved" || !status) {
      pago.estado = "pagado";
      pago.fechaPago = new Date();
      if (paymentId) pago.mercadoPago.paymentId = paymentId;
      if (status) pago.mercadoPago.status = status;
    }

    await pago.save();

    res.json(pago);
  } catch (error) {
    console.error("Error confirmando pago:", error);
    res.status(500).json({ mensaje: "Error al confirmar el pago", error });
  }
};

// 🚨 OBTENER ALERTAS PENDIENTES
export const obtenerAlertasPendientes = async (req, res) => {
  try {
    const pagos = await Pago.find({
      estado: "pendiente",
    }).populate("pacienteId", "nombre apellido telefono");

    const alertas = pagos.filter((pago) => pago.necesitaAlerta());

    res.json(alertas);
  } catch (error) {
    console.error("Error obteniendo alertas:", error);
    res.status(500).json({ mensaje: "Error al obtener alertas", error });
  }
};

// 📤 ENVIAR ALERTA
export const enviarAlerta = async (req, res) => {
  try {
    const { pagoId } = req.params;

    const pago = await Pago.findById(pagoId).populate(
      "pacienteId",
      "nombre apellido telefono"
    );

    if (!pago) {
      return res.status(404).json({ mensaje: "Pago no encontrado" });
    }

    // Aquí integrarías con WhatsApp API
    const mensaje = `Hola ${
      pago.pacienteId.nombre
    }, tienes un pago pendiente por $${
      pago.monto
    } que vence el ${pago.fechaVencimiento.toLocaleDateString()}. ¡No olvides realizar tu pago!`;

    console.log(`ALERTA ENVIADA a ${pago.pacienteId.telefono}: ${mensaje}`);

    // Marcar alerta como enviada
    pago.alertaEnviada = true;
    pago.fechaUltimaAlerta = new Date();
    await pago.save();

    res.json({
      telefono: pago.pacienteId.telefono,
      mensaje,
      enviado: true,
    });
  } catch (error) {
    console.error("Error enviando alerta:", error);
    res.status(500).json({ mensaje: "Error al enviar alerta", error });
  }
};

// 📊 ESTADÍSTICAS
export const obtenerEstadisticas = async (req, res) => {
  try {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const stats = await Promise.all([
      // Ingresos del mes
      Pago.aggregate([
        { $match: { estado: "pagado", fechaPago: { $gte: inicioMes } } },
        {
          $group: {
            _id: null,
            total: { $sum: "$monto" },
            cantidad: { $sum: 1 },
          },
        },
      ]),
      // Pagos pendientes
      Pago.countDocuments({ estado: "pendiente" }),
      // Pagos vencidos
      Pago.countDocuments({ estado: "vencido" }),
      // Sesiones disponibles
      Pago.aggregate([
        { $match: { estado: "pagado" } },
        {
          $project: {
            disponibles: {
              $subtract: ["$sesionesIncluidas", "$sesionesUsadas"],
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$disponibles" } } },
      ]),
    ]);

    const estadisticas = {
      ingresosMes: stats[0][0]?.total || 0,
      pagosMes: stats[0][0]?.cantidad || 0,
      pagosPendientes: stats[1],
      pagosVencidos: stats[2],
      sesionesDisponibles: stats[3][0]?.total || 0,
    };

    res.json(estadisticas);
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ mensaje: "Error al obtener estadísticas", error });
  }
};

// ⚠️ MARCAR VENCIDOS (tarea automática)
export const marcarPagosVencidos = async (req, res) => {
  try {
    const pagosVencidos = await Pago.find({
      estado: "pendiente",
      fechaVencimiento: { $lt: new Date() },
    });

    for (const pago of pagosVencidos) {
      await pago.marcarVencido();
    }

    res.json({
      mensaje: `${pagosVencidos.length} pagos marcados como vencidos`,
      cantidad: pagosVencidos.length,
    });
  } catch (error) {
    console.error("Error marcando vencidos:", error);
    res.status(500).json({ mensaje: "Error al marcar pagos vencidos", error });
  }
};
