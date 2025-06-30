import EstudioLaboratorio from "../models/EstudioLaboratorio.js";
import SolicitudAnalisis from "../models/SolicitudAnalisis.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const subirEstudio = async (req, res) => {
  try {
    console.log("BODY recibido:", req.body);
    console.log("FILE recibido:", req.file);

    const { solicitudId } = req.body;
    const archivoLocal = req.file?.path;
    const nombreArchivo = req.file?.originalname;

    if (!solicitudId || !archivoLocal || !nombreArchivo) {
      console.error("Faltan datos:", {
        solicitudId,
        archivoLocal,
        nombreArchivo,
      });
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Validar que la solicitud exista
    let solicitud;
    try {
      solicitud = await SolicitudAnalisis.findById(solicitudId);
    } catch (err) {
      console.error("Error al buscar solicitud:", err);
      return res
        .status(500)
        .json({ message: "Error al buscar solicitud", error: err.message });
    }
    if (!solicitud) {
      console.error("Solicitud no encontrada:", solicitudId);
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    // Subir a Cloudinary
    let resultado;
    try {
      resultado = await cloudinary.uploader.upload(archivoLocal, {
        folder: "estudios_laboratorio",
        resource_type: "auto",
      });
      console.log("Subida a Cloudinary exitosa:", resultado);
    } catch (err) {
      console.error("Error al subir a Cloudinary:", err);
      return res
        .status(500)
        .json({ message: "Error al subir a Cloudinary", error: err.message });
    }

    // Eliminar archivo local (opcional pero recomendado)
    try {
      fs.unlinkSync(archivoLocal);
      console.log("Archivo local eliminado:", archivoLocal);
    } catch (err) {
      console.warn("No se pudo eliminar el archivo local:", archivoLocal, err);
    }

    // Guardar en MongoDB
    let estudio;
    try {
      estudio = new EstudioLaboratorio({
        solicitudId,
        archivoUrl: resultado.secure_url,
        nombreArchivo: nombreArchivo,
      });
      await estudio.save();
      console.log("Estudio guardado:", estudio);
    } catch (err) {
      console.error("Error al guardar en MongoDB:", err);
      return res
        .status(500)
        .json({ message: "Error al guardar estudio", error: err.message });
    }

    res.status(201).json(estudio);
  } catch (err) {
    console.error("Error general en subirEstudio:", err);
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
    console.error("Error al buscar estudios por solicitud:", err);
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
    console.error("Error al buscar estudios por paciente:", err);
    res
      .status(500)
      .json({ message: "Error al buscar estudios", error: err.message });
  }
};
