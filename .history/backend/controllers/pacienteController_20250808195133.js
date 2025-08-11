import Paciente from "../models/Paciente.js";
import HistorialClinico from "../models/HistorialClinico.js"; // ← AGREGAR ESTA IMPORTACIÓN
import mongoose from "mongoose"; // ← AGREGAR ESTA IMPORTACIÓN
// Crear un nuevo paciente
export const crearPaciente = async (req, res) => {
  try {
    const nuevoPaciente = new Paciente(req.body);
    const guardado = await nuevoPaciente.save();
    res.status(201).json(guardado);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear paciente", error });
  }
};

// Obtener todos los pacientes
export const obtenerPacientes = async (req, res) => {
  try {
    const pacientes = await Paciente.find().sort({ creadoEn: -1 });
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener pacientes", error });
  }
};

// Obtener un solo paciente por ID
export const obtenerPacientePorId = async (req, res) => {
  try {
    const paciente = await Paciente.findById(req.params.id);
    if (!paciente)
      return res.status(404).json({ mensaje: "Paciente no encontrado" });
    res.json(paciente);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener paciente", error });
  }
};

// Actualizar un paciente
export const actualizarPaciente = async (req, res) => {
  try {
    const actualizado = await Paciente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!actualizado)
      return res.status(404).json({ mensaje: "Paciente no encontrado" });
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al actualizar paciente", error });
  }
};

// Eliminar un paciente
export const eliminarPaciente = async (req, res) => {
  try {
    const eliminado = await Paciente.findByIdAndDelete(req.params.id);
    if (!eliminado)
      return res.status(404).json({ mensaje: "Paciente no encontrado" });
    res.json({ mensaje: "Paciente eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar paciente", error });
  }
};

// ... tus funciones existentes quedan igual ...

// NUEVA FUNCIÓN - Agregar al final del archivo
export const crearPacienteConHistorial = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Separar datos del paciente y del historial
    const { historial, ...datosPaciente } = req.body;

    // 1. Crear paciente
    const nuevoPaciente = new Paciente(datosPaciente);
    const pacienteGuardado = await nuevoPaciente.save({ session });

    // 2. Crear historial si viene incluido
    if (historial && Object.keys(historial).length > 0) {
      const nuevoHistorial = new HistorialClinico({
        ...historial,
        pacienteId: pacienteGuardado._id,
      });
      await nuevoHistorial.save({ session });
    }

    // Confirmar transacción
    await session.commitTransaction();
    res.status(201).json(pacienteGuardado);
  } catch (error) {
    // Revertir en caso de error
    await session.abortTransaction();
    res.status(400).json({
      mensaje: "Error al crear paciente con historial",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
