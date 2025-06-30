// controllers/tratamientoController.js
import mongoose from "mongoose";
import RegistroTratamiento from "../models/RegistroTratamiento.js";
import Paciente from "../models/Paciente.js";

const esIdValido = (id) => mongoose.Types.ObjectId.isValid(id);

// Crear un nuevo registro de tratamiento
export const crearRegistroTratamiento = async (req, res) => {
  try {
    const {
      pacienteId,
      nombreTratamiento,
      diasAdministracion,
      notasAdicionales,
    } = req.body;

    if (!esIdValido(pacienteId))
      return res.status(400).json({ mensaje: "ID paciente inválido" });

    const paciente = await Paciente.findById(pacienteId);
    if (!paciente)
      return res.status(404).json({ mensaje: "Paciente no encontrado" });

    const tratamientosValidos = [
      "Minoxidil",
      "Pantenol",
      "Dutasteride",
      "Extracto placenta",
      "Aminoacidos",
      "Minerales",
      "Finasteride",
      "Plasma",
    ];

    if (!tratamientosValidos.includes(nombreTratamiento))
      return res
        .status(400)
        .json({ mensaje: "Nombre de tratamiento inválido" });

    if (
      !Array.isArray(diasAdministracion) ||
      !diasAdministracion.every((d) => !isNaN(new Date(d).getTime()))
    )
      return res.status(400).json({
        mensaje:
          "Días de administración deben ser un array de fechas válidas en formato ISO",
      });

    const registro = new RegistroTratamiento({
      pacienteId,
      nombreTratamiento,
      diasAdministracion: diasAdministracion.map((d) => new Date(d)),
      notasAdicionales,
    });

    const guardado = await registro.save();

    res.status(201).json(guardado);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error creando registro de tratamiento", error });
  }
};

// Obtener registros de tratamiento por paciente
export const obtenerRegistrosPorPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;

    if (!esIdValido(pacienteId))
      return res.status(400).json({ mensaje: "ID paciente inválido" });

    const paciente = await Paciente.findById(pacienteId);
    if (!paciente)
      return res.status(404).json({ mensaje: "Paciente no encontrado" });

    const registros = await RegistroTratamiento.find({ pacienteId }).populate(
      "pacienteId",
      "nombre apellido dni telefono email genero"
    );

    res.json(registros);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener registros de tratamiento",
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

    if (!esIdValido(id))
      return res.status(400).json({ mensaje: "ID de registro inválido" });

    const tratamientosValidos = [
      "Minoxidil",
      "Pantenol",
      "Dutasteride",
      "Extracto placenta",
      "Aminoacidos",
      "Minerales",
      "Finasteride",
      "Plasma",
    ];

    if (nombreTratamiento && !tratamientosValidos.includes(nombreTratamiento))
      return res
        .status(400)
        .json({ mensaje: "Nombre de tratamiento inválido" });

    if (
      diasAdministracion &&
      (!Array.isArray(diasAdministracion) ||
        !diasAdministracion.every((d) => !isNaN(new Date(d).getTime())))
    )
      return res.status(400).json({
        mensaje:
          "Días de administración deben ser un array de fechas válidas en formato ISO",
      });

    const updateData = {};
    if (nombreTratamiento) updateData.nombreTratamiento = nombreTratamiento;
    if (diasAdministracion)
      updateData.diasAdministracion = diasAdministracion.map(
        (d) => new Date(d)
      );
    if (notasAdicionales !== undefined)
      updateData.notasAdicionales = notasAdicionales;

    const actualizado = await RegistroTratamiento.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    ).populate("pacienteId", "nombre apellido dni telefono email genero");

    if (!actualizado)
      return res
        .status(404)
        .json({ mensaje: "Registro de tratamiento no encontrado" });

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar el registro de tratamiento",
      error,
    });
  }
};

// Eliminar un registro de tratamiento
export const eliminarRegistroTratamiento = async (req, res) => {
  try {
    const { id } = req.params;

    if (!esIdValido(id))
      return res.status(400).json({ mensaje: "ID de registro inválido" });

    const eliminado = await RegistroTratamiento.findByIdAndDelete(id);

    if (!eliminado)
      return res
        .status(404)
        .json({ mensaje: "Registro de tratamiento no encontrado" });

    res.json({ mensaje: "Registro de tratamiento eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al eliminar el registro de tratamiento", error });
  }
};
