import EstudioLaboratorio from "../models/EstudioLaboratorio.js";
import SolicitudAnalisis from "../models/SolicitudAnalisis.js";

// Subir estudio (archivo) a una solicitud
export const subirEstudio = async (req, res) => {
  try {
    const { solicitudId } = req.body;
    // Suponiendo que el archivo se guarda y su URL está en req.file.path o similar
    const archivoUrl = req.file?.path || req.body.archivoUrl;
    const nombreArchivo = req.file?.originalname || req.body.nombreArchivo;

    if (!solicitudId || !archivoUrl || !nombreArchivo) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // (Opcional) Validar que la solicitud exista
    const solicitud = await SolicitudAnalisis.findById(solicitudId);
    if (!solicitud)
      return res.status(404).json({ message: "Solicitud no encontrada" });

    const estudio = new EstudioLaboratorio({
      solicitudId,
      archivoUrl,
      nombreArchivo,
    });

    await estudio.save();
    res.status(201).json(estudio);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al subir el estudio", error: err.message });
  }
};

// Obtener estudios de una solicitud
export const listarEstudiosPorSolicitud = async (req, res) => {
  try {
    const { solicitudId } = req.params;
    const estudios = await EstudioLaboratorio.find({ solicitudId }).sort({
      fechaSubida: -1,
    });
    res.json(estudios);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al buscar estudios", error: err.message });
  }
};

// (Opcional) Obtener todos los estudios de un paciente
export const listarEstudiosPorPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    // Buscar solicitudes del paciente
    const solicitudes = await SolicitudAnalisis.find({ pacienteId });
    const solicitudIds = solicitudes.map((s) => s._id);
    // Buscar estudios asociados a esas solicitudes
    const estudios = await EstudioLaboratorio.find({
      solicitudId: { $in: solicitudIds },
    });
    res.json(estudios);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al buscar estudios", error: err.message });
  }
};
