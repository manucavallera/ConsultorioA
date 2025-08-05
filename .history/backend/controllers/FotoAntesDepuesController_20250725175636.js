import FotoAntesDepues from "../models/FotoAntesDepues.js";
import Paciente from "../models/Paciente.js";
import cloudinary from "../config/cloudinary.js";

// ============================================
// SUBIR FOTO ANTES O DESPUÉS
// ============================================
export const subirFoto = async (req, res) => {
  try {
    console.log("BODY recibido:", req.body);
    console.log("FILE recibido:", req.file);

    const { pacienteId, tipoFoto, descripcion, tratamientoRelacionado, notas } =
      req.body;
    const archivo = req.file; // Ya está en Cloudinary gracias a CloudinaryStorage

    // Validaciones
    if (!pacienteId || !tipoFoto || !archivo) {
      return res.status(400).json({
        message: "Faltan datos obligatorios",
        requeridos: ["pacienteId", "tipoFoto", "archivo"],
      });
    }

    // Validar tipo de foto
    if (!["antes", "despues"].includes(tipoFoto)) {
      return res.status(400).json({
        message: "Tipo de foto inválido. Use: 'antes' o 'despues'",
      });
    }

    // Verificar que el paciente existe
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    // Validar que es una imagen
    if (!archivo.mimetype || !archivo.mimetype.startsWith("image/")) {
      return res.status(400).json({
        message: "Solo se permiten archivos de imagen",
      });
    }

    // Crear registro en la base de datos
    const nuevaFoto = new FotoAntesDepues({
      pacienteId,
      tipoFoto,
      archivoUrl: archivo.path,
      nombreArchivo: archivo.originalname,
      cloudinaryId: archivo.filename,
      descripcion: descripcion || "",
      tratamientoRelacionado: tratamientoRelacionado || "",
      notas: notas || "",
    });

    await nuevaFoto.save();

    // Poblar información del paciente para la respuesta
    await nuevaFoto.populate("pacienteId", "nombre apellido dni");

    res.status(201).json({
      message: "Foto subida exitosamente",
      foto: nuevaFoto,
    });
  } catch (error) {
    console.error("Error al subir foto:", error);
    res.status(500).json({
      message: "Error al subir la foto",
      error: error.message,
    });
  }
};

// ============================================
// OBTENER TODAS LAS FOTOS DE UN PACIENTE
// ============================================
export const obtenerFotosPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { tipo, limite = 20 } = req.query;

    // Construir filtros
    let filtros = {
      pacienteId,
      visible: true,
    };

    if (tipo && ["antes", "despues"].includes(tipo)) {
      filtros.tipoFoto = tipo;
    }

    const fotos = await FotoAntesDepues.find(filtros)
      .populate("pacienteId", "nombre apellido dni")
      .sort({ fechaSubida: -1 })
      .limit(parseInt(limite));

    res.json({
      total: fotos.length,
      fotos: fotos,
    });
  } catch (error) {
    console.error("Error obteniendo fotos:", error);
    res.status(500).json({
      message: "Error obteniendo fotos",
      error: error.message,
    });
  }
};

// ============================================
// OBTENER COMPARACIÓN ANTES/DESPUÉS
// ============================================
export const obtenerComparacion = async (req, res) => {
  try {
    const { pacienteId } = req.params;

    // Obtener fotos de antes
    const fotosAntes = await FotoAntesDepues.find({
      pacienteId,
      tipoFoto: "antes",
      visible: true,
    })
      .populate("pacienteId", "nombre apellido dni")
      .sort({ fechaSubida: -1 });

    // Obtener fotos de después
    const fotosDespues = await FotoAntesDepues.find({
      pacienteId,
      tipoFoto: "despues",
      visible: true,
    })
      .populate("pacienteId", "nombre apellido dni")
      .sort({ fechaSubida: -1 });

    res.json({
      pacienteId,
      paciente: fotosAntes[0]?.pacienteId || fotosDespues[0]?.pacienteId,
      antes: {
        total: fotosAntes.length,
        fotos: fotosAntes,
      },
      despues: {
        total: fotosDespues.length,
        fotos: fotosDespues,
      },
      totalGeneral: fotosAntes.length + fotosDespues.length,
      tieneComparacion: fotosAntes.length > 0 && fotosDespues.length > 0,
    });
  } catch (error) {
    console.error("Error obteniendo comparación:", error);
    res.status(500).json({
      message: "Error obteniendo comparación",
      error: error.message,
    });
  }
};

// ============================================
// OBTENER ESTADÍSTICAS
// ============================================
export const obtenerEstadisticas = async (req, res) => {
  try {
    const { pacienteId } = req.params;

    const stats = await FotoAntesDepues.aggregate([
      {
        $match: {
          pacienteId: new mongoose.Types.ObjectId(pacienteId),
          visible: true,
        },
      },
      {
        $group: {
          _id: "$tipoFoto",
          total: { $sum: 1 },
          ultimaFecha: { $max: "$fechaSubida" },
        },
      },
    ]);

    const resultado = {
      pacienteId,
      antes: 0,
      despues: 0,
      total: 0,
      ultimaActividad: null,
    };

    stats.forEach((stat) => {
      resultado[stat._id] = stat.total;
      resultado.total += stat.total;

      if (
        !resultado.ultimaActividad ||
        stat.ultimaFecha > resultado.ultimaActividad
      ) {
        resultado.ultimaActividad = stat.ultimaFecha;
      }
    });

    res.json(resultado);
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({
      message: "Error obteniendo estadísticas",
      error: error.message,
    });
  }
};

// ============================================
// ELIMINAR FOTO
// ============================================
export const eliminarFoto = async (req, res) => {
  try {
    const { id } = req.params;

    const foto = await FotoAntesDepues.findById(id);
    if (!foto) {
      return res.status(404).json({ message: "Foto no encontrada" });
    }

    // Eliminar de Cloudinary
    if (foto.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(foto.cloudinaryId);
        console.log("Foto eliminada de Cloudinary:", foto.cloudinaryId);
      } catch (cloudinaryError) {
        console.error("Error eliminando de Cloudinary:", cloudinaryError);
      }
    }

    // Eliminar de la base de datos
    await FotoAntesDepues.findByIdAndDelete(id);

    res.json({
      message: "Foto eliminada exitosamente",
      fotoEliminada: {
        id: foto._id,
        tipoFoto: foto.tipoFoto,
        nombreArchivo: foto.nombreArchivo,
      },
    });
  } catch (error) {
    console.error("Error eliminando foto:", error);
    res.status(500).json({
      message: "Error eliminando foto",
      error: error.message,
    });
  }
};

// ============================================
// ACTUALIZAR FOTO (solo metadatos)
// ============================================
export const actualizarFoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, tratamientoRelacionado, notas, visible } = req.body;

    const foto = await FotoAntesDepues.findByIdAndUpdate(
      id,
      {
        descripcion,
        tratamientoRelacionado,
        notas,
        visible,
      },
      { new: true, runValidators: true }
    ).populate("pacienteId", "nombre apellido dni");

    if (!foto) {
      return res.status(404).json({ message: "Foto no encontrada" });
    }

    res.json({
      message: "Foto actualizada exitosamente",
      foto: foto,
    });
  } catch (error) {
    console.error("Error actualizando foto:", error);
    res.status(500).json({
      message: "Error actualizando foto",
      error: error.message,
    });
  }
};
