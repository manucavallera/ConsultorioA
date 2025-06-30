import mongoose from "mongoose";

const solicitudAnalisisSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Paciente",
    required: true,
  },
  analisis: {
    type: [String], // Ej: ["Hemograma", "Glucosa"]
    required: true,
  },
  descripcion: {
    type: String,
    default: "",
  },
  fechaSolicitud: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("SolicitudAnalisis", solicitudAnalisisSchema);
