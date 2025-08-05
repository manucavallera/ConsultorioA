// models/Pago.js
const mongoose = require("mongoose");

const pagoSchema = new mongoose.Schema(
  {
    // 🔗 RELACIONES PRINCIPALES
    citaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cita",
      required: true,
    },
    pacienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paciente",
      required: true,
    },
    grupoTratamientoId: {
      type: mongoose.Schema.Types.ObjectId,
      // Para agrupar pagos del mismo tratamiento mensual/quincenal
      index: true,
    },

    // 💰 INFORMACIÓN FINANCIERA
    monto: {
      type: Number,
      required: true,
      min: 0,
    },
    montoOriginal: {
      type: Number, // Para guardar el monto antes de descuentos
    },
    descuento: {
      type: Number,
      default: 0,
      min: 0,
      max: 100, // Porcentaje de descuento
    },
    montoDescuento: {
      type: Number,
      default: 0, // Monto en pesos del descuento
    },
    metodoPago: {
      type: String,
      required: true,
      enum: ["Efectivo", "Transferencia", "Mercado Pago"],
    },
    estado: {
      type: String,
      required: true,
      enum: ["Pendiente", "Pagado", "Parcial", "Vencido", "Cancelado"],
      default: "Pendiente",
    },

    // 🏥 OBRA SOCIAL / PREPAGA
    obraSocial: {
      tiene: {
        type: Boolean,
        default: false,
      },
      nombre: String,
      numeroAfiliado: String,
      cobertura: {
        type: Number,
        min: 0,
        max: 100, // Porcentaje que cubre la obra social
      },
      montoCobertura: Number, // Monto que cubre la obra social
      montoACargo: Number, // Lo que paga el paciente
      autorizacion: String, // Número de autorización
      fechaAutorizacion: Date,
    },

    // 🆕 TIPOS DE TRATAMIENTO CON ALERTAS
    tipoTratamiento: {
      type: String,
      enum: ["Sesion Individual", "Quincenal", "Mensual", "Personalizado"],
      default: "Sesion Individual",
    },

    // 📅 PLAN DE TRATAMIENTO
    planTratamiento: {
      sesionesTotales: {
        type: Number,
        default: 1,
      },
      sesionesCompletadas: {
        type: Number,
        default: 0,
      },
      sesionesRestantes: {
        type: Number,
        default: 1,
      },
      fechaInicioTratamiento: Date,
      fechaFinTratamiento: Date,
      proximaAlerta: Date,
      frecuenciaAlertas: {
        type: String,
        enum: ["diaria", "semanal", "quincenal", "mensual"],
        default: "semanal",
      },
      activo: {
        type: Boolean,
        default: true,
      },
      notas: String, // Notas específicas del tratamiento
    },

    // 📅 FECHAS IMPORTANTES
    fechaPago: {
      type: Date,
      required: true,
      default: Date.now,
    },
    fechaVencimiento: Date,
    fechaRecordatorio: Date, // Cuándo enviar recordatorio

    // 📋 DOCUMENTACIÓN
    numeroFactura: {
      type: String,
      unique: true,
      sparse: true,
    },
    numeroRecibo: String,
    observaciones: {
      type: String,
      maxlength: 1000,
    },
    notasInternas: {
      type: String,
      maxlength: 500, // Solo para el médico, no se muestra al paciente
    },

    // 🔵 MERCADO PAGO
    mercadoPago: {
      id: String,
      linkPago: String,
      estadoMP: {
        type: String,
        enum: ["pending", "approved", "rejected", "cancelled", "in_process"],
      },
      fechaPagoMP: Date,
      comisionMP: Number, // Comisión cobrada por MP
      montoNetoMP: Number, // Monto que recibes después de comisiones
      preferenceId: String,
      paymentId: String,
    },

    // 🏦 TRANSFERENCIA BANCARIA
    transferencia: {
      comprobante: String, // URL del archivo del comprobante
      numeroTransferencia: String,
      banco: String,
      cbu: String,
      alias: String,
      fechaTransferencia: Date,
      verificado: {
        type: Boolean,
        default: false,
      },
      fechaVerificacion: Date,
    },

    // 💵 EFECTIVO
    efectivo: {
      recibido: Number, // Monto recibido
      vuelto: Number, // Vuelto dado
      moneda: {
        type: String,
        enum: ["ARS", "USD"],
        default: "ARS",
      },
    },

    // 🚨 SISTEMA DE ALERTAS
    alertas: [
      {
        tipo: {
          type: String,
          enum: [
            "Pago Vencido",
            "Sesion Programada",
            "Tratamiento Finalizado",
            "Recordatorio Pago",
            "Seguimiento Pendiente",
          ],
        },
        mensaje: String,
        fechaAlerta: Date,
        enviada: {
          type: Boolean,
          default: false,
        },
        fechaEnvio: Date,
        metodoEnvio: {
          type: String,
          enum: ["WhatsApp", "Email", "SMS"],
          default: "WhatsApp",
        },
        telefonoEnvio: String,
        emailEnvio: String,
        intentosEnvio: {
          type: Number,
          default: 0,
        },
        ultimoIntento: Date,
        respuesta: String, // Respuesta del paciente si la hay
      },
    ],

    // ⚙️ CONFIGURACIÓN DE ALERTAS
    configuracionAlertas: {
      habilitadas: {
        type: Boolean,
        default: true,
      },
      diasAntes: {
        type: Number,
        default: 1,
      },
      horaEnvio: {
        type: String,
        default: "10:00",
      },
      mensajePersonalizado: String,
      incluirDatosPago: {
        type: Boolean,
        default: true,
      },
    },

    // 📊 HISTORIAL DE CAMBIOS
    historialEstados: [
      {
        estadoAnterior: String,
        estadoNuevo: String,
        fecha: {
          type: Date,
          default: Date.now,
        },
        motivo: String,
        usuario: String, // Quien hizo el cambio
        ip: String,
        observaciones: String,
      },
    ],

    // 🏷️ ETIQUETAS Y CATEGORÍAS
    etiquetas: [String], // Para categorizar pagos: "urgente", "descuento", etc.
    categoria: {
      type: String,
      enum: ["Consulta", "Tratamiento", "Estudio", "Certificado", "Otro"],
      default: "Consulta",
    },

    // 🔄 PAGOS RELACIONADOS
    pagosPrevios: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pago",
      },
    ],
    pagoSiguiente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pago",
    },

    // 📱 INFORMACIÓN DE CONTACTO ESPECÍFICA
    contactoPago: {
      telefono: String, // Por si es diferente al del paciente
      email: String,
      preferenciaComunicacion: {
        type: String,
        enum: ["WhatsApp", "Email", "SMS", "Llamada"],
        default: "WhatsApp",
      },
    },

    // 🔐 METADATOS Y AUDITORÍA
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
    fechaActualizacion: {
      type: Date,
      default: Date.now,
    },
    creadoPor: String, // Usuario que creó el registro
    actualizadoPor: String, // Último usuario que modificó
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// 📍 ÍNDICES PARA PERFORMANCE
pagoSchema.index({ pacienteId: 1, fechaPago: -1 });
pagoSchema.index({ estado: 1, fechaVencimiento: 1 });
pagoSchema.index({ "alertas.enviada": 1, "alertas.fechaAlerta": 1 });
pagoSchema.index({ grupoTratamientoId: 1 });
pagoSchema.index({ numeroFactura: 1 });

// 🔧 MIDDLEWARE PRE-SAVE
pagoSchema.pre("save", function (next) {
  this.fechaActualizacion = new Date();
  this.version += 1;

  // Calcular monto con descuento
  if (this.descuento > 0) {
    this.montoDescuento =
      (this.montoOriginal || this.monto) * (this.descuento / 100);
    this.monto = (this.montoOriginal || this.monto) - this.montoDescuento;
  }

  // Configurar plan de tratamiento según el tipo
  if (this.isNew || this.isModified("tipoTratamiento")) {
    switch (this.tipoTratamiento) {
      case "Quincenal":
        this.planTratamiento.sesionesTotales = 2;
        this.planTratamiento.frecuenciaAlertas = "semanal";
        break;
      case "Mensual":
        this.planTratamiento.sesionesTotales = 4;
        this.planTratamiento.frecuenciaAlertas = "semanal";
        break;
      default: // Sesion Individual
        this.planTratamiento.sesionesTotales = 1;
        this.planTratamiento.frecuenciaAlertas = "semanal";
    }
    this.planTratamiento.sesionesRestantes =
      this.planTratamiento.sesionesTotales;
  }

  // Registrar cambio de estado
  if (this.isModified("estado") && !this.isNew) {
    this.historialEstados.push({
      estadoAnterior: this.constructor.findOne({ _id: this._id }).estado,
      estadoNuevo: this.estado,
      fecha: new Date(),
      motivo: "Cambio automático",
      usuario: this.actualizadoPor || "Sistema",
    });
  }

  next();
});

// Generar número de factura automático
pagoSchema.pre("save", async function (next) {
  if (!this.numeroFactura && this.estado === "Pagado") {
    const año = new Date().getFullYear();
    const contador = await mongoose.model("Pago").countDocuments({
      numeroFactura: { $regex: `^F-${año}-` },
    });
    this.numeroFactura = `F-${año}-${(contador + 1)
      .toString()
      .padStart(6, "0")}`;
  }
  next();
});

// 🚨 MÉTODOS PARA ALERTAS
pagoSchema.methods.crearAlertaTratamiento = function () {
  const ahora = new Date();
  let proximaFecha;

  switch (this.tipoTratamiento) {
    case "Quincenal":
      proximaFecha = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días
      break;
    case "Mensual":
      proximaFecha = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días
      break;
    default:
      proximaFecha = new Date(ahora.getTime() + 24 * 60 * 60 * 1000); // 24 horas
  }

  this.alertas.push({
    tipo: "Sesion Programada",
    mensaje: `Recordatorio: Próxima sesión de tratamiento ${this.tipoTratamiento}`,
    fechaAlerta: proximaFecha,
    enviada: false,
    telefonoEnvio: this.contactoPago.telefono,
    emailEnvio: this.contactoPago.email,
  });
};

pagoSchema.methods.actualizarProgresoTratamiento = function () {
  this.planTratamiento.sesionesCompletadas += 1;
  this.planTratamiento.sesionesRestantes = Math.max(
    0,
    this.planTratamiento.sesionesTotales -
      this.planTratamiento.sesionesCompletadas
  );

  if (
    this.planTratamiento.sesionesCompletadas >=
    this.planTratamiento.sesionesTotales
  ) {
    this.planTratamiento.activo = false;
    this.planTratamiento.fechaFinTratamiento = new Date();
    this.alertas.push({
      tipo: "Tratamiento Finalizado",
      mensaje: `🎉 Tratamiento ${this.tipoTratamiento} completado exitosamente. Total: ${this.planTratamiento.sesionesTotales} sesiones.`,
      fechaAlerta: new Date(),
      enviada: false,
    });
  } else {
    // Crear próxima alerta
    this.crearAlertaTratamiento();
  }
};

pagoSchema.methods.marcarComoVencido = function () {
  if (
    this.estado === "Pendiente" &&
    this.fechaVencimiento &&
    new Date() > this.fechaVencimiento
  ) {
    this.estado = "Vencido";
    this.alertas.push({
      tipo: "Pago Vencido",
      mensaje: `⚠️ Pago vencido. Monto: $${
        this.monto
      }. Vencía el ${this.fechaVencimiento.toLocaleDateString("es-AR")}.`,
      fechaAlerta: new Date(),
      enviada: false,
    });
  }
};

// 📊 MÉTODOS ESTÁTICOS PARA ESTADÍSTICAS
pagoSchema.statics.obtenerEstadisticas = async function () {
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const inicioAño = new Date(hoy.getFullYear(), 0, 1);

  const estadisticas = await this.aggregate([
    {
      $facet: {
        ingresosHoy: [
          { $match: { fechaPago: { $gte: inicioDia }, estado: "Pagado" } },
          {
            $group: {
              _id: null,
              total: { $sum: "$monto" },
              cantidad: { $sum: 1 },
            },
          },
        ],
        ingresosMes: [
          { $match: { fechaPago: { $gte: inicioMes }, estado: "Pagado" } },
          {
            $group: {
              _id: null,
              total: { $sum: "$monto" },
              cantidad: { $sum: 1 },
            },
          },
        ],
        ingresosAño: [
          { $match: { fechaPago: { $gte: inicioAño }, estado: "Pagado" } },
          {
            $group: {
              _id: null,
              total: { $sum: "$monto" },
              cantidad: { $sum: 1 },
            },
          },
        ],
        montosPendientes: [
          { $match: { estado: { $in: ["Pendiente", "Parcial"] } } },
          {
            $group: {
              _id: null,
              total: { $sum: "$monto" },
              cantidad: { $sum: 1 },
            },
          },
        ],
        montosVencidos: [
          { $match: { estado: "Vencido" } },
          {
            $group: {
              _id: null,
              total: { $sum: "$monto" },
              cantidad: { $sum: 1 },
            },
          },
        ],
        totalPagos: [{ $count: "total" }],
        tratamientosActivos: [
          { $match: { "planTratamiento.activo": true } },
          { $count: "total" },
        ],
        alertasPendientes: [
          { $unwind: "$alertas" },
          {
            $match: {
              "alertas.enviada": false,
              "alertas.fechaAlerta": { $lte: hoy },
            },
          },
          { $count: "total" },
        ],
        porMetodoPago: [
          { $match: { estado: "Pagado" } },
          {
            $group: {
              _id: "$metodoPago",
              total: { $sum: "$monto" },
              cantidad: { $sum: 1 },
            },
          },
        ],
        porTipoTratamiento: [
          {
            $group: {
              _id: "$tipoTratamiento",
              total: { $sum: "$monto" },
              cantidad: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  const resultado = estadisticas[0];
  return {
    ingresosHoy: resultado.ingresosHoy[0]?.total || 0,
    cantidadPagosHoy: resultado.ingresosHoy[0]?.cantidad || 0,
    ingresosMes: resultado.ingresosMes[0]?.total || 0,
    cantidadPagosMes: resultado.ingresosMes[0]?.cantidad || 0,
    ingresosAño: resultado.ingresosAño[0]?.total || 0,
    montosPendientes: resultado.montosPendientes[0]?.total || 0,
    cantidadPendientes: resultado.montosPendientes[0]?.cantidad || 0,
    montosVencidos: resultado.montosVencidos[0]?.total || 0,
    cantidadVencidos: resultado.montosVencidos[0]?.cantidad || 0,
    totalPagos: resultado.totalPagos[0]?.total || 0,
    tratamientosActivos: resultado.tratamientosActivos[0]?.total || 0,
    alertasPendientes: resultado.alertasPendientes[0]?.total || 0,
    porMetodoPago: resultado.porMetodoPago || [],
    porTipoTratamiento: resultado.porTipoTratamiento || [],
  };
};

// 🔍 MÉTODO PARA OBTENER ALERTAS PENDIENTES
pagoSchema.statics.obtenerAlertasPendientes = async function () {
  const hoy = new Date();

  return await this.find({
    alertas: {
      $elemMatch: {
        enviada: false,
        fechaAlerta: { $lte: hoy },
      },
    },
  }).populate("pacienteId citaId");
};

// 🔍 MÉTODO PARA BUSCAR PAGOS
pagoSchema.statics.buscar = function (termino) {
  return this.find({
    $or: [
      { numeroFactura: { $regex: termino, $options: "i" } },
      { numeroRecibo: { $regex: termino, $options: "i" } },
      { observaciones: { $regex: termino, $options: "i" } },
      {
        "transferencia.numeroTransferencia": { $regex: termino, $options: "i" },
      },
    ],
  }).populate("pacienteId citaId");
};

module.exports = mongoose.model("Pago", pagoSchema);
