import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API_URL = "http://localhost:5000";

// Utilidades para fechas
const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString("es-AR");
};

const formatearHora = (hora) => {
  return hora;
};

const obtenerColorEstado = (estado) => {
  const colores = {
    Programada: "bg-blue-100 text-blue-700 border-blue-200",
    Confirmada: "bg-green-100 text-green-700 border-green-200",
    "En curso": "bg-yellow-100 text-yellow-700 border-yellow-200",
    Completada: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Cancelada: "bg-red-100 text-red-700 border-red-200",
    "No asistió": "bg-gray-100 text-gray-700 border-gray-200",
  };
  return colores[estado] || "bg-gray-100 text-gray-700 border-gray-200";
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

export default function CitasDashboard() {
  const navigate = useNavigate();
  const { pacienteId } = useParams(); // Para detectar si venimos de un paciente específico
  const { state } = useLocation(); // Para recibir datos del paciente
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
  const [formData, setFormData] = useState({
    pacienteId: "",
    fecha: "",
    hora: "",
    duracion: "60", // NUEVO: Duración por defecto
    tipoConsulta: "",
    motivo: "",
    observaciones: "",
    costo: "",
    metodoPago: "Pendiente",
  });

  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState("Todas");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroPaciente, setFiltroPaciente] = useState(pacienteId || ""); // Nuevo filtro por paciente
  const [vistaModo, setVistaModo] = useState("lista"); // "lista" o "calendario"

  useEffect(() => {
    cargarDatos();
    // Si venimos de un paciente específico, preseleccionarlo
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
      duracion: cita.duracion?.toString() || "60", // NUEVO: Cargar duración
      tipoConsulta: cita.tipoConsulta,
      motivo: cita.motivo || "",
      observaciones: cita.observaciones || "",
      costo: cita.costo || "",
      metodoPago: cita.metodoPago || "Pendiente",
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
      duracion: "60", // NUEVO: Reset duración por defecto
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
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>⏳</div>
          <p className='text-xl text-gray-600'>Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-2xl shadow-xl p-6 mb-8'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <button
                onClick={() => navigate(-1)}
                className='mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all'
              >
                ← Volver
              </button>
              <div>
                <h1 className='text-3xl font-bold text-gray-800 flex items-center'>
                  <span className='bg-blue-100 text-blue-600 rounded-full p-3 mr-4'>
                    📅
                  </span>
                  Gestión de Citas
                </h1>
                <p className='text-gray-600 mt-1'>
                  Administración completa de citas y agenda médica
                </p>
              </div>
            </div>

            <div className='flex space-x-3'>
              <div className='flex bg-gray-100 rounded-xl p-1'>
                <button
                  onClick={() => setVistaModo("lista")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    vistaModo === "lista"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  📋 Lista
                </button>
                <button
                  onClick={() => setVistaModo("calendario")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    vistaModo === "calendario"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  📅 Calendario
                </button>
              </div>

              <button
                onClick={() => setShowForm(true)}
                className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 
                  rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 
                  font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                  flex items-center space-x-2'
              >
                <span>➕</span>
                <span>Nueva Cita</span>
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mt-6'>
            <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl'>
              <div className='flex items-center'>
                <span className='text-2xl mr-3'>📅</span>
                <div>
                  <p className='text-sm opacity-90'>Citas Hoy</p>
                  <p className='text-2xl font-bold'>
                    {estadisticas.citasHoy || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl'>
              <div className='flex items-center'>
                <span className='text-2xl mr-3'>📊</span>
                <div>
                  <p className='text-sm opacity-90'>Este Mes</p>
                  <p className='text-2xl font-bold'>
                    {estadisticas.citasDelMes || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl'>
              <div className='flex items-center'>
                <span className='text-2xl mr-3'>👥</span>
                <div>
                  <p className='text-sm opacity-90'>Total Citas</p>
                  <p className='text-2xl font-bold'>
                    {estadisticas.totalCitas || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl'>
              <div className='flex items-center'>
                <span className='text-2xl mr-3'>👤</span>
                <div>
                  <p className='text-sm opacity-90'>Pacientes</p>
                  <p className='text-2xl font-bold'>{pacientes.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center'>
            <span className='text-xl mr-3'>⚠️</span>
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className='ml-auto text-red-700 hover:text-red-900'
            >
              ✕
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className='bg-white rounded-2xl shadow-lg p-6 mb-8'>
          <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center'>
            <span className='bg-gray-100 text-gray-600 rounded-full p-2 mr-3'>
              🔍
            </span>
            Filtros
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className='w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='Todas'>Todas las citas</option>
                <option value='Programada'>Programadas</option>
                <option value='Confirmada'>Confirmadas</option>
                <option value='En curso'>En curso</option>
                <option value='Completada'>Completadas</option>
                <option value='Cancelada'>Canceladas</option>
                <option value='No asistió'>No asistió</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Fecha
              </label>
              <input
                type='date'
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className='w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            <div className='flex items-end'>
              <button
                onClick={() => {
                  setFiltroEstado("Todas");
                  setFiltroFecha("");
                }}
                className='w-full bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl 
                  font-medium transition-all duration-200'
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
          <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
            <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b'>
              <h3 className='text-xl font-bold text-gray-800 flex items-center'>
                <span className='bg-blue-100 text-blue-600 rounded-full p-2 mr-3'>
                  📋
                </span>
                Lista de Citas ({citasFiltradas.length})
              </h3>
            </div>

            {citasFiltradas.length === 0 ? (
              <div className='p-12 text-center'>
                <div className='text-6xl mb-4'>📅</div>
                <h3 className='text-xl font-semibold text-gray-700 mb-2'>
                  No hay citas programadas
                </h3>
                <p className='text-gray-500 mb-6'>
                  Comienza agendando la primera cita
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 
                    rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 
                    font-medium'
                >
                  ➕ Crear Primera Cita
                </button>
              </div>
            ) : (
              <div className='p-6'>
                <div className='space-y-4'>
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
    <div className='bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200'>
      <div className='flex flex-col lg:flex-row lg:items-center justify-between'>
        <div className='flex-1'>
          {/* Header de la cita */}
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center space-x-3'>
              <span className='text-2xl'>
                {obtenerIconoTipo(cita.tipoConsulta)}
              </span>
              <div>
                <h4 className='text-lg font-bold text-gray-800'>
                  {cita.pacienteId.nombre} {cita.pacienteId.apellido}
                </h4>
                <p className='text-sm text-gray-600'>{cita.tipoConsulta}</p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${obtenerColorEstado(
                cita.estado
              )}`}
            >
              {cita.estado}
            </span>
          </div>

          {/* Información de fecha y hora */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-3'>
            <div className='flex items-center text-sm text-gray-600'>
              <span className='mr-2'>📅</span>
              <span>{formatearFecha(cita.fecha)}</span>
            </div>
            <div className='flex items-center text-sm text-gray-600'>
              <span className='mr-2'>🕐</span>
              <span>{formatearHora(cita.hora)}</span>
            </div>
            <div className='flex items-center text-sm text-gray-600'>
              <span className='mr-2'>⏱️</span>
              <span>{cita.duracion || 60} min</span>
            </div>
          </div>

          {/* Motivo y costo */}
          {cita.motivo && (
            <div className='mb-2'>
              <span className='text-sm text-gray-600'>
                <span className='font-medium'>Motivo:</span> {cita.motivo}
              </span>
            </div>
          )}

          {cita.costo && (
            <div className='flex items-center text-sm text-gray-600'>
              <span className='mr-2'>💰</span>
              <span>
                ${cita.costo} - {cita.metodoPago}
              </span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className='flex flex-wrap gap-2 mt-4 lg:mt-0 lg:ml-6'>
          {/* Botón de cambio rápido de estado */}
          <div className='relative'>
            <button
              onClick={() => setMostrarAcciones(!mostrarAcciones)}
              className='bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded-lg 
                font-medium text-sm transition-all duration-200 flex items-center space-x-1'
            >
              <span>✅</span>
              <span>Estado</span>
            </button>

            {mostrarAcciones && (
              <div className='absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-40'>
                {[
                  "Programada",
                  "Confirmada",
                  "En curso",
                  "Completada",
                  "Cancelada",
                  "No asistió",
                ].map((estado) => (
                  <button
                    key={estado}
                    onClick={() => {
                      onCambiarEstado(cita._id, estado);
                      setMostrarAcciones(false);
                    }}
                    className='w-full text-left px-3 py-2 hover:bg-gray-50 text-sm first:rounded-t-lg last:rounded-b-lg transition-all'
                  >
                    {estado}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onEditar(cita)}
            className='bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-lg 
              font-medium text-sm transition-all duration-200 flex items-center space-x-1'
          >
            <span>✏️</span>
            <span>Editar</span>
          </button>

          <button
            onClick={() => onEliminar(cita._id)}
            className='bg-red-100 text-red-700 hover:bg-red-200 px-3 py-2 rounded-lg 
              font-medium text-sm transition-all duration-200'
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Modal de Formulario
const CitaFormModal = ({
  formData,
  setFormData,
  pacientes,
  onSubmit,
  onCancel,
  editando,
}) => {
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

  // NUEVO: Opciones de duración
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
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl'>
          <div className='flex items-center justify-between'>
            <h3 className='text-2xl font-bold'>
              {editando ? "✏️ Editar Cita" : "📅 Nueva Cita"}
            </h3>
            <button
              onClick={onCancel}
              className='text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all'
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Paciente */}
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                👤 Paciente
              </label>
              <select
                value={formData.pacienteId}
                onChange={(e) =>
                  setFormData({ ...formData, pacienteId: e.target.value })
                }
                required
                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                📅 Fecha
              </label>
              <input
                type='date'
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
                required
                min={new Date().toISOString().split("T")[0]}
                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            {/* Hora */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                🕐 Hora
              </label>
              <select
                value={formData.hora}
                onChange={(e) =>
                  setFormData({ ...formData, hora: e.target.value })
                }
                required
                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Seleccionar hora</option>
                {horariosDisponibles.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>
            </div>

            {/* NUEVO: Duración */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                ⏱️ Duración
              </label>
              <select
                value={formData.duracion}
                onChange={(e) =>
                  setFormData({ ...formData, duracion: e.target.value })
                }
                required
                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                🩺 Tipo de consulta
              </label>
              <select
                value={formData.tipoConsulta}
                onChange={(e) =>
                  setFormData({ ...formData, tipoConsulta: e.target.value })
                }
                required
                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Seleccionar tipo</option>
                {tiposConsulta.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* Método de pago */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                💳 Método de pago
              </label>
              <select
                value={formData.metodoPago}
                onChange={(e) =>
                  setFormData({ ...formData, metodoPago: e.target.value })
                }
                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                {metodosPago.map((metodo) => (
                  <option key={metodo} value={metodo}>
                    {metodo}
                  </option>
                ))}
              </select>
            </div>

            {/* Costo */}
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                💰 Costo (opcional)
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
                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            {/* Motivo */}
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                📝 Motivo de la consulta
              </label>
              <textarea
                value={formData.motivo}
                onChange={(e) =>
                  setFormData({ ...formData, motivo: e.target.value })
                }
                placeholder='Describe el motivo de la consulta...'
                rows='3'
                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
              />
            </div>

            {/* Observaciones */}
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                📋 Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) =>
                  setFormData({ ...formData, observaciones: e.target.value })
                }
                placeholder='Observaciones adicionales...'
                rows='3'
                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
              />
            </div>
          </div>

          {/* Botones */}
          <div className='flex justify-end space-x-4 mt-8'>
            <button
              type='button'
              onClick={onCancel}
              className='px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 
                transition-all duration-200 font-medium'
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
                rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 
                font-medium shadow-lg hover:shadow-xl'
            >
              {editando ? "💾 Actualizar" : "✅ Agendar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente Calendario Simple
const CalendarioCitas = ({ citas, onEditarCita }) => {
  const [fechaActual, setFechaActual] = useState(new Date());

  const obtenerDiasDelMes = (fecha) => {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasDelMes = [];

    // Días del mes anterior para completar la primera semana
    const primerDiaSemana = primerDia.getDay();
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const dia = new Date(año, mes, -i);
      diasDelMes.push({ fecha: dia, esDelMesActual: false });
    }

    // Días del mes actual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(año, mes, dia);
      diasDelMes.push({ fecha, esDelMesActual: true });
    }

    // Días del mes siguiente para completar la última semana
    const diasRestantes = 42 - diasDelMes.length; // 6 semanas × 7 días
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

  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
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
    <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
      {/* Header del calendario */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6'>
        <div className='flex items-center justify-between'>
          <button
            onClick={() => navegarMes(-1)}
            className='p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all'
          >
            ← Anterior
          </button>

          <h2 className='text-2xl font-bold'>
            {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
          </h2>

          <button
            onClick={() => navegarMes(1)}
            className='p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all'
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className='grid grid-cols-7 border-b border-gray-200'>
        {diasSemana.map((dia) => (
          <div
            key={dia}
            className='p-4 text-center font-medium text-gray-600 bg-gray-50'
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Calendario */}
      <div className='grid grid-cols-7'>
        {diasDelMes.map((diaInfo, index) => {
          const citasDelDiaActual = citasDelDia(diaInfo.fecha);
          const esHoy =
            diaInfo.fecha.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`min-h-32 p-2 border-r border-b border-gray-100 ${
                diaInfo.esDelMesActual ? "bg-white" : "bg-gray-50"
              } ${esHoy ? "bg-blue-50" : ""}`}
            >
              {/* Número del día */}
              <div
                className={`text-sm font-medium mb-1 ${
                  diaInfo.esDelMesActual ? "text-gray-900" : "text-gray-400"
                } ${esHoy ? "text-blue-600 font-bold" : ""}`}
              >
                {diaInfo.fecha.getDate()}
              </div>

              {/* Citas del día */}
              <div className='space-y-1'>
                {citasDelDiaActual.slice(0, 3).map((cita) => (
                  <button
                    key={cita._id}
                    onClick={() => onEditarCita(cita)}
                    className={`w-full text-left text-xs p-1 rounded truncate transition-all hover:scale-105 ${obtenerColorEstado(
                      cita.estado
                    )}`}
                  >
                    <div className='flex items-center space-x-1'>
                      <span>{obtenerIconoTipo(cita.tipoConsulta)}</span>
                      <span className='truncate'>
                        {cita.hora} - {cita.pacienteId.nombre}
                      </span>
                    </div>
                  </button>
                ))}

                {citasDelDiaActual.length > 3 && (
                  <div className='text-xs text-gray-500 text-center'>
                    +{citasDelDiaActual.length - 3} más
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
