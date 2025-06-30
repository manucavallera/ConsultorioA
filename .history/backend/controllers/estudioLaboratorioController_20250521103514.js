import EstudioLaboratorio from "../models/EstudioLaboratorio.js";
import SolicitudAnalisis from "../models/SolicitudAnalisis.js";
import cloudinary from "../cloudinary.js";
import fs from "fs";

export const subirEstudio = async (req, res) => {
  try {
    const { solicitudId } = req.body;
    const archivoLocal = req.file?.path;
    const nombreArchivo = req.file?.originalname;

    if (!solicitudId || !archivoLocal || !nombreArchivo) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Validar que la solicitud exista
    const solicitud = await SolicitudAnalisis.findById(solicitudId);
    if (!solicitud)
      return res.status(404).json({ message: "Solicitud no encontrada" });

    // Subir a Cloudinary
    const resultado = await cloudinary.uploader.upload(archivoLocal, {
      folder: "estudios_laboratorio",
      resource_type: "auto",
    });

    // Eliminar archivo local (opcional pero recomendado)
    fs.unlinkSync(archivoLocal);

    // Guardar en MongoDB
    const estudio = new EstudioLaboratorio({
      solicitudId,
      archivoUrl: resultado.secure_url,
      nombreArchivo: nombreArchivo,
    });

    await estudio.save();
    res.status(201).json(estudio);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al subir el estudio", error: err.message });
  }
};

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

export const listarEstudiosPorPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const solicitudes = await SolicitudAnalisis.find({ pacienteId });
    const solicitudIds = solicitudes.map((s) => s._id);
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
