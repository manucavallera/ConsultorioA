import mongoose from "mongoose";

const historialClinicoSchema = mongoose.Schema(
  {
    pacienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paciente",
      required: true,
    },
    tipoCueroCabelludo: {
      type: String,
      enum: ["Normal", "Graso", "Deshidratado"],
      required: true,
    },
    frecuenciaLavadoCapilar: {
      type: String,
      enum: ["Diaria", "Día 1/2", "Semanal"],
      required: true,
    },
    tricoscopiaDigital: {
      type: String,
      enum: [
        "Ptiarisis simple",
        "Ptiarisis esteatoide",
        "Seborrea",
        "Sensible",
        "Deshidratación",
      ],
      required: true,
    },
    tipoAlopecia: {
      type: String,
      enum: [
        "Alopecia carencial",
        "Efluvio telógeno",
        "Alopecia androgénica",
        "Otros",
      ],
      required: true,
    },
    observaciones: { type: String },
  },
  { timestamps: true }
);

const HistorialClinico = mongoose.model(
  "HistorialClinico",
  historialClinicoSchema
);

export default HistorialClinico;
