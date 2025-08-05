// controllers/pagoController.js
import Pago from "../models/Pago.js";
import Cita from "../models/Cita.js";
import Paciente from "../models/Paciente.js";

// ➕ CREAR NUEVO PAGO
export const crearPago = async (req, res) => {
  try {
    const {
      citaId,
      monto,
      metodoPago,
      estado = "Pendiente",
      fechaPago,
      fechaVencimiento,
      observaciones,
      tipoTratamiento = "Sesion Individual",
    } = req.body;

    // Validar que la cita existe
    const cita = await Cita.findById(citaId).populate("pacienteId");
    if (!cita) {
      return res.status(404).json({
        success: false,
        mensaje: "Cita no encontrada",
      });
    }

    // Crear el pago
    const nuevoPago = new Pago({
      citaId,
      pacienteId: cita.pacienteId._id,
      monto,
      metodoPago,
      estado,
      fechaPago: fechaPago || new Date(),
      fechaVencimiento,
      observaciones,
      tipoTratamiento,
    });

    await nuevoPago.save();

    // Poblar datos para respuesta
    const pagoCompleto = await Pago.findById(nuevoPago._id)
      .populate("pacienteId", "nombre apellido dni telefono email")
      .populate("citaId", "fecha hora tipoConsulta motivo");

    res.status(201).json({
      success: true,
      mensaje: "Pago creado exitosamente",
      data: pagoCompleto,
    });
  } catch (error) {
    console.error("Error al crear pago:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al crear el pago",
      error: error.message,
    });
  }
};

// 📋 OBTENER TODOS LOS PAGOS
export const obtenerPagos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      estado,
      metodoPago,
      fechaDesde,
      fechaHasta,
      pacienteId,
    } = req.query;

    // Construir filtros
    let filtros = {};

    if (estado && estado !== "Todos") {
      filtros.estado = estado;
    }

    if (metodoPago && metodoPago !== "Todos") {
      filtros.metodoPago = metodoPago;
    }

    if (pacienteId) {
      filtros.pacienteId = pacienteId;
    }

    if (fechaDesde || fechaHasta) {
      filtros.fechaPago = {};
      if (fechaDesde) filtros.fechaPago.$gte = new Date(fechaDesde);
      if (fechaHasta)
        filtros.fechaPago.$lte = new Date(fechaHasta + "T23:59:59.999Z");
    }

    const pagos = await Pago.find(filtros)
      .populate("pacienteId", "nombre apellido dni telefono email")
      .populate("citaId", "fecha hora tipoConsulta motivo")
      .sort({ fechaPago: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pago.countDocuments(filtros);

    res.json({
      success: true,
      data: pagos,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDocs: total,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener los pagos",
      error: error.message,
    });
  }
};

// 🔍 OBTENER PAGO POR ID
export const obtenerPagoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const pago = await Pago.findById(id)
      .populate("pacienteId", "nombre apellido dni telefono email")
      .populate("citaId", "fecha hora tipoConsulta motivo duracion");

    if (!pago) {
      return res.status(404).json({
        success: false,
        mensaje: "Pago no encontrado",
      });
    }

    res.json({
      success: true,
      data: pago,
    });
  } catch (error) {
    console.error("Error al obtener pago:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener el pago",
      error: error.message,
    });
  }
};

// ✏️ ACTUALIZAR PAGO
export const actualizarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    const pago = await Pago.findById(id);
    if (!pago) {
      return res.status(404).json({
        success: false,
        mensaje: "Pago no encontrado",
      });
    }

    // Actualizar campos
    Object.keys(datosActualizacion).forEach((key) => {
      if (key !== "_id" && key !== "fechaCreacion") {
        pago[key] = datosActualizacion[key];
      }
    });

    await pago.save();

    const pagoActualizado = await Pago.findById(id)
      .populate("pacienteId", "nombre apellido dni telefono email")
      .populate("citaId", "fecha hora tipoConsulta motivo");

    res.json({
      success: true,
      mensaje: "Pago actualizado exitosamente",
      data: pagoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar pago:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al actualizar el pago",
      error: error.message,
    });
  }
};

// 🗑️ ELIMINAR PAGO
export const eliminarPago = async (req, res) => {
  try {
    const { id } = req.params;

    const pago = await Pago.findById(id);
    if (!pago) {
      return res.status(404).json({
        success: false,
        mensaje: "Pago no encontrado",
      });
    }

    await Pago.findByIdAndDelete(id);

    res.json({
      success: true,
      mensaje: "Pago eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar pago:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al eliminar el pago",
      error: error.message,
    });
  }
};

// 📋 OBTENER PAGOS POR PACIENTE
export const obtenerPagosPorPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { incluirCompletos = false } = req.query;

    let filtros = { pacienteId };

    if (!incluirCompletos) {
      filtros.estado = { $ne: "Pagado" };
    }

    const pagos = await Pago.find(filtros)
      .populate("citaId", "fecha hora tipoConsulta")
      .sort({ fechaPago: -1 });

    res.json({
      success: true,
      data: pagos,
    });
  } catch (error) {
    console.error("Error al obtener pagos por paciente:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener pagos del paciente",
      error: error.message,
    });
  }
};

// 📅 OBTENER PAGOS POR FECHA
export const obtenerPagosPorFecha = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        mensaje: "fechaInicio y fechaFin son requeridas",
      });
    }

    const pagos = await Pago.find({
      fechaPago: {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin + "T23:59:59.999Z"),
      },
    })
      .populate("pacienteId", "nombre apellido dni")
      .populate("citaId", "fecha hora tipoConsulta")
      .sort({ fechaPago: -1 });

    res.json({
      success: true,
      data: pagos,
    });
  } catch (error) {
    console.error("Error al obtener pagos por fecha:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener pagos por fecha",
      error: error.message,
    });
  }
};

// 📊 OBTENER ESTADÍSTICAS
export const obtenerEstadisticasPagos = async (req, res) => {
  try {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    );

    const [
      ingresosHoy,
      ingresosMes,
      montosPendientes,
      totalPagos,
      cantidadPendientes,
    ] = await Promise.all([
      // Ingresos de hoy
      Pago.aggregate([
        { $match: { fechaPago: { $gte: inicioDia }, estado: "Pagado" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$monto" },
            cantidad: { $sum: 1 },
          },
        },
      ]),
      // Ingresos del mes
      Pago.aggregate([
        { $match: { fechaPago: { $gte: inicioMes }, estado: "Pagado" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$monto" },
            cantidad: { $sum: 1 },
          },
        },
      ]),
      // Montos pendientes
      Pago.aggregate([
        { $match: { estado: { $in: ["Pendiente", "Parcial"] } } },
        {
          $group: {
            _id: null,
            total: { $sum: "$monto" },
            cantidad: { $sum: 1 },
          },
        },
      ]),
      // Total de pagos
      Pago.countDocuments(),
      // Cantidad pendientes
      Pago.countDocuments({ estado: { $in: ["Pendiente", "Parcial"] } }),
    ]);

    const estadisticas = {
      ingresosHoy: ingresosHoy[0]?.total || 0,
      cantidadPagosHoy: ingresosHoy[0]?.cantidad || 0,
      ingresosMes: ingresosMes[0]?.total || 0,
      cantidadPagosMes: ingresosMes[0]?.cantidad || 0,
      montosPendientes: montosPendientes[0]?.total || 0,
      cantidadPendientes: montosPendientes[0]?.cantidad || 0,
      totalPagos,
      tratamientosActivos: 0, // TODO: implementar cuando tengas el campo
      alertasPendientes: 0, // TODO: implementar cuando tengas el campo
    };

    res.json({
      success: true,
      data: estadisticas,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener estadísticas",
      error: error.message,
    });
  }
};

// 🚨 OBTENER ALERTAS PENDIENTES
export const obtenerAlertasPendientes = async (req, res) => {
  try {
    // Por ahora retorna array vacío, implementar cuando tengas el sistema de alertas
    res.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error("Error al obtener alertas:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener alertas pendientes",
      error: error.message,
    });
  }
};

// 🔍 BUSCAR PAGOS
export const buscarPagos = async (req, res) => {
  try {
    const { q: termino } = req.query;

    if (!termino) {
      return res.status(400).json({
        success: false,
        mensaje: "Término de búsqueda requerido",
      });
    }

    const pagos = await Pago.find({
      $or: [
        { numeroFactura: { $regex: termino, $options: "i" } },
        { numeroRecibo: { $regex: termino, $options: "i" } },
        { observaciones: { $regex: termino, $options: "i" } },
      ],
    })
      .populate("pacienteId", "nombre apellido dni")
      .populate("citaId", "fecha hora tipoConsulta")
      .limit(20);

    res.json({
      success: true,
      data: pagos,
    });
  } catch (error) {
    console.error("Error en búsqueda:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error en la búsqueda",
      error: error.message,
    });
  }
};

// 💳 PROCESAR MERCADO PAGO
export const procesarMercadoPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { preferenceId, paymentId, status } = req.body;

    const pago = await Pago.findById(id);
    if (!pago) {
      return res.status(404).json({
        success: false,
        mensaje: "Pago no encontrado",
      });
    }

    // Actualizar información de Mercado Pago
    pago.mercadoPago = {
      ...pago.mercadoPago,
      preferenceId,
      paymentId,
      estadoMP: status,
      fechaPagoMP: status === "approved" ? new Date() : null,
    };

    // Si fue aprobado, marcar como pagado
    if (status === "approved") {
      pago.estado = "Pagado";
      pago.fechaPago = new Date();
    }

    await pago.save();

    res.json({
      success: true,
      mensaje: "Pago procesado exitosamente",
      data: pago,
    });
  } catch (error) {
    console.error("Error al procesar pago MP:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al procesar el pago",
      error: error.message,
    });
  }
};

// 🏦 VERIFICAR TRANSFERENCIA
export const verificarTransferencia = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numeroTransferencia,
      banco,
      fechaTransferencia,
      comprobante,
      verificado = true,
    } = req.body;

    const pago = await Pago.findById(id);
    if (!pago) {
      return res.status(404).json({
        success: false,
        mensaje: "Pago no encontrado",
      });
    }

    // Actualizar información de transferencia
    pago.transferencia = {
      ...pago.transferencia,
      numeroTransferencia,
      banco,
      fechaTransferencia: new Date(fechaTransferencia),
      comprobante,
      verificado,
      fechaVerificacion: verificado ? new Date() : null,
    };

    // Si se verificó, marcar como pagado
    if (verificado) {
      pago.estado = "Pagado";
      pago.fechaPago = new Date(fechaTransferencia);
    }

    await pago.save();

    res.json({
      success: true,
      mensaje: "Transferencia verificada exitosamente",
      data: pago,
    });
  } catch (error) {
    console.error("Error al verificar transferencia:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al verificar la transferencia",
      error: error.message,
    });
  }
};

// 💵 REGISTRAR EFECTIVO
export const registrarEfectivo = async (req, res) => {
  try {
    const { id } = req.params;
    const { montoRecibido, vuelto = 0, moneda = "ARS" } = req.body;

    const pago = await Pago.findById(id);
    if (!pago) {
      return res.status(404).json({
        success: false,
        mensaje: "Pago no encontrado",
      });
    }

    // Validar que el monto recibido sea suficiente
    if (montoRecibido < pago.monto) {
      return res.status(400).json({
        success: false,
        mensaje: "El monto recibido es menor al monto del pago",
      });
    }

    // Actualizar información de efectivo
    pago.efectivo = {
      recibido: montoRecibido,
      vuelto,
      moneda,
    };

    pago.estado = "Pagado";
    pago.fechaPago = new Date();

    await pago.save();

    res.json({
      success: true,
      mensaje: "Pago en efectivo registrado exitosamente",
      data: pago,
    });
  } catch (error) {
    console.error("Error al registrar efectivo:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al registrar el pago en efectivo",
      error: error.message,
    });
  }
};

// 📤 ENVIAR WHATSAPP
export const enviarAlertaWhatsApp = async (req, res) => {
  try {
    const { id } = req.params;
    const { mensaje, telefono } = req.body;

    const pago = await Pago.findById(id)
      .populate("pacienteId", "nombre apellido telefono")
      .populate("citaId", "fecha hora tipoConsulta");

    if (!pago) {
      return res.status(404).json({
        success: false,
        mensaje: "Pago no encontrado",
      });
    }

    // Simular envío exitoso (aquí integrarías con WhatsApp API)
    const telefonoDestino = telefono || pago.pacienteId.telefono;
    console.log(`Enviando WhatsApp a ${telefonoDestino}: ${mensaje}`);

    res.json({
      success: true,
      mensaje: "Alerta enviada por WhatsApp exitosamente",
      data: {
        telefono: telefonoDestino,
        mensaje: mensaje,
        fechaEnvio: new Date(),
      },
    });
  } catch (error) {
    console.error("Error al enviar WhatsApp:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al enviar la alerta por WhatsApp",
      error: error.message,
    });
  }
};

// ⚠️ MARCAR VENCIDOS
export const marcarPagosVencidos = async (req, res) => {
  try {
    const hoy = new Date();

    const result = await Pago.updateMany(
      {
        estado: "Pendiente",
        fechaVencimiento: { $lt: hoy },
      },
      {
        $set: { estado: "Vencido" },
      }
    );

    res.json({
      success: true,
      mensaje: `${result.modifiedCount} pagos marcados como vencidos`,
      data: { cantidad: result.modifiedCount },
    });
  } catch (error) {
    console.error("Error al marcar vencidos:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al marcar pagos vencidos",
      error: error.message,
    });
  }
};
