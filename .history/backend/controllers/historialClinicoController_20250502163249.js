import HistorialClinico from "../models/HistorialClinico.js";
import Paciente from "../models/Paciente.js";

// Crear historial clínico vinculado a un paciente
export const crearHistorialClinico = async (req, res) => {
  try {
    const { pacienteId } = req.body;

    // Verifica si el paciente existe
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente) {
      return res.status(404).json({ mensaje: "Paciente no encontrado" });
    }

    // Crea el historial clínico
    const nuevoHistorial = new HistorialClinico(req.body);
    const guardado = await nuevoHistorial.save();
    res.status(201).json(guardado);
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al crear historial clínico", error });
  }
};
