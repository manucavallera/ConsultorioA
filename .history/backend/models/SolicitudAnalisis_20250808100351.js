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
        type: mongoose.Schema.Types.Mixed, // ✅ CAMBIO: Acepta números Y texto
        default: null,
      },
      unidad: {
        type: String,
        default: "",
      },
      _id: false,
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
