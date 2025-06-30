import mongoose from "mongoose";

const registroTratamientoSchema = new mongoose.Schema(
  {
    pacienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paciente",
      required: true,
    },
    tratamientoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tratamiento",
      required: true,
    },
    nombreTratamiento: {
      type: String,
      enum: [
        "Minoxidil",
        "Pantenol",
        "Dutasteride",
        "Extracto placenta",
        "Aminoacidos",
        "Minerales",
        "Finasteride",
        "Plasma",
      ],
      required: true,
    },
    diasAdministracion: [
      {
        type: Date,
      },
    ],
  },
  { timestamps: true }
);

const RegistroTratamiento = mongoose.model(
  "RegistroTratamiento",
  registroTratamientoSchema
);

export default RegistroTratamiento;
