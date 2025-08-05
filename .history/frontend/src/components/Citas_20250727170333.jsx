import React, { useState, useEffect } from "react";
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

// ✅ CAMBIAR ESTA FUNCIÓN:
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

  // Estados para formulario
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  // ✅ QUITAR costo y metodoPago:
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
      handleCancelarForm();
    } catch (err) {
      setError(err.message);
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
      costo: "",
      metodoPago: "Pendiente",
    });
    setEditandoId(null);
    setShowForm(false);
  };

  const citasFiltradas = citas.filter((cita) => {
    const cumpleFiltroEstado =
      filtroEstado === "Todas" || cita.estado === filtroEstado;
    const cumpleFiltroFecha =
      !filtroFecha ||
      new Date(cita.fecha).toISOString().split("T")[0] === filtroFecha;
    return cumpleFiltroEstado && cumpleFiltroFecha;
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
            {[
              {
                titulo: "Citas Hoy",
                valor: estadisticas.citasHoy || 0,
                color: "blue",
                icono: "📅",
                desc: "Agenda de hoy",
              },
              {
                titulo: "Este Mes",
                valor: estadisticas.citasDelMes || 0,
                color: "emerald",
                icono: "📊",
                desc: "Citas mensuales",
              },
              {
                titulo: "Total Citas",
                valor: estadisticas.totalCitas || 0,
                color: "purple",
                icono: "👥",
                desc: "Historial completo",
              },
              {
                titulo: "Pacientes",
                valor: pacientes.length,
                color: "orange",
                icono: "👤",
                desc: "Activos totales",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1`}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p
                      className={`text-${stat.color}-100 text-sm font-medium mb-1`}
                    >
                      {stat.titulo}
                    </p>
                    <p className='text-3xl font-bold'>{stat.valor}</p>
                    <p className={`text-${stat.color}-200 text-xs mt-1`}>
                      {stat.desc}
                    </p>
                  </div>
                  <div className='bg-white/20 rounded-xl p-3'>
                    <span className='text-2xl'>{stat.icono}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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

        {/* Filtros */}
        <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8'>
          <div className='flex items-center mb-6'>
            <div className='bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-3 mr-4'>
              <span className='text-xl'>🔍</span>
            </div>
            <h3 className='text-2xl font-bold text-gray-900'>Filtros</h3>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
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

            <div className='flex items-end'>
              <button
                onClick={() => {
                  setFiltroEstado("Todas");
                  setFiltroFecha("");
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
            onSubmit={handleSubmit}
            onCancel={handleCancelarForm}
            editando={!!editandoId}
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
      </div>
    </div>
  );
}

// Componente Card de Cita
const CitaCard = ({ cita, onEditar, onCambiarEstado, onEliminar }) => {
  const [mostrarAcciones, setMostrarAcciones] = useState(false);

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
              <div className='mb-3 bg-blue-50 rounded-xl p-3'>
                <p className='text-sm text-blue-800'>
                  <span className='font-semibold'>Motivo:</span> {cita.motivo}
                </p>
              </div>
            )}

            {cita.costo && (
              <div className='flex items-center text-green-700 bg-green-50 rounded-xl p-3'>
                <span className='mr-2 text-lg'>💰</span>
                <span className='font-semibold'>
                  ${cita.costo} - {cita.metodoPago}
                </span>
              </div>
            )}
          </div>

          <div className='flex flex-wrap gap-3 lg:flex-col lg:items-end'>
            <div className='relative'>
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
                  {[
                   {[
  "Programada",
  "En curso", 
  "Completada",
].map((estado) => (
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
  onSubmit,
  onCancel,
  editando,
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
  const metodosPago = [
    "Efectivo",
    "Transferencia",
    "Tarjeta",
    "Obra Social",
    "Pendiente",
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
                {horariosDisponibles.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
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

            {/* Método de pago */}
            <div>
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-yellow-100 rounded-lg p-2 mr-3'>💳</span>
                Método de pago
              </label>
              <select
                value={formData.metodoPago}
                onChange={(e) =>
                  setFormData({ ...formData, metodoPago: e.target.value })
                }
                className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white'
              >
                {metodosPago.map((metodo) => (
                  <option key={metodo} value={metodo}>
                    {metodo}
                  </option>
                ))}
              </select>
            </div>

            {/* Costo */}
            <div>
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-emerald-100 rounded-lg p-2 mr-3'>💰</span>
                Costo (opcional)
              </label>
              <input
                type='number'
                value={formData.costo}
                onChange={(e) =>
                  setFormData({ ...formData, costo: e.target.value })
                }
                placeholder='0.00'
                min='0'
                step='0.01'
                className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white'
              />
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
              className='px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
                rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 
                font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 order-1 sm:order-2'
            >
              {editando ? "💾 Actualizar Cita" : "✅ Agendar Cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
