import EstudioLaboratorio from "../models/EstudioLaboratorio.js";
import SolicitudAnalisis from "../models/SolicitudAnalisis.js";
import Paciente from "../models/Paciente.js";
import cloudinary from "../config/cloudinary.js";

// ✅ CONTROLADOR PARA CloudinaryStorage - NO hace doble subida
export const subirEstudio = async (req, res) => {
  try {
    console.log("BODY recibido:", req.body);
    console.log("FILE recibido:", req.file);

    const { solicitudId } = req.body;
    const archivo = req.file; // ✅ El archivo YA está en Cloudinary

    if (!solicitudId || !archivo) {
      console.error("Faltan datos:", { solicitudId, archivo: !!archivo });
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Validar que la solicitud exista
    const solicitud = await SolicitudAnalisis.findById(solicitudId).populate(
      "pacienteId"
    );
    if (!solicitud) {
      console.error("Solicitud no encontrada:", solicitudId);
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    // ✅ El archivo YA está en Cloudinary, solo guardar en MongoDB
    const estudio = new EstudioLaboratorio({
      solicitudId,
      pacienteId: solicitud.pacienteId._id,
      archivoUrl: archivo.path, // ✅ URL de Cloudinary
      nombreArchivo: archivo.originalname,
      tipoArchivo: "estudio",
      cloudinaryId: archivo.filename, // ✅ Public ID de Cloudinary
    });

    await estudio.save();
    console.log("Estudio guardado:", estudio);

    res.status(201).json({
      message: "Estudio subido exitosamente",
      estudio: estudio,
    });
  } catch (err) {
    console.error("Error general en subirEstudio:", err);
    res.status(500).json({
      message: "Error al subir el estudio",
      error: err.message,
    });
  }
};

// ✅ CONTROLADOR PARA FOTOS - También adaptado
export const subirFoto = async (req, res) => {
  try {
    console.log("BODY recibido:", req.body);
    console.log("FILE recibido:", req.file);

    const { pacienteId, tipoArchivo, descripcion } = req.body;
    const archivo = req.file; // ✅ YA está en Cloudinary

    if (!pacienteId || !tipoArchivo || !archivo) {
      console.error("Faltan datos:", {
        pacienteId,
        tipoArchivo,
        archivo: !!archivo,
      });
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Validar tipo de archivo
    if (!["foto_antes", "foto_despues"].includes(tipoArchivo)) {
      return res.status(400).json({
        message: "Tipo de archivo inválido. Use: foto_antes o foto_despues",
      });
    }

    // Validar que el paciente exista
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente) {
      console.error("Paciente no encontrado:", pacienteId);
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    // ✅ Guardar en MongoDB - el archivo YA está en Cloudinary
    const foto = new EstudioLaboratorio({
      pacienteId,
      archivoUrl: archivo.path, // ✅ URL de Cloudinary
      nombreArchivo: archivo.originalname,
      tipoArchivo,
      descripcion: descripcion || "",
      cloudinaryId: archivo.filename, // ✅ Public ID de Cloudinary
    });

    await foto.save();
    console.log("Foto guardada:", foto);

    res.status(201).json({
      message: "Foto subida exitosamente",
      foto: foto,
    });
  } catch (err) {
    console.error("Error general en subirFoto:", err);
    res.status(500).json({
      message: "Error al subir la foto",
      error: err.message,
    });
  }
};

// ✅ ELIMINAR archivo - Funciona con cloudinaryId
export const eliminarArchivo = async (req, res) => {
  try {
    const { id } = req.params;

    const archivo = await EstudioLaboratorio.findById(id);
    if (!archivo) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    // ✅ Eliminar de Cloudinary usando cloudinaryId
    if (archivo.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(archivo.cloudinaryId);
        console.log("Archivo eliminado de Cloudinary:", archivo.cloudinaryId);
      } catch (cloudinaryError) {
        console.error("Error eliminando de Cloudinary:", cloudinaryError);
        // Continuar aunque falle Cloudinary
      }
    }

    // Eliminar registro de la base de datos
    await EstudioLaboratorio.findByIdAndDelete(id);

    res.json({ message: "Archivo eliminado exitosamente" });
  } catch (error) {
    console.error("Error eliminando archivo:", error);
    res.status(500).json({
      message: "Error eliminando archivo",
      error: error.message,
    });
  }
};

// ✅ Resto de funciones sin cambios
export const listarEstudiosPorSolicitud = async (req, res) => {
  try {
    const { solicitudId } = req.params;
    const estudios = await EstudioLaboratorio.find({
      solicitudId,
      tipoArchivo: "estudio",
    }).sort({ fechaSubida: -1 });

    res.json(estudios);
  } catch (err) {
    console.error("Error al buscar estudios por solicitud:", err);
    res.status(500).json({
      message: "Error al buscar estudios",
      error: err.message,
    });
  }
};

export const listarEstudiosPorPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const solicitudes = await SolicitudAnalisis.find({ pacienteId });
    const solicitudIds = solicitudes.map((s) => s._id);
    const estudios = await EstudioLaboratorio.find({
      solicitudId: { $in: solicitudIds },
      tipoArchivo: "estudio",
    })
      .populate("solicitudId")
      .sort({ fechaSubida: -1 });

    res.json(estudios);
  } catch (err) {
    console.error("Error al buscar estudios por paciente:", err);
    res.status(500).json({
      message: "Error al buscar estudios",
      error: err.message,
    });
  }
};
