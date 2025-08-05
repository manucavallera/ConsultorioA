import mongoose from "mongoose";

const fotoAntesDepuesSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Paciente",
    required: true,
  },
  tipoFoto: {
    type: String,
    required: true,
    enum: ["antes", "despues"],
  },
  archivoUrl: {
    type: String,
    required: true,
  },
  nombreArchivo: {
    type: String,
    required: true,
  },
  cloudinaryId: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    default: "",
  },
  fechaSubida: {
    type: Date,
    default: Date.now,
  },
  visible: {
    type: Boolean,
    default: true,
  },
  // Campos opcionales para más detalles
  tratamientoRelacionado: {
    type: String,
    default: "",
  },
  notas: {
    type: String,
    default: "",
  },
});

// Índices para mejorar performance
fotoAntesDepuesSchema.index({ pacienteId: 1, tipoFoto: 1 });
fotoAntesDepuesSchema.index({ fechaSubida: -1 });
fotoAntesDepuesSchema.index({ visible: 1 });

// Método virtual para obtener URL optimizada
fotoAntesDepuesSchema.virtual("urlOptimizada").get(function () {
  if (this.archivoUrl && this.archivoUrl.includes("cloudinary")) {
    // Aplicar transformaciones automáticas de Cloudinary
    return this.archivoUrl.replace(
      "/upload/",
      "/upload/w_800,h_600,c_limit,q_auto,f_auto/"
    );
  }
  return this.archivoUrl;
});

// Método virtual para thumbnail
fotoAntesDepuesSchema.virtual("thumbnail").get(function () {
  if (this.archivoUrl && this.archivoUrl.includes("cloudinary")) {
    return this.archivoUrl.replace(
      "/upload/",
      "/upload/w_300,h_300,c_fill,q_auto,f_auto/"
    );
  }
  return this.archivoUrl;
});

// Incluir virtuals en JSON
fotoAntesDepuesSchema.set("toJSON", { virtuals: true });

export default mongoose.model("FotoAntesDepues", fotoAntesDepuesSchema);
