import mongoose from "mongoose";

const estudioLaboratorioSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Paciente",
    required: true,
  },
  solicitudAnalisis: {
    type: [String], // Ahora es un array de strings
    required: true,
  },
  descripcion: {
    type: String,
    default: "",
  },
  archivoUrl: {
    type: String,
    required: true,
  },
  nombreArchivo: {
    type: String,
    required: true,
  },
  fechaSubida: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("EstudioLaboratorio", estudioLaboratorioSchema);
