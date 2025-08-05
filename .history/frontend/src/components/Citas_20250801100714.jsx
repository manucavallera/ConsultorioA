import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API_URL = "http://localhost:5000";

// Utilidades para fechas
const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString("es-AR", {
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
  const [notificacionesActivas, setNotificacionesActivas] = useState([]);
  const [filtroPagos, setFiltroPagos] = useState("todos"); // 🆕 AGREGAR ESTA LÍNEA

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

  const generarLinkMercadoPago = async (citaId, numeroPago) => {
    try {
      const res = await fetch(
        `${API_URL}/citas/${citaId}/pagos/${numeroPago}/mercadopago`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error("Error al generar link de MercadoPago");

      const data = await res.json();
      window.open(data.paymentUrl, "_blank");

      setMensaje("Link de MercadoPago generado");
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const enviarAlertaWhatsApp = async (citaId, numeroPago) => {
    try {
      const res = await fetch(
        `${API_URL}/citas/${citaId}/pagos/${numeroPago}/alerta`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error("Error al enviar alerta");

      const data = await res.json();
      setMensaje(`Alerta enviada a ${data.telefono}`);
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

  const enviarRecordatorioEmail = async (citaId, numeroPago) => {
    try {
      const res = await fetch(
        `${API_URL}/citas/${citaId}/pagos/${numeroPago}/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error("Error al enviar recordatorio");

      const data = await res.json();
      setMensaje(`Recordatorio enviado a ${data.email}`);
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const abrirModalPagos = (cita) => {
    setCitaSeleccionadaPagos(cita);
    setModalPagosAbierto(true);
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
      fecha: new Date(cita.fecha).toISOString().split("T")[0],
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
      new Date(cita.fecha).toISOString().split("T")[0] === filtroFecha;
    const cumpleFiltroPaciente =
      !filtroPaciente || cita.pacienteId._id === filtroPaciente;

    // 🆕 NUEVO FILTRO DE PAGOS
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
                      // 🆕 Nuevas props para pagos
                      onCrearPlanPagos={crearPlanPagos}
                      onConfirmarPago={confirmarPago}
                      onGenerarLinkMP={generarLinkMercadoPago}
                      onEnviarAlerta={enviarAlertaWhatsApp}
                      mostrandoPagos={mostrandoPagos}
                      setMostrandoPagos={setMostrandoPagos}
                      creandoPlan={creandoPlan}
                      setCreandoPlan={setCreandoPlan}
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

        {/* 🆕 AQUÍ AGREGAR EL MODAL */}
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
            onGenerarLinkMP={generarLinkMercadoPago}
            onEnviarWhatsApp={enviarAlertaWhatsApp}
            onEnviarEmail={enviarRecordatorioEmail}
            onRecargar={cargarDatos}
          />
        )}
      </div>
    </div>
  );
}

// Componente Card de Cita
const CitaCard = ({
  cita,
  onEditar,
  onCambiarEstado,
  onEliminar,
  abrirModalPagos, // ✅ AGREGAR ESTA LÍNEA
  // 🆕 Nuevas props para pagos
  onCrearPlanPagos,
  onConfirmarPago,
  onGenerarLinkMP,
  onEnviarAlerta,
  mostrandoPagos,
  setMostrandoPagos,
  creandoPlan,
  setCreandoPlan,
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

            {/* 🆕 SECCIÓN DE PAGOS */}
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

                  {/* 🆕 BOTÓN PARA MOSTRAR/OCULTAR */}
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
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {pago.estado === "pendiente" && (
                        <div className='flex gap-2'>
                          <button
                            onClick={() =>
                              onConfirmarPago(
                                cita._id,
                                pago.numeroPago,
                                "efectivo"
                              )
                            }
                            className='flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700'
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
                            className='flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700'
                          >
                            🏦 Confirmar Transferencia
                          </button>
                          <button
                            onClick={() =>
                              onEnviarAlerta(cita._id, pago.numeroPago)
                            }
                            className='px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700'
                          >
                            📱
                          </button>
                        </div>
                      )}

                      {pago.estado === "pagado" && pago.fechaPago && (
                        <div className='bg-green-100 rounded-lg p-2 text-sm'>
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

          <div className='flex flex-wrap gap-3 lg:flex-col lg:items-end'>
            <div className='relative' ref={accionesRef}>
              <button
                onClick={() => setMostrarAcciones(!mostrarAcciones)}
                className='bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-3 rounded-xl 
                  font-semibold text-sm transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md'
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
              className='bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-3 rounded-xl 
                font-semibold text-sm transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md'
            >
              <span>✏️</span>
              <span>Editar</span>
            </button>

            <button
              onClick={() => onEliminar(cita._id)}
              className='bg-red-100 text-red-700 hover:bg-red-200 px-4 py-3 rounded-xl 
                font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md'
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Modal de Formulario con horarios expandidos
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
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-white/20'>
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-t-3xl'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='bg-white/20 rounded-2xl p-3'>
                <span className='text-2xl'>{editando ? "✏️" : "📅"}</span>
              </div>
              <div>
                <h3 className='text-3xl font-bold'>
                  {editando ? "Editar Cita" : "Nueva Cita"}
                </h3>
                <p className='text-blue-100 mt-1'>
                  {editando
                    ? "Modifica los datos de la cita"
                    : "Programa una nueva cita médica"}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className='text-white hover:bg-white/20 rounded-2xl p-3 transition-all duration-200'
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className='p-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Paciente */}
            <div className='lg:col-span-2'>
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-blue-100 rounded-lg p-2 mr-3'>👤</span>
                Paciente
              </label>
              <select
                value={formData.pacienteId}
                onChange={(e) =>
                  setFormData({ ...formData, pacienteId: e.target.value })
                }
                required
                className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-gray-800 font-medium'
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
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-green-100 rounded-lg p-2 mr-3'>📅</span>
                Fecha
              </label>
              <input
                type='date'
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
                required
                min={new Date().toISOString().split("T")[0]}
                className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white'
              />
            </div>

            {/* Hora */}
            <div>
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-orange-100 rounded-lg p-2 mr-3'>🕐</span>
                Hora
              </label>
              <select
                value={formData.hora}
                onChange={(e) =>
                  setFormData({ ...formData, hora: e.target.value })
                }
                required
                className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white'
              >
                <option value=''>Seleccionar hora</option>
                {horariosDisponibles.map((hora) => {
                  // Validación de horarios ocupados
                  const horaOcupada = citas.some(
                    (cita) =>
                      new Date(cita.fecha).toISOString().split("T")[0] ===
                        formData.fecha &&
                      cita.hora === hora &&
                      cita._id !== editandoId
                  );
                  return (
                    <option key={hora} value={hora} disabled={horaOcupada}>
                      {hora} {horaOcupada ? "(Ocupado)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Duración */}
            <div>
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-purple-100 rounded-lg p-2 mr-3'>⏱️</span>
                Duración
              </label>
              <select
                value={formData.duracion}
                onChange={(e) =>
                  setFormData({ ...formData, duracion: e.target.value })
                }
                required
                className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white'
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
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-red-100 rounded-lg p-2 mr-3'>🩺</span>
                Tipo de consulta
              </label>
              <select
                value={formData.tipoConsulta}
                onChange={(e) =>
                  setFormData({ ...formData, tipoConsulta: e.target.value })
                }
                required
                className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white'
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
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-indigo-100 rounded-lg p-2 mr-3'>📝</span>
                Motivo de la consulta
              </label>
              <textarea
                value={formData.motivo}
                onChange={(e) =>
                  setFormData({ ...formData, motivo: e.target.value })
                }
                placeholder='Describe el motivo de la consulta...'
                rows='4'
                className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none bg-white'
              />
            </div>

            {/* Observaciones */}
            <div className='lg:col-span-2'>
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-gray-100 rounded-lg p-2 mr-3'>📋</span>
                Observaciones adicionales
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) =>
                  setFormData({ ...formData, observaciones: e.target.value })
                }
                placeholder='Observaciones, instrucciones especiales, recordatorios...'
                rows='4'
                className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none bg-white'
              />
            </div>
          </div>

          {/* Botones */}
          <div className='flex flex-col sm:flex-row justify-end gap-4 mt-10'>
            <button
              type='button'
              onClick={onCancel}
              className='px-8 py-4 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl 
                transition-all duration-200 font-semibold order-2 sm:order-1'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={guardando}
              className={`px-10 py-4 rounded-2xl transition-all duration-200 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 order-1 sm:order-2 ${
                guardando
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
              }`}
            >
              {guardando ? (
                <span className='flex items-center'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
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

{
}

// Componente Calendario
const CalendarioCitas = ({ citas, onEditarCita }) => {
  const [fechaActual, setFechaActual] = useState(new Date());

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
    return citas.filter((cita) => {
      const fechaCita = new Date(cita.fecha);
      return fechaCita.toDateString() === fecha.toDateString();
    });
  };

  const navegarMes = (direccion) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(fechaActual.getMonth() + direccion);
    setFechaActual(nuevaFecha);
  };

  const diasSemana = [
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
    <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden'>
      <div className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8'>
        <div className='flex items-center justify-between'>
          <button
            onClick={() => navegarMes(-1)}
            className='p-3 hover:bg-white/20 rounded-2xl transition-all duration-200 flex items-center space-x-2 font-medium'
          >
            <span>←</span>
            <span>Anterior</span>
          </button>

          <div className='text-center'>
            <h2 className='text-3xl font-bold'>
              {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
            </h2>
            <p className='text-blue-100 mt-1'>Calendario de citas médicas</p>
          </div>

          <button
            onClick={() => navegarMes(1)}
            className='p-3 hover:bg-white/20 rounded-2xl transition-all duration-200 flex items-center space-x-2 font-medium'
          >
            <span>Siguiente</span>
            <span>→</span>
          </button>
        </div>
      </div>

      <div className='grid grid-cols-7 border-b-2 border-gray-200 bg-gray-50'>
        {diasSemana.map((dia) => (
          <div
            key={dia}
            className='p-4 text-center font-bold text-gray-700 border-r border-gray-200 last:border-r-0'
          >
            <span className='hidden sm:inline'>{dia}</span>
            <span className='sm:hidden'>{dia.slice(0, 3)}</span>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7'>
        {diasDelMes.map((diaInfo, index) => {
          const citasDelDiaActual = citasDelDia(diaInfo.fecha);
          const esHoy =
            diaInfo.fecha.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`min-h-32 p-3 border-r border-b border-gray-100 last:border-r-0 transition-all duration-200 ${
                diaInfo.esDelMesActual
                  ? "bg-white hover:bg-gray-50"
                  : "bg-gray-50"
              } ${esHoy ? "bg-blue-50 border-blue-200" : ""}`}
            >
              <div
                className={`text-sm font-bold mb-2 ${
                  diaInfo.esDelMesActual ? "text-gray-900" : "text-gray-400"
                } ${
                  esHoy
                    ? "text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center"
                    : ""
                }`}
              >
                {diaInfo.fecha.getDate()}
              </div>

              <div className='space-y-1'>
                {citasDelDiaActual.slice(0, 2).map((cita) => (
                  <button
                    key={cita._id}
                    onClick={() => onEditarCita(cita)}
                    className={`w-full text-left text-xs p-2 rounded-lg transition-all hover:scale-105 shadow-sm ${obtenerColorEstado(
                      cita.estado
                    )}`}
                  >
                    <div className='flex items-center space-x-1'>
                      <span className='text-sm'>
                        {obtenerIconoTipo(cita.tipoConsulta)}
                      </span>
                      <div className='truncate flex-1'>
                        <div className='font-semibold'>{cita.hora}</div>
                        <div className='truncate'>{cita.pacienteId.nombre}</div>
                      </div>
                    </div>
                  </button>
                ))}

                {citasDelDiaActual.length > 2 && (
                  <div className='text-xs text-gray-500 text-center bg-gray-100 rounded-lg p-1 font-medium'>
                    +{citasDelDiaActual.length - 2} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ModalGestionPagos = ({
  cita,
  onClose,
  onCrearPlan,
  onEditarPago,
  onEliminarPago,
  onConfirmarPago,
  onGenerarLinkMP,
  onEnviarWhatsApp,
  onEnviarEmail,
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
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-white/20'>
        <div className='bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 rounded-t-3xl'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='bg-white/20 rounded-2xl p-3'>
                <span className='text-2xl'>💳</span>
              </div>
              <div>
                <h3 className='text-3xl font-bold'>Gestión de Pagos</h3>
                <p className='text-green-100 mt-1'>
                  {cita.pacienteId.nombre} {cita.pacienteId.apellido} -{" "}
                  {formatearFecha(cita.fecha)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='text-white hover:bg-white/20 rounded-2xl p-3 transition-all duration-200'
            >
              ✕
            </button>
          </div>
        </div>

        <div className='p-8'>
          {/* Crear Plan de Pagos */}
          {!tienePagos && (
            <div className='bg-blue-50 rounded-3xl p-8 mb-8'>
              <div className='flex items-center mb-6'>
                <div className='bg-blue-100 rounded-xl p-3 mr-4'>
                  <span className='text-xl text-blue-600'>💳</span>
                </div>
                <div>
                  <h4 className='text-2xl font-bold text-gray-900'>
                    Crear Plan de Pagos
                  </h4>
                  <p className='text-gray-600'>
                    Configura el plan de pagos para esta cita
                  </p>
                </div>
              </div>

              {!creandoPlan ? (
                <button
                  onClick={() => setCreandoPlan(true)}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold text-lg transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl'
                >
                  ➕ Crear Plan de Pagos
                </button>
              ) : (
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-bold text-gray-700 mb-3'>
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
                        className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white'
                      >
                        <option value='sesion'>Por Sesión (1 pago)</option>
                        <option value='quincenal'>Quincenal (2 pagos)</option>
                        <option value='mensual'>Mensual (4 pagos)</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-bold text-gray-700 mb-3'>
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
                        className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white'
                      />
                    </div>
                  </div>

                  <div className='flex gap-4'>
                    <button
                      onClick={handleCrearPlan}
                      disabled={!planForm.montoPorSesion}
                      className='flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-all'
                    >
                      ✅ Crear Plan
                    </button>
                    <button
                      onClick={() => setCreandoPlan(false)}
                      className='px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all'
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
            <div>
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center'>
                  <div className='bg-green-100 rounded-xl p-3 mr-4'>
                    <span className='text-xl text-green-600'>💰</span>
                  </div>
                  <div>
                    <h4 className='text-2xl font-bold text-gray-900'>
                      Plan de Pagos - {cita.pago.tipoPlan}
                    </h4>
                    <p className='text-gray-600'>
                      Gestiona los pagos individuales de esta cita
                    </p>
                  </div>
                </div>

                <div className='bg-white rounded-2xl p-4 shadow-lg border border-gray-200'>
                  <div className='grid grid-cols-3 gap-6 text-center'>
                    <div>
                      <p className='text-sm text-gray-500'>Total</p>
                      <p className='text-xl font-bold'>
                        {cita.pago.pagos.length}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Pagados</p>
                      <p className='text-xl font-bold text-green-600'>
                        {
                          cita.pago.pagos.filter((p) => p.estado === "pagado")
                            .length
                        }
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Pendientes</p>
                      <p className='text-xl font-bold text-orange-600'>
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

              <div className='space-y-4'>
                {cita.pago.pagos.map((pago) => (
                  <div
                    key={pago.numeroPago}
                    className={`bg-white rounded-2xl border-2 p-6 transition-all duration-200 ${
                      pago.estado === "pagado"
                        ? "border-green-200 bg-green-50"
                        : pago.estado === "vencido"
                        ? "border-red-200 bg-red-50"
                        : "border-orange-200 bg-orange-50"
                    }`}
                  >
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center space-x-4'>
                        <div className='bg-white rounded-xl p-3 shadow-sm'>
                          <span className='text-xl font-bold text-gray-700'>
                            #{pago.numeroPago}
                          </span>
                        </div>
                        <div>
                          <h5 className='text-xl font-bold text-gray-900'>
                            Pago #{pago.numeroPago}
                          </h5>
                          <span
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              pago.estado === "pagado"
                                ? "bg-green-100 text-green-700"
                                : pago.estado === "vencido"
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {pago.estado.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='text-3xl font-bold text-gray-900'>
                          ${pago.monto}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {pago.metodoPago}
                        </p>
                      </div>
                    </div>

                    {editandoPago === pago.numeroPago ? (
                      // Formulario de edición
                      <div className='bg-white rounded-xl p-6 border border-gray-200'>
                        <h6 className='text-lg font-bold text-gray-900 mb-4'>
                          Editar Pago
                        </h6>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
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
                              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Fecha de Vencimiento
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
                              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            />
                          </div>
                        </div>
                        <div className='flex gap-3'>
                          <button
                            onClick={() => handleEditarPago(pago.numeroPago)}
                            className='flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all'
                          >
                            💾 Guardar Cambios
                          </button>
                          <button
                            onClick={() => setEditandoPago(null)}
                            className='px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all'
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Vista normal del pago
                      <div>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                          <div className='bg-white rounded-lg p-3 text-center'>
                            <p className='text-sm text-gray-500'>Método</p>
                            <p className='font-semibold'>{pago.metodoPago}</p>
                          </div>
                          <div className='bg-white rounded-lg p-3 text-center'>
                            <p className='text-sm text-gray-500'>Vence</p>
                            <p className='font-semibold'>
                              {new Date(
                                pago.fechaVencimiento
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className='bg-white rounded-lg p-3 text-center'>
                            <p className='text-sm text-gray-500'>Creado</p>
                            <p className='font-semibold'>
                              {new Date(
                                pago.fechaCreacion
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {pago.estado === "pagado" && pago.fechaPago && (
                          <div className='bg-green-100 rounded-lg p-4 mb-4'>
                            <p className='text-green-700 font-medium'>
                              ✅ Pagado el{" "}
                              {new Date(pago.fechaPago).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        <div className='flex flex-wrap gap-3'>
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
                                className='flex-1 min-w-32 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-all'
                              >
                                💰 Confirmar Efectivo
                              </button>
                              <button
                                onClick={() =>
                                  onGenerarLinkMP(cita._id, pago.numeroPago)
                                }
                                className='flex-1 min-w-32 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all'
                              >
                                💳 MercadoPago
                              </button>
                              <button
                                onClick={() => iniciarEdicion(pago)}
                                className='px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all'
                              >
                                ✏️ Editar
                              </button>
                              <button
                                onClick={() =>
                                  onEliminarPago(cita._id, pago.numeroPago)
                                }
                                className='px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all'
                              >
                                🗑️ Eliminar
                              </button>
                            </>
                          )}

                          <button
                            onClick={() =>
                              onEnviarWhatsApp(cita._id, pago.numeroPago)
                            }
                            className='px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all'
                          >
                            📱 WhatsApp
                          </button>
                          <button
                            onClick={() =>
                              onEnviarEmail(cita._id, pago.numeroPago)
                            }
                            className='px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all'
                          >
                            📧 Email
                          </button>
                        </div>
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

const EstadisticasPagos = () => {
  const [estadisticasPagos, setEstadisticasPagos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarEstadisticasPagos = async () => {
      try {
        const res = await fetch(`${API_URL}/citas/estadisticas-pagos`);
        const data = await res.json();
        setEstadisticasPagos(data);
      } catch (error) {
        console.error("Error al cargar estadísticas de pagos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarEstadisticasPagos();
  }, []);

  if (cargando || !estadisticasPagos) return null;

  return (
    <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8'>
      <div className='flex items-center mb-6'>
        <div className='bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-3 mr-4'>
          <span className='text-xl text-green-600'>💰</span>
        </div>
        <h3 className='text-2xl font-bold text-gray-900'>
          Estadísticas de Pagos
        </h3>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6'>
        <div className='bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-blue-100 text-sm font-medium mb-1'>
                Total Pagos
              </p>
              <p className='text-3xl font-bold'>
                {estadisticasPagos.totalPagos}
              </p>
            </div>
            <div className='bg-white/20 rounded-xl p-3'>
              <span className='text-2xl'>📊</span>
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-green-100 text-sm font-medium mb-1'>Pagados</p>
              <p className='text-3xl font-bold'>
                {estadisticasPagos.pagosPagados}
              </p>
            </div>
            <div className='bg-white/20 rounded-xl p-3'>
              <span className='text-2xl'>✅</span>
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-orange-100 text-sm font-medium mb-1'>
                Pendientes
              </p>
              <p className='text-3xl font-bold'>
                {estadisticasPagos.pagosPendientes}
              </p>
            </div>
            <div className='bg-white/20 rounded-xl p-3'>
              <span className='text-2xl'>⏳</span>
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-lg'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-red-100 text-sm font-medium mb-1'>Vencidos</p>
              <p className='text-3xl font-bold'>
                {estadisticasPagos.pagosVencidos}
              </p>
            </div>
            <div className='bg-white/20 rounded-xl p-3'>
              <span className='text-2xl'>⚠️</span>
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-purple-100 text-sm font-medium mb-1'>
                Monto Total
              </p>
              <p className='text-2xl font-bold'>
                ${estadisticasPagos.montoTotal}
              </p>
              <p className='text-purple-200 text-xs'>
                Pendiente: ${estadisticasPagos.montoPendiente}
              </p>
            </div>
            <div className='bg-white/20 rounded-xl p-3'>
              <span className='text-2xl'>💰</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
