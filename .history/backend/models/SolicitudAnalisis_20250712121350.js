import mongoose from "mongoose";

const solicitudAnalisisSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Paciente",
    required: true,
  },
  analisis: [
    {
      nombre: {
        type: String,
        required: true,
      },
      valor: {
        type: Number,
        default: null, // null significa que aún no tiene resultado
      },
      unidad: {
        type: String,
        default: "", // Para especificar mg/dl, g/dl, etc.
      },
      _id: false, // Evita que MongoDB genere _id para cada análisis
    },
  ],
  descripcion: {
    type: String,
    default: "",
  },
  fechaSolicitud: {
    type: Date,
    default: Date.now,
  },
  estado: {
    type: String,
    enum: ["Pendiente", "En proceso", "Completado"],
    default: "Pendiente",
  },
});

export default mongoose.model("SolicitudAnalisis", solicitudAnalisisSchema);
