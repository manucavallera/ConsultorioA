import mongoose from "mongoose";

const citaSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Paciente",
    required: true,
  },
  fecha: { type: Date, required: true },
  hora: { type: String, required: true }, // "09:30", "14:00", etc.
  duracion: { type: Number, default: 60 }, // en minutos
  tipoConsulta: {
    type: String,
    required: true,
    enum: [
      "Consulta inicial",
      "Control",
      "Tratamiento",
      "Seguimiento",
      "Urgencia",
    ],
  },
  // ✅ ESTADOS SIMPLIFICADOS
  estado: {
    type: String,
    required: true,
    default: "Programada",
    enum: [
      "Programada", // Cita agendada
      "En curso", // Paciente en consulta
      "Completada", // Cita finalizada
    ],
  },
  motivo: { type: String }, // Motivo de la consulta
  observaciones: { type: String }, // Notas del médico
  recordatorio: { type: Boolean, default: true }, // Si enviar recordatorio
  notas: { type: String }, // Notas adicionales

  // 🆕 CAMPOS DE PAGO INTEGRADOS
  pago: {
    // Información del plan de pago
    tipoPlan: {
      type: String,
      enum: ["sesion", "quincenal", "mensual"],
      default: null,
    },
    montoPorSesion: {
      type: Number,
      default: 0,
    },

    // Pagos individuales para esta cita
    pagos: [
      {
        numeroPago: Number, // 1, 2, 3, 4 (para saber cuál pago es)
        monto: Number,
        metodoPago: {
          type: String,
          enum: ["efectivo", "transferencia", "mercadopago", "tarjeta"],
          default: "efectivo",
        },
        estado: {
          type: String,
          enum: ["pendiente", "pagado", "vencido"],
          default: "pendiente",
        },
        fechaVencimiento: Date,
        fechaPago: Date,

        // Mercado Pago
        mercadoPago: {
          preferenceId: String,
          paymentId: String,
          paymentUrl: String,
          status: String,
        },

        // WhatsApp Alertas
        alertaEnviada: { type: Boolean, default: false },
        fechaUltimaAlerta: Date,

        fechaCreacion: { type: Date, default: Date.now },
      },
    ],
  },

  creadoEn: { type: Date, default: Date.now },
  actualizadoEn: { type: Date, default: Date.now },
});

// Middleware para actualizar la fecha de modificación
citaSchema.pre("save", function (next) {
  this.actualizadoEn = Date.now();
  next();
});

// MÉTODOS PARA MANEJAR PAGOS
citaSchema.methods.crearPagosPlan = function (tipoPlan, montoPorSesion) {
  const cantidadPagos =
    tipoPlan === "mensual" ? 4 : tipoPlan === "quincenal" ? 2 : 1;

  this.pago = {
    tipoPlan,
    montoPorSesion,
    pagos: [],
  };

  for (let i = 1; i <= cantidadPagos; i++) {
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 7); // 7 días para pagar

    this.pago.pagos.push({
      numeroPago: i,
      monto: montoPorSesion,
      estado: "pendiente",
      fechaVencimiento,
      metodoPago: "efectivo",
    });
  }

  return this.save();
};

citaSchema.methods.confirmarPago = function (
  numeroPago,
  metodoPago = "efectivo"
) {
  const pago = this.pago.pagos.find((p) => p.numeroPago === numeroPago);
  if (pago) {
    pago.estado = "pagado";
    pago.fechaPago = new Date();
    pago.metodoPago = metodoPago;
  }
  return this.save();
};

citaSchema.methods.necesitaAlerta = function () {
  return (
    this.pago?.pagos?.some((pago) => {
      if (pago.estado !== "pendiente" || pago.alertaEnviada) return false;

      const ahora = new Date();
      const unDiaAntes = new Date(pago.fechaVencimiento);
      unDiaAntes.setDate(unDiaAntes.getDate() - 1);

      return ahora >= unDiaAntes;
    }) || false
  );
};

// Índices para mejorar consultas
citaSchema.index({ pacienteId: 1, fecha: 1 });
citaSchema.index({ fecha: 1, hora: 1 });
citaSchema.index({ estado: 1 });
citaSchema.index({ "pago.pagos.estado": 1 });
citaSchema.index({ "pago.pagos.fechaVencimiento": 1 });

export default mongoose.model("Cita", citaSchema);
