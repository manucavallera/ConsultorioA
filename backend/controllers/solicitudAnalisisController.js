import SolicitudAnalisis from "../models/SolicitudAnalisis.js";

// Crear nueva solicitud de análisis
export const crearSolicitud = async (req, res) => {
  try {
    const { pacienteId, analisis, descripcion } = req.body;
    if (!pacienteId || !analisis || analisis.length === 0) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }
    const solicitud = new SolicitudAnalisis({
      pacienteId,
      analisis,
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

// Editar una solicitud por ID
export const editarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { analisis, descripcion } = req.body;
    const actualizada = await SolicitudAnalisis.findByIdAndUpdate(
      id,
      { analisis, descripcion },
      { new: true }
    ).populate("pacienteId");
    if (!actualizada) return res.status(404).json({ message: "No encontrada" });
    res.json(actualizada);
  } catch (err) {
    res.status(500).json({ message: "Error al editar", error: err.message });
  }
};
