import RegistroTratamiento from "../models/registroTratamientoModel.js";
import Paciente from "../models/Paciente.js";
import HistorialClinico from "../models/HistorialClinico.js";

// Crear un nuevo registro de tratamiento (individual)
export const crearRegistroTratamiento = async (req, res) => {
  try {
    const {
      pacienteId,
      historialClinicoId,
      nombreTratamiento,
      diasTratamiento,
      notasAdicionales,
    } = req.body;

    // Verificar si el paciente y el historial clínico existen
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente)
      return res.status(404).json({ mensaje: "Paciente no encontrado" });

    const historialClinico = await HistorialClinico.findById(
      historialClinicoId
    );
    if (!historialClinico)
      return res
        .status(404)
        .json({ mensaje: "Historial clínico no encontrado" });

    // Crear el registro de tratamiento individual
    const registro = new RegistroTratamiento({
      pacienteId,
      historialClinicoId,
      nombreTratamiento,
      diasTratamiento,
      notasAdicionales,
      tipoRegistro: "individual",
    });
    const guardado = await registro.save();

    // Populate para devolver información completa
    const registroCompleto = await RegistroTratamiento.findById(guardado._id)
      .populate("pacienteId", "nombre apellido dni telefono email genero")
      .populate(
        "historialClinicoId",
        "tipoCueroCabelludo frecuenciaLavadoCapilar tricoscopiaDigital tipoAlopecia observaciones antecedentes"
      );

    res.status(201).json(registroCompleto);
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al crear el registro de tratamiento", error });
  }
};

// NUEVA FUNCIÓN: Crear múltiples tratamientos en una sola operación
export const crearMultiplesTratamientos = async (req, res) => {
  try {
    const {
      pacienteId,
      historialClinicoId,
      tratamientos, // Array de { nombreTratamiento, diasTratamiento }
      notasAdicionales,
    } = req.body;

    // Validaciones
    if (
      !tratamientos ||
      !Array.isArray(tratamientos) ||
      tratamientos.length === 0
    ) {
      return res.status(400).json({
        mensaje:
          "Se requiere al menos un tratamiento en el array 'tratamientos'",
      });
    }

    // Verificar si el paciente y el historial clínico existen
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente)
      return res.status(404).json({ mensaje: "Paciente no encontrado" });

    const historialClinico = await HistorialClinico.findById(
      historialClinicoId
    );
    if (!historialClinico)
      return res
        .status(404)
        .json({ mensaje: "Historial clínico no encontrado" });

    // Validar que todos los tratamientos tengan los campos requeridos
    for (let i = 0; i < tratamientos.length; i++) {
      const tratamiento = tratamientos[i];
      if (!tratamiento.nombreTratamiento || !tratamiento.diasTratamiento) {
        return res.status(400).json({
          mensaje: `Tratamiento ${
            i + 1
          }: Se requieren nombreTratamiento y diasTratamiento`,
        });
      }
    }

    // Crear el registro con múltiples tratamientos
    const registro = new RegistroTratamiento({
      pacienteId,
      historialClinicoId,
      tratamientos,
      notasAdicionales,
      tipoRegistro: "multiple",
    });
    const guardado = await registro.save();

    // Populate para devolver información completa
    const registroCompleto = await RegistroTratamiento.findById(guardado._id)
      .populate("pacienteId", "nombre apellido dni telefono email genero")
      .populate(
        "historialClinicoId",
        "tipoCueroCabelludo frecuenciaLavadoCapilar tricoscopiaDigital tipoAlopecia observaciones antecedentes"
      );

    res.status(201).json(registroCompleto);
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al crear los múltiples tratamientos", error });
  }
};

// Obtener registros de tratamiento por paciente
export const obtenerRegistrosPorPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    // Verificar si el paciente existe
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente)
      return res.status(404).json({ mensaje: "Paciente no encontrado" });

    // Obtener registros de tratamiento con información del historial clínico
    const registros = await RegistroTratamiento.find({ pacienteId })
      .sort({ creadoEn: -1 }) // Más recientes primero
      .populate(
        "historialClinicoId",
        "tipoCueroCabelludo frecuenciaLavadoCapilar tricoscopiaDigital tipoAlopecia observaciones antecedentes"
      )
      .populate("pacienteId", "nombre apellido dni telefono email genero");

    res.json(registros);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener los registros de tratamiento",
      error,
    });
  }
};

// Obtener registros de tratamiento por historial clínico
export const obtenerRegistrosPorHistorialClinico = async (req, res) => {
  try {
    const { historialClinicoId } = req.params;
    // Verificar si el historial clínico existe
    const historialClinico = await HistorialClinico.findById(
      historialClinicoId
    );
    if (!historialClinico)
      return res
        .status(404)
        .json({ mensaje: "Historial clínico no encontrado" });

    // Obtener registros de tratamiento con información del paciente
    const registros = await RegistroTratamiento.find({ historialClinicoId })
      .sort({ creadoEn: -1 }) // Más recientes primero
      .populate("pacienteId", "nombre apellido dni telefono email genero")
      .populate(
        "historialClinicoId",
        "tipoCueroCabelludo frecuenciaLavadoCapilar tricoscopiaDigital tipoAlopecia observaciones antecedentes"
      );

    res.json(registros);
  } catch (error) {
    res.status(500).json({
      mensaje:
        "Error al obtener los registros de tratamiento por historial clínico",
      error,
    });
  }
};

// Actualizar un registro de tratamiento
export const actualizarRegistroTratamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Obtener el registro actual para determinar el tipo
    const registroActual = await RegistroTratamiento.findById(id);
    if (!registroActual) {
      return res
        .status(404)
        .json({ mensaje: "Registro de tratamiento no encontrado" });
    }

    // Actualizar según el tipo de registro
    let camposActualizar = {};

    if (registroActual.tipoRegistro === "individual") {
      const { nombreTratamiento, diasTratamiento, notasAdicionales } =
        updateData;
      camposActualizar = {
        nombreTratamiento,
        diasTratamiento,
        notasAdicionales,
      };
    } else {
      const { tratamientos, notasAdicionales } = updateData;
      camposActualizar = { tratamientos, notasAdicionales };
    }

    // Actualizar el registro y obtener la información relacionada
    const actualizado = await RegistroTratamiento.findByIdAndUpdate(
      id,
      camposActualizar,
      { new: true }
    )
      .populate("pacienteId", "nombre apellido dni telefono email genero")
      .populate(
        "historialClinicoId",
        "tipoCueroCabelludo frecuenciaLavadoCapilar tricoscopiaDigital tipoAlopecia observaciones antecedentes"
      );

    res.json(actualizado);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al actualizar el registro de tratamiento",
      error,
    });
  }
};

// Eliminar un registro de tratamiento
export const eliminarRegistroTratamiento = async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar el registro
    const eliminado = await RegistroTratamiento.findByIdAndDelete(id);
    if (!eliminado)
      return res
        .status(404)
        .json({ mensaje: "Registro de tratamiento no encontrado" });

    res.json({ mensaje: "Registro de tratamiento eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al eliminar el registro de tratamiento", error });
  }
};

// NUEVA FUNCIÓN: Marcar día como administrado
export const marcarDiaAdministrado = async (req, res) => {
  try {
    const { id, tratamientoIndex, fechaIndex } = req.params;
    const { administrado, nota } = req.body;

    const registro = await RegistroTratamiento.findById(id);
    if (!registro) {
      return res.status(404).json({ mensaje: "Registro no encontrado" });
    }

    if (registro.tipoRegistro === "individual") {
      // Para tratamiento individual
      if (fechaIndex >= registro.diasTratamiento.length) {
        return res.status(400).json({ mensaje: "Índice de fecha inválido" });
      }
      registro.diasTratamiento[fechaIndex].administrado = administrado;
      if (nota !== undefined) {
        registro.diasTratamiento[fechaIndex].nota = nota;
      }
    } else {
      // Para múltiples tratamientos
      if (tratamientoIndex >= registro.tratamientos.length) {
        return res
          .status(400)
          .json({ mensaje: "Índice de tratamiento inválido" });
      }
      if (
        fechaIndex >=
        registro.tratamientos[tratamientoIndex].diasTratamiento.length
      ) {
        return res.status(400).json({ mensaje: "Índice de fecha inválido" });
      }
      registro.tratamientos[tratamientoIndex].diasTratamiento[
        fechaIndex
      ].administrado = administrado;
      if (nota !== undefined) {
        registro.tratamientos[tratamientoIndex].diasTratamiento[
          fechaIndex
        ].nota = nota;
      }
    }

    await registro.save();

    const registroActualizado = await RegistroTratamiento.findById(id)
      .populate("pacienteId", "nombre apellido dni telefono email genero")
      .populate("historialClinicoId");

    res.json(registroActualizado);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar el estado del día",
      error,
    });
  }
};
