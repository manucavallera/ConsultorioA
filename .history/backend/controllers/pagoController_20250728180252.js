import Pago from "../models/Pago.js";
import Paciente from "../models/Paciente.js";
import Cita from "../models/Cita.js";

// 🆕 CREAR PAGO
export const crearPago = async (req, res) => {
  try {
    const { pacienteId, tipoTratamiento, monto, descripcion } = req.body;

    // Validar que el paciente existe
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente) {
      return res.status(404).json({
        success: false,
        message: "Paciente no encontrado",
      });
    }

    const nuevoPago = new Pago({
      pacienteId,
      tipoTratamiento,
      monto,
      descripcion,
    });

    await nuevoPago.save();

    const pagoCompleto = await Pago.findById(nuevoPago._id).populate(
      "pacienteId",
      "nombre apellido dni telefono"
    );

    res.status(201).json({
      success: true,
      message: "Pago creado exitosamente",
      data: pagoCompleto,
    });
  } catch (error) {
    console.error("Error creando pago:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el pago",
      error: error.message,
    });
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

    res.json({
      success: true,
      data: pagos,
    });
  } catch (error) {
    console.error("Error obteniendo pagos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener pagos",
      error: error.message,
    });
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
      return res.status(404).json({
        success: false,
        message: "Pago no encontrado",
      });
    }

    if (pago.estado !== "pagado") {
      return res.status(400).json({
        success: false,
        message: "El pago debe estar confirmado para anexar citas",
      });
    }

    if (!pago.puedeUsarSesion()) {
      return res.status(400).json({
        success: false,
        message: "No quedan sesiones disponibles en este pago",
      });
    }

    // Verificar que la cita existe
    const cita = await Cita.findById(citaId);
    if (!cita) {
      return res.status(404).json({
        success: false,
        message: "Cita no encontrada",
      });
    }

    // Usar una sesión
    await pago.usarSesion();

    // Actualizar la cita con el pago
    await Cita.findByIdAndUpdate(citaId, { pagoId: pagoId });

    const pagoActualizado = await Pago.findById(pagoId).populate(
      "pacienteId",
      "nombre apellido dni telefono"
    );

    res.json({
      success: true,
      message: "Cita anexada exitosamente",
      data: pagoActualizado,
    });
  } catch (error) {
    console.error("Error anexando cita:", error);
    res.status(500).json({
      success: false,
      message: "Error al anexar la cita",
      error: error.message,
    });
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
      return res.status(404).json({
        success: false,
        message: "Pago no encontrado",
      });
    }

    // Aquí integrarías con Mercado Pago SDK
    const preferencia = {
      items: [
        {
          title: `Tratamiento ${pago.tipoTratamiento} - ${pago.sesionesIncluidas} sesiones`,
          unit_price: pago.monto,
          quantity: 1,
          currency_id: "ARS",
        },
      ],
      payer: {
        name: pago.pacienteId.nombre,
        surname: pago.pacienteId.apellido,
        email: pago.pacienteId.email || "sin-email@consultorio.com",
        phone: {
          number: pago.pacienteId.telefono || "",
        },
      },
      external_reference: pago._id.toString(),
      notification_url: `${process.env.BASE_URL}/pagos/webhook/mercadopago`,
      back_urls: {
        success: `${process.env.FRONTEND_URL}/pagos/exito`,
        failure: `${process.env.FRONTEND_URL}/pagos/error`,
        pending: `${process.env.FRONTEND_URL}/pagos/pendiente`,
      },
    };

    // SIMULACIÓN - Reemplazar con SDK real de MP
    const mockPreferenceId = `PREF_${Date.now()}_${pago._id}`;
    const mockPaymentUrl = `https://checkout.mercadopago.com.ar/preferences/${mockPreferenceId}`;

    // Guardar datos de MP en el pago
    pago.mercadoPago.preferenceId = mockPreferenceId;
    pago.mercadoPago.paymentUrl = mockPaymentUrl;
    await pago.save();

    res.json({
      success: true,
      message: "Preferencia creada exitosamente",
      data: {
        preferenceId: mockPreferenceId,
        paymentUrl: mockPaymentUrl,
        pago: pago,
      },
    });
  } catch (error) {
    console.error("Error creando preferencia MP:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear preferencia de pago",
      error: error.message,
    });
  }
};

// ✅ CONFIRMAR PAGO (webhook o manual)
export const confirmarPago = async (req, res) => {
  try {
    const { pagoId } = req.params;
    const { paymentId, status } = req.body;

    const pago = await Pago.findById(pagoId);
    if (!pago) {
      return res.status(404).json({
        success: false,
        message: "Pago no encontrado",
      });
    }

    if (status === "approved") {
      pago.estado = "pagado";
      pago.fechaPago = new Date();
      pago.mercadoPago.paymentId = paymentId;
      pago.mercadoPago.status = status;
    }

    await pago.save();

    res.json({
      success: true,
      message: "Pago confirmado exitosamente",
      data: pago,
    });
  } catch (error) {
    console.error("Error confirmando pago:", error);
    res.status(500).json({
      success: false,
      message: "Error al confirmar el pago",
      error: error.message,
    });
  }
};

// 🚨 OBTENER ALERTAS PENDIENTES
export const obtenerAlertasPendientes = async (req, res) => {
  try {
    const pagos = await Pago.find({
      estado: "pendiente",
    }).populate("pacienteId", "nombre apellido telefono");

    const alertas = pagos.filter((pago) => pago.necesitaAlerta());

    res.json({
      success: true,
      data: alertas,
      total: alertas.length,
    });
  } catch (error) {
    console.error("Error obteniendo alertas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener alertas",
      error: error.message,
    });
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
      return res.status(404).json({
        success: false,
        message: "Pago no encontrado",
      });
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
      success: true,
      message: "Alerta enviada exitosamente",
      data: { telefono: pago.pacienteId.telefono, mensaje },
    });
  } catch (error) {
    console.error("Error enviando alerta:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar alerta",
      error: error.message,
    });
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

    res.json({
      success: true,
      data: estadisticas,
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
      error: error.message,
    });
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
      success: true,
      message: `${pagosVencidos.length} pagos marcados como vencidos`,
      data: { cantidad: pagosVencidos.length },
    });
  } catch (error) {
    console.error("Error marcando vencidos:", error);
    res.status(500).json({
      success: false,
      message: "Error al marcar pagos vencidos",
      error: error.message,
    });
  }
};
