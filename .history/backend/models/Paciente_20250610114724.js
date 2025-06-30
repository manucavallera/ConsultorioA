import mongoose from "mongoose";

const pacienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  dni: { type: String, required: true, unique: true },
  telefono: { type: String },
  email: { type: String },
  direccion: { type: String },
  fechaNacimiento: { type: Date },
  genero: { type: String }, // Campo flexible, acepta cualquier valor
  antecedentesEnfermedad: { type: String }, // Nuevo campo
  alergias: { type: String }, // Nuevo campo
  horasSueno: { type: Number }, // Nuevo campo (puedes poner type: String si prefieres)
  obraSocial: { type: String }, // Nuevo campo
  tipoShampoo: { type: String }, // Nuevo campo
  creadoEn: { type: Date, default: Date.now },
});

export default mongoose.model("Paciente", pacienteSchema);
