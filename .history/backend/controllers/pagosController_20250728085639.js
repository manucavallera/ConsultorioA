// controllers/pagosController.js
const Pago = require("../models/Pago");
const Cita = require("../models/Cita");
const Paciente = require("../models/Paciente");
const mongoose = require("mongoose");

const pagosController = {
  // 📋 OBTENER TODOS LOS PAGOS
  obtenerTodos: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        estado,
        metodoPago,
        fechaDesde,
        fechaHasta,
        pacienteId,
        buscar,
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

      // Búsqueda por texto
      if (buscar) {
        filtros.$or = [
          { numeroFactura: { $regex: buscar, $options: "i" } },
          { numeroRecibo: { $regex: buscar, $options: "i" } },
          { observaciones: { $regex: buscar, $options: "i" } },
        ];
      }

      const opciones = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: [
          { path: "pacienteId", select: "nombre apellido dni telefono email" },
          { path: "citaId", select: "fecha hora tipoConsulta motivo" },
        ],
        sort: { fechaPago: -1 },
      };

      const pagos = await Pago.paginate(filtros, opciones);

      res.json({
        success: true,
        data: pagos.docs,
        pagination: {
          currentPage: pagos.page,
          totalPages: pagos.totalPages,
          totalDocs: pagos.totalDocs,
          limit: pagos.limit,
          hasNextPage: pagos.hasNextPage,
          hasPrevPage: pagos.hasPrevPage,
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
  },

  // 🔍 OBTENER PAGO POR ID
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const pago = await Pago.findById(id)
        .populate("pacienteId", "nombre apellido dni telefono email")
        .populate("citaId", "fecha hora tipoConsulta motivo duracion")
        .populate("pagosPrevios")
        .populate("pagoSiguiente");

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
  },

  // ➕ CREAR NUEVO PAGO
  crear: async (req, res) => {
    try {
      const {
        citaId,
        monto,
        metodoPago,
        estado = "Pendiente",
        fechaPago,
        fechaVencimiento,
        observaciones,
        descuento = 0,
        tipoTratamiento = "Sesion Individual",
        obraSocial = {},
        configuracionAlertas = {},
        contactoPago = {},
      } = req.body;

      // Validar que la cita existe
      const cita = await Cita.findById(citaId).populate("pacienteId");
      if (!cita) {
        return res.status(404).json({
          success: false,
          mensaje: "Cita no encontrada",
        });
      }

      // Crear grupo de tratamiento para tratamientos múltiples
      let grupoTratamientoId = null;
      if (tipoTratamiento !== "Sesion Individual") {
        grupoTratamientoId = new mongoose.Types.ObjectId();
      }

      // Crear el pago
      const nuevoPago = new Pago({
        citaId,
        pacienteId: cita.pacienteId._id,
        grupoTratamientoId,
        monto,
        montoOriginal: monto,
        metodoPago,
        estado,
        fechaPago: fechaPago || new Date(),
        fechaVencimiento,
        observaciones,
        descuento,
        tipoTratamiento,
        obraSocial: {
          ...obraSocial,
          montoACargo: obraSocial.tiene
            ? monto - (monto * (obraSocial.cobertura || 0)) / 100
            : monto,
        },
        configuracionAlertas: {
          habilitadas: true,
          diasAntes: 1,
          horaEnvio: "10:00",
          ...configuracionAlertas,
        },
        contactoPago: {
          telefono: contactoPago.telefono || cita.pacienteId.telefono,
          email: contactoPago.email || cita.pacienteId.email,
          preferenciaComunicacion:
            contactoPago.preferenciaComunicacion || "WhatsApp",
        },
        creadoPor: req.user?.nombre || "Sistema",
        actualizadoPor: req.user?.nombre || "Sistema",
      });

      // Si es un tratamiento múltiple, crear alertas automáticas
      if (tipoTratamiento !== "Sesion Individual") {
        nuevoPago.crearAlertaTratamiento();
      }

      // Si tiene fecha de vencimiento, crear alerta de recordatorio
      if (fechaVencimiento) {
        const fechaRecordatorio = new Date(fechaVencimiento);
        fechaRecordatorio.setDate(
          fechaRecordatorio.getDate() - (configuracionAlertas.diasAntes || 1)
        );

        nuevoPago.alertas.push({
          tipo: "Recordatorio Pago",
          mensaje: `Recordatorio: Tienes un pago pendiente de $${monto} que vence el ${new Date(
            fechaVencimiento
          ).toLocaleDateString("es-AR")}`,
          fechaAlerta: fechaRecordatorio,
          enviada: false,
        });
      }

      await nuevoPago.save();

      // Poblar el pago creado para devolver datos completos
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
  },

  // ✏️ ACTUALIZAR PAGO
  actualizar: async (req, res) => {
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

      // Guardar estado anterior para el historial
      const estadoAnterior = pago.estado;

      // Actualizar campos
      Object.keys(datosActualizacion).forEach((key) => {
        if (key !== "_id" && key !== "fechaCreacion") {
          pago[key] = datosActualizacion[key];
        }
      });

      pago.actualizadoPor = req.user?.nombre || "Sistema";

      // Si cambió el estado, agregar al historial
      if (estadoAnterior !== pago.estado) {
        pago.historialEstados.push({
          estadoAnterior,
          estadoNuevo: pago.estado,
          fecha: new Date(),
          motivo: datosActualizacion.motivoCambio || "Actualización manual",
          usuario: req.user?.nombre || "Sistema",
        });

        // Si se marca como pagado, actualizar progreso del tratamiento
        if (
          pago.estado === "Pagado" &&
          pago.tipoTratamiento !== "Sesion Individual"
        ) {
          pago.actualizarProgresoTratamiento();
        }
      }

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
  },

  // 🗑️ ELIMINAR PAGO
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      const pago = await Pago.findById(id);
      if (!pago) {
        return res.status(404).json({
          success: false,
          mensaje: "Pago no encontrado",
        });
      }

      // Verificar si se puede eliminar
      if (pago.estado === "Pagado" && pago.numeroFactura) {
        return res.status(400).json({
          success: false,
          mensaje:
            "No se puede eliminar un pago facturado. Debe cancelarlo en su lugar.",
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
  },

  // 📊 OBTENER ESTADÍSTICAS
  obtenerEstadisticas: async (req, res) => {
    try {
      const estadisticas = await Pago.obtenerEstadisticas();

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
  },

  // 🚨 OBTENER ALERTAS PENDIENTES
  obtenerAlertasPendientes: async (req, res) => {
    try {
      const alertasPendientes = await Pago.obtenerAlertasPendientes();

      res.json({
        success: true,
        data: alertasPendientes,
      });
    } catch (error) {
      console.error("Error al obtener alertas:", error);
      res.status(500).json({
        success: false,
        mensaje: "Error al obtener alertas pendientes",
        error: error.message,
      });
    }
  },

  // 💳 PROCESAR PAGO CON MERCADO PAGO
  procesarMercadoPago: async (req, res) => {
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

        // Actualizar progreso si es tratamiento
        if (pago.tipoTratamiento !== "Sesion Individual") {
          pago.actualizarProgresoTratamiento();
        }
      } else if (status === "rejected") {
        pago.estado = "Pendiente";
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
  },

  // 🏦 VERIFICAR TRANSFERENCIA
  verificarTransferencia: async (req, res) => {
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

        // Actualizar progreso si es tratamiento
        if (pago.tipoTratamiento !== "Sesion Individual") {
          pago.actualizarProgresoTratamiento();
        }
      }

      pago.actualizadoPor = req.user?.nombre || "Sistema";
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
  },

  // 💵 REGISTRAR PAGO EN EFECTIVO
  registrarEfectivo: async (req, res) => {
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

      // Actualizar progreso si es tratamiento
      if (pago.tipoTratamiento !== "Sesion Individual") {
        pago.actualizarProgresoTratamiento();
      }

      pago.actualizadoPor = req.user?.nombre || "Sistema";
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
  },

  // 📤 ENVIAR ALERTA POR WHATSAPP
  enviarAlertaWhatsApp: async (req, res) => {
    try {
      const { id } = req.params;
      const { alertaId, mensaje, telefono } = req.body;

      const pago = await Pago.findById(id)
        .populate("pacienteId", "nombre apellido telefono")
        .populate("citaId", "fecha hora tipoConsulta");

      if (!pago) {
        return res.status(404).json({
          success: false,
          mensaje: "Pago no encontrado",
        });
      }

      const alerta = pago.alertas.id(alertaId);
      if (!alerta) {
        return res.status(404).json({
          success: false,
          mensaje: "Alerta no encontrada",
        });
      }

      // Aquí integrarías con la API de WhatsApp
      // Por ahora simulamos el envío exitoso
      const telefonoDestino =
        telefono || pago.contactoPago.telefono || pago.pacienteId.telefono;
      const mensajeFinal = mensaje || alerta.mensaje;

      // Simular envío exitoso
      console.log(`Enviando WhatsApp a ${telefonoDestino}: ${mensajeFinal}`);

      // Actualizar alerta
      alerta.enviada = true;
      alerta.fechaEnvio = new Date();
      alerta.intentosEnvio += 1;
      alerta.ultimoIntento = new Date();

      await pago.save();

      res.json({
        success: true,
        mensaje: "Alerta enviada por WhatsApp exitosamente",
        data: {
          telefono: telefonoDestino,
          mensaje: mensajeFinal,
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
  },

  // 🔍 BUSCAR PAGOS
  buscar: async (req, res) => {
    try {
      const { termino } = req.query;

      if (!termino) {
        return res.status(400).json({
          success: false,
          mensaje: "Término de búsqueda requerido",
        });
      }

      const resultados = await Pago.buscar(termino);

      res.json({
        success: true,
        data: resultados,
      });
    } catch (error) {
      console.error("Error en búsqueda:", error);
      res.status(500).json({
        success: false,
        mensaje: "Error en la búsqueda",
        error: error.message,
      });
    }
  },

  // ⚠️ MARCAR PAGOS VENCIDOS (Función para ejecutar automáticamente)
  marcarVencidos: async (req, res) => {
    try {
      const hoy = new Date();

      const pagosVencidos = await Pago.find({
        estado: "Pendiente",
        fechaVencimiento: { $lt: hoy },
      });

      for (const pago of pagosVencidos) {
        pago.marcarComoVencido();
        await pago.save();
      }

      res.json({
        success: true,
        mensaje: `${pagosVencidos.length} pagos marcados como vencidos`,
        data: { cantidad: pagosVencidos.length },
      });
    } catch (error) {
      console.error("Error al marcar vencidos:", error);
      res.status(500).json({
        success: false,
        mensaje: "Error al marcar pagos vencidos",
        error: error.message,
      });
    }
  },

  // 📋 OBTENER PAGOS POR PACIENTE
  obtenerPorPaciente: async (req, res) => {
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
  },
};

module.exports = pagosController;
