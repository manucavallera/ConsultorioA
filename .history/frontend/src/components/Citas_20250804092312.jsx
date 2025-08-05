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