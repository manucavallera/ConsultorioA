import mongoose from "mongoose";

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
  diasAdministracion: {
    type: [String], // Array de strings para guardar los días seleccionados
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
