import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import jsPDF from "jspdf";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

// ✅ NUEVA FUNCIÓN PARA OBTENER CITAS POR DÍA DE LA SEMANA

// ✅ COMPONENTE TARJETA PARA VISTA SEMANAL
const TarjetaCitaSemanal = ({
  cita,
  onEditar,
  onEliminar,
  onCambiarEstado,
}) => {
  const [mostrarAcciones, setMostrarAcciones] = useState(false);
  const accionesRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accionesRef.current && !accionesRef.current.contains(event.target)) {
        setMostrarAcciones(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-all hover:shadow-md transform hover:scale-105 ${
        cita.estado === "Completada"
          ? "bg-green-100 border-l-4 border-green-500"
          : cita.estado === "En curso"
          ? "bg-yellow-100 border-l-4 border-yellow-500"
          : "bg-blue-100 border-l-4 border-blue-500"
      }`}
      onClick={() => onEditar(cita)}
    >
      {/* INFORMACIÓN PRINCIPAL */}
      <div className='mb-2'>
        <div className='font-bold text-lg text-gray-900 mb-1'>{cita.hora}</div>

        <div className='font-semibold text-sm text-gray-800 mb-1'>
          {cita.pacienteId.nombre} {cita.pacienteId.apellido}
        </div>

        <div className='flex items-center text-xs text-gray-600 mb-2'>
          <span className='mr-1'>{obtenerIconoTipo(cita.tipoConsulta)}</span>
          <span>{cita.tipoConsulta}</span>
        </div>
      </div>

      {/* FECHA ESPECÍFICA */}
      <div className='text-xs text-gray-500 mb-2'>
        📅 {formatearFecha(cita.fecha)}
      </div>

      {/* DURACIÓN Y ESTADO */}
      <div className='flex items-center justify-between mb-2'>
        <div className='text-xs text-gray-500'>
          ⏱️ {cita.duracion || 60} min
        </div>

        <div
          className={`text-xs px-2 py-1 rounded font-bold text-center ${
            cita.estado === "Completada"
              ? "bg-green-200 text-green-800"
              : cita.estado === "En curso"
              ? "bg-yellow-200 text-yellow-800"
              : "bg-blue-200 text-blue-800"
          }`}
        >
          {cita.estado}
        </div>
      </div>

      {/* INFORMACIÓN DE CONTACTO */}
      {cita.pacienteId.telefono && (
        <div className='text-xs text-gray-500 mb-2 truncate'>
          📱 {cita.pacienteId.telefono}
        </div>
      )}

      {/* INFORMACIÓN DE PAGOS */}
      {cita.pago?.pagos && (
        <div className='text-xs text-gray-500 mb-2'>
          💳 {cita.pago.pagos.filter((p) => p.estado === "pagado").length}/
          {cita.pago.pagos.length} pagados
        </div>
      )}

      {/* ACCIONES RÁPIDAS */}
      <div className='flex gap-1 mt-2'>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditar(cita);
          }}
          className='flex-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 py-1 rounded transition-all'
          title='Editar cita'
        >
          ✏️ Editar
        </button>

        <div className='relative' ref={accionesRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMostrarAcciones(!mostrarAcciones);
            }}
            className='text-xs text-green-600 hover:text-green-800 hover:bg-green-100 px-2 py-1 rounded transition-all'
            title='Cambiar estado'
          >
            ✅
          </button>

          {mostrarAcciones && (
            <div className='absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10 min-w-32'>
              {["Programada", "En curso", "Completada"].map((estado) => (
                <button
                  key={estado}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCambiarEstado(cita._id, estado);
                    setMostrarAcciones(false);
                  }}
                  className='w-full text-left px-3 py-2 hover:bg-gray-50 text-xs font-medium transition-all first:rounded-t-lg last:rounded-b-lg'
                >
                  {estado}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEliminar(cita._id);
          }}
          className='text-xs text-red-600 hover:text-red-800 hover:bg-red-100 px-2 py-1 rounded transition-all'
          title='Eliminar cita'
        >
          🗑️
        </button>
      </div>
    </div>
  );
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

  const citasDeHoy = useMemo(() => {
    const hoy = obtenerFechaHoy();
    return citas
      .filter((cita) => {
        if (!cita || !cita.pacienteId) return false;
        const fechaCita = cita.fecha.includes("T")
          ? cita.fecha.split("T")[0]
          : cita.fecha;
        return fechaCita === hoy;
      })
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [citas]);

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
  const [filtroPaciente, setFiltroPaciente] = useState(""); // Vacío = todos los pacientes
  const [vistaModo, setVistaModo] = useState("lista");
  const [vistaCompleta, setVistaCompleta] = useState(false);

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

  // ✅ COMPONENTE PANEL NOTIFICACIONES RESPONSIVE
  const PanelNotificaciones = () => (
    <div className='fixed top-4 right-4 z-50'>
      {/* Botón de notificaciones */}
      <button
        onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
        className='relative bg-white rounded-full p-3 sm:p-4 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-200 transform hover:scale-105'
      >
        <span className='text-xl sm:text-2xl'>🔔</span>
        {notificacionesNoLeidas > 0 && (
          <span className='absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center font-bold animate-pulse'>
            {notificacionesNoLeidas}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {mostrarNotificaciones && (
        <div className='absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-80 sm:max-h-96 overflow-y-auto'>
          <div className='p-3 sm:p-4 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <h3 className='text-base sm:text-lg font-bold text-gray-900'>
                Notificaciones
              </h3>
              <button
                onClick={() => setMostrarNotificaciones(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                ✕
              </button>
            </div>
          </div>

          <div className='max-h-64 sm:max-h-80 overflow-y-auto'>
            {notificaciones.length === 0 ? (
              <div className='p-6 sm:p-8 text-center text-gray-500'>
                <span className='text-3xl sm:text-4xl block mb-2'>🔔</span>
                <p className='text-sm sm:text-base'>No hay notificaciones</p>
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 transition-all ${
                    !notif.leido
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className='flex items-start space-x-2 sm:space-x-3'>
                    <div
                      className={`${notif.color} rounded-full p-1.5 sm:p-2 text-white flex-shrink-0`}
                    >
                      <span className='text-xs sm:text-sm'>{notif.icono}</span>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <p className='font-semibold text-xs sm:text-sm text-gray-900 truncate'>
                          {notif.titulo}
                        </p>
                        <button
                          onClick={() => eliminarNotificacion(notif.id)}
                          className='text-gray-400 hover:text-red-500 text-xs ml-2 flex-shrink-0'
                        >
                          ✕
                        </button>
                      </div>
                      <p className='text-xs sm:text-sm text-gray-600 mt-1'>
                        {notif.mensaje}
                      </p>
                      <p className='text-xs text-gray-500 mt-1 truncate'>
                        {notif.detalle}
                      </p>
                      {!notif.leido && (
                        <button
                          onClick={() => marcarComoLeido(notif.id)}
                          className='text-xs text-blue-600 hover:text-blue-800 mt-2'
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
    // ✅ VALIDAR QUE LA CITA EXISTA Y TENGA LOS DATOS NECESARIOS
    if (!cita || !cita.pacienteId) {
      console.warn("⚠️ Cita sin datos de paciente encontrada:", cita);
      return false;
    }

    const cumpleFiltroEstado =
      filtroEstado === "Todas" || cita.estado === filtroEstado;

    const cumpleFiltroFecha =
      !filtroFecha ||
      (cita.fecha && cita.fecha.includes("T")
        ? cita.fecha.split("T")[0]
        : cita.fecha) === filtroFecha;

    // ✅ VALIDAR QUE pacienteId EXISTA Y TENGA _id
    const cumpleFiltroPaciente =
      !filtroPaciente ||
      (cita.pacienteId && cita.pacienteId._id === filtroPaciente);

    const cumpleFiltroPagos =
      filtroPagos === "todos" ||
      (filtroPagos === "con-pagos-pendientes" &&
        cita.pago?.pagos?.some((p) => p && p.estado === "pendiente")) ||
      (filtroPagos === "sin-pagos" && !cita.pago?.pagos?.length);

    return (
      cumpleFiltroEstado &&
      cumpleFiltroFecha &&
      cumpleFiltroPaciente &&
      cumpleFiltroPagos
    );
  });

  const obtenerCitasPorDiaSemana = (indiceDia) => {
    return citasFiltradas
      .filter((cita) => {
        if (!cita || !cita.pacienteId) return false;

        // ✅ CREAR FECHA CORRECTAMENTE PARA EVITAR PROBLEMAS DE ZONA HORARIA
        const fechaStr = cita.fecha.includes("T")
          ? cita.fecha.split("T")[0]
          : cita.fecha;
        const [año, mes, dia] = fechaStr.split("-");
        const fechaCita = new Date(
          parseInt(año),
          parseInt(mes) - 1,
          parseInt(dia)
        );

        // ✅ MAPEO CORRECTO DE DÍAS:
        const diaSemanaJS = fechaCita.getDay(); // 0=Domingo, 1=Lunes, 2=Martes, etc.

        let diaCorrespondiente;
        if (diaSemanaJS === 0) {
          // Domingo
          diaCorrespondiente = 6; // Posición 6 en nuestro array
        } else {
          // Lunes=1 -> 0, Martes=2 -> 1, etc.
          diaCorrespondiente = diaSemanaJS - 1;
        }

        return diaCorrespondiente === indiceDia;
      })
      .sort((a, b) => {
        const fechaComparacion = a.fecha.localeCompare(b.fecha);
        if (fechaComparacion !== 0) return fechaComparacion;
        return a.hora.localeCompare(b.hora);
      });
  };

  if (cargando) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='relative'>
            <div className='w-16 h-16 sm:w-20 sm:h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-xl sm:text-2xl'>📅</span>
            </div>
          </div>
          <p className='text-lg sm:text-xl text-gray-600 font-medium'>
            Cargando citas...
          </p>
          <p className='text-xs sm:text-sm text-gray-500 mt-2'>
            Preparando tu agenda médica
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      <PanelNotificaciones />
      <div className='max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8'>
        {/* Header */}
        <div className='bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-4 sm:p-8 mb-6 sm:mb-8'>
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div className='flex items-center'>
                <button
                  onClick={() => navigate(-1)}
                  className='mr-4 sm:mr-6 p-2 sm:p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-all duration-200 group'
                >
                  <span className='group-hover:-translate-x-1 transition-transform duration-200'>
                    ←
                  </span>{" "}
                  <span className='hidden sm:inline'>Volver</span>
                </button>
                <div className='flex items-center'>
                  <div className='bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl p-2 sm:p-4 mr-3 sm:mr-6 shadow-lg'>
                    <span className='text-xl sm:text-3xl text-white'>📅</span>
                  </div>
                  <div>
                    <h1 className='text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2'>
                      Gestión de Citas
                    </h1>
                    <p className='text-sm sm:text-lg text-gray-600'>
                      Administración completa de citas y agenda médica
                    </p>
                  </div>
                </div>
              </div>

              <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
                <div className='flex bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 shadow-lg border border-white/30'>
                  <button
                    onClick={() => setVistaModo("lista")}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 font-medium text-sm sm:text-base ${
                      vistaModo === "lista"
                        ? "bg-white text-blue-600 shadow-lg transform scale-105"
                        : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                    }`}
                  >
                    <span className='sm:hidden'>📋</span>
                    <span className='hidden sm:inline'>📋 Lista</span>
                  </button>
                  <button
                    onClick={() => setVistaModo("calendario")}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 font-medium text-sm sm:text-base ${
                      vistaModo === "calendario"
                        ? "bg-white text-blue-600 shadow-lg transform scale-105"
                        : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                    }`}
                  >
                    <span className='sm:hidden'>📅</span>
                    <span className='hidden sm:inline'>📅 Calendario</span>
                  </button>
                </div>

                <button
                  onClick={configurarNumeroDoctor}
                  className='bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-xl 
        font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-center space-x-2'
                  title='Configurar número de WhatsApp'
                >
                  <span>⚙️</span>
                  <span className='hidden sm:inline'>Config WhatsApp</span>
                  <span className='sm:hidden'>Config</span>
                </button>

                <button
                  onClick={() => setShowForm(true)}
                  className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-8 py-3 sm:py-4 
                    rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 
                    font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1
                    flex items-center justify-center gap-2 sm:gap-3 min-w-fit text-sm sm:text-base'
                >
                  <span className='text-lg sm:text-xl'>➕</span>
                  <span>Nueva Cita</span>
                </button>
                <button
                  onClick={() => setVistaCompleta(!vistaCompleta)}
                  className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2 ${
                    vistaCompleta
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-white text-green-600 border-2 border-green-600 hover:bg-green-50"
                  }`}
                >
                  <span className='text-lg sm:text-xl'>📅</span>
                  <span>
                    {vistaCompleta ? "Ocultar" : "Mostrar"} Agenda Semanal (
                    {citasFiltradas.length})
                  </span>
                </button>
              </div>
            </div>

            {/* Estadísticas */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6'>
              <div className='bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-blue-100 text-xs sm:text-sm font-medium mb-1'>
                      Citas Hoy
                    </p>
                    <p className='text-xl sm:text-3xl font-bold'>
                      {estadisticas.citasHoy || 0}
                    </p>
                    <p className='text-blue-200 text-xs mt-1 hidden sm:block'>
                      Agenda de hoy
                    </p>
                  </div>
                  <div className='bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3'>
                    <span className='text-lg sm:text-2xl'>📅</span>
                  </div>
                </div>
              </div>

              <div className='bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-emerald-100 text-xs sm:text-sm font-medium mb-1'>
                      Este Mes
                    </p>
                    <p className='text-xl sm:text-3xl font-bold'>
                      {estadisticas.citasDelMes || 0}
                    </p>
                    <p className='text-emerald-200 text-xs mt-1 hidden sm:block'>
                      Citas mensuales
                    </p>
                  </div>
                  <div className='bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3'>
                    <span className='text-lg sm:text-2xl'>📊</span>
                  </div>
                </div>
              </div>

              <div className='bg-gradient-to-br from-purple-500 to-purple-600 text-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-purple-100 text-xs sm:text-sm font-medium mb-1'>
                      Total Citas
                    </p>
                    <p className='text-xl sm:text-3xl font-bold'>
                      {estadisticas.totalCitas || 0}
                    </p>
                    <p className='text-purple-200 text-xs mt-1 hidden sm:block'>
                      Historial completo
                    </p>
                  </div>
                  <div className='bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3'>
                    <span className='text-lg sm:text-2xl'>👥</span>
                  </div>
                </div>
              </div>

              <div className='bg-gradient-to-br from-orange-500 to-orange-600 text-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-orange-100 text-xs sm:text-sm font-medium mb-1'>
                      Pacientes
                    </p>
                    <p className='text-xl sm:text-3xl font-bold'>
                      {pacientes.length}
                    </p>
                    <p className='text-orange-200 text-xs mt-1 hidden sm:block'>
                      Activos totales
                    </p>
                  </div>
                  <div className='bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3'>
                    <span className='text-lg sm:text-2xl'>👤</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <EstadisticasPagos citas={citas} />

        {vistaCompleta && (
          <div className='bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 overflow-hidden'>
            {/* Header Mejorado */}
            <div className='bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 sm:p-8'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3 sm:space-x-4'>
                  <div className='bg-white/20 rounded-xl sm:rounded-2xl p-2 sm:p-3'>
                    <span className='text-lg sm:text-2xl'>📅</span>
                  </div>
                  <div>
                    <h3 className='text-2xl sm:text-3xl font-bold'>
                      Agenda Semanal Global
                    </h3>
                    <p className='text-green-100 mt-1 text-sm sm:text-base'>
                      Todos los pacientes organizados por día -{" "}
                      {citasFiltradas.length} citas totales
                    </p>
                  </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className='text-right'>
                  <div className='text-3xl sm:text-4xl font-bold'>
                    {citasFiltradas.length}
                  </div>
                  <div className='text-green-100 text-sm'>Total Citas</div>
                  <div className='text-green-200 text-xs mt-1'>
                    {
                      citasFiltradas.filter((c) => c.estado === "Programada")
                        .length
                    }{" "}
                    programadas
                  </div>
                </div>
              </div>
            </div>

            {/* Vista Semanal Mejorada */}
            <div className='p-4 sm:p-8'>
              {citasFiltradas.length === 0 ? (
                <div className='text-center py-8 sm:py-12'>
                  <div className='bg-gray-100 rounded-full w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 sm:mb-6'>
                    <span className='text-2xl sm:text-4xl'>📅</span>
                  </div>
                  <h3 className='text-xl sm:text-2xl font-bold text-gray-700 mb-2 sm:mb-3'>
                    Comienza tu agenda semanal
                  </h3>
                  <p className='text-gray-500 mb-6 sm:mb-8 text-sm sm:text-lg'>
                    Agrega citas para cualquier día de la semana y organiza
                    mejor tu práctica médica.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all'
                  >
                    ➕ Agregar Primera Cita
                  </button>
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  {/* GRID DE DÍAS DE LA SEMANA */}
                  <div className='grid grid-cols-1 md:grid-cols-7 gap-4 min-w-full'>
                    {[
                      "Lunes",
                      "Martes",
                      "Miércoles",
                      "Jueves",
                      "Viernes",
                      "Sábado",
                      "Domingo",
                    ].map((dia, index) => {
                      const citasDelDia = obtenerCitasPorDiaSemana(index);

                      return (
                        <div
                          key={dia}
                          className='bg-gray-50 rounded-xl border border-gray-200 min-h-96'
                        >
                          {/* HEADER DEL DÍA */}
                          <div
                            className={`p-4 rounded-t-xl font-bold text-center text-white ${
                              index === 5 || index === 6
                                ? "bg-orange-500" // Fines de semana
                                : "bg-blue-600" // Días laborales
                            }`}
                          >
                            <h4 className='text-lg'>{dia}</h4>
                            <span className='text-sm opacity-90'>
                              {citasDelDia.length} cita
                              {citasDelDia.length !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* CITAS DEL DÍA */}
                          <div className='p-3 space-y-3 max-h-80 overflow-y-auto'>
                            {citasDelDia.length === 0 ? (
                              <div className='text-center py-8 text-gray-500'>
                                <span className='text-4xl block mb-3'>📋</span>
                                <p className='text-sm mb-4'>
                                  Sin citas programadas
                                </p>
                                <button
                                  onClick={() => setShowForm(true)}
                                  className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105'
                                >
                                  ➕ Agregar Cita
                                </button>
                              </div>
                            ) : (
                              <>
                                {citasDelDia.map((cita) => (
                                  <TarjetaCitaSemanal
                                    key={cita._id}
                                    cita={cita}
                                    onEditar={handleEditar}
                                    onEliminar={handleEliminar}
                                    onCambiarEstado={handleCambiarEstado}
                                  />
                                ))}

                                {/* BOTÓN AGREGAR MÁS */}
                                <button
                                  onClick={() => setShowForm(true)}
                                  className='w-full bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-600 hover:text-blue-600 py-3 rounded-xl text-sm font-medium transition-all'
                                >
                                  ➕ Agregar Otra Cita
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* LEYENDA MEJORADA */}
                  <div className='mt-6 p-4 bg-gray-50 rounded-xl'>
                    <h5 className='font-bold text-gray-800 mb-3'>
                      Leyenda y Acciones:
                    </h5>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm'>
                      <div className='flex items-center'>
                        <div className='w-4 h-4 bg-blue-500 rounded mr-2'></div>
                        <span>Programada</span>
                      </div>
                      <div className='flex items-center'>
                        <div className='w-4 h-4 bg-yellow-500 rounded mr-2'></div>
                        <span>En curso</span>
                      </div>
                      <div className='flex items-center'>
                        <div className='w-4 h-4 bg-green-500 rounded mr-2'></div>
                        <span>Completada</span>
                      </div>
                      <div className='flex items-center'>
                        <div className='w-4 h-4 bg-orange-500 rounded mr-2'></div>
                        <span>Fin de semana</span>
                      </div>
                    </div>

                    <div className='mt-3 text-xs text-gray-600 space-y-1'>
                      <p>
                        💡 <strong>Click directo:</strong> ✏️ Editar | ✅
                        Cambiar estado | 🗑️ Eliminar
                      </p>
                      <p>
                        📱 <strong>Responsive:</strong> Se adapta
                        automáticamente a móvil, tablet y desktop
                      </p>
                      <p>
                        🔄 <strong>Filtros activos:</strong> Usa los filtros
                        superiores para ver citas específicas
                      </p>
                    </div>
                  </div>

                  {/* ACCIONES GLOBALES */}
                  <div className='mt-6 flex flex-wrap gap-3 justify-center'>
                    <button
                      onClick={() => setShowForm(true)}
                      className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2'
                    >
                      <span>➕</span>
                      <span>Nueva Cita</span>
                    </button>

                    <button
                      onClick={() => {
                        setFiltroEstado("Todas");
                        setFiltroFecha("");
                        setFiltroPaciente("");
                        setFiltroPagos("todos");
                      }}
                      className='bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2'
                    >
                      <span>🔄</span>
                      <span>Limpiar Filtros</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className='bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2'
                    >
                      <span>🖨️</span>
                      <span>Imprimir Agenda</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Error Alert */}
        {error && (
          <div className='bg-red-50 border-l-4 border-red-400 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center shadow-lg'>
            <div className='bg-red-100 rounded-full p-2 mr-0 sm:mr-4 mb-2 sm:mb-0'>
              <span className='text-lg sm:text-xl'>⚠️</span>
            </div>
            <div className='flex-1'>
              <p className='font-medium text-sm sm:text-base'>Error</p>
              <p className='text-xs sm:text-sm'>{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className='mt-2 sm:mt-0 ml-0 sm:ml-4 text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 rounded-full p-2 transition-all'
            >
              ✕
            </button>
          </div>
        )}

        {/* Success Alert */}
        {mensaje && (
          <div className='bg-green-50 border-l-4 border-green-400 text-green-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center shadow-lg'>
            <div className='bg-green-100 rounded-full p-2 mr-0 sm:mr-4 mb-2 sm:mb-0'>
              <span className='text-lg sm:text-xl'>✅</span>
            </div>
            <div className='flex-1'>
              <p className='font-medium text-sm sm:text-base'>Éxito</p>
              <p className='text-xs sm:text-sm'>{mensaje}</p>
            </div>
            <button
              onClick={() => setMensaje("")}
              className='mt-2 sm:mt-0 ml-0 sm:ml-4 text-green-500 hover:text-green-700 bg-green-100 hover:bg-green-200 rounded-full p-2 transition-all'
            >
              ✕
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className='bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-4 sm:p-8 mb-6 sm:mb-8'>
          <div className='flex items-center mb-4 sm:mb-6'>
            <div className='bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-3 mr-3 sm:mr-4'>
              <span className='text-lg sm:text-xl'>🔍</span>
            </div>
            <h3 className='text-xl sm:text-2xl font-bold text-gray-900'>
              Filtros
            </h3>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6'>
            <div>
              <label className='block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
                Estado de la cita
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className='w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-sm sm:text-base'
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
              <label className='block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
                Fecha específica
              </label>
              <input
                type='date'
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className='w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-sm sm:text-base'
              />
            </div>
            // Después del filtro de "Fecha específica", AGREGAR:
            <div>
              <label className='block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
                Filtrar por paciente
              </label>
              <select
                value={filtroPaciente}
                onChange={(e) => setFiltroPaciente(e.target.value)}
                className='w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-sm sm:text-base'
              >
                <option value=''>Todos los pacientes</option>
                {pacientes.map((paciente) => (
                  <option key={paciente._id} value={paciente._id}>
                    {paciente.nombre} {paciente.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
                Filtrar por pagos
              </label>
              <select
                value={filtroPagos}
                onChange={(e) => setFiltroPagos(e.target.value)}
                className='w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-sm sm:text-base'
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
                className='w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl 
                  font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm sm:text-base'
              >
                🔄 <span className='hidden sm:inline'>Limpiar filtros</span>
                <span className='sm:hidden'>Limpiar</span>
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
          <div className='bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 overflow-hidden'>
            <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-8 border-b border-gray-200'>
              <div className='flex items-center'>
                <div className='bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg sm:rounded-xl p-2 sm:p-3 mr-3 sm:mr-4'>
                  <span className='text-lg sm:text-xl text-blue-600'>📋</span>
                </div>
                <h3 className='text-xl sm:text-2xl font-bold text-gray-900'>
                  Lista de Citas ({citasFiltradas.length})
                </h3>
              </div>
            </div>

            {citasFiltradas.length === 0 ? (
              <div className='p-8 sm:p-16 text-center'>
                <div className='bg-gray-100 rounded-full w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 sm:mb-6'>
                  <span className='text-2xl sm:text-4xl'>📅</span>
                </div>
                <h3 className='text-xl sm:text-2xl font-bold text-gray-700 mb-2 sm:mb-3'>
                  No hay citas programadas
                </h3>
                <p className='text-gray-500 mb-6 sm:mb-8 text-sm sm:text-lg'>
                  Comienza agendando la primera cita para organizar tu práctica
                  médica
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 
                    rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 
                    font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-sm sm:text-base'
                >
                  ➕ Crear Primera Cita
                </button>
              </div>
            ) : (
              <div className='p-4 sm:p-8'>
                <div className='space-y-4 sm:space-y-6'>
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

// Componente Card de Cita - RESPONSIVE
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
    <div className='bg-white rounded-xl sm:rounded-2xl border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden'>
      <div
        className={`h-1 sm:h-1.5 ${obtenerColorTipo(cita.tipoConsulta)}`}
      ></div>

      <div className='p-4 sm:p-6'>
        <div className='flex flex-col gap-4 sm:gap-6'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div className='flex-1'>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3'>
                <div className='flex items-center space-x-3 sm:space-x-4'>
                  <div className='bg-gray-100 rounded-lg sm:rounded-xl p-2 sm:p-3 flex-shrink-0'>
                    <span className='text-lg sm:text-2xl'>
                      {obtenerIconoTipo(cita.tipoConsulta)}
                    </span>
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h4 className='text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate'>
                      {cita.pacienteId.nombre} {cita.pacienteId.apellido}
                    </h4>
                    <p className='text-gray-600 font-medium text-sm sm:text-base'>
                      {cita.tipoConsulta}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold border shadow-sm flex-shrink-0 ${obtenerColorEstado(
                    cita.estado
                  )}`}
                >
                  {cita.estado}
                </span>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4'>
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
                    className='flex items-center text-gray-600 bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3'
                  >
                    <span className='mr-2 sm:mr-3 text-base sm:text-lg'>
                      {item.icono}
                    </span>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                        {item.titulo}
                      </p>
                      <p className='font-semibold text-sm sm:text-base truncate'>
                        {item.valor}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {cita.motivo && (
                <div className='mb-4 bg-blue-50 rounded-lg sm:rounded-xl p-3'>
                  <p className='text-xs sm:text-sm text-blue-800'>
                    <span className='font-semibold'>Motivo:</span> {cita.motivo}
                  </p>
                </div>
              )}

              {/* Sección de pagos */}
              <div className='mb-4'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2'>
                  <div className='flex items-center space-x-2'>
                    <span className='text-base sm:text-lg'>💳</span>
                    <h5 className='font-semibold text-gray-800 text-sm sm:text-base'>
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
                    className='bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all w-full sm:w-auto'
                  >
                    💳 Gestionar Pagos
                  </button>
                </div>

                {/* Estado de pagos resumido */}
                {tienePagos && (
                  <div className='bg-gray-50 rounded-lg sm:rounded-xl p-3 mb-3'>
                    <div className='grid grid-cols-3 gap-2 sm:gap-4 text-center'>
                      <div>
                        <p className='text-xs text-gray-500'>Total Pagos</p>
                        <p className='font-semibold text-sm sm:text-base'>
                          {cita.pago.pagos.length}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500'>Pagados</p>
                        <p className='font-semibold text-green-600 text-sm sm:text-base'>
                          {
                            cita.pago.pagos.filter((p) => p.estado === "pagado")
                              .length
                          }
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500'>Pendientes</p>
                        <p className='font-semibold text-orange-600 text-sm sm:text-base'>
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
                        className='text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium'
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
                    className='w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all text-sm sm:text-base'
                  >
                    💳 Crear Plan de Pagos
                  </button>
                )}

                {/* Formulario para crear plan */}
                {!tienePagos && creandoPlan[cita._id] && (
                  <div className='bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-3'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      <select
                        value={planForm.tipoPlan}
                        onChange={(e) =>
                          setPlanForm((prev) => ({
                            ...prev,
                            tipoPlan: e.target.value,
                          }))
                        }
                        className='px-3 py-2 border border-blue-200 rounded-lg text-xs sm:text-sm'
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
                        className='px-3 py-2 border border-blue-200 rounded-lg text-xs sm:text-sm'
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
                          setPlanForm({
                            tipoPlan: "sesion",
                            montoPorSesion: "",
                          });
                        }}
                        disabled={!planForm.montoPorSesion}
                        className='flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400'
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
                        className='px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm hover:bg-gray-300'
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
                        className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 ${
                          pago.estado === "pagado"
                            ? "border-green-200 bg-green-50"
                            : pago.estado === "vencido"
                            ? "border-red-200 bg-red-50"
                            : "border-orange-200 bg-orange-50"
                        }`}
                      >
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2'>
                          <div className='flex items-center space-x-2 sm:space-x-3'>
                            <span className='bg-white rounded-lg px-2 sm:px-3 py-1 font-semibold text-xs sm:text-sm'>
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
                          <span className='font-bold text-base sm:text-lg'>
                            ${pago.monto}
                          </span>
                        </div>

                        <div className='grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mb-3'>
                          <div>
                            <p className='text-gray-500'>Método</p>
                            <p className='font-medium'>{pago.metodoPago}</p>
                          </div>
                          <div>
                            <p className='text-gray-500'>Vence</p>
                            <p className='font-medium'>
                              {new Date(
                                pago.fechaVencimiento
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {pago.estado === "pendiente" && (
                          <div className='flex flex-col sm:flex-row gap-2'>
                            <button
                              onClick={() =>
                                onConfirmarPago(
                                  cita._id,
                                  pago.numeroPago,
                                  "efectivo"
                                )
                              }
                              className='flex-1 bg-green-600 text-white py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-700'
                            >
                              💰 Confirmar Efectivo
                            </button>
                            <button
                              onClick={() =>
                                onConfirmarPago(
                                  cita._id,
                                  pago.numeroPago,
                                  "transferencia"
                                )
                              }
                              className='flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700'
                            >
                              🏦 Confirmar Transferencia
                            </button>
                          </div>
                        )}

                        {pago.estado === "pagado" && pago.fechaPago && (
                          <div className='bg-green-100 rounded-lg p-2 text-xs sm:text-sm'>
                            <p className='text-green-700'>
                              ✅ Pagado el{" "}
                              {new Date(pago.fechaPago).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className='flex flex-row sm:flex-col gap-2 sm:gap-3 justify-start sm:items-end overflow-x-auto sm:overflow-x-visible'>
              <div className='relative flex-shrink-0' ref={accionesRef}>
                <button
                  onClick={() => setMostrarAcciones(!mostrarAcciones)}
                  className='bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl 
                    font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md whitespace-nowrap'
                >
                  <span>✅</span>
                  <span>Estado</span>
                </button>

                {mostrarAcciones && (
                  <div className='absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-48 overflow-hidden'>
                    {["Programada", "En curso", "Completada"].map((estado) => (
                      <button
                        key={estado}
                        onClick={() => {
                          onCambiarEstado(cita._id, estado);
                          setMostrarAcciones(false);
                        }}
                        className='w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium transition-all first:rounded-t-xl last:rounded-b-xl'
                      >
                        {estado}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => onEditar(cita)}
                className='bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl 
                  font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md whitespace-nowrap flex-shrink-0'
              >
                <span>✏️</span>
                <span>Editar</span>
              </button>

              <button
                onClick={() => onEnviarRecordatorio(cita)}
                className='bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl 
        font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md whitespace-nowrap flex-shrink-0'
                title='Crear recordatorio interno'
              >
                <span>🔔</span>
                <span className='hidden sm:inline'>Recordatorio</span>
                <span className='sm:hidden'>Rec</span>
              </button>

              <button
                onClick={() => onEliminar(cita._id)}
                className='bg-red-100 text-red-700 hover:bg-red-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl 
                  font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0'
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Modal de Formulario - RESPONSIVE
const CitaFormModal = ({
  formData,
  setFormData,
  pacientes,
  citas,
  editandoId,
  onSubmit,
  onCancel,
  editando,
  guardando,
}) => {
  // Horarios expandidos de 09:00 a 21:00 cada 30 minutos
  const horariosDisponibles = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
  ];

  const duracionesDisponibles = [
    { value: "15", label: "15 minutos" },
    { value: "30", label: "30 minutos" },
    { value: "45", label: "45 minutos" },
    { value: "60", label: "1 hora" },
    { value: "90", label: "1 hora 30 min" },
    { value: "120", label: "2 horas" },
    { value: "180", label: "3 horas" },
  ];

  const tiposConsulta = [
    "Consulta inicial",
    "Control",
    "Tratamiento",
    "Seguimiento",
    "Urgencia",
  ];

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4'>
      <div className='bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-white/20'>
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-8 rounded-t-2xl sm:rounded-t-3xl'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3 sm:space-x-4'>
              <div className='bg-white/20 rounded-xl sm:rounded-2xl p-2 sm:p-3'>
                <span className='text-lg sm:text-2xl'>
                  {editando ? "✏️" : "📅"}
                </span>
              </div>
              <div>
                <h3 className='text-2xl sm:text-3xl font-bold'>
                  {editando ? "Editar Cita" : "Nueva Cita"}
                </h3>
                <p className='text-blue-100 mt-1 text-sm sm:text-base'>
                  {editando
                    ? "Modifica los datos de la cita"
                    : "Programa una nueva cita médica"}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className='text-white hover:bg-white/20 rounded-xl sm:rounded-2xl p-2 sm:p-3 transition-all duration-200'
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className='p-4 sm:p-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8'>
            {/* Paciente */}
            <div className='lg:col-span-2'>
              <label className='block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 flex items-center'>
                <span className='bg-blue-100 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3'>
                  👤
                </span>
                <span className='text-sm sm:text-base'>Paciente</span>
              </label>
              <select
                value={formData.pacienteId}
                onChange={(e) =>
                  setFormData({ ...formData, pacienteId: e.target.value })
                }
                required
                className='w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-gray-800 font-medium text-sm sm:text-base'
              >
                <option value=''>Seleccionar paciente</option>
                {pacientes.map((paciente) => (
                  <option key={paciente._id} value={paciente._id}>
                    {paciente.nombre} {paciente.apellido} - DNI: {paciente.dni}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className='block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 flex items-center'>
                <span className='bg-green-100 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3'>
                  📅
                </span>
                <span className='text-sm sm:text-base'>Fecha</span>
              </label>
              <input
                type='date'
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
                required
                min={obtenerFechaHoy()}
                className='w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-sm sm:text-base'
              />
            </div>

            {/* Hora */}
            <div>
              <label className='block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 flex items-center'>
                <span className='bg-orange-100 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3'>
                  🕐
                </span>
                <span className='text-sm sm:text-base'>Hora</span>
              </label>
              <select
                value={formData.hora}
                onChange={(e) =>
                  setFormData({ ...formData, hora: e.target.value })
                }
                required
                className='w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-sm sm:text-base'
              >
                <option value=''>Seleccionar hora</option>
                {horariosDisponibles.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>
            </div>

            {/* Duración */}
            <div>
              <label className='block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 flex items-center'>
                <span className='bg-purple-100 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3'>
                  ⏱️
                </span>
                <span className='text-sm sm:text-base'>Duración</span>
              </label>
              <select
                value={formData.duracion}
                onChange={(e) =>
                  setFormData({ ...formData, duracion: e.target.value })
                }
                required
                className='w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-sm sm:text-base'
              >
                {duracionesDisponibles.map((duracion) => (
                  <option key={duracion.value} value={duracion.value}>
                    {duracion.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de consulta */}
            <div>
              <label className='block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 flex items-center'>
                <span className='bg-red-100 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3'>
                  🩺
                </span>
                <span className='text-sm sm:text-base'>Tipo de consulta</span>
              </label>
              <select
                value={formData.tipoConsulta}
                onChange={(e) =>
                  setFormData({ ...formData, tipoConsulta: e.target.value })
                }
                required
                className='w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-sm sm:text-base'
              >
                <option value=''>Seleccionar tipo</option>
                {tiposConsulta.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {obtenerIconoTipo(tipo)} {tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* Motivo */}
            <div className='lg:col-span-2'>
              <label className='block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 flex items-center'>
                <span className='bg-indigo-100 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3'>
                  📝
                </span>
                <span className='text-sm sm:text-base'>
                  Motivo de la consulta
                </span>
              </label>
              <textarea
                value={formData.motivo}
                onChange={(e) =>
                  setFormData({ ...formData, motivo: e.target.value })
                }
                placeholder='Describe el motivo de la consulta...'
                rows='3'
                className='w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none bg-white text-sm sm:text-base'
              />
            </div>

            {/* Observaciones */}
            <div className='lg:col-span-2'>
              <label className='block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 flex items-center'>
                <span className='bg-gray-100 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3'>
                  📋
                </span>
                <span className='text-sm sm:text-base'>
                  Observaciones adicionales
                </span>
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) =>
                  setFormData({ ...formData, observaciones: e.target.value })
                }
                placeholder='Observaciones, instrucciones especiales, recordatorios...'
                rows='3'
                className='w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none bg-white text-sm sm:text-base'
              />
            </div>
          </div>

          {/* Botones */}
          <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-10'>
            <button
              type='button'
              onClick={onCancel}
              className='px-6 sm:px-8 py-3 sm:py-4 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl sm:rounded-2xl 
                transition-all duration-200 font-semibold text-sm sm:text-base'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={guardando}
              className={`px-8 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-200 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 text-sm sm:text-base ${
                guardando
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
              }`}
            >
              {guardando ? (
                <span className='flex items-center justify-center'>
                  <div className='w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                  Guardando...
                </span>
              ) : editando ? (
                "💾 Actualizar Cita"
              ) : (
                "✅ Agendar Cita"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente Calendario - RESPONSIVE
// Componente Calendario - RESPONSIVE - MEJORADO PARA MOSTRAR TODAS LAS CITAS
// Componente Calendario - TOTALMENTE RESPONSIVE - MEJORADO PARA MOSTRAR TODAS LAS CITAS
const CalendarioCitas = ({ citas, onEditarCita }) => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [modalCitasAbierto, setModalCitasAbierto] = useState(false);
  const [citasDelDiaSeleccionado, setCitasDelDiaSeleccionado] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  const obtenerDiasDelMes = (fecha) => {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasDelMes = [];

    const primerDiaSemana = primerDia.getDay();
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const dia = new Date(año, mes, -i);
      diasDelMes.push({ fecha: dia, esDelMesActual: false });
    }

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(año, mes, dia);
      diasDelMes.push({ fecha, esDelMesActual: true });
    }

    const diasRestantes = 42 - diasDelMes.length;
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fecha = new Date(año, mes + 1, dia);
      diasDelMes.push({ fecha, esDelMesActual: false });
    }

    return diasDelMes;
  };

  const citasDelDia = (fecha) => {
    return citas
      .filter((cita) => {
        const fechaCitaStr = cita.fecha.includes("T")
          ? cita.fecha.split("T")[0]
          : cita.fecha;
        const fechaBuscadaStr = fecha.toISOString().split("T")[0];
        return fechaCitaStr === fechaBuscadaStr;
      })
      .sort((a, b) => a.hora.localeCompare(b.hora));
  };

  const navegarMes = (direccion) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(fechaActual.getMonth() + direccion);
    setFechaActual(nuevaFecha);
  };

  const abrirModalCitas = (fecha, citas) => {
    setCitasDelDiaSeleccionado(citas);
    setFechaSeleccionada(fecha);
    setModalCitasAbierto(true);
  };

  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const diasSemanaCompletos = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const diasDelMes = obtenerDiasDelMes(fechaActual);

  return (
    <>
      <div className='bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl border border-white/20 overflow-hidden'>
        {/* Header del calendario */}
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 sm:p-4 lg:p-6'>
          <div className='flex items-center justify-between'>
            <button
              onClick={() => navegarMes(-1)}
              className='p-2 sm:p-3 hover:bg-white/20 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base'
            >
              <span className='text-lg sm:text-xl'>←</span>
              <span className='hidden sm:inline'>Anterior</span>
            </button>

            <div className='text-center flex-1'>
              <h2 className='text-lg sm:text-2xl lg:text-3xl font-bold'>
                {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
              </h2>
              <p className='text-blue-100 mt-1 text-xs sm:text-sm lg:text-base hidden sm:block'>
                Calendario de citas médicas
              </p>
            </div>

            <button
              onClick={() => navegarMes(1)}
              className='p-2 sm:p-3 hover:bg-white/20 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base'
            >
              <span className='hidden sm:inline'>Siguiente</span>
              <span className='text-lg sm:text-xl'>→</span>
            </button>
          </div>
        </div>

        {/* Días de la semana */}
        <div className='grid grid-cols-7 border-b border-gray-200 bg-gray-50'>
          {diasSemana.map((dia, index) => (
            <div
              key={dia}
              className='p-2 sm:p-3 lg:p-4 text-center font-bold text-gray-700 border-r border-gray-200 last:border-r-0 text-xs sm:text-sm lg:text-base'
            >
              <span className='sm:hidden'>{dia}</span>
              <span className='hidden sm:inline lg:hidden'>
                {diasSemanaCompletos[index].slice(0, 4)}
              </span>
              <span className='hidden lg:inline'>
                {diasSemanaCompletos[index]}
              </span>
            </div>
          ))}
        </div>

        {/* Cuadrícula del calendario */}
        <div className='grid grid-cols-7 gap-0'>
          {diasDelMes.map((diaInfo, index) => {
            const citasDelDiaActual = citasDelDia(diaInfo.fecha);
            const esHoy =
              diaInfo.fecha.toISOString().split("T")[0] === obtenerFechaHoy();

            return (
              <div
                key={index}
                className={`
                  h-16 sm:h-20 lg:h-28 xl:h-32 p-1 sm:p-2 lg:p-3 border-r border-b border-gray-100 last:border-r-0 
                  transition-all duration-200 hover:bg-gray-50 cursor-pointer
                  ${diaInfo.esDelMesActual ? "bg-white" : "bg-gray-50"}
                  ${
                    esHoy
                      ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
                      : ""
                  }
                  ${citasDelDiaActual.length > 0 ? "hover:shadow-md" : ""}
                `}
                onClick={() =>
                  citasDelDiaActual.length > 0 &&
                  abrirModalCitas(diaInfo.fecha, citasDelDiaActual)
                }
              >
                {/* Número del día */}
                <div className='flex items-center justify-between mb-1'>
                  <div
                    className={`
                      text-xs sm:text-sm lg:text-base font-bold
                      ${
                        diaInfo.esDelMesActual
                          ? "text-gray-900"
                          : "text-gray-400"
                      }
                      ${
                        esHoy
                          ? "bg-blue-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex items-center justify-center text-xs sm:text-sm"
                          : ""
                      }
                    `}
                  >
                    {diaInfo.fecha.getDate()}
                  </div>

                  {/* Indicador de cantidad de citas */}
                  {citasDelDiaActual.length > 0 && (
                    <div
                      className={`
                        text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full min-w-0 flex items-center justify-center
                        ${
                          citasDelDiaActual.length >= 4
                            ? "bg-red-100 text-red-700"
                            : citasDelDiaActual.length >= 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }
                      `}
                    >
                      {citasDelDiaActual.length}
                    </div>
                  )}
                </div>

                {/* Citas del día - Responsive */}
                <div className='space-y-0.5 sm:space-y-1 overflow-hidden'>
                  {/* Móvil: Solo puntos de colores */}
                  <div className='sm:hidden flex flex-wrap gap-0.5'>
                    {citasDelDiaActual.slice(0, 6).map((cita, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full ${
                          cita.estado === "Completada"
                            ? "bg-green-500"
                            : cita.estado === "En curso"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
                        title={`${cita.hora} - ${cita.pacienteId.nombre}`}
                      />
                    ))}
                    {citasDelDiaActual.length > 6 && (
                      <div className='text-xs text-gray-500 ml-1'>
                        +{citasDelDiaActual.length - 6}
                      </div>
                    )}
                  </div>

                  {/* Tablet y Desktop: Barras de citas */}
                  <div className='hidden sm:block space-y-0.5'>
                    {citasDelDiaActual.slice(0, 3).map((cita) => (
                      <div
                        key={cita._id}
                        className={`
                          text-xs px-1 py-0.5 lg:px-2 lg:py-1 rounded truncate text-white font-medium
                          ${
                            cita.estado === "Completada"
                              ? "bg-green-500"
                              : cita.estado === "En curso"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                          }
                        `}
                        title={`${cita.hora} - ${cita.pacienteId.nombre} ${cita.pacienteId.apellido} - ${cita.tipoConsulta}`}
                      >
                        <span className='text-xs lg:text-sm'>{cita.hora}</span>
                        <span className='hidden lg:inline ml-1'>
                          {cita.pacienteId.nombre}
                        </span>
                      </div>
                    ))}

                    {citasDelDiaActual.length > 3 && (
                      <div className='text-xs text-blue-600 font-medium text-center bg-blue-50 rounded px-1 py-0.5'>
                        +{citasDelDiaActual.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leyenda responsive */}
        <div className='p-2 sm:p-4 bg-gray-50 border-t border-gray-200'>
          <div className='flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm'>
            <div className='flex items-center space-x-1 sm:space-x-2'>
              <div className='w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full'></div>
              <span>Completada</span>
            </div>
            <div className='flex items-center space-x-1 sm:space-x-2'>
              <div className='w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full'></div>
              <span>En curso</span>
            </div>
            <div className='flex items-center space-x-1 sm:space-x-2'>
              <div className='w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full'></div>
              <span>Programada</span>
            </div>
            <div className='flex items-center space-x-1 sm:space-x-2'>
              <div className='w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full'></div>
              <span>Hoy</span>
            </div>
          </div>
          <p className='text-center text-xs text-gray-500 mt-1 sm:mt-2'>
            💡 Click en días con citas para ver detalles
          </p>
        </div>
      </div>

      {/* Modal con todas las citas del día */}
      {modalCitasAbierto && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4'>
          <div className='bg-white w-full sm:max-w-2xl lg:max-w-4xl sm:rounded-2xl lg:rounded-3xl shadow-2xl max-h-full sm:max-h-[90vh] overflow-hidden'>
            {/* Header del modal */}
            <div className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-xl sm:text-2xl lg:text-3xl font-bold'>
                    Citas del día
                  </h3>
                  <p className='text-blue-100 mt-1 text-sm sm:text-base'>
                    {formatearFecha(fechaSeleccionada?.toISOString())} -{" "}
                    {citasDelDiaSeleccionado.length} cita
                    {citasDelDiaSeleccionado.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setModalCitasAbierto(false)}
                  className='text-white hover:bg-white/20 rounded-xl p-2 sm:p-3 transition-all duration-200 text-xl sm:text-2xl'
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Lista de citas */}
            <div className='p-4 sm:p-6 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto'>
              <div className='space-y-3 sm:space-y-4'>
                {citasDelDiaSeleccionado.map((cita) => (
                  <div
                    key={cita._id}
                    className={`
                      p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl border-l-4 hover:shadow-lg transition-all cursor-pointer
                      ${
                        cita.estado === "Completada"
                          ? "border-green-500 bg-green-50"
                          : cita.estado === "En curso"
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-blue-500 bg-blue-50"
                      }
                    `}
                    onClick={() => {
                      onEditarCita(cita);
                      setModalCitasAbierto(false);
                    }}
                  >
                    {/* Header de la cita */}
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2'>
                      <div className='flex items-center space-x-2 sm:space-x-3'>
                        <div className='bg-white rounded-lg p-2 sm:p-3 shadow-sm'>
                          <span className='text-lg sm:text-xl'>
                            {obtenerIconoTipo(cita.tipoConsulta)}
                          </span>
                        </div>
                        <div>
                          <h4 className='text-lg sm:text-xl font-bold text-gray-900'>
                            {cita.pacienteId.nombre} {cita.pacienteId.apellido}
                          </h4>
                          <p className='text-sm sm:text-base text-gray-600'>
                            {cita.tipoConsulta}
                          </p>
                        </div>
                      </div>

                      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
                        <div className='bg-white rounded-lg px-3 py-2 shadow-sm'>
                          <span className='text-lg sm:text-xl font-bold text-gray-900'>
                            {cita.hora}
                          </span>
                        </div>
                        <span
                          className={`
                            px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold
                            ${
                              cita.estado === "Completada"
                                ? "bg-green-100 text-green-700"
                                : cita.estado === "En curso"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                            }
                          `}
                        >
                          {cita.estado}
                        </span>
                      </div>
                    </div>

                    {/* Detalles de la cita */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3'>
                      <div className='bg-white rounded-lg p-2 sm:p-3 shadow-sm'>
                        <p className='text-xs text-gray-500 mb-1'>Duración</p>
                        <p className='font-semibold text-sm sm:text-base'>
                          {cita.duracion || 60} minutos
                        </p>
                      </div>

                      {cita.motivo && (
                        <div className='bg-white rounded-lg p-2 sm:p-3 shadow-sm sm:col-span-2 lg:col-span-2'>
                          <p className='text-xs text-gray-500 mb-1'>Motivo</p>
                          <p className='font-semibold text-sm sm:text-base line-clamp-2'>
                            {cita.motivo}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Información de pagos */}
                    {cita.pago?.pagos && (
                      <div className='bg-white rounded-lg p-2 sm:p-3 shadow-sm mb-3'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
                          <div className='flex items-center space-x-2'>
                            <span className='text-sm sm:text-base'>💳</span>
                            <span className='font-semibold text-sm sm:text-base text-gray-800'>
                              Plan de Pagos
                            </span>
                          </div>

                          <div className='grid grid-cols-3 gap-2 sm:gap-4 text-center'>
                            <div className='bg-gray-50 rounded px-2 py-1'>
                              <p className='text-xs text-gray-500'>Total</p>
                              <p className='text-sm font-bold'>
                                {cita.pago.pagos.length}
                              </p>
                            </div>
                            <div className='bg-green-50 rounded px-2 py-1'>
                              <p className='text-xs text-gray-500'>Pagados</p>
                              <p className='text-sm font-bold text-green-600'>
                                {
                                  cita.pago.pagos.filter(
                                    (p) => p.estado === "pagado"
                                  ).length
                                }
                              </p>
                            </div>
                            <div className='bg-orange-50 rounded px-2 py-1'>
                              <p className='text-xs text-gray-500'>
                                Pendientes
                              </p>
                              <p className='text-sm font-bold text-orange-600'>
                                {
                                  cita.pago.pagos.filter(
                                    (p) => p.estado === "pendiente"
                                  ).length
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer de la cita */}
                    <div className='flex items-center justify-between pt-3 border-t border-gray-200'>
                      <div className='text-xs sm:text-sm text-gray-500'>
                        👆 Click para editar esta cita
                      </div>

                      <div className='flex items-center space-x-2 text-xs sm:text-sm text-gray-600'>
                        {cita.observaciones && (
                          <div className='flex items-center space-x-1'>
                            <span>📝</span>
                            <span className='hidden sm:inline'>
                              Con observaciones
                            </span>
                            <span className='sm:hidden'>Obs</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {citasDelDiaSeleccionado.length === 0 && (
                <div className='text-center py-8 sm:py-12'>
                  <div className='bg-gray-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4'>
                    <span className='text-2xl sm:text-3xl'>📅</span>
                  </div>
                  <h3 className='text-lg sm:text-xl font-bold text-gray-700 mb-2'>
                    No hay citas este día
                  </h3>
                  <p className='text-gray-500 text-sm sm:text-base'>
                    Este día no tiene citas programadas
                  </p>
                </div>
              )}
            </div>

            {/* Footer del modal - Solo en desktop */}
            <div className='hidden sm:block p-4 sm:p-6 bg-gray-50 border-t border-gray-200'>
              <div className='flex items-center justify-between'>
                <div className='text-sm text-gray-600'>
                  Total: {citasDelDiaSeleccionado.length} cita
                  {citasDelDiaSeleccionado.length !== 1 ? "s" : ""} programada
                  {citasDelDiaSeleccionado.length !== 1 ? "s" : ""}
                </div>
                <button
                  onClick={() => setModalCitasAbierto(false)}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all text-sm sm:text-base'
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
// Componente Modal de Gestión de Pagos - RESPONSIVE
const ModalGestionPagos = ({
  cita,
  onClose,
  onCrearPlan,
  onEditarPago,
  onEliminarPago,
  onConfirmarPago,
  onImprimirRecibo,
  onRecargar,
}) => {
  const [editandoPago, setEditandoPago] = useState(null);
  const [creandoPlan, setCreandoPlan] = useState(false);
  const [planForm, setPlanForm] = useState({
    tipoPlan: "sesion",
    montoPorSesion: "",
  });
  const [editForm, setEditForm] = useState({
    monto: "",
    fechaVencimiento: "",
  });

  const tienePagos = cita.pago && cita.pago.pagos && cita.pago.pagos.length > 0;

  const handleCrearPlan = async () => {
    await onCrearPlan(
      cita._id,
      planForm.tipoPlan,
      parseFloat(planForm.montoPorSesion)
    );
    setCreandoPlan(false);
    setPlanForm({ tipoPlan: "sesion", montoPorSesion: "" });
    await onRecargar();
  };

  const handleEditarPago = async (numeroPago) => {
    await onEditarPago(
      cita._id,
      numeroPago,
      parseFloat(editForm.monto),
      editForm.fechaVencimiento
    );
    setEditandoPago(null);
    setEditForm({ monto: "", fechaVencimiento: "" });
    await onRecargar();
  };

  const iniciarEdicion = (pago) => {
    setEditForm({
      monto: pago.monto.toString(),
      fechaVencimiento: new Date(pago.fechaVencimiento)
        .toISOString()
        .split("T")[0],
    });
    setEditandoPago(pago.numeroPago);
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4'>
      <div className='bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-white/20'>
        <div className='bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 sm:p-8 rounded-t-2xl sm:rounded-t-3xl'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3 sm:space-x-4'>
              <div className='bg-white/20 rounded-xl sm:rounded-2xl p-2 sm:p-3'>
                <span className='text-lg sm:text-2xl'>💳</span>
              </div>
              <div>
                <h3 className='text-2xl sm:text-3xl font-bold'>
                  Gestión de Pagos
                </h3>
                <p className='text-green-100 mt-1 text-sm sm:text-base'>
                  {cita.pacienteId.nombre} {cita.pacienteId.apellido} -{" "}
                  {formatearFecha(cita.fecha)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='text-white hover:bg-white/20 rounded-xl sm:rounded-2xl p-2 sm:p-3 transition-all duration-200'
            >
              ✕
            </button>
          </div>
        </div>

        <div className='p-4 sm:p-8'>
          {/* Crear Plan de Pagos */}
          {!tienePagos && (
            <div className='bg-blue-50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-6 sm:mb-8'>
              <div className='flex items-center mb-4 sm:mb-6'>
                <div className='bg-blue-100 rounded-lg sm:rounded-xl p-2 sm:p-3 mr-3 sm:mr-4'>
                  <span className='text-lg sm:text-xl text-blue-600'>💳</span>
                </div>
                <div>
                  <h4 className='text-xl sm:text-2xl font-bold text-gray-900'>
                    Crear Plan de Pagos
                  </h4>
                  <p className='text-gray-600 text-sm sm:text-base'>
                    Configura el plan de pagos para esta cita
                  </p>
                </div>
              </div>

              {!creandoPlan ? (
                <button
                  onClick={() => setCreandoPlan(true)}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl'
                >
                  ➕ Crear Plan de Pagos
                </button>
              ) : (
                <div className='space-y-4 sm:space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
                    <div>
                      <label className='block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3'>
                        Tipo de Plan
                      </label>
                      <select
                        value={planForm.tipoPlan}
                        onChange={(e) =>
                          setPlanForm((prev) => ({
                            ...prev,
                            tipoPlan: e.target.value,
                          }))
                        }
                        className='w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white text-sm sm:text-base'
                      >
                        <option value='sesion'>Por Sesión (1 pago)</option>
                        <option value='quincenal'>Quincenal (2 pagos)</option>
                        <option value='mensual'>Mensual (4 pagos)</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3'>
                        Monto por Sesión
                      </label>
                      <input
                        type='number'
                        placeholder='Ingrese el monto'
                        value={planForm.montoPorSesion}
                        onChange={(e) =>
                          setPlanForm((prev) => ({
                            ...prev,
                            montoPorSesion: e.target.value,
                          }))
                        }
                        className='w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white text-sm sm:text-base'
                      />
                    </div>
                  </div>

                  <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
                    <button
                      onClick={handleCrearPlan}
                      disabled={!planForm.montoPorSesion}
                      className='flex-1 bg-green-600 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-all text-sm sm:text-base'
                    >
                      ✅ Crear Plan
                    </button>
                    <button
                      onClick={() => setCreandoPlan(false)}
                      className='px-6 sm:px-8 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-300 transition-all text-sm sm:text-base'
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lista de Pagos */}
          {tienePagos && (
            <div className='space-y-4 sm:space-y-6'>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3'>
                <div className='flex items-center'>
                  <div className='bg-green-100 rounded-lg sm:rounded-xl p-2 sm:p-3 mr-3 sm:mr-4'>
                    <span className='text-lg sm:text-xl text-green-600'>
                      💰
                    </span>
                  </div>
                  <div>
                    <h4 className='text-xl sm:text-2xl font-bold text-gray-900'>
                      Plan de Pagos - {cita.pago.tipoPlan}
                    </h4>
                    <p className='text-gray-600 text-sm sm:text-base'>
                      {cita.pago.pagos.length} pagos configurados
                    </p>
                  </div>
                </div>
              </div>

              <div className='grid gap-3 sm:gap-4'>
                {cita.pago.pagos.map((pago) => (
                  <div
                    key={pago.numeroPago}
                    className={`border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all ${
                      pago.estado === "pagado"
                        ? "border-green-200 bg-green-50"
                        : pago.estado === "vencido"
                        ? "border-red-200 bg-red-50"
                        : "border-orange-200 bg-orange-50"
                    }`}
                  >
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3'>
                      <div className='flex items-center space-x-3 sm:space-x-4'>
                        <div className='bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-sm'>
                          <span className='font-bold text-sm sm:text-lg'>
                            #{pago.numeroPago}
                          </span>
                        </div>
                        <div>
                          <h5 className='text-lg sm:text-xl font-bold text-gray-900'>
                            ${pago.monto}
                          </h5>
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium ${
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
                      </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4'>
                      <div className='bg-white rounded-lg sm:rounded-xl p-2 sm:p-3'>
                        <p className='text-xs sm:text-sm text-gray-500 mb-1'>
                          Método
                        </p>
                        <p className='font-semibold text-sm sm:text-base'>
                          {pago.metodoPago}
                        </p>
                      </div>
                      <div className='bg-white rounded-lg sm:rounded-xl p-2 sm:p-3'>
                        <p className='text-xs sm:text-sm text-gray-500 mb-1'>
                          Vencimiento
                        </p>
                        <p className='font-semibold text-sm sm:text-base'>
                          {new Date(pago.fechaVencimiento).toLocaleDateString()}
                        </p>
                      </div>
                      {pago.fechaPago && (
                        <div className='bg-white rounded-lg sm:rounded-xl p-2 sm:p-3'>
                          <p className='text-xs sm:text-sm text-gray-500 mb-1'>
                            Fecha de Pago
                          </p>
                          <p className='font-semibold text-green-600 text-sm sm:text-base'>
                            {new Date(pago.fechaPago).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Edición de pago */}
                    {editandoPago === pago.numeroPago ? (
                      <div className='bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4'>
                          <div>
                            <label className='block text-xs sm:text-sm font-bold text-gray-700 mb-2'>
                              Monto
                            </label>
                            <input
                              type='number'
                              value={editForm.monto}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  monto: e.target.value,
                                }))
                              }
                              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base'
                            />
                          </div>
                          <div>
                            <label className='block text-xs sm:text-sm font-bold text-gray-700 mb-2'>
                              Fecha Vencimiento
                            </label>
                            <input
                              type='date'
                              value={editForm.fechaVencimiento}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  fechaVencimiento: e.target.value,
                                }))
                              }
                              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base'
                            />
                          </div>
                        </div>
                        <div className='flex flex-col sm:flex-row gap-2'>
                          <button
                            onClick={() => handleEditarPago(pago.numeroPago)}
                            className='bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 text-sm sm:text-base font-medium'
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditandoPago(null)}
                            className='bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base font-medium'
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Acciones del pago */
                      <div className='flex flex-wrap gap-2 sm:gap-3'>
                        {pago.estado === "pendiente" && (
                          <>
                            <button
                              onClick={() =>
                                onConfirmarPago(
                                  cita._id,
                                  pago.numeroPago,
                                  "efectivo"
                                )
                              }
                              className='bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 font-medium text-xs sm:text-sm'
                            >
                              💰{" "}
                              <span className='hidden sm:inline'>
                                Confirmar{" "}
                              </span>
                              Efectivo
                            </button>
                            <button
                              onClick={() =>
                                onConfirmarPago(
                                  cita._id,
                                  pago.numeroPago,
                                  "transferencia"
                                )
                              }
                              className='bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-xs sm:text-sm'
                            >
                              🏦{" "}
                              <span className='hidden sm:inline'>
                                Confirmar{" "}
                              </span>
                              Transferencia
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => iniciarEdicion(pago)}
                          className='bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-700 font-medium text-xs sm:text-sm'
                        >
                          ✏️ Editar
                        </button>

                        {pago.estado === "pagado" && (
                          <>
                            <button
                              onClick={() =>
                                onImprimirRecibo(cita, pago, "imprimir")
                              }
                              className='bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 font-medium text-xs sm:text-sm'
                            >
                              🖨️{" "}
                              <span className='hidden sm:inline'>Imprimir</span>
                            </button>
                            <button
                              onClick={() =>
                                onImprimirRecibo(cita, pago, "pdf")
                              }
                              className='bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium text-xs sm:text-sm'
                            >
                              📄 PDF
                            </button>
                          </>
                        )}

                        <button
                          onClick={() =>
                            onEliminarPago(cita._id, pago.numeroPago)
                          }
                          className='bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 font-medium text-xs sm:text-sm'
                        >
                          🗑️ <span className='hidden sm:inline'>Eliminar</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente EstadisticasPagos - RESPONSIVE
const EstadisticasPagos = ({ citas }) => {
  const [estadisticasPagos, setEstadisticasPagos] = useState({
    totalPagos: 0,
    pagosPendientes: 0,
    pagosVencidos: 0,
    pagosCompletados: 0,
    montoTotal: 0,
    montoPendiente: 0,
  });

  useEffect(() => {
    calcularEstadisticasPagos();
  }, [citas]);

  const calcularEstadisticasPagos = () => {
    let totalPagos = 0;
    let pagosPendientes = 0;
    let pagosVencidos = 0;
    let pagosCompletados = 0;
    let montoTotal = 0;
    let montoPendiente = 0;

    const hoy = new Date();

    citas.forEach((cita) => {
      if (cita.pago && cita.pago.pagos) {
        cita.pago.pagos.forEach((pago) => {
          totalPagos++;
          montoTotal += pago.monto;

          if (pago.estado === "pagado") {
            pagosCompletados++;
          } else if (pago.estado === "pendiente") {
            const fechaVencimiento = new Date(pago.fechaVencimiento);
            if (fechaVencimiento < hoy) {
              pagosVencidos++;
            } else {
              pagosPendientes++;
            }
            montoPendiente += pago.monto;
          }
        });
      }
    });

    setEstadisticasPagos({
      totalPagos,
      pagosPendientes,
      pagosVencidos,
      pagosCompletados,
      montoTotal,
      montoPendiente,
    });
  };

  return (
    <div className='bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-4 sm:p-8 mb-6 sm:mb-8'>
      <div className='flex items-center mb-4 sm:mb-6'>
        <div className='bg-gradient-to-br from-green-100 to-green-200 rounded-lg sm:rounded-xl p-2 sm:p-3 mr-3 sm:mr-4'>
          <span className='text-lg sm:text-xl text-green-600'>💰</span>
        </div>
        <h3 className='text-xl sm:text-2xl font-bold text-gray-900'>
          Estadísticas de Pagos
        </h3>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
        <div className='bg-gradient-to-br from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-green-100 text-xs sm:text-sm font-medium mb-1'>
                Pagos Completados
              </p>
              <p className='text-2xl sm:text-3xl font-bold'>
                {estadisticasPagos.pagosCompletados}
              </p>
              <p className='text-green-200 text-xs mt-1 hidden sm:block'>
                Total pagados
              </p>
            </div>
            <div className='bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3'>
              <span className='text-lg sm:text-2xl'>✅</span>
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-orange-100 text-xs sm:text-sm font-medium mb-1'>
                Pagos Pendientes
              </p>
              <p className='text-2xl sm:text-3xl font-bold'>
                {estadisticasPagos.pagosPendientes}
              </p>
              <p className='text-orange-200 text-xs mt-1 hidden sm:block'>
                Por cobrar
              </p>
            </div>
            <div className='bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3'>
              <span className='text-lg sm:text-2xl'>⏳</span>
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-br from-red-500 to-red-600 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-red-100 text-xs sm:text-sm font-medium mb-1'>
                Pagos Vencidos
              </p>
              <p className='text-2xl sm:text-3xl font-bold'>
                {estadisticasPagos.pagosVencidos}
              </p>
              <p className='text-red-200 text-xs mt-1 hidden sm:block'>
                Requieren atención
              </p>
            </div>
            <div className='bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3'>
              <span className='text-lg sm:text-2xl'>⚠️</span>
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-blue-100 text-xs sm:text-sm font-medium mb-1'>
                Monto Total
              </p>
              <p className='text-xl sm:text-2xl font-bold'>
                ${estadisticasPagos.montoTotal?.toLocaleString() || 0}
              </p>
              <p className='text-blue-200 text-xs mt-1 hidden sm:block'>
                Total facturado
              </p>
            </div>
            <div className='bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3'>
              <span className='text-lg sm:text-2xl'>💎</span>
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-purple-100 text-xs sm:text-sm font-medium mb-1'>
                Monto Pendiente
              </p>
              <p className='text-xl sm:text-2xl font-bold'>
                ${estadisticasPagos.montoPendiente?.toLocaleString() || 0}
              </p>
              <p className='text-purple-200 text-xs mt-1 hidden sm:block'>
                Por cobrar
              </p>
            </div>
            <div className='bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3'>
              <span className='text-lg sm:text-2xl'>💸</span>
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-br from-gray-500 to-gray-600 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-100 text-xs sm:text-sm font-medium mb-1'>
                Total Pagos
              </p>
              <p className='text-2xl sm:text-3xl font-bold'>
                {estadisticasPagos.totalPagos}
              </p>
              <p className='text-gray-200 text-xs mt-1 hidden sm:block'>
                Todos los pagos
              </p>
            </div>
            <div className='bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-3'>
              <span className='text-lg sm:text-2xl'>📊</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
