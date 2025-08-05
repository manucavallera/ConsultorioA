import mongoose from "mongoose";

const pagoSchema = new mongoose.Schema(
  {
    // DATOS BÁSICOS
    pacienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paciente",
      required: true,
    },
    citaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cita",
      default: null,
    },

    // TIPO DE TRATAMIENTO
    tipoTratamiento: {
      type: String,
      enum: ["mensual", "quincenal", "sesion"],
      required: true,
    },

    // DATOS DEL PAGO
    monto: {
      type: Number,
      required: true,
      min: 0,
    },
    metodoPago: {
      type: String,
      enum: ["efectivo", "transferencia", "mercadopago", "tarjeta"],
      default: "efectivo",
    },
    sesionesIncluidas: {
      type: Number,
      default: 1,
    },
    sesionesUsadas: {
      type: Number,
      default: 0,
    },

    // ESTADO DEL PAGO
    estado: {
      type: String,
      enum: ["pendiente", "pagado", "vencido", "cancelado"],
      default: "pendiente",
    },

    // FECHAS
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
    fechaVencimiento: {
      type: Date,
      default: function () {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 7); // 7 días para pagar
        return fecha;
      },
    },
    fechaPago: {
      type: Date,
      default: null,
    },

    // MERCADO PAGO
    mercadoPago: {
      preferenceId: String,
      paymentId: String,
      status: String,
      paymentUrl: String,
    },

    // ALERTAS
    alertaEnviada: {
      type: Boolean,
      default: false,
    },
    fechaUltimaAlerta: {
      type: Date,
      default: null,
    },

    // OBSERVACIONES
    descripcion: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// MIDDLEWARE: Calcular sesiones según tipo
pagoSchema.pre("save", function (next) {
  if (this.isNew) {
    // Establecer sesiones según tipo
    switch (this.tipoTratamiento) {
      case "mensual":
        this.sesionesIncluidas = 4;
        break;
      case "quincenal":
        this.sesionesIncluidas = 2;
        break;
      case "sesion":
        this.sesionesIncluidas = 1;
        break;
      default:
        this.sesionesIncluidas = 1;
    }

    // Establecer fecha de vencimiento según tipo
    if (!this.fechaVencimiento) {
      const dias =
        this.tipoTratamiento === "mensual"
          ? 30
          : this.tipoTratamiento === "quincenal"
          ? 15
          : 7;

      const fecha = new Date();
      fecha.setDate(fecha.getDate() + dias);
      this.fechaVencimiento = fecha;
    }
  }
  next();
});

// MÉTODOS SIMPLES
pagoSchema.methods.puedeUsarSesion = function () {
  return (
    this.estado === "pagado" && this.sesionesUsadas < this.sesionesIncluidas
  );
};

pagoSchema.methods.usarSesion = function () {
  if (this.puedeUsarSesion()) {
    this.sesionesUsadas += 1;
    return this.save();
  }
  throw new Error("No se puede usar la sesión");
};

pagoSchema.methods.necesitaAlerta = function () {
  const ahora = new Date();
  const unDiaAntes = new Date(this.fechaVencimiento);
  unDiaAntes.setDate(unDiaAntes.getDate() - 1);

  return (
    this.estado === "pendiente" && ahora >= unDiaAntes && !this.alertaEnviada
  );
};

pagoSchema.methods.marcarVencido = function () {
  if (this.estado === "pendiente" && new Date() > this.fechaVencimiento) {
    this.estado = "vencido";
    return this.save();
  }
};

// Índices para performance
pagoSchema.index({ pacienteId: 1 });
pagoSchema.index({ estado: 1 });
pagoSchema.index({ fechaVencimiento: 1 });
pagoSchema.index({ fechaCreacion: -1 });

export default mongoose.model("Pago", pagoSchema);
