import mongoose from "mongoose";

const estudioLaboratorioSchema = new mongoose.Schema({
  solicitudId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SolicitudAnalisis",
    required: false, // ✅ Cambiar a opcional para fotos
  },
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Paciente",
    required: true, // ✅ NUEVO - necesario para fotos
  },
  archivoUrl: {
    type: String,
    required: true,
  },
  nombreArchivo: {
    type: String,
    required: true,
  },
  tipoArchivo: {
    type: String,
    required: true,
    enum: ["estudio", "foto_antes", "foto_despues"], // ✅ NUEVO
  },
  cloudinaryId: {
    type: String,
    required: true, // ✅ NUEVO - para poder eliminar de Cloudinary
  },
  descripcion: {
    type: String,
    default: "", // ✅ NUEVO - para fotos
  },
  visible: {
    type: Boolean,
    default: true, // ✅ NUEVO - para soft delete
  },
  fechaSubida: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Índices para mejorar performance
estudioLaboratorioSchema.index({ solicitudId: 1, tipoArchivo: 1 });
estudioLaboratorioSchema.index({ pacienteId: 1, tipoArchivo: 1 });
estudioLaboratorioSchema.index({ visible: 1 });

export default mongoose.model("EstudioLaboratorio", estudioLaboratorioSchema);
