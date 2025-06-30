import Tratamiento from "../models/tratamientoModel.js";
import Paciente from "../models/Paciente.js";
import HistorialClinico from "../models/HistorialClinico.js";

// Crear un nuevo tratamiento
export const crearTratamiento = async (req, res) => {
  try {
    const {
      pacienteId,
      historialClinicoId,
      nombreTratamiento,
      tipoTratamiento,
    } = req.body;

    // Verificar si el paciente existe
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente) {
      return res.status(404).json({ mensaje: "Paciente no encontrado" });
    }

    // Verificar si el historial clínico existe
    const historialClinico = await HistorialClinico.findById(
      historialClinicoId
    );
    if (!historialClinico) {
      return res
        .status(404)
        .json({ mensaje: "Historial clínico no encontrado" });
    }

    // Crear el tratamiento
    const tratamiento = new Tratamiento({
      pacienteId,
      historialClinicoId,
      nombreTratamiento,
      tipoTratamiento,
    });
    const guardado = await tratamiento.save();

    res.status(201).json(guardado);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear tratamiento", error });
  }
};

// Obtener tratamientos por paciente
export const obtenerTratamientosPorPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;

    // Verificar si el paciente existe
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente) {
      return res.status(404).json({ mensaje: "Paciente no encontrado" });
    }

    // Obtener los tratamientos del paciente
    const tratamientos = await Tratamiento.find({ pacienteId }).populate(
      "historialClinicoId"
    );
    res.json({ paciente, tratamientos });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener tratamientos", error });
  }
};

// Obtener tratamientos por historial clínico
export const obtenerTratamientosPorHistorialClinico = async (req, res) => {
  try {
    const { historialClinicoId } = req.params;

    // Verificar si el historial clínico existe
    const historialClinico = await HistorialClinico.findById(
      historialClinicoId
    );
    if (!historialClinico) {
      return res
        .status(404)
        .json({ mensaje: "Historial clínico no encontrado" });
    }

    // Obtener los tratamientos vinculados al historial clínico
    const tratamientos = await Tratamiento.find({ historialClinicoId });
    res.json({ historialClinico, tratamientos });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener tratamientos por historial clínico",
      error,
    });
  }
};

// Actualizar un tratamiento
export const actualizarTratamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      pacienteId,
      historialClinicoId,
      nombreTratamiento,
      tipoTratamiento,
      estado,
    } = req.body;

    // Verificar si el paciente existe
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente) {
      return res.status(404).json({ mensaje: "Paciente no encontrado" });
    }

    // Verificar si el historial clínico existe
    const historialClinico = await HistorialClinico.findById(
      historialClinicoId
    );
    if (!historialClinico) {
      return res
        .status(404)
        .json({ mensaje: "Historial clínico no encontrado" });
    }

    // Actualizar el tratamiento
    const actualizado = await Tratamiento.findByIdAndUpdate(
      id,
      { nombreTratamiento, tipoTratamiento, estado },
      { new: true }
    );

    if (!actualizado) {
      return res.status(404).json({ mensaje: "Tratamiento no encontrado" });
    }

    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al actualizar tratamiento", error });
  }
};

// Eliminar un tratamiento
export const eliminarTratamiento = async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar el tratamiento
    const eliminado = await Tratamiento.findByIdAndDelete(id);
    if (!eliminado) {
      return res.status(404).json({ mensaje: "Tratamiento no encontrado" });
    }

    res.json({ mensaje: "Tratamiento eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar tratamiento", error });
  }
};
