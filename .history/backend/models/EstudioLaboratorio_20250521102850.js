import mongoose from "mongoose";

const estudioLaboratorioSchema = new mongoose.Schema({
  solicitudId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SolicitudAnalisis",
    required: true,
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
  // Opcional: notas, quién subió, etc.
});

export default mongoose.model("EstudioLaboratorio", estudioLaboratorioSchema);
