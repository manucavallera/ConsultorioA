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
    res.status(201).json(solicitud);
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
    const solicitudes = await SolicitudAnalisis.find({ pacienteId }).sort({
      fechaSolicitud: -1,
    });
    res.json(solicitudes);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al buscar solicitudes", error: err.message });
  }
};

// (Opcional) Obtener una solicitud por ID
export const obtenerSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await SolicitudAnalisis.findById(id);
    if (!solicitud) return res.status(404).json({ message: "No encontrada" });
    res.json(solicitud);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};
