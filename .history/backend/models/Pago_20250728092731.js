// models/Pago.js
import mongoose from "mongoose";

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
    tipoTratamiento: {
      type: String,
      enum: ["Sesion Individual", "Quincenal", "Mensual"],
      default: "Sesion Individual",
    },

    // Para Mercado Pago
    mercadoPago: {
      id: String,
      linkPago: String,
      estadoMP: String,
      fechaPagoMP: Date,
      preferenceId: String,
      paymentId: String,
    },

    // Para transferencias
    transferencia: {
      comprobante: String,
      numeroTransferencia: String,
      banco: String,
      fechaTransferencia: Date,
      verificado: {
        type: Boolean,
        default: false,
      },
    },

    // Para efectivo
    efectivo: {
      recibido: Number,
      vuelto: Number,
      moneda: {
        type: String,
        enum: ["ARS", "USD"],
        default: "ARS",
      },
    },
  },
  {
    timestamps: true,
  }
);

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

export default mongoose.model("Pago", pagoSchema);
