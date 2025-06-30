import RegistroTratamiento from "../models/registroTratamientoModel.js";
import Paciente from "../models/Paciente.js";
import HistorialClinico from "../models/HistorialClinico.js";

// Crear un nuevo registro de tratamiento
export const crearRegistroTratamiento = async (req, res) => {
  try {
    const {
      pacienteId,
      historialClinicoId,
      nombreTratamiento,
      diasAdministracion,
      notasAdicionales,
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

    // Crear el registro de tratamiento
    const registro = new RegistroTratamiento({
      pacienteId,
      historialClinicoId,
      nombreTratamiento,
      diasAdministracion,
      notasAdicionales,
    });
    const guardado = await registro.save();

    res.status(201).json(guardado);
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al crear el registro de tratamiento", error });
  }
};

// Obtener registros de tratamiento por paciente
export const obtenerRegistrosPorPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;

    // Verificar si el paciente existe
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente) {
      return res.status(404).json({ mensaje: "Paciente no encontrado" });
    }

    // Obtener registros de tratamiento
    const registros = await RegistroTratamiento.find({ pacienteId })
      .populate(
        "historialClinicoId",
        "tipoCueroCabelludo frecuenciaLavadoCapilar tricoscopiaDigital tipoAlopecia observaciones antecedentes"
      ) // Información del historial
      .populate("pacienteId", "nombre apellido dni telefono email genero"); // Información del paciente
    res.json(registros);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener los registros de tratamiento",
      error,
    });
  }
};

// Obtener registros de tratamiento por historial clínico
export const obtenerRegistrosPorHistorialClinico = async (req, res) => {
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

    // Obtener registros de tratamiento
    const registros = await RegistroTratamiento.find({ historialClinicoId })
      .populate("pacienteId", "nombre apellido dni telefono email genero") // Información del paciente
      .populate(
        "historialClinicoId",
        "tipoCueroCabelludo frecuenciaLavadoCapilar tricoscopiaDigital tipoAlopecia observaciones antecedentes"
      ); // Información del historial
    res.json(registros);
  } catch (error) {
    res.status(500).json({
      mensaje:
        "Error al obtener los registros de tratamiento por historial clínico",
      error,
    });
  }
};

// Actualizar un registro de tratamiento
export const actualizarRegistroTratamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreTratamiento, diasAdministracion, notasAdicionales } =
      req.body;

    // Actualizar el registro de tratamiento
    const actualizado = await RegistroTratamiento.findByIdAndUpdate(
      id,
      { nombreTratamiento, diasAdministracion, notasAdicionales },
      { new: true }
    )
      .populate("pacienteId", "nombre apellido dni telefono email genero") // Información del paciente
      .populate(
        "historialClinicoId",
        "tipoCueroCabelludo frecuenciaLavadoCapilar tricoscopiaDigital tipoAlopecia observaciones antecedentes"
      ); // Información del historial

    if (!actualizado) {
      return res
        .status(404)
        .json({ mensaje: "Registro de tratamiento no encontrado" });
    }

    res.json(actualizado);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al actualizar el registro de tratamiento",
      error,
    });
  }
};

// Eliminar un registro de tratamiento
export const eliminarRegistroTratamiento = async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar el registro de tratamiento
    const eliminado = await RegistroTratamiento.findByIdAndDelete(id);
    if (!eliminado) {
      return res
        .status(404)
        .json({ mensaje: "Registro de tratamiento no encontrado" });
    }

    res.json({ mensaje: "Registro de tratamiento eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al eliminar el registro de tratamiento", error });
  }
};
