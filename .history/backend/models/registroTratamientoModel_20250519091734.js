import mongoose from "mongoose";

const diaTratamientoSchema = new mongoose.Schema({
  fecha: { type: Date, required: true }, // Fecha completa: día, mes, año
  administrado: { type: Boolean, default: false }, // Si ya se administró ese día
  nota: { type: String, default: "" }, // Nota específica para ese día (opcional)
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
  nombreTratamiento: {
    type: String,
    required: true,
  },
  diasTratamiento: {
    type: [diaTratamientoSchema], // Array de objetos con fecha completa y estado
    required: true,
  },
  notasAdicionales: {
    type: String,
    default: "",
  },
  creadoEn: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("RegistroTratamiento", registroTratamientoSchema);
