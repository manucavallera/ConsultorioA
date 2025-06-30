import EstudioLaboratorio from "../models/EstudioLaboratorio.js";
import Paciente from "../models/Paciente.js";

// Crear un nuevo estudio/laboratorio con archivo en Cloudinary
export const crearEstudioLaboratorio = async (req, res) => {
  try {
    const { pacienteId, tipo, descripcion } = req.body;

    // Validar que el paciente exista
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente)
      return res.status(404).json({ mensaje: "Paciente no encontrado" });

    // Validar que haya archivo adjunto
    if (!req.file) {
      return res.status(400).json({ mensaje: "No se adjuntó ningún archivo" });
    }

    // Crear el nuevo estudio con datos de Cloudinary (Multer ya lo subió)
    const nuevoEstudio = new EstudioLaboratorio({
      pacienteId,
      tipo,
      descripcion,
      archivoUrl: req.file.path, // URL segura de Cloudinary
      nombreArchivo: req.file.originalname, // Nombre original
    });

    await nuevoEstudio.save();
    res.status(201).json(nuevoEstudio);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear el estudio", error });
  }
};

// Obtener estudios por paciente
export const obtenerEstudiosPorPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const estudios = await EstudioLaboratorio.find({ pacienteId }).sort({
      fechaSubida: -1,
    });
    res.json(estudios);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener estudios", error });
  }
};

// Obtener estudio individual por ID
export const obtenerEstudioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const estudio = await EstudioLaboratorio.findById(id);
    if (!estudio)
      return res.status(404).json({ mensaje: "Estudio no encontrado" });

    res.json(estudio);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el estudio", error });
  }
};

// Eliminar un estudio
export const eliminarEstudioLaboratorio = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await EstudioLaboratorio.findByIdAndDelete(id);
    if (!eliminado)
      return res.status(404).json({ mensaje: "Estudio no encontrado" });

    res.json({ mensaje: "Estudio eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el estudio", error });
  }
};
