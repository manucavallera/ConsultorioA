import mongoose from "mongoose";

const estudioLaboratorioSchema = new mongoose.Schema(
  {
    // ============================================
    // CAMPOS ORIGINALES (los que ya tienes)
    // ============================================
    solicitudId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SolicitudAnalisis",
      required: false, // ✅ Cambio: ahora opcional para fotos
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
    // NUEVOS CAMPOS PARA FOTOS ANTES/DESPUÉS
    // ============================================
    pacienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paciente",
      required: false, // ✅ Opcional para mantener compatibilidad con estudios existentes
    },
    tipoArchivo: {
      type: String,
      enum: ["estudio", "foto_antes", "foto_despues", "foto_durante"],
      default: "estudio", // ✅ Por defecto es 'estudio' para registros existentes
    },
    // Campos específicos para fotos
    zona: {
      type: String, // ej: "rostro", "cuerpo", "brazos", "abdomen"
      required: false,
    },
    angulo: {
      type: String, // ej: "frontal", "perfil izquierdo", "perfil derecho", "lateral"
      required: false,
    },
    tratamientoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tratamiento",
      required: false,
    },
    descripcion: {
      type: String,
      maxlength: 500,
    },
    // Datos de Cloudinary
    cloudinaryId: {
      type: String,
      required: false, // ✅ Opcional para mantener compatibilidad
    },
    subidoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: false,
    },
    visible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // ✅ Agrega createdAt y updatedAt automáticamente
  }
);

// Índices optimizados
estudioLaboratorioSchema.index({ solicitudId: 1, fechaSubida: -1 }); // Para estudios existentes
estudioLaboratorioSchema.index({
  pacienteId: 1,
  tipoArchivo: 1,
  fechaSubida: -1,
}); // Para fotos
estudioLaboratorioSchema.index({ tratamientoId: 1, tipoArchivo: 1 }); // Para fotos por tratamiento

export default mongoose.model("EstudioLaboratorio", estudioLaboratorioSchema);
