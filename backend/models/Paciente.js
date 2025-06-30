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
  edad: { type: String }, // Nuevo campo agregado
  antecedentesEnfermedad: { type: String }, // Campo existente
  antecedentesFamiliares: { type: String }, // Nuevo campo agregado
  alergias: { type: String }, // Campo existente
  horasSueno: { type: Number }, // Campo existente
  obraSocial: { type: String }, // Campo existente
  tipoShampoo: { type: String }, // Campo existente
  creadoEn: { type: Date, default: Date.now },
});

export default mongoose.model("Paciente", pacienteSchema);
