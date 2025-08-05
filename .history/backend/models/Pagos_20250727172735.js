// models/Pago.js
const mongoose = require("mongoose");

const pagoSchema = new mongoose.Schema(
  {
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
    monto: {
      type: Number,
      required: true,
      min: 0,
    },
    metodoPago: {
      type: String,
      required: true,
      enum: ["Efectivo", "Transferencia", "Mercado Pago"],
    },
    estado: {
      type: String,
      required: true,
      enum: ["Pendiente", "Pagado", "Parcial", "Vencido"],
      default: "Pendiente",
    },

    // 🆕 TIPOS DE TRATAMIENTO CON ALERTAS
    tipoTratamiento: {
      type: String,
      enum: ["Sesion Individual", "Quincenal", "Mensual"],
      default: "Sesion Individual",
    },

    // Para tratamientos programados
    planTratamiento: {
      sesionesTotales: {
        type: Number,
        default: 1, // 1 para individual, 2 para quincenal, 4 para mensual
      },
      sesionesCompletadas: {
        type: Number,
        default: 0,
      },
      fechaInicioTratamiento: {
        type: Date,
      },
      fechaFinTratamiento: {
        type: Date,
      },
      proximaAlerta: {
        type: Date,
      },
      frecuenciaAlertas: {
        type: String,
        enum: ["semanal", "quincenal", "mensual"],
        default: "semanal",
      },
      activo: {
        type: Boolean,
        default: true,
      },
    },

    // Información básica del pago
    fechaPago: {
      type: Date,
      required: true,
      default: Date.now,
    },
    fechaVencimiento: {
      type: Date,
    },
    observaciones: {
      type: String,
      maxlength: 500,
    },
    numeroFactura: {
      type: String,
      unique: true,
      sparse: true,
    },
    descuento: {
      type: Number,
      default: 0,
      min: 0,
    },
    montoOriginal: {
      type: Number,
    },

    // Para Mercado Pago
    mercadoPago: {
      id: String,
      linkPago: String,
      estadoMP: String,
      fechaPagoMP: Date,
    },

    // Para transferencias
    transferencia: {
      comprobante: String, // URL del archivo
      numeroTransferencia: String,
      banco: String,
    },

    // 🆕 SISTEMA DE ALERTAS
    alertas: [
      {
        tipo: {
          type: String,
          enum: [
            "Pago Vencido",
            "Sesion Programada",
            "Tratamiento Finalizado",
            "Recordatorio Pago",
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
      },
    ],

    // Metadatos
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
    fechaActualizacion: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// 🔧 MIDDLEWARE PRE-SAVE
pagoSchema.pre("save", function (next) {
  this.fechaActualizacion = new Date();

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
  }

  next();
});

// Generar número de factura automático
pagoSchema.pre("save", async function (next) {
  if (!this.numeroFactura && this.estado === "Pagado") {
    const contador = await mongoose.model("Pago").countDocuments();
    this.numeroFactura = `F-${new Date().getFullYear()}-${(contador + 1)
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
  });
};

pagoSchema.methods.actualizarProgresoTratamiento = function () {
  this.planTratamiento.sesionesCompletadas += 1;

  if (
    this.planTratamiento.sesionesCompletadas >=
    this.planTratamiento.sesionesTotales
  ) {
    this.planTratamiento.activo = false;
    this.alertas.push({
      tipo: "Tratamiento Finalizado",
      mensaje: `Tratamiento ${this.tipoTratamiento} completado. ${this.planTratamiento.sesionesTotales} sesiones finalizadas.`,
      fechaAlerta: new Date(),
      enviada: false,
    });
  } else {
    // Crear próxima alerta
    this.crearAlertaTratamiento();
  }
};

// 📊 MÉTODOS ESTÁTICOS PARA ESTADÍSTICAS
pagoSchema.statics.obtenerEstadisticas = async function () {
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  const estadisticas = await this.aggregate([
    {
      $facet: {
        ingresosHoy: [
          { $match: { fechaPago: { $gte: inicioDia }, estado: "Pagado" } },
          { $group: { _id: null, total: { $sum: "$monto" } } },
        ],
        ingresosMes: [
          { $match: { fechaPago: { $gte: inicioMes }, estado: "Pagado" } },
          { $group: { _id: null, total: { $sum: "$monto" } } },
        ],
        montosPendientes: [
          { $match: { estado: { $in: ["Pendiente", "Parcial"] } } },
          { $group: { _id: null, total: { $sum: "$monto" } } },
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
      },
    },
  ]);

  const resultado = estadisticas[0];
  return {
    ingresosHoy: resultado.ingresosHoy[0]?.total || 0,
    ingresosMes: resultado.ingresosMes[0]?.total || 0,
    montosPendientes: resultado.montosPendientes[0]?.total || 0,
    totalPagos: resultado.totalPagos[0]?.total || 0,
    tratamientosActivos: resultado.tratamientosActivos[0]?.total || 0,
    alertasPendientes: resultado.alertasPendientes[0]?.total || 0,
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

module.exports = mongoose.model("Pago", pagoSchema);
