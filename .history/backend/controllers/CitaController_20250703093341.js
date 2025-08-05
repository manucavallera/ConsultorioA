import Cita from "../models/Cita.js";

// Crear una nueva cita
export const crearCita = async (req, res) => {
  try {
    const nuevaCita = new Cita(req.body);
    const guardada = await nuevaCita.save();

    // Poblar con datos del paciente para la respuesta
    const citaPopulada = await Cita.findById(guardada._id).populate(
      "pacienteId"
    );

    res.status(201).json(citaPopulada);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al crear cita",
      error: error.message,
    });
  }
};

// Obtener todas las citas
export const obtenerCitas = async (req, res) => {
  try {
    const citas = await Cita.find()
      .populate("pacienteId")
      .sort({ fecha: 1, hora: 1 }); // Ordenar por fecha y hora

    res.json(citas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener citas",
      error: error.message,
    });
  }
};

// Obtener citas por rango de fechas
export const obtenerCitasPorFecha = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const filtro = {};
    if (fechaInicio && fechaFin) {
      filtro.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin),
      };
    }

    const citas = await Cita.find(filtro)
      .populate("pacienteId")
      .sort({ fecha: 1, hora: 1 });

    res.json(citas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener citas por fecha",
      error: error.message,
    });
  }
};

// Obtener citas de un paciente específico
export const obtenerCitasPorPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;

    const citas = await Cita.find({ pacienteId })
      .populate("pacienteId")
      .sort({ fecha: -1 }); // Más recientes primero

    res.json(citas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener citas del paciente",
      error: error.message,
    });
  }
};

// Obtener una cita por ID
export const obtenerCitaPorId = async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id).populate("pacienteId");

    if (!cita) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }

    res.json(cita);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener cita",
      error: error.message,
    });
  }
};

// Actualizar una cita
export const actualizarCita = async (req, res) => {
  try {
    const actualizada = await Cita.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("pacienteId");

    if (!actualizada) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }

    res.json(actualizada);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al actualizar cita",
      error: error.message,
    });
  }
};

// Cambiar estado de una cita
export const cambiarEstadoCita = async (req, res) => {
  try {
    const { estado } = req.body;

    const cita = await Cita.findByIdAndUpdate(
      req.params.id,
      { estado, actualizadoEn: Date.now() },
      { new: true, runValidators: true }
    ).populate("pacienteId");

    if (!cita) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }

    res.json(cita);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al cambiar estado de cita",
      error: error.message,
    });
  }
};

// Eliminar una cita
export const eliminarCita = async (req, res) => {
  try {
    const eliminada = await Cita.findByIdAndDelete(req.params.id);

    if (!eliminada) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }

    res.json({ mensaje: "Cita eliminada correctamente" });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar cita",
      error: error.message,
    });
  }
};

// Obtener disponibilidad de horarios
export const obtenerDisponibilidad = async (req, res) => {
  try {
    const { fecha } = req.query;

    // Horarios de trabajo (puedes ajustar según tus necesidades)
    const horariosDisponibles = [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
    ];

    // Obtener citas ocupadas para esa fecha
    const citasOcupadas = await Cita.find({
      fecha: new Date(fecha),
      estado: { $ne: "Cancelada" }, // Excluir canceladas
    }).select("hora");

    const horariosOcupados = citasOcupadas.map((cita) => cita.hora);
    const horariosLibres = horariosDisponibles.filter(
      (horario) => !horariosOcupados.includes(horario)
    );

    res.json({
      fecha,
      horariosDisponibles,
      horariosOcupados,
      horariosLibres,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener disponibilidad",
      error: error.message,
    });
  }
};

// Estadísticas de citas
export const obtenerEstadisticasCitas = async (req, res) => {
  try {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    const totalCitas = await Cita.countDocuments();
    const citasDelMes = await Cita.countDocuments({
      fecha: { $gte: inicioMes, $lte: finMes },
    });
    const citasHoy = await Cita.countDocuments({
      fecha: {
        $gte: new Date(hoy.setHours(0, 0, 0, 0)),
        $lte: new Date(hoy.setHours(23, 59, 59, 999)),
      },
    });

    // Citas por estado
    const citasPorEstado = await Cita.aggregate([
      {
        $group: {
          _id: "$estado",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalCitas,
      citasDelMes,
      citasHoy,
      citasPorEstado,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener estadísticas",
      error: error.message,
    });
  }
};
