import mongoose from "mongoose";

const diaTratamientoSchema = new mongoose.Schema({
  fecha: { type: Date, required: true }, // Fecha completa: día, mes, año
  administrado: { type: Boolean, default: false }, // Si ya se administró ese día
  nota: { type: String, default: "" }, // Nota específica para ese día (opcional)
});

// NUEVO: Schema para un tratamiento individual
const tratamientoIndividualSchema = new mongoose.Schema({
  nombreTratamiento: {
    type: String,
    required: true,
  },
  diasTratamiento: {
    type: [diaTratamientoSchema], // Array de objetos con fecha completa y estado
    required: true,
  },
  _id: false, // Evita que MongoDB genere _id para cada tratamiento
});

const registroTratamientoSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Paciente",
    required: true,
  },
  historialClinicoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HistorialClinico",
    required: true,
  },
  // MODIFICADO: Ahora puede ser un solo tratamiento O múltiples
  nombreTratamiento: {
    type: String,
    required: function () {
      return !this.tratamientos || this.tratamientos.length === 0;
    },
  },
  diasTratamiento: {
    type: [diaTratamientoSchema],
    required: function () {
      return !this.tratamientos || this.tratamientos.length === 0;
    },
  },
  // NUEVO: Array de múltiples tratamientos
  tratamientos: {
    type: [tratamientoIndividualSchema],
    validate: {
      validator: function (tratamientos) {
        // Si hay tratamientos múltiples, no debe haber nombreTratamiento individual
        if (tratamientos && tratamientos.length > 0) {
          return !this.nombreTratamiento;
        }
        return true;
      },
      message:
        "No se puede tener tratamientos múltiples y tratamiento individual al mismo tiempo",
    },
  },
  notasAdicionales: {
    type: String,
    default: "",
  },
  // NUEVO: Tipo de registro para distinguir
  tipoRegistro: {
    type: String,
    enum: ["individual", "multiple"],
    default: "individual",
  },
  creadoEn: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para determinar el tipo de registro antes de guardar
registroTratamientoSchema.pre("save", function (next) {
  if (this.tratamientos && this.tratamientos.length > 0) {
    this.tipoRegistro = "multiple";
    // Limpiar campos individuales si existen
    this.nombreTratamiento = undefined;
    this.diasTratamiento = undefined;
  } else {
    this.tipoRegistro = "individual";
  }
  next();
});

export default mongoose.model("RegistroTratamiento", registroTratamientoSchema);
