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

// Agregar estas funciones al final de tu citaController.js

// 🆕 CREAR PLAN DE PAGOS PARA UNA CITA
export const crearPlanPagos = async (req, res) => {
  try {
    const { citaId } = req.params;
    const { tipoPlan, montoPorSesion } = req.body;

    const cita = await Cita.findById(citaId).populate("pacienteId");
    if (!cita) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }

    // Crear los pagos según el plan
    await cita.crearPagosPlan(tipoPlan, montoPorSesion);

    res.json({
      mensaje: "Plan de pagos creado exitosamente",
      cita: cita,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear plan de pagos",
      error: error.message,
    });
  }
};

// 💳 GENERAR LINK DE MERCADO PAGO
export const generarLinkMercadoPago = async (req, res) => {
  try {
    const { citaId, numeroPago } = req.params;

    const cita = await Cita.findById(citaId).populate("pacienteId");
    if (!cita) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }

    const pago = cita.pago.pagos.find(
      (p) => p.numeroPago === parseInt(numeroPago)
    );
    if (!pago) {
      return res.status(404).json({ mensaje: "Pago no encontrado" });
    }

    // SIMULACIÓN - Aquí integrarías con Mercado Pago SDK real
    const mockPreferenceId = `PREF_${Date.now()}_${citaId}_${numeroPago}`;
    const mockPaymentUrl = `https://checkout.mercadopago.com.ar/preferences/${mockPreferenceId}`;

    // Guardar datos de MP
    pago.mercadoPago = {
      preferenceId: mockPreferenceId,
      paymentUrl: mockPaymentUrl,
    };
    pago.metodoPago = "mercadopago";

    await cita.save();

    res.json({
      mensaje: "Link de pago generado",
      paymentUrl: mockPaymentUrl,
      preferenceId: mockPreferenceId,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al generar link de Mercado Pago",
      error: error.message,
    });
  }
};

// ✅ CONFIRMAR PAGO
export const confirmarPago = async (req, res) => {
  try {
    const { citaId, numeroPago } = req.params;
    const { metodoPago, paymentId } = req.body;

    const cita = await Cita.findById(citaId).populate("pacienteId");
    if (!cita) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }

    await cita.confirmarPago(parseInt(numeroPago), metodoPago);

    // Si es mercado pago, guardar el payment ID
    if (metodoPago === "mercadopago" && paymentId) {
      const pago = cita.pago.pagos.find(
        (p) => p.numeroPago === parseInt(numeroPago)
      );
      if (pago) {
        pago.mercadoPago.paymentId = paymentId;
        pago.mercadoPago.status = "approved";
        await cita.save();
      }
    }

    res.json({
      mensaje: "Pago confirmado exitosamente",
      cita: cita,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al confirmar pago",
      error: error.message,
    });
  }
};

// 📱 ENVIAR ALERTA WHATSAPP
export const enviarAlertaWhatsApp = async (req, res) => {
  try {
    const { citaId, numeroPago } = req.params;

    const cita = await Cita.findById(citaId).populate("pacienteId");
    if (!cita) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }

    const pago = cita.pago.pagos.find(
      (p) => p.numeroPago === parseInt(numeroPago)
    );
    if (!pago) {
      return res.status(404).json({ mensaje: "Pago no encontrado" });
    }

    // Crear mensaje personalizado
    const mensaje = `Hola ${
      cita.pacienteId.nombre
    }, tienes un pago pendiente de $${
      pago.monto
    } para tu cita del ${cita.fecha.toLocaleDateString()}. Vence el ${pago.fechaVencimiento.toLocaleDateString()}. ¡No olvides realizar tu pago!`;

    // Aquí integrarías con WhatsApp API
    console.log(`WHATSAPP ENVIADO a ${cita.pacienteId.telefono}: ${mensaje}`);

    // Marcar alerta como enviada
    pago.alertaEnviada = true;
    pago.fechaUltimaAlerta = new Date();
    await cita.save();

    res.json({
      mensaje: "Alerta enviada por WhatsApp",
      telefono: cita.pacienteId.telefono,
      textoEnviado: mensaje,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al enviar alerta",
      error: error.message,
    });
  }
};

// 🚨 OBTENER ALERTAS PENDIENTES (TODAS LAS CITAS)
export const obtenerAlertasPendientes = async (req, res) => {
  try {
    const citas = await Cita.find({
      "pago.pagos": { $exists: true },
    }).populate("pacienteId");

    const alertasPendientes = citas.filter((cita) => cita.necesitaAlerta());

    const alertasDetalladas = alertasPendientes.map((cita) => {
      const pagosConAlerta = cita.pago.pagos.filter((pago) => {
        if (pago.estado !== "pendiente" || pago.alertaEnviada) return false;

        const ahora = new Date();
        const unDiaAntes = new Date(pago.fechaVencimiento);
        unDiaAntes.setDate(unDiaAntes.getDate() - 1);

        return ahora >= unDiaAntes;
      });

      return {
        cita: cita,
        pagosConAlerta: pagosConAlerta,
      };
    });

    res.json({
      totalAlertas: alertasDetalladas.length,
      alertas: alertasDetalladas,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener alertas pendientes",
      error: error.message,
    });
  }
};

// 📊 ESTADÍSTICAS DE PAGOS
export const obtenerEstadisticasPagos = async (req, res) => {
  try {
    const citas = await Cita.find({
      "pago.pagos": { $exists: true },
    });

    let totalPagos = 0;
    let pagosPendientes = 0;
    let pagosPagados = 0;
    let pagosVencidos = 0;
    let montoTotal = 0;
    let montoPendiente = 0;

    citas.forEach((cita) => {
      if (cita.pago && cita.pago.pagos) {
        cita.pago.pagos.forEach((pago) => {
          totalPagos++;
          montoTotal += pago.monto;

          if (pago.estado === "pendiente") {
            pagosPendientes++;
            montoPendiente += pago.monto;
          } else if (pago.estado === "pagado") {
            pagosPagados++;
          } else if (pago.estado === "vencido") {
            pagosVencidos++;
          }
        });
      }
    });

    res.json({
      totalPagos,
      pagosPendientes,
      pagosPagados,
      pagosVencidos,
      montoTotal,
      montoPendiente,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener estadísticas de pagos",
      error: error.message,
    });
  }
};
