import SolicitudAnalisis from "../models/SolicitudAnalisis.js";

// Crear nueva solicitud de análisis
export const crearSolicitud = async (req, res) => {
  try {
    const { pacienteId, analisis, descripcion } = req.body;

    if (!pacienteId || !analisis || analisis.length === 0) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Validar que cada análisis tenga al menos el nombre
    const analisisValidados = analisis.map((item) => {
      if (typeof item === "string") {
        // Si es string (compatibilidad hacia atrás), convertir a objeto
        return { nombre: item, valor: null, unidad: "" };
      } else {
        // Si ya es objeto, validar estructura
        return {
          nombre: item.nombre || "",
          valor: item.valor || null,
          unidad: item.unidad || "",
        };
      }
    });

    const solicitud = new SolicitudAnalisis({
      pacienteId,
      analisis: analisisValidados,
      descripcion,
    });

    await solicitud.save();

    // IMPORTANTE: populate después de guardar
    const solicitudPopulada = await SolicitudAnalisis.findById(
      solicitud._id
    ).populate("pacienteId");

    res.status(201).json(solicitudPopulada);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al crear la solicitud", error: err.message });
  }
};

// Listar solicitudes por paciente
export const listarSolicitudesPorPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const solicitudes = await SolicitudAnalisis.find({ pacienteId })
      .sort({ fechaSolicitud: -1 })
      .populate("pacienteId");
    res.json(solicitudes);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al buscar solicitudes", error: err.message });
  }
};

// Obtener una solicitud por ID
export const obtenerSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await SolicitudAnalisis.findById(id).populate(
      "pacienteId"
    );
    if (!solicitud) return res.status(404).json({ message: "No encontrada" });
    res.json(solicitud);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

// Eliminar una solicitud por ID
export const eliminarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const borrada = await SolicitudAnalisis.findByIdAndDelete(id);
    if (!borrada) return res.status(404).json({ message: "No encontrada" });
    res.json({ message: "Solicitud eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar", error: err.message });
  }
};

// Editar una solicitud completa por ID
export const editarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { analisis, descripcion, estado } = req.body;

    // Validar análisis si se envían
    let analisisValidados = analisis;
    if (analisis) {
      analisisValidados = analisis.map((item) => {
        if (typeof item === "string") {
          return { nombre: item, valor: null, unidad: "" };
        } else {
          return {
            nombre: item.nombre || "",
            valor: item.valor || null,
            unidad: item.unidad || "",
          };
        }
      });
    }

    const actualizada = await SolicitudAnalisis.findByIdAndUpdate(
      id,
      {
        ...(analisisValidados && { analisis: analisisValidados }),
        ...(descripcion && { descripcion }),
        ...(estado && { estado }),
      },
      { new: true }
    ).populate("pacienteId");

    if (!actualizada) return res.status(404).json({ message: "No encontrada" });
    res.json(actualizada);
  } catch (err) {
    res.status(500).json({ message: "Error al editar", error: err.message });
  }
};

// NUEVA FUNCIÓN: Actualizar solo los valores de los análisis
export const actualizarValoresAnalisis = async (req, res) => {
  try {
    const { id } = req.params;
    const { analisis } = req.body; // Array con { nombre, valor, unidad }

    const solicitud = await SolicitudAnalisis.findById(id);
    if (!solicitud) return res.status(404).json({ message: "No encontrada" });

    // Actualizar valores manteniendo la estructura existente
    const analisisActualizado = solicitud.analisis.map((item) => {
      const nuevosValores = analisis.find((a) => a.nombre === item.nombre);
      if (nuevosValores) {
        return {
          nombre: item.nombre,
          valor:
            nuevosValores.valor !== undefined
              ? nuevosValores.valor
              : item.valor,
          unidad:
            nuevosValores.unidad !== undefined
              ? nuevosValores.unidad
              : item.unidad,
        };
      }
      return item;
    });

    const actualizada = await SolicitudAnalisis.findByIdAndUpdate(
      id,
      {
        analisis: analisisActualizado,
        estado: "Completado", // Automáticamente marcar como completado cuando se agregan valores
      },
      { new: true }
    ).populate("pacienteId");

    res.json(actualizada);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al actualizar valores", error: err.message });
  }
};
