// controllers/tratamientoController.js
import mongoose from "mongoose";
import RegistroTratamiento from "../models/RegistroTratamiento.js";
import Paciente from "../models/Paciente.js";

const esIdValido = (id) => mongoose.Types.ObjectId.isValid(id);

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

// Obtener registros por paciente
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
