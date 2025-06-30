import mongoose from "mongoose";

const historialClinicoSchema = mongoose.Schema(
  {
    pacienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paciente",
      required: true,
    },
    diagnostico: { type: String, required: true },
    tratamientos: { type: String },
    observaciones: { type: String },
  },
  { timestamps: true }
);

const HistorialClinico = mongoose.model(
  "HistorialClinico",
  historialClinicoSchema
);

export default HistorialClinico;
