import EstudioLaboratorio from "../models/EstudioLaboratorio.js";
import SolicitudAnalisis from "../models/SolicitudAnalisis.js";
import Paciente from "../models/Paciente.js";
import cloudinary from "../config/cloudinary.js";

// ============================================
// FUNCIONES CORREGIDAS PARA CloudinaryStorage
// ============================================

export const subirEstudio = async (req, res) => {
  try {
    console.log("BODY recibido:", req.body);
    console.log("FILE recibido:", req.file);

    const { solicitudId } = req.body;
    const archivo = req.file; // ✅ YA está en Cloudinary gracias a CloudinaryStorage

    if (!solicitudId || !archivo) {
      console.error("Faltan datos:", {
        solicitudId,
        archivo: !!archivo,
      });
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Validar que la solicitud exista
    let solicitud;
    try {
      solicitud = await SolicitudAnalisis.findById(solicitudId).populate(
        "pacienteId"
      );
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

    // ✅ NO subir a Cloudinary - YA está subido por multer
    // El archivo ya tiene: archivo.path (URL) y archivo.filename (public_id)

    // Guardar en MongoDB
    let estudio;
    try {
      estudio = new EstudioLaboratorio({
        solicitudId,
        pacienteId: solicitud.pacienteId._id,
        archivoUrl: archivo.path, // ✅ URL directa de Cloudinary
        nombreArchivo: archivo.originalname,
        tipoArchivo: "estudio",
        cloudinaryId: archivo.filename, // ✅ Public ID de Cloudinary
      });
      await estudio.save();
      console.log("Estudio guardado:", estudio);
    } catch (err) {
      console.error("Error al guardar en MongoDB:", err);
      return res
        .status(500)
        .json({ message: "Error al guardar estudio", error: err.message });
    }

    res.status(201).json({
      message: "Estudio subido exitosamente",
      estudio: estudio,
    });
  } catch (err) {
    console.error("Error general en subirEstudio:", err);
    res
      .status(500)
      .json({ message: "Error al subir el estudio", error: err.message });
  }
};

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
    let paciente;
    try {
      paciente = await Paciente.findById(pacienteId);
    } catch (err) {
      console.error("Error al buscar paciente:", err);
      return res
        .status(500)
        .json({ message: "Error al buscar paciente", error: err.message });
    }

    if (!paciente) {
      console.error("Paciente no encontrado:", pacienteId);
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    // ✅ NO subir a Cloudinary - YA está subido

    // Guardar en MongoDB
    let foto;
    try {
      foto = new EstudioLaboratorio({
        pacienteId,
        archivoUrl: archivo.path, // ✅ URL de Cloudinary
        nombreArchivo: archivo.originalname,
        tipoArchivo,
        descripcion: descripcion || "",
        cloudinaryId: archivo.filename, // ✅ Public ID de Cloudinary
      });
      await foto.save();
      console.log("Foto guardada:", foto);
    } catch (err) {
      console.error("Error al guardar en MongoDB:", err);
      return res
        .status(500)
        .json({ message: "Error al guardar foto", error: err.message });
    }

    res.status(201).json({
      message: "Foto subida exitosamente",
      foto: foto,
    });
  } catch (err) {
    console.error("Error general en subirFoto:", err);
    res
      .status(500)
      .json({ message: "Error al subir la foto", error: err.message });
  }
};

// ============================================
// FUNCIONES DE CONSULTA (sin cambios)
// ============================================

export const listarEstudiosPorSolicitud = async (req, res) => {
  try {
    const { solicitudId } = req.params;
    const estudios = await EstudioLaboratorio.find({
      solicitudId,
      tipoArchivo: "estudio",
    }).sort({
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
      tipoArchivo: "estudio",
    })
      .populate("solicitudId")
      .sort({ fechaSubida: -1 });
    res.json(estudios);
  } catch (err) {
    console.error("Error al buscar estudios por paciente:", err);
    res
      .status(500)
      .json({ message: "Error al buscar estudios", error: err.message });
  }
};

export const obtenerFotosPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { tipo, limite = 50 } = req.query;

    let filtros = {
      pacienteId,
      visible: true,
      tipoArchivo: { $in: ["foto_antes", "foto_despues"] },
    };

    if (tipo) {
      const tipoMapeado =
        tipo === "antes"
          ? "foto_antes"
          : tipo === "despues"
          ? "foto_despues"
          : tipo;
      filtros.tipoArchivo = tipoMapeado;
    }

    const fotos = await EstudioLaboratorio.find(filtros)
      .sort({ fechaSubida: -1 })
      .limit(parseInt(limite));

    res.json(fotos);
  } catch (error) {
    console.error("Error obteniendo fotos del paciente:", error);
    res
      .status(500)
      .json({ message: "Error obteniendo fotos", error: error.message });
  }
};

export const obtenerComparacion = async (req, res) => {
  try {
    const { pacienteId } = req.params;

    const fotosAntes = await EstudioLaboratorio.find({
      pacienteId,
      visible: true,
      tipoArchivo: "foto_antes",
    }).sort({ fechaSubida: -1 });

    const fotosDespues = await EstudioLaboratorio.find({
      pacienteId,
      visible: true,
      tipoArchivo: "foto_despues",
    }).sort({ fechaSubida: -1 });

    res.json({
      antes: fotosAntes,
      despues: fotosDespues,
      total: fotosAntes.length + fotosDespues.length,
    });
  } catch (error) {
    console.error("Error obteniendo comparación:", error);
    res
      .status(500)
      .json({ message: "Error obteniendo comparación", error: error.message });
  }
};

export const obtenerEstadisticasFotos = async (req, res) => {
  try {
    const { pacienteId } = req.params;

    const fotosAntes = await EstudioLaboratorio.countDocuments({
      pacienteId,
      visible: true,
      tipoArchivo: "foto_antes",
    });

    const fotosDespues = await EstudioLaboratorio.countDocuments({
      pacienteId,
      visible: true,
      tipoArchivo: "foto_despues",
    });

    const total = fotosAntes + fotosDespues;

    const resultado = {
      pacienteId,
      total: total,
      resumen: {
        antes: fotosAntes,
        despues: fotosDespues,
      },
    };

    res.json(resultado);
  } catch (error) {
    console.error("Error obteniendo estadísticas de fotos:", error);
    res
      .status(500)
      .json({ message: "Error obteniendo estadísticas", error: error.message });
  }
};

// ============================================
// FUNCIONES GENERALES
// ============================================

export const eliminarArchivo = async (req, res) => {
  try {
    const { id } = req.params;

    const archivo = await EstudioLaboratorio.findById(id);
    if (!archivo) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    // Eliminar de Cloudinary si tiene cloudinaryId
    if (archivo.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(archivo.cloudinaryId);
        console.log("Archivo eliminado de Cloudinary:", archivo.cloudinaryId);
      } catch (cloudinaryError) {
        console.error("Error eliminando de Cloudinary:", cloudinaryError);
      }
    }

    // Eliminar registro de la base de datos
    await EstudioLaboratorio.findByIdAndDelete(id);

    res.json({ message: "Archivo eliminado exitosamente" });
  } catch (error) {
    console.error("Error eliminando archivo:", error);
    res
      .status(500)
      .json({ message: "Error eliminando archivo", error: error.message });
  }
};

export const actualizarArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, visible } = req.body;

    const archivo = await EstudioLaboratorio.findByIdAndUpdate(
      id,
      { descripcion, visible },
      { new: true, runValidators: true }
    );

    if (!archivo) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    res.json({
      message: "Archivo actualizado exitosamente",
      archivo: archivo,
    });
  } catch (error) {
    console.error("Error actualizando archivo:", error);
    res
      .status(500)
      .json({ message: "Error actualizando archivo", error: error.message });
  }
};
