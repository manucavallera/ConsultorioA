import mongoose from "mongoose";

const citaSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Paciente",
    required: true,
  },
  fecha: { type: Date, required: true },
  hora: { type: String, required: true }, // "09:30", "14:00", etc.
  duracion: { type: Number, default: 60 }, // en minutos
  tipoConsulta: {
    type: String,
    required: true,
    enum: [
      "Consulta inicial",
      "Control",
      "Tratamiento",
      "Seguimiento",
      "Urgencia",
    ],
  },
  // ✅ ESTADOS SIMPLIFICADOS
  estado: {
    type: String,
    required: true,
    default: "Programada",
    enum: [
      "Programada", // Cita agendada
      "En curso", // Paciente en consulta
      "Completada", // Cita finalizada
    ],
  },
  motivo: { type: String }, // Motivo de la consulta
  observaciones: { type: String }, // Notas del médico
  recordatorio: { type: Boolean, default: true }, // Si enviar recordatorio
  notas: { type: String }, // Notas adicionales
  creadoEn: { type: Date, default: Date.now },
  actualizadoEn: { type: Date, default: Date.now },
});

// Middleware para actualizar la fecha de modificación
citaSchema.pre("save", function (next) {
  this.actualizadoEn = Date.now();
  next();
});

// Índices para mejorar consultas
citaSchema.index({ pacienteId: 1, fecha: 1 });
citaSchema.index({ fecha: 1, hora: 1 });
citaSchema.index({ estado: 1 });

export default mongoose.model("Cita", citaSchema);
