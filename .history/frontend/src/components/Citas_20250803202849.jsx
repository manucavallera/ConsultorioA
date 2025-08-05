import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import jsPDF from "jspdf";

const API_URL = "http://localhost:5000";

const obtenerFechaHoy = () => {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${año}-${mes}-${dia}`;
};

// Utilidades para fechas
const formatearFecha = (fecha) => {
  if (!fecha) return "";

  // Tomar solo la parte de fecha sin hora para evitar problemas UTC
  const fechaSoloFecha = fecha.includes("T") ? fecha.split("T")[0] : fecha;
  const [año, mes, dia] = fechaSoloFecha.split("-");
  const fechaLocal = new Date(año, mes - 1, dia);

  return fechaLocal.toLocaleDateString("es-AR", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatearHora = (hora) => {
  return hora;
};

// ✅ FUNCIÓN CORREGIDA CON CLASES FIJAS:
const obtenerColorEstado = (estado) => {
  const colores = {
    Programada:
      "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200 shadow-blue-100",
    "En curso":
      "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border-amber-200 shadow-amber-100",
    Completada:
      "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200 shadow-green-100",
  };
  return (
    colores[estado] ||
    "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200 shadow-gray-100"
  );
};

const obtenerIconoTipo = (tipo) => {
  const iconos = {
    "Consulta inicial": "🩺",
    Control: "🔍",
    Tratamiento: "💊",
    Seguimiento: "📊",
    Urgencia: "🚨",
  };
  return iconos[tipo] || "📋";
};

const obtenerColorTipo = (tipo) => {
  const colores = {
    "Consulta inicial": "bg-blue-500",
    Control: "bg-green-500",
    Tratamiento: "bg-purple-500",
    Seguimiento: "bg-orange-500",
    Urgencia: "bg-red-500",
  };
  return colores[tipo] || "bg-gray-500";
};

export default function CitasDashboard() {
  const navigate = useNavigate();
  const { pacienteId } = useParams();
  const { state } = useLocation();
  const pacienteSeleccionado = state?.paciente;

  // Estados principales
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mostrandoPagos, setMostrandoPagos] = useState({});
  const [creandoPlan, setCreandoPlan] = useState({});
  const [modalPagosAbierto, setModalPagosAbierto] = useState(false);
  const [citaSeleccionadaPagos, setCitaSeleccionadaPagos] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [filtroPagos, setFiltroPagos] = useState("todos");

  const [numeroDoctor, setNumeroDoctor] = useState(
    localStorage.getItem("numeroDoctor") || "+5491123456789" 
  );

  // Estados para formulario
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    pacienteId: "",
    fecha: "",
    hora: "",
    duracion: "60",
    tipoConsulta: "",
    motivo: "",
    observaciones: "",
  });

  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState("Todas");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroPaciente, setFiltroPaciente] = useState(pacienteId || "");
  const [vistaModo, setVistaModo] = useState("lista");

  // ✅ FUNCIONES DESPUÉS DE TODOS LOS ESTADOS
  const configurarNumeroDoctor = () => {
    const nuevoNumero = prompt(
      "Ingrese su número de WhatsApp (con código de país):",
      numeroDoctor
    );
    if (nuevoNumero && nuevoNumero.trim()) {
      setNumeroDoctor(nuevoNumero.trim());
      localStorage.setItem("numeroDoctor", nuevoNumero.trim());
      setMensaje("Número de WhatsApp actualizado");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const crearRecordatorio = (cita, tipo = "cita_programada") => {
    const id = Date.now() + Math.random();
    const paciente = cita.pacienteId;

    const tiposRecordatorio = {
      cita_programada: {
        titulo: "🩺 Cita Programada",
        mensaje: `Cita con ${paciente.nombre} ${paciente.apellido}`,
        color: "bg-blue-500",
        icono: "📅",
      },
      cita_hoy: {
        titulo: "⚡ Cita Hoy",
        mensaje: `HOY a las ${cita.hora} - ${paciente.nombre} ${paciente.apellido}`,
        color: "bg-orange-500",
        icono: "🔔",
      },
      cita_pronto: {
        titulo: "⏰ Cita en 1 hora",
        mensaje: `${paciente.nombre} ${paciente.apellido} - ${cita.tipoConsulta}`,
        color: "bg-red-500",
        icono: "⚠️",
      },
      pago_vencido: {
        titulo: "💳 Pago Vencido",
        mensaje: `${paciente.nombre} ${paciente.apellido} tiene pagos pendientes`,
        color: "bg-red-500",
        icono: "💰",
      },
    };

    const recordatorio = {
      id,
      tipo,
      citaId: cita._id,
      titulo: tiposRecordatorio[tipo].titulo,
      mensaje: tiposRecordatorio[tipo].mensaje,
      detalle: `${formatearFecha(cita.fecha)} a las ${cita.hora} - ${
        cita.tipoConsulta
      }`,
      color: tiposRecordatorio[tipo].color,
      icono: tiposRecordatorio[tipo].icono,
      fechaCreacion: new Date(),
      leido: false,
      cita: cita,
    };

    setNotificaciones((prev) => [recordatorio, ...prev]);

    // Auto-mostrar notificaciones críticas
    if (tipo === "cita_pronto" || tipo === "cita_hoy") {
      setMostrarNotificaciones(true);
    }

    return id;
  };

  // Función para marcar notificación como leída
  const marcarComoLeido = (notificacionId) => {
    setNotificaciones((prev) =>
      prev.map((notif) =>
        notif.id === notificacionId ? { ...notif, leido: true } : notif
      )
    );
  };

  // Función para eliminar notificación
  const eliminarNotificacion = (notificacionId) => {
    setNotificaciones((prev) =>
      prev.filter((notif) => notif.id !== notificacionId)
    );
  };

  // Función mejorada para recordatorios (reemplaza enviarRecordatorioDoctor)
  const crearRecordatorioManual = (cita) => {
    crearRecordatorio(cita, "cita_programada");
    setMensaje(
      `🔔 Recordatorio creado para la cita de ${cita.pacienteId.nombre}`
    );
    setTimeout(() => setMensaje(""), 3000);
  };

  const notificacionesNoLeidas = notificaciones.filter((n) => !n.leido).length;

  // ✅ COMPONENTE PANEL NOTIFICACIONES CORREGIDO
  const PanelNotificaciones = () => (
    <div className="fixed top-4 right-4 z-50">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
        className="relative bg-white rounded-full p-4 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
      >
        <span className="text-2xl">🔔</span>
        {notificacionesNoLeidas > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
            {notificacionesNoLeidas}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {mostrarNotificaciones && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Notificaciones</h3>
              <button
                onClick={() => setMostrarNotificaciones(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <span className="text-4xl block mb-2">🔔</span>
                <p>No hay notificaciones</p>
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-all ${
                    !notif.leido ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`${notif.color} rounded-full p-2 text-white`}>
                      <span className="text-sm">{notif.icono}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-gray-900">
                          {notif.titulo}
                        </p>
                        <button
                          onClick={() => eliminarNotificacion(notif.id)}
                          className="text-gray-400 hover:text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notif.mensaje}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.detalle}</p>
                      {!notif.leido && (
                        <button
                          onClick={() => marcarComoLeido(notif.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                        >
                          Marcar como leído
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  // ✅ AUTO-CREAR RECORDATORIOS - MOVIDO AL LUGAR CORRECTO
  useEffect(() => {
    if (citas.length > 0) {
      const hoy = obtenerFechaHoy();
      const ahora = new Date();

      citas.forEach((cita) => {
        const fechaCita = cita.fecha.includes("T")
          ? cita.fecha.split("T")[0]
          : cita.fecha;

        // Recordatorios para citas de hoy
        if (fechaCita === hoy && cita.estado === "Programada") {
          const [hora, minutos] = cita.hora.split(":");
          const fechaHoraCita = new Date();
          fechaHoraCita.setHours(parseInt(hora), parseInt(minutos), 0, 0);

          const tiempoRestante = fechaHoraCita - ahora;
          const horasRestantes = tiempoRestante / (1000 * 60 * 60);

          // Notificación para citas en menos de 2 horas
          if (horasRestantes > 0 && horasRestantes <= 2) {
            crearRecordatorio(cita, "cita_pronto");
          }
          // Notificación para citas de hoy
          else if (horasRestantes > 2) {
            crearRecordatorio(cita, "cita_hoy");
          }
        }

        // Recordatorios para pagos vencidos
        if (cita.pago?.pagos) {
          const pagosVencidos = cita.pago.pagos.filter((pago) => {
            const fechaVencimiento = new Date(pago.fechaVencimiento);
            return pago.estado === "pendiente" && fechaVencimiento < ahora;
          });

          if (pagosVencidos.length > 0) {
            crearRecordatorio(cita, "pago_vencido");
          }
        }
      });
    }
  }, [citas]);

  useEffect(() => {
    cargarDatos();
    if (pacienteId && pacienteSeleccionado) {
      setFormData((prev) => ({ ...prev, pacienteId: pacienteId }));
    }
  }, [pacienteId, pacienteSeleccionado]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [citasRes, pacientesRes, estadisticasRes] = await Promise.all([
        fetch(`${API_URL}/citas`),
        fetch(`${API_URL}/pacientes`),
        fetch(`${API_URL}/citas/estadisticas/resumen`),
      ]);

      const citasData = await citasRes.json();
      const pacientesData = await pacientesRes.json();
      const estadisticasData = await estadisticasRes.json();

      setCitas(citasData);
      setPacientes(pacientesData);
      setEstadisticas(estadisticasData);
    } catch (err) {
      setError("Error al cargar los datos");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const crearPlanPagos = async (citaId, tipoPlan, montoPorSesion) => {
    try {
      const res = await fetch(`${API_URL}/citas/${citaId}/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoPlan, montoPorSesion }),
      });

      if (!res.ok) throw new Error("Error al crear plan de pagos");

      await cargarDatos();
      setMensaje("Plan de pagos creado exitosamente");
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmarPago = async (citaId, numeroPago, metodoPago = "efectivo") => {
    try {
      const res = await fetch(
        `${API_URL}/citas/${citaId}/pagos/${numeroPago}/confirmar`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metodoPago }),
        }
      );

      if (!res.ok) throw new Error("Error al confirmar pago");

      await cargarDatos();
      setMensaje("Pago confirmado exitosamente");
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const editarPago = async (citaId, numeroPago, monto, fechaVencimiento) => {
    try {
      const res = await fetch(
        `${API_URL}/citas/${citaId}/pagos/${numeroPago}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ monto, fechaVencimiento }),
        }
      );

      if (!res.ok) throw new Error("Error al editar pago");

      await cargarDatos();
      setMensaje("Pago editado exitosamente");
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminarPago = async (citaId, numeroPago) => {
    if (!window.confirm("¿Estás seguro de eliminar este pago?")) return;

    try {
      const res = await fetch(
        `${API_URL}/citas/${citaId}/pagos/${numeroPago}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Error al eliminar pago");

      await cargarDatos();
      setMensaje("Pago eliminado exitosamente");
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const abrirModalPagos = (cita) => {
    setCitaSeleccionadaPagos(cita);
    setModalPagosAbierto(true);
  };
  
  const imprimirRecibo = (cita, pago, formato = "imprimir") => {
    if (formato === "pdf") {
      // Generar PDF
      const doc = new jsPDF();

      // Configurar fuente
      doc.setFont("helvetica");

      // Header
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text("RECIBO DE PAGO", 105, 30, { align: "center" });

      doc.setFontSize(14);
      doc.text(`Pago #${pago.numeroPago}`, 105, 45, { align: "center" });

      // Línea separadora
      doc.setLineWidth(0.5);
      doc.line(20, 55, 190, 55);

      // Contenido
      doc.setFontSize(12);
      let yPosition = 75;

      const addLine = (label, value) => {
        doc.setFont("helvetica", "bold");
        doc.text(label + ":", 25, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(value.toString(), 80, yPosition);
        yPosition += 15;
      };

      addLine(
        "Paciente",
        `${cita.pacienteId.nombre} ${cita.pacienteId.apellido}`
      );
      addLine("Fecha de Cita", formatearFecha(cita.fecha));
      addLine("Tipo", cita.tipoConsulta);
      addLine("Método de Pago", pago.metodoPago);
      addLine(
        "Fecha de Pago",
        pago.fechaPago
          ? new Date(pago.fechaPago).toLocaleDateString()
          : "Pendiente"
      );

      // Monto destacado
      yPosition += 10;
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`MONTO: $${pago.monto}`, 105, yPosition, { align: "center" });

      // Footer
      yPosition += 30;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generado el: ${new Date().toLocaleDateString()}`,
        105,
        yPosition,
        { align: "center" }
      );

      // Descargar PDF
      doc.save(
        `Recibo-Pago-${pago.numeroPago}-${cita.pacienteId.apellido}.pdf`
      );
    } else {
      // Imprimir tradicional
      const ventanaImpresion = window.open("", "_blank");
      const contenidoRecibo = `
    <html>
      <head>
        <title>Recibo de Pago #${pago.numeroPago}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            max-width: 600px; 
            margin: 0 auto; 
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .contenido { 
            margin: 20px 0; 
            line-height: 1.6;
          }
          .contenido p {
            margin: 10px 0;
            font-size: 14px;
          }
          .total { 
            font-size: 18px; 
            font-weight: bold; 
            text-align: center;
            background: #f0f0f0;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RECIBO DE PAGO</h1>
          <p>Pago #${pago.numeroPago}</p>
        </div>
        <div class="contenido">
          <p><strong>Paciente:</strong> ${cita.pacienteId.nombre} ${
        cita.pacienteId.apellido
      }</p>
          <p><strong>Fecha de Cita:</strong> ${formatearFecha(cita.fecha)}</p>
          <p><strong>Tipo:</strong> ${cita.tipoConsulta}</p>
          <p><strong>Método de Pago:</strong> ${pago.metodoPago}</p>
          <p><strong>Fecha de Pago:</strong> ${
            pago.fechaPago
              ? new Date(pago.fechaPago).toLocaleDateString()
              : "Pendiente"
          }</p>
          <div class="total">MONTO: $${pago.monto}</div>
        </div>
        <div class="footer">
          <p>Generado el: ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
    </html>
  `;

      ventanaImpresion.document.write(contenidoRecibo);
      ventanaImpresion.document.close();
      ventanaImpresion.print();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);

    try {
      const url = editandoId
        ? `${API_URL}/citas/${editandoId}`
        : `${API_URL}/citas`;
      const method = editandoId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.mensaje || "Error al guardar cita");
      }

      await cargarDatos();
      setMensaje(
        editandoId
          ? "Cita actualizada exitosamente"
          : "Cita creada exitosamente"
      );
      setTimeout(() => setMensaje(""), 3000);
      handleCancelarForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (cita) => {
    setFormData({
      pacienteId: cita.pacienteId._id,
      fecha: cita.fecha.includes("T") ? cita.fecha.split("T")[0] : cita.fecha,
      hora: cita.hora,
      duracion: cita.duracion?.toString() || "60",
      tipoConsulta: cita.tipoConsulta,
      motivo: cita.motivo || "",
      observaciones: cita.observaciones || "",
    });
    setEditandoId(cita._id);
    setShowForm(true);
  };

  const handleCambiarEstado = async (citaId, nuevoEstado) => {
    try {
      const res = await fetch(`${API_URL}/citas/${citaId}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) throw new Error("Error al cambiar estado");

      await cargarDatos();

      if (nuevoEstado === "Programada") {
        const cita = citas.find((c) => c._id === citaId);
        if (cita) {
          crearRecordatorioManual(cita);
        }
      }
    } catch (err) {
      setError("Error al cambiar estado de la cita");
    }
  };

  const handleEliminar = async (citaId) => {
    if (!window.confirm("¿Estás seguro de eliminar esta cita?")) return;

    try {
      const res = await fetch(`${API_URL}/citas/${citaId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar cita");

      await cargarDatos();
    } catch (err) {
      setError("Error al eliminar la cita");
    }
  };

  const handleCancelarForm = () => {
    setFormData({
      pacienteId: "",
      fecha: "",
      hora: "",
      duracion: "60",
      tipoConsulta: "",
      motivo: "",
      observaciones: "",
    });
    setEditandoId(null);
    setShowForm(false);
  };

  // ✅ FILTROS CORREGIDOS INCLUYENDO PACIENTE Y PAGOS:
  const citasFiltradas = citas.filter((cita) => {
    const cumpleFiltroEstado =
      filtroEstado === "Todas" || cita.estado === filtroEstado;

    const cumpleFiltroFecha =
      !filtroFecha ||
      (cita.fecha.includes("T") ? cita.fecha.split("T")[0] : cita.fecha) ===
        filtroFecha;

    const cumpleFiltroPaciente =
      !filtroPaciente || cita.pacienteId._id === filtroPaciente;

    const cumpleFiltroPagos =
      filtroPagos === "todos" ||
      (filtroPagos === "con-pagos-pendientes" &&
        cita.pago?.pagos?.some((p) => p.estado === "pendiente")) ||
      (filtroPagos === "sin-pagos" && !cita.pago?.pagos?.length);

    return (
      cumpleFiltroEstado &&
      cumpleFiltroFecha &&
      cumpleFiltroPaciente &&
      cumpleFiltroPagos
    );
  });

  if (cargando) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='relative'>
            <div className='w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-2xl'>📅</span>
            </div>
          </div>
          <p className='text-xl text-gray-600 font-medium'>Cargando citas...</p>
          <p className='text-sm text-gray-500 mt-2'>
            Preparando tu agenda médica
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      <PanelNotificaciones />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8'>
          <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
            <div className='flex items-center'>
              <button
                onClick={() => navigate(-1)}
                className='mr-6 p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-2xl transition-all duration-200 group'
              >
                <span className='group-hover:-translate-x-1 transition-transform duration-200'>
                  ←
                </span>{" "}
                Volver
              </button>
              <div className='flex items-center'>
                <div className='bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 mr-6 shadow-lg'>
                  <span className='text-3xl text-white'>📅</span>
                </div>
                <div>
                  <h1 className='text-4xl font-bold text-gray-900 mb-2'>
                    Gestión de Citas
                  </h1>
                  <p className='text-gray-600 text-lg'>
                    Administración completa de citas y agenda médica
                  </p>
                </div>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-white/30'>
                <button
                  onClick={() => setVistaModo("lista")}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                    vistaModo === "lista"
                      ? "bg-white text-blue-600 shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                  }`}
                >
                  📋 Lista
                </button>
                <button
                  onClick={() => setVistaModo("calendario")}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                    vistaModo === "calendario"
                      ? "bg-white text-blue-600 shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                  }`}
                >
                  📅 Calendario
                </button>
              </div>

              <button
                onClick={configurarNumeroDoctor}
                className='bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl 
      font-medium text-sm transition-all duration-200 flex items-center space-x-2'
                title='Configurar número de WhatsApp'
              >
                <span>⚙️</span>
                <span>Config WhatsApp</span>
              </button>

              <button
                onClick={() => setShowForm(true)}
                className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 
                  rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 
                  font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1
                  flex items-center justify-center gap-3 min-w-fit'
              >
                <span className='text-xl'>➕</span>
                <span>Nueva Cita</span>
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8'>
            <div className='bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-blue-100 text-sm font-medium mb-1'>
                    Citas Hoy
                  </p>
                  <p className='text-3xl font-bold'>
                    {estadisticas.citasHoy || 0}
                  </p>
                  <p className='text-blue-200 text-xs mt-1'>Agenda de hoy</p>
                </div>
                <div className='bg-white/20 rounded-xl p-3'>
                  <span className='text-2xl'>📅</span>
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-emerald-100 text-sm font-medium mb-1'>
                    Este Mes
                  </p>
                  <p className='text-3xl font-bold'>
                    {estadisticas.citasDelMes || 0}
                  </p>
                  <p className='text-emerald-200 text-xs mt-1'>
                    Citas mensuales
                  </p>
                </div>
                <div className='bg-white/20 rounded-xl p-3'>
                  <span className='text-2xl'>📊</span>
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-purple-100 text-sm font-medium mb-1'>
                    Total Citas
                  </p>
                  <p className='text-3xl font-bold'>
                    {estadisticas.totalCitas || 0}
                  </p>
                  <p className='text-purple-200 text-xs mt-1'>
                    Historial completo
                  </p>
                </div>
                <div className='bg-white/20 rounded-xl p-3'>
                  <span className='text-2xl'>👥</span>
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-orange-100 text-sm font-medium mb-1'>
                    Pacientes
                  </p>
                  <p className='text-3xl font-bold'>{pacientes.length}</p>
                  <p className='text-orange-200 text-xs mt-1'>
                    Activos totales
                  </p>
                </div>
                <div className='bg-white/20 rounded-xl p-3'>
                  <span className='text-2xl'>👤</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <EstadisticasPagos />

        {/* Error Alert */}
        {error && (
          <div className='bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-2xl mb-8 flex items-center shadow-lg'>
            <div className='bg-red-100 rounded-full p-2 mr-4'>
              <span className='text-xl'>⚠️</span>
            </div>
            <div className='flex-1'>
              <p className='font-medium'>Error</p>
              <p className='text-sm'>{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className='ml-4 text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 rounded-full p-2 transition-all'
            >
              ✕
            </button>
          </div>
        )}

        {/* Success Alert */}
        {mensaje && (
          <div className='bg-green-50 border-l-4 border-green-400 text-green-700 px-6 py-4 rounded-2xl mb-8 flex items-center shadow-lg'>
            <div className='bg-green-100 rounded-full p-2 mr-4'>
              <span className='text-xl'>✅</span>
            </div>
            <div className='flex-1'>
              <p className='font-medium'>Éxito</p>
              <p className='text-sm'>{mensaje}</p>
            </div>
            <button
              onClick={() => setMensaje("")}
              className='ml-4 text-green-500 hover:text-green-700 bg-green-100 hover:bg-green-200 rounded-full p-2 transition-all'
            >
              ✕
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8'>
          <div className='flex items-center mb-6'>
            <div className='bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-3 mr-4'>
              <span className='text-xl'>🔍</span>
            </div>
            <h3 className='text-2xl font-bold text-gray-900'>Filtros</h3>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-3'>
                Estado de la cita
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white'
              >
                {["Todas", "Programada", "En curso", "Completada"].map(
                  (estado) => (
                    <option
                      key={estado}
                      value={estado === "Todas" ? "Todas" : estado}
                    >
                      {estado === "Todas" ? "Todas las citas" : estado}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-3'>
                Fecha específica
              </label>
              <input
                type='date'
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white'
              />
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-3'>
                Filtrar por pagos
              </label>
              <select
                value={filtroPagos}
                onChange={(e) => setFiltroPagos(e.target.value)}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white'
              >
                <option value='todos'>Todas las citas</option>
                <option value='con-pagos-pendientes'>
                  Solo pagos pendientes
                </option>
                <option value='sin-pagos'>Sin plan de pagos</option>
              </select>
            </div>

            <div className='flex items-end'>
              <button
                onClick={() => {
                  setFiltroEstado("Todas");
                  setFiltroFecha("");
                  setFiltroPaciente("");
                  setFiltroPagos("todos");
                }}
                className='w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 px-6 py-3 rounded-xl 
                  font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
              >
                🔄 Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <CitaFormModal
            formData={formData}
            setFormData={setFormData}
            pacientes={pacientes}
            citas={citas}
            editandoId={editandoId}
            onSubmit={handleSubmit}
            onCancel={handleCancelarForm}
            editando={!!editandoId}
            guardando={guardando}
          />
        )}

        {/* Lista de Citas */}
        {vistaModo === "lista" && (
          <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden'>
            <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-8 border-b border-gray-200'>
              <div className='flex items-center'>
                <div className='bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-3 mr-4'>
                  <span className='text-xl text-blue-600'>📋</span>
                </div>
                <h3 className='text-2xl font-bold text-gray-900'>
                  Lista de Citas ({citasFiltradas.length})
                </h3>
              </div>
            </div>

            {citasFiltradas.length === 0 ? (
              <div className='p-16 text-center'>
                <div className='bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6'>
                  <span className='text-4xl'>📅</span>
                </div>
                <h3 className='text-2xl font-bold text-gray-700 mb-3'>
                  No hay citas programadas
                </h3>
                <p className='text-gray-500 mb-8 text-lg'>
                  Comienza agendando la primera cita para organizar tu práctica
                  médica
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 
                    rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 
                    font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1'
                >
                  ➕ Crear Primera Cita
                </button>
              </div>
            ) : (
              <div className='p-8'>
                <div className='space-y-6'>
                  {citasFiltradas.map((cita) => (
                    <CitaCard
                      key={cita._id}
                      cita={cita}
                      onEditar={handleEditar}
                      onCambiarEstado={handleCambiarEstado}
                      onEliminar={handleEliminar}
                      abrirModalPagos={abrirModalPagos}
                      onCrearPlanPagos={crearPlanPagos}
                      onConfirmarPago={confirmarPago}
                      mostrandoPagos={mostrandoPagos}
                      setMostrandoPagos={setMostrandoPagos}
                      creandoPlan={creandoPlan}
                      setCreandoPlan={setCreandoPlan}
                      onEnviarRecordatorio={crearRecordatorioManual}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vista Calendario */}
        {vistaModo === "calendario" && (
          <CalendarioCitas citas={citasFiltradas} onEditarCita={handleEditar} />
        )}

        {/* Modal de gestión de pagos */}
        {modalPagosAbierto && citaSeleccionadaPagos && (
          <ModalGestionPagos
            cita={citaSeleccionadaPagos}
            onClose={() => {
              setModalPagosAbierto(false);
              setCitaSeleccionadaPagos(null);
            }}
            onCrearPlan={crearPlanPagos}
            onEditarPago={editarPago}
            onEliminarPago={eliminarPago}
            onConfirmarPago={confirmarPago}
            onImprimirRecibo={imprimirRecibo}
            onRecargar={cargarDatos}
          />
        )}
      </div>
    </div>
  );
}

// ✅ COMPONENTES DEFINIDOS DESPUÉS DEL COMPONENTE PRINCIPAL

// Componente Card de Cita
const CitaCard = ({
  cita,
  onEditar,
  onCambiarEstado,
  onEliminar,
  abrirModalPagos,
  onCrearPlanPagos,
  onConfirmarPago,
  mostrandoPagos,
  setMostrandoPagos,
  creandoPlan,
  setCreandoPlan,
  onEnviarRecordatorio,
}) => {
  const [mostrarAcciones, setMostrarAcciones] = useState(false);
  const accionesRef = useRef(null);

  // Estados locales para el plan de pagos
  const [planForm, setPlanForm] = useState({
    tipoPlan: "sesion",
    montoPorSesion: "",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accionesRef.current && !accionesRef.current.contains(event.target)) {
        setMostrarAcciones(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tienePagos = cita.pago && cita.pago.pagos && cita.pago.pagos.length > 0;

  return (
    <div className='bg-white rounded-2xl border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden'>
      <div className={`h-1.5 ${obtenerColorTipo(cita.tipoConsulta)}`}></div>

      <div className='p-6'>
        <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
          <div className='flex-1'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center space-x-4'>
                <div className='bg-gray-100 rounded-xl p-3'>
                  <span className='text-2xl'>
                    {obtenerIconoTipo(cita.tipoConsulta)}
                  </span>
                </div>
                <div>
                  <h4 className='text-xl font-bold text-gray-900 mb-1'>
                    {cita.pacienteId.nombre} {cita.pacienteId.apellido}
                  </h4>
                  <p className='text-gray-600 font-medium'>
                    {cita.tipoConsulta}
                  </p>
                </div>
              </div>
              <span
                className={`px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm ${obtenerColorEstado(
                  cita.estado
                )}`}
              >
                {cita.estado}
              </span>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              {[
                {
                  icono: "📅",
                  titulo: "Fecha",
                  valor: formatearFecha(cita.fecha),
                },
                {
                  icono: "🕐",
                  titulo: "Hora",
                  valor: formatearHora(cita.hora),
                },
                {
                  icono: "⏱️",
                  titulo: "Duración",
                  valor: `${cita.duracion || 60} min`,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className='flex items-center text-gray-600 bg-gray-50 rounded-xl p-3'
                >
                  <span className='mr-3 text-lg'>{item.icono}</span>
                  <div>
                    <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                      {item.titulo}
                    </p>
                    <p className='font-semibold'>{item.valor}</p>
                  </div>
                </div>
              ))}
            </div>

            {cita.motivo && (
              <div className='mb-4 bg-blue-50 rounded-xl p-3'>
                <p className='text-sm text-blue-800'>
                  <span className='font-semibold'>Motivo:</span> {cita.motivo}
                </p>
              </div>
            )}

            {/* Sección de pagos */}
            <div className='mb-4'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center space-x-2'>
                  <span className='text-lg'>💳</span>
                  <h5 className='font-semibold text-gray-800'>
                    Sistema de Pagos
                  </h5>
                  {tienePagos && (
                    <span className='bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium'>
                      {cita.pago.tipoPlan}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => abrirModalPagos(cita)}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all'
                >
                  💳 Gestionar Pagos
                </button>
              </div>

              {/* Estado de pagos resumido */}
              {tienePagos && (
                <div className='bg-gray-50 rounded-xl p-3 mb-3'>
                  <div className='grid grid-cols-3 gap-4 text-center'>
                    <div>
                      <p className='text-xs text-gray-500'>Total Pagos</p>
                      <p className='font-semibold'>{cita.pago.pagos.length}</p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>Pagados</p>
                      <p className='font-semibold text-green-600'>
                        {
                          cita.pago.pagos.filter((p) => p.estado === "pagado")
                            .length
                        }
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>Pendientes</p>
                      <p className='font-semibold text-orange-600'>
                        {
                          cita.pago.pagos.filter(
                            (p) => p.estado === "pendiente"
                          ).length
                        }
                      </p>
                    </div>
                  </div>

                  {/* Botón para mostrar/ocultar */}
                  <div className='mt-3 text-center'>
                    <button
                      onClick={() =>
                        setMostrandoPagos((prev) => ({
                          ...prev,
                          [cita._id]: !prev[cita._id],
                        }))
                      }
                      className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                    >
                      {mostrandoPagos[cita._id]
                        ? "🔼 Ocultar detalles"
                        : "🔽 Ver detalles"}
                    </button>
                  </div>
                </div>
              )}

              {/* Crear plan de pagos */}
              {!tienePagos && !creandoPlan[cita._id] && (
                <button
                  onClick={() =>
                    setCreandoPlan((prev) => ({
                      ...prev,
                      [cita._id]: true,
                    }))
                  }
                  className='w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-xl font-medium transition-all'
                >
                  💳 Crear Plan de Pagos
                </button>
              )}

              {/* Formulario para crear plan */}
              {!tienePagos && creandoPlan[cita._id] && (
                <div className='bg-blue-50 rounded-xl p-4 space-y-3'>
                  <div className='grid grid-cols-2 gap-3'>
                    <select
                      value={planForm.tipoPlan}
                      onChange={(e) =>
                        setPlanForm((prev) => ({
                          ...prev,
                          tipoPlan: e.target.value,
                        }))
                      }
                      className='px-3 py-2 border border-blue-200 rounded-lg text-sm'
                    >
                      <option value='sesion'>Por Sesión</option>
                      <option value='quincenal'>Quincenal</option>
                      <option value='mensual'>Mensual</option>
                    </select>

                    <input
                      type='number'
                      placeholder='Monto por sesión'
                      value={planForm.montoPorSesion}
                      onChange={(e) =>
                        setPlanForm((prev) => ({
                          ...prev,
                          montoPorSesion: e.target.value,
                        }))
                      }
                      className='px-3 py-2 border border-blue-200 rounded-lg text-sm'
                    />
                  </div>

                  <div className='flex gap-2'>
                    <button
                      onClick={() => {
                        onCrearPlanPagos(
                          cita._id,
                          planForm.tipoPlan,
                          parseFloat(planForm.montoPorSesion)
                        );
                        setCreandoPlan((prev) => ({
                          ...prev,
                          [cita._id]: false,
                        }));
                        setPlanForm({ tipoPlan: "sesion", montoPorSesion: "" });
                      }}
                      disabled={!planForm.montoPorSesion}
                      className='flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400'
                    >
                      Crear Plan
                    </button>
                    <button
                      onClick={() =>
                        setCreandoPlan((prev) => ({
                          ...prev,
                          [cita._id]: false,
                        }))
                      }
                      className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300'
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista detallada de pagos */}
              {tienePagos && mostrandoPagos[cita._id] && (
                <div className='space-y-3'>
                  {cita.pago.pagos.map((pago) => (
                    <div
                      key={pago.numeroPago}
                      className={`border rounded-xl p-4 ${
                        pago.estado === "pagado"
                          ? "border-green-200 bg-green-50"
                          : pago.estado === "vencido"
                          ? "border-red-200 bg-red-50"
                          : "border-orange-200 bg-orange-50"
                      }`}
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center space-x-3'>
                          <span className='bg-white rounded-lg px-3 py-1 font-semibold text-sm'>
                            Pago #{pago.numeroPago}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              pago.estado === "pagado"
                                ? "bg-green-100 text-green-700"
                                : pago.estado === "vencido"
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {pago.estado}
                          </span>
                        </div>
                        <span className='font-bold text-lg'>${pago.monto}</span>
                      </div>

                      <div className='grid grid-cols-2 gap-4 text-sm mb-3'>
                        <div>
                          <p className='text-gray-500'>Método</p>
                          <p className='font-medium'>{pago.metodoPago}</p>
                        </div>
                        <div>
                          <p className='text-gray-500'>Vence</p>
                          <p className='font-medium'>
                            {new Date(
                              pago.fechaVencimiento