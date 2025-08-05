import mongoose from "mongoose";

const estudioLaboratorioSchema = new mongoose.Schema(
  {
    // ============================================
    // CAMPOS ORIGINALES (los que ya tienes)
    // ============================================
    solicitudId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SolicitudAnalisis",
      required: false, // ✅ Ahora opcional para fotos
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

    // ============================================
    // CAMPOS SIMPLES PARA FOTOS ANTES/DESPUÉS
    // ============================================
    pacienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paciente",
      required: false, // ✅ Opcional para compatibilidad
    },
    tipoArchivo: {
      type: String,
      enum: ["estudio", "foto_antes", "foto_despues"], // ✅ Solo 3 tipos
      default: "estudio",
    },
    descripcion: {
      type: String,
      maxlength: 300, // ✅ Más corto
    },
    // Datos de Cloudinary
    cloudinaryId: {
      type: String,
      required: false,
    },
    visible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices simples
estudioLaboratorioSchema.index({ solicitudId: 1, fechaSubida: -1 }); // Para estudios
estudioLaboratorioSchema.index({
  pacienteId: 1,
  tipoArchivo: 1,
  fechaSubida: -1,
}); // Para fotos

export default mongoose.model("EstudioLaboratorio", estudioLaboratorioSchema);
