import HistorialClinico from "../models/HistorialClinico.js"; // Modelo de historial clínico
import Paciente from "../models/Paciente.js"; // Modelo de paciente

// Crear historial clínico vinculado a un paciente
export const crearHistorialClinico = async (req, res) => {
  try {
    const {
      pacienteId,
      tipoCueroCabelludo,
      frecuenciaLavadoCapilar,
      tricoscopiaDigital,
    } = req.body;

    // Verifica si el paciente existe
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente) {
      return res.status(404).json({ mensaje: "Paciente no encontrado" });
    }

    // Validar campos requeridos
    if (
      !tipoCueroCabelludo ||
      !frecuenciaLavadoCapilar ||
      !tricoscopiaDigital
    ) {
      return res
        .status(400)
        .json({ mensaje: "Todos los campos son obligatorios" });
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

// Obtener historiales clínicos por paciente
export const obtenerHistorialPorPaciente = async (req, res) => {
  try {
    const historial = await HistorialClinico.find({
      pacienteId: req.params.pacienteId,
    });
    res.json(historial);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener historial clínico", error });
  }
};

// Actualizar un historial clínico
export const actualizarHistorialClinico = async (req, res) => {
  try {
    const { tipoCueroCabelludo, frecuenciaLavadoCapilar, tricoscopiaDigital } =
      req.body;

    // Validar campos requeridos
    if (
      !tipoCueroCabelludo ||
      !frecuenciaLavadoCapilar ||
      !tricoscopiaDigital
    ) {
      return res
        .status(400)
        .json({ mensaje: "Todos los campos son obligatorios" });
    }

    const actualizado = await HistorialClinico.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!actualizado) {
      return res
        .status(404)
        .json({ mensaje: "Historial clínico no encontrado" });
    }
    res.json(actualizado);
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al actualizar historial clínico", error });
  }
};

// Eliminar un historial clínico
export const eliminarHistorialClinico = async (req, res) => {
  try {
    const eliminado = await HistorialClinico.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res
        .status(404)
        .json({ mensaje: "Historial clínico no encontrado" });
    }
    res.json({ mensaje: "Historial clínico eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al eliminar historial clínico", error });
  }
};
