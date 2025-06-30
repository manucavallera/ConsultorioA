import mongoose from "mongoose";

const estudioLaboratorioSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Paciente",
    required: true,
  },
  tipo: {
    type: String, // Ejemplo: "Laboratorio", "Imagen", "Otro"
    required: true,
  },
  descripcion: {
    type: String,
    default: "",
  },
  archivoUrl: {
    type: String, // URL o path del archivo en el server o la nube
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
