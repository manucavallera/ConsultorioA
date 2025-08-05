import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

const RegistroTratamiento = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { paciente, historialClinicoId } = state || {};

  const [datosPaciente, setDatosPaciente] = useState(paciente || null);
  const [datosHistorial, setDatosHistorial] = useState(null);

  // NUEVO: Estado para múltiples tratamientos
  const [modoMultiple, setModoMultiple] = useState(false);
  const [tratamientosMultiples, setTratamientosMultiples] = useState([
    {
      nombreTratamiento: "",
      diasTratamiento: [],
      nuevaFecha: "",
    },
  ]);

  // Estados existentes para tratamiento individual
  const [formulario, setFormulario] = useState({
    nombreTratamiento: "",
    diasTratamiento: [],
    notasAdicionales: "",
  });
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [notasGenerales, setNotasGenerales] = useState("");

  const [registros, setRegistros] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditar, setIdEditar] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const tratamientosDisponibles = [
    { value: "Minoxidil", icon: "💊", color: "bg-blue-100 text-blue-700" },
    { value: "Pantenol", icon: "🧴", color: "bg-green-100 text-green-700" },
    {
      value: "Dutasteride",
      icon: "💉",
      color: "bg-purple-100 text-purple-700",
    },
    {
      value: "Extracto placenta",
      icon: "🧬",
      color: "bg-pink-100 text-pink-700",
    },
    {
      value: "Aminoacidos",
      icon: "🔬",
      color: "bg-yellow-100 text-yellow-700",
    },
    { value: "Minerales", icon: "⚡", color: "bg-orange-100 text-orange-700" },
    { value: "Finasteride", icon: "💊", color: "bg-red-100 text-red-700" },
    { value: "Plasma", icon: "🩸", color: "bg-indigo-100 text-indigo-700" },
    { value: "Exosomas", icon: "🧪", color: "bg-cyan-100 text-cyan-700" },
    {
      value: "Carboxiterapia",
      icon: "💨",
      color: "bg-emerald-100 text-emerald-700",
    },
  ];

  useEffect(() => {
    if (paciente && historialClinicoId) {
      cargarDatosPacienteEHistorial(historialClinicoId);
      cargarRegistrosDeTratamiento(historialClinicoId);
    }
  }, [paciente?._id, historialClinicoId]);

  const cargarDatosPacienteEHistorial = async (historialId) => {
    try {
      const response = await fetch(`${API_URL}/historial/${paciente._id}`);
      if (!response.ok)
        throw new Error("Error al obtener datos del historial clínico.");
      const historialArray = await response.json();
      const registroEspecifico = historialArray.find(
        (registro) => registro._id === historialId
      );
      setDatosHistorial(registroEspecifico);
    } catch (error) {
      console.error("Error al obtener datos del historial clínico:", error);
    }
  };

  const cargarRegistrosDeTratamiento = async (historialId) => {
    try {
      const response = await fetch(
        `${API_URL}/tratamientos/historial/${historialId}`
      );
      if (!response.ok)
        throw new Error("Error al obtener registros de tratamiento.");
      const registrosData = await response.json();
      setRegistros(
        registrosData.sort(
          (a, b) => new Date(b.creadoEn) - new Date(a.creadoEn)
        )
      );
    } catch (error) {
      console.error("Error al obtener registros:", error);
    }
  };

  // FUNCIONES PARA TRATAMIENTO INDIVIDUAL
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const agregarFecha = () => {
    if (
      nuevaFecha &&
      !formulario.diasTratamiento.some((d) => d.fecha === nuevaFecha)
    ) {
      setFormulario((prev) => ({
        ...prev,
        diasTratamiento: [
          ...prev.diasTratamiento,
          { fecha: nuevaFecha, administrado: false, nota: "" },
        ],
      }));
      setNuevaFecha("");
    }
  };

  const eliminarFecha = (fecha) => {
    setFormulario((prev) => ({
      ...prev,
      diasTratamiento: prev.diasTratamiento.filter((d) => d.fecha !== fecha),
    }));
  };

  // NUEVAS FUNCIONES PARA MÚLTIPLES TRATAMIENTOS
  const agregarTratamiento = () => {
    setTratamientosMultiples([
      ...tratamientosMultiples,
      {
        nombreTratamiento: "",
        diasTratamiento: [],
        nuevaFecha: "",
      },
    ]);
  };

  const eliminarTratamiento = (index) => {
    if (tratamientosMultiples.length > 1) {
      setTratamientosMultiples(
        tratamientosMultiples.filter((_, i) => i !== index)
      );
    }
  };

  const manejarCambioTratamientoMultiple = (index, field, value) => {
    const nuevos = [...tratamientosMultiples];
    nuevos[index][field] = value;
    setTratamientosMultiples(nuevos);
  };

  const agregarFechaTratamientoMultiple = (index) => {
    const tratamiento = tratamientosMultiples[index];
    if (
      tratamiento.nuevaFecha &&
      !tratamiento.diasTratamiento.some(
        (d) => d.fecha === tratamiento.nuevaFecha
      )
    ) {
      const nuevos = [...tratamientosMultiples];
      nuevos[index].diasTratamiento.push({
        fecha: tratamiento.nuevaFecha,
        administrado: false,
        nota: "",
      });
      nuevos[index].nuevaFecha = "";
      setTratamientosMultiples(nuevos);
    }
  };

  const eliminarFechaTratamientoMultiple = (tratamientoIndex, fecha) => {
    const nuevos = [...tratamientosMultiples];
    nuevos[tratamientoIndex].diasTratamiento = nuevos[
      tratamientoIndex
    ].diasTratamiento.filter((d) => d.fecha !== fecha);
    setTratamientosMultiples(nuevos);
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (modoMultiple) {
        // Validar que todos los tratamientos tengan nombre
        const tratamientosValidos = tratamientosMultiples.filter(
          (t) => t.nombreTratamiento && t.diasTratamiento.length > 0
        );

        if (tratamientosValidos.length === 0) {
          alert("Debe agregar al menos un tratamiento con fechas");
          return;
        }

        // Preparar datos para múltiples tratamientos
        const datos = {
          pacienteId: paciente._id,
          historialClinicoId,
          tratamientos: tratamientosValidos.map((t) => ({
            nombreTratamiento: t.nombreTratamiento,
            diasTratamiento: t.diasTratamiento,
          })),
          notasAdicionales: notasGenerales,
        };

        response = await fetch(`${API_URL}/tratamientos/multiples`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        });
      } else {
        // Tratamiento individual (lógica existente)
        const registro = {
          ...formulario,
          pacienteId: paciente._id,
          historialClinicoId,
        };

        response = await fetch(
          `${API_URL}/tratamientos${modoEdicion ? `/${idEditar}` : ""}`,
          {
            method: modoEdicion ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registro),
          }
        );
      }

      if (!response.ok)
        throw new Error("Error al guardar el registro de tratamiento.");

      limpiarFormulario();
      setShowForm(false);
      cargarRegistrosDeTratamiento(historialClinicoId);
    } catch (error) {
      console.error("Error al guardar el registro:", error);
      alert("Error al guardar el tratamiento");
    }
  };

  const manejarEdicion = (registro) => {
    setModoEdicion(true);
    setIdEditar(registro._id);
    setModoMultiple(false); // Siempre editar como individual
    setFormulario({
      nombreTratamiento: registro.nombreTratamiento,
      diasTratamiento: registro.diasTratamiento,
      notasAdicionales: registro.notasAdicionales,
    });
    setShowForm(true);
  };

  // Función para editar múltiples tratamientos
  const handleEditarMultiples = (registro) => {
    setModoEdicion(true);
    setIdEditar(registro._id);
    setModoMultiple(true);

    // Convertir los tratamientos existentes al formato del estado
    const tratamientosParaEditar = registro.tratamientos.map((t) => ({
      nombreTratamiento: t.nombreTratamiento,
      diasTratamiento: t.diasTratamiento,
      nuevaFecha: "",
    }));

    setTratamientosMultiples(tratamientosParaEditar);
    setNotasGenerales(registro.notasAdicionales || "");
    setShowForm(true);
  };

  const eliminarRegistro = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este tratamiento?")) return;
    try {
      const response = await fetch(`${API_URL}/tratamientos/${id}`, {
        method: "DELETE",
      });
      if (!response.ok)
        throw new Error("Error al eliminar el registro de tratamiento.");
      cargarRegistrosDeTratamiento(historialClinicoId);
    } catch (error) {
      console.error("Error al eliminar el registro:", error);
    }
  };

  const limpiarFormulario = () => {
    setFormulario({
      nombreTratamiento: "",
      diasTratamiento: [],
      notasAdicionales: "",
    });
    setNuevaFecha("");
    setTratamientosMultiples([
      {
        nombreTratamiento: "",
        diasTratamiento: [],
        nuevaFecha: "",
      },
    ]);
    setNotasGenerales("");
    setModoEdicion(false);
    setIdEditar(null);
    setModoMultiple(false);
  };

  const handleNewTreatment = () => {
    limpiarFormulario();
    setShowForm(true);
  };

  const getTreatmentInfo = (treatmentName) => {
    return (
      tratamientosDisponibles.find((t) => t.value === treatmentName) || {
        icon: "💊",
        color: "bg-gray-100 text-gray-700",
      }
    );
  };

  // Función para renderizar un tratamiento individual en el formulario múltiple
  const renderTratamientoMultiple = (tratamiento, index) => (
    <div
      key={index}
      className='border border-gray-200 rounded-xl p-4 bg-gray-50'
    >
      <div className='flex items-center justify-between mb-4'>
        <h4 className='font-medium text-gray-800 flex items-center'>
          <span className='mr-2'>💊</span>
          Tratamiento {index + 1}
        </h4>
        {tratamientosMultiples.length > 1 && (
          <button
            type='button'
            onClick={() => eliminarTratamiento(index)}
            className='text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 
              rounded-full w-8 h-8 flex items-center justify-center transition-all'
            title='Eliminar tratamiento'
          >
            ×
          </button>
        )}
      </div>

      {/* Selector de tratamiento */}
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Tipo de Tratamiento
        </label>
        <select
          value={tratamiento.nombreTratamiento}
          onChange={(e) =>
            manejarCambioTratamientoMultiple(
              index,
              "nombreTratamiento",
              e.target.value
            )
          }
          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
          required
        >
          <option value=''>Seleccione un tratamiento</option>
          {tratamientosDisponibles.map((trat) => (
            <option key={trat.value} value={trat.value}>
              {trat.icon} {trat.value}
            </option>
          ))}
        </select>
      </div>

      {/* Gestión de fechas */}
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Fechas de Administración
        </label>
        <div className='flex gap-2 mb-3'>
          <input
            type='date'
            value={tratamiento.nuevaFecha}
            onChange={(e) =>
              manejarCambioTratamientoMultiple(
                index,
                "nuevaFecha",
                e.target.value
              )
            }
            className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
          />
          <button
            type='button'
            onClick={() => agregarFechaTratamientoMultiple(index)}
            disabled={!tratamiento.nuevaFecha}
            className='bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded-lg 
              transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm'
          >
            ➕
          </button>
        </div>

        {/* Fechas seleccionadas */}
        <div className='min-h-[40px] bg-white rounded-lg p-3 border'>
          {tratamiento.diasTratamiento.length > 0 ? (
            <div className='flex flex-wrap gap-2'>
              {tratamiento.diasTratamiento
                .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                .map((d) => (
                  <div
                    key={d.fecha}
                    className='bg-green-100 text-green-700 rounded-lg px-2 py-1 flex items-center space-x-2 text-sm'
                  >
                    <span>{new Date(d.fecha).toLocaleDateString()}</span>
                    <button
                      type='button'
                      onClick={() =>
                        eliminarFechaTratamientoMultiple(index, d.fecha)
                      }
                      className='text-red-500 hover:text-red-700 font-bold'
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <div className='text-center text-gray-500 text-sm py-2'>
              No hay fechas seleccionadas
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-100 p-6'>
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
                  <span className='bg-green-100 text-green-600 rounded-full p-3 mr-4'>
                    💊
                  </span>
                  Gestión de Tratamientos
                </h1>
                <p className='text-gray-600 mt-1'>
                  Control y seguimiento de tratamientos médicos
                </p>
              </div>
            </div>
            <div className='flex space-x-3'>
              <button
                onClick={() => {
                  limpiarFormulario();
                  setModoMultiple(false);
                  setShowForm(true);
                }}
                className='bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 
                  rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 
                  font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                  flex items-center space-x-2'
              >
                <span>➕</span>
                <span>Un Tratamiento</span>
              </button>
              <button
                onClick={() => {
                  limpiarFormulario();
                  setModoMultiple(true);
                  setShowForm(true);
                }}
                className='bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 
                  rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-200 
                  font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                  flex items-center space-x-2'
              >
                <span>📋</span>
                <span>Múltiples Tratamientos</span>
              </button>
            </div>
          </div>
        </div>

        {/* Patient and History Info */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Patient Info */}
          {datosPaciente && (
            <div className='bg-white rounded-2xl shadow-lg p-6'>
              <h3 className='text-xl font-bold text-gray-800 mb-6 flex items-center'>
                <span className='bg-blue-100 text-blue-600 rounded-full p-2 mr-3'>
                  👤
                </span>
                Información del Paciente
              </h3>
              <div className='space-y-4'>
                {[
                  {
                    key: "nombre",
                    label: "Nombre Completo",
                    value: `${datosPaciente.nombre} ${datosPaciente.apellido}`,
                    icon: "👤",
                  },
                  {
                    key: "dni",
                    label: "DNI",
                    value: datosPaciente.dni,
                    icon: "🆔",
                  },
                  {
                    key: "email",
                    label: "Email",
                    value: datosPaciente.email,
                    icon: "✉️",
                  },
                  {
                    key: "telefono",
                    label: "Teléfono",
                    value: datosPaciente.telefono,
                    icon: "📱",
                  },
                  {
                    key: "genero",
                    label: "Género",
                    value: datosPaciente.genero,
                    icon: "⚧",
                  },
                ].map(({ key, label, value, icon }) => (
                  <div
                    key={key}
                    className='flex items-center p-3 bg-gray-50 rounded-lg'
                  >
                    <span className='text-lg mr-3'>{icon}</span>
                    <div>
                      <p className='text-sm text-gray-600 font-medium'>
                        {label}
                      </p>
                      <p className='text-gray-800 font-semibold'>
                        {value || "No especificado"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinical History Info */}
          {datosHistorial && (
            <div className='bg-white rounded-2xl shadow-lg p-6'>
              <h3 className='text-xl font-bold text-gray-800 mb-6 flex items-center'>
                <span className='bg-red-100 text-red-600 rounded-full p-2 mr-3'>
                  📋
                </span>
                Historial Clínico
              </h3>
              <div className='space-y-4'>
                {[
                  {
                    key: "tipoCueroCabelludo",
                    label: "Cuero Cabelludo",
                    icon: "🧴",
                  },
                  {
                    key: "frecuenciaLavadoCapilar",
                    label: "Frecuencia Lavado",
                    icon: "🚿",
                  },
                  {
                    key: "tricoscopiaDigital",
                    label: "Tricoscopia",
                    icon: "🔬",
                  },
                  { key: "tipoAlopecia", label: "Tipo Alopecia", icon: "💊" },
                ].map(
                  ({ key, label, icon }) =>
                    datosHistorial[key] && (
                      <div
                        key={key}
                        className='flex items-center p-3 bg-gray-50 rounded-lg'
                      >
                        <span className='text-lg mr-3'>{icon}</span>
                        <div>
                          <p className='text-sm text-gray-600 font-medium'>
                            {label}
                          </p>
                          <p className='text-gray-800 font-semibold'>
                            {datosHistorial[key]}
                          </p>
                        </div>
                      </div>
                    )
                )}
                {(datosHistorial.observaciones ||
                  datosHistorial.antecedentes) && (
                  <div className='border-t pt-4'>
                    {datosHistorial.observaciones && (
                      <div className='mb-3'>
                        <p className='text-sm text-gray-600 font-medium mb-1 flex items-center'>
                          <span className='mr-2'>📝</span>
                          Observaciones
                        </p>
                        <p className='text-sm text-gray-700 bg-gray-50 rounded-lg p-3'>
                          {datosHistorial.observaciones}
                        </p>
                      </div>
                    )}
                    {datosHistorial.antecedentes && (
                      <div>
                        <p className='text-sm text-gray-600 font-medium mb-1 flex items-center'>
                          <span className='mr-2'>📜</span>
                          Antecedentes
                        </p>
                        <p className='text-sm text-gray-700 bg-gray-50 rounded-lg p-3'>
                          {datosHistorial.antecedentes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
              <div
                className={`bg-gradient-to-r ${
                  modoMultiple
                    ? "from-green-600 to-teal-600"
                    : "from-blue-600 to-indigo-600"
                } text-white p-6 rounded-t-2xl`}
              >
                <div className='flex items-center justify-between'>
                  <h3 className='text-2xl font-bold'>
                    {modoEdicion
                      ? "✏️ Editar Tratamiento"
                      : modoMultiple
                      ? "📋 Múltiples Tratamientos"
                      : "💊 Nuevo Tratamiento"}
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className='text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all'
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={manejarSubmit} className='p-6'>
                {(modoMultiple && !modoEdicion) ||
                (modoMultiple && modoEdicion) ? (
                  // FORMULARIO PARA MÚLTIPLES TRATAMIENTOS
                  <div className='space-y-6'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-lg font-semibold text-gray-800'>
                        Agregar Múltiples Tratamientos
                      </h4>
                      <button
                        type='button'
                        onClick={agregarTratamiento}
                        className='bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-lg 
                          font-medium transition-all duration-200 flex items-center space-x-2'
                      >
                        <span>➕</span>
                        <span>Agregar Tratamiento</span>
                      </button>
                    </div>

                    <div className='space-y-4'>
                      {tratamientosMultiples.map((tratamiento, index) =>
                        renderTratamientoMultiple(tratamiento, index)
                      )}
                    </div>

                    {/* Notas generales para múltiples tratamientos */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-3 flex items-center'>
                        <span className='mr-2'>📝</span>
                        Notas Generales
                      </label>
                      <textarea
                        value={notasGenerales}
                        onChange={(e) => setNotasGenerales(e.target.value)}
                        rows='4'
                        placeholder='Observaciones generales para todos los tratamientos...'
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl 
                          focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200
                          bg-white hover:border-gray-300 placeholder-gray-400 text-gray-700 resize-none'
                      />
                    </div>
                  </div>
                ) : (
                  // FORMULARIO PARA TRATAMIENTO INDIVIDUAL (EXISTENTE)
                  <div className='space-y-6'>
                    {/* Treatment Selection */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-3 flex items-center'>
                        <span className='mr-2'>💊</span>
                        Tipo de Tratamiento
                      </label>
                      <select
                        name='nombreTratamiento'
                        value={formulario.nombreTratamiento}
                        onChange={manejarCambio}
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl 
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
                          bg-white hover:border-gray-300 text-gray-700'
                        required
                      >
                        <option value=''>Seleccione un tratamiento</option>
                        {tratamientosDisponibles.map((tratamiento) => (
                          <option
                            key={tratamiento.value}
                            value={tratamiento.value}
                          >
                            {tratamiento.icon} {tratamiento.value}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Management */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-3 flex items-center'>
                        <span className='mr-2'>📅</span>
                        Fechas de Administración
                      </label>
                      <div className='flex gap-3 mb-4'>
                        <input
                          type='date'
                          value={nuevaFecha}
                          onChange={(e) => setNuevaFecha(e.target.value)}
                          className='flex-1 px-4 py-3 border border-gray-200 rounded-xl 
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                        />
                        <button
                          type='button'
                          onClick={agregarFecha}
                          disabled={!nuevaFecha}
                          className='bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-3 rounded-xl 
                            font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center space-x-2'
                        >
                          <span>➕</span>
                          <span>Agregar</span>
                        </button>
                      </div>

                      {/* Selected Dates */}
                      <div className='min-h-[50px] bg-gray-50 rounded-xl p-4'>
                        {formulario.diasTratamiento.length > 0 ? (
                          <div className='flex flex-wrap gap-2'>
                            {formulario.diasTratamiento
                              .sort(
                                (a, b) => new Date(a.fecha) - new Date(b.fecha)
                              )
                              .map((d) => (
                                <div
                                  key={d.fecha}
                                  className='bg-blue-100 text-blue-700 rounded-lg px-3 py-2 flex items-center space-x-2
                                    border border-blue-200 shadow-sm'
                                >
                                  <span className='text-sm font-medium'>
                                    📅 {new Date(d.fecha).toLocaleDateString()}
                                  </span>
                                  <button
                                    type='button'
                                    onClick={() => eliminarFecha(d.fecha)}
                                    className='text-red-500 hover:text-red-700 font-bold ml-2 
                                      w-5 h-5 flex items-center justify-center rounded-full 
                                      hover:bg-red-100 transition-all'
                                    title='Eliminar fecha'
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className='text-center text-gray-500 py-4'>
                            <span className='text-2xl mb-2 block'>📅</span>
                            <span>No hay fechas seleccionadas</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-3 flex items-center'>
                        <span className='mr-2'>📝</span>
                        Notas Adicionales
                      </label>
                      <textarea
                        name='notasAdicionales'
                        value={formulario.notasAdicionales}
                        onChange={manejarCambio}
                        rows='4'
                        placeholder='Agregar observaciones, dosis, instrucciones especiales...'
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl 
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
                          bg-white hover:border-gray-300 placeholder-gray-400 text-gray-700 resize-none'
                      />
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className='flex justify-end space-x-4 mt-8'>
                  <button
                    type='button'
                    onClick={() => setShowForm(false)}
                    className='px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 
                      transition-all duration-200 font-medium'
                  >
                    Cancelar
                  </button>
                  <button
                    type='submit'
                    className={`px-8 py-3 bg-gradient-to-r ${
                      modoMultiple
                        ? "from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                        : "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    } text-white rounded-xl transition-all duration-200 
                      font-medium shadow-lg hover:shadow-xl`}
                  >
                    {modoEdicion
                      ? "💾 Actualizar"
                      : modoMultiple
                      ? "✅ Guardar Tratamientos"
                      : "✅ Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Treatment Records */}
        <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
          <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b'>
            <div className='flex items-center justify-between'>
              <h3 className='text-xl font-bold text-gray-800 flex items-center'>
                <span className='bg-purple-100 text-purple-600 rounded-full p-2 mr-3'>
                  📊
                </span>
                Historial de Tratamientos ({registros.length})
              </h3>
            </div>
          </div>

          {registros.length === 0 ? (
            <div className='p-12 text-center'>
              <div className='text-6xl mb-4'>💊</div>
              <h3 className='text-xl font-semibold text-gray-700 mb-2'>
                No hay tratamientos registrados
              </h3>
              <p className='text-gray-500 mb-6'>
                Comienza agregando el primer tratamiento para este paciente
              </p>
              <div className='flex justify-center space-x-4'>
                <button
                  onClick={() => {
                    limpiarFormulario();
                    setModoMultiple(false);
                    setShowForm(true);
                  }}
                  className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 
                    rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 
                    font-medium'
                >
                  ➕ Un Tratamiento
                </button>
                <button
                  onClick={() => {
                    limpiarFormulario();
                    setModoMultiple(true);
                    setShowForm(true);
                  }}
                  className='bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 
                    rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-200 
                    font-medium'
                >
                  📋 Múltiples Tratamientos
                </button>
              </div>
            </div>
          ) : (
            <div className='p-6'>
              <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
                {registros.map((registro) => {
                  // Determinar si es un registro múltiple o individual
                  const esMultiple =
                    registro.tipoRegistro === "multiple" &&
                    registro.tratamientos;

                  if (esMultiple) {
                    // Renderizar registro múltiple
                    return (
                      <div
                        key={registro._id}
                        className='bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden'
                      >
                        {/* Card Header para múltiples */}
                        <div className='bg-gradient-to-r from-green-100 to-teal-100 text-green-800 p-4'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center'>
                              <span className='text-2xl mr-3'>📋</span>
                              <h4 className='font-bold text-lg'>
                                Múltiples Tratamientos
                              </h4>
                            </div>
                            <span className='bg-white bg-opacity-50 rounded-full px-3 py-1 text-xs font-medium'>
                              {new Date(
                                registro.creadoEn || Date.now()
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Card Content para múltiples */}
                        <div className='p-6'>
                          {/* Lista de tratamientos */}
                          <div className='mb-4'>
                            <p className='text-sm font-medium text-gray-700 mb-3 flex items-center'>
                              <span className='mr-2'>💊</span>
                              Tratamientos Incluidos (
                              {registro.tratamientos.length})
                            </p>
                            <div className='space-y-3'>
                              {registro.tratamientos.map((trat, index) => {
                                const treatmentInfo = getTreatmentInfo(
                                  trat.nombreTratamiento
                                );
                                return (
                                  <div
                                    key={index}
                                    className='bg-gray-50 rounded-lg p-3'
                                  >
                                    <div className='flex items-center mb-2'>
                                      <span className='text-lg mr-2'>
                                        {treatmentInfo.icon}
                                      </span>
                                      <span className='font-medium text-gray-800'>
                                        {trat.nombreTratamiento}
                                      </span>
                                    </div>
                                    {trat.diasTratamiento &&
                                      trat.diasTratamiento.length > 0 && (
                                        <div className='flex flex-wrap gap-1'>
                                          {trat.diasTratamiento
                                            .sort(
                                              (a, b) =>
                                                new Date(a.fecha) -
                                                new Date(b.fecha)
                                            )
                                            .slice(0, 3)
                                            .map((d, idx) => (
                                              <span
                                                key={idx}
                                                className='bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs'
                                              >
                                                {new Date(
                                                  d.fecha
                                                ).toLocaleDateString()}
                                              </span>
                                            ))}
                                          {trat.diasTratamiento.length > 3 && (
                                            <span className='bg-gray-100 text-gray-600 rounded px-2 py-1 text-xs'>
                                              +{trat.diasTratamiento.length - 3}{" "}
                                              más
                                            </span>
                                          )}
                                        </div>
                                      )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Notes para múltiples */}
                          {registro.notasAdicionales && (
                            <div className='mb-4'>
                              <p className='text-sm font-medium text-gray-700 mb-2 flex items-center'>
                                <span className='mr-2'>📝</span>
                                Notas Generales
                              </p>
                              <p className='text-sm text-gray-600 bg-gray-50 rounded-lg p-3'>
                                {registro.notasAdicionales}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Card Actions para múltiples */}
                        <div className='bg-gray-50 p-4 flex gap-2'>
                          <button
                            onClick={() => handleEditarMultiples(registro)}
                            className='flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-lg 
                              font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-1'
                          >
                            <span>✏️</span>
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => eliminarRegistro(registro._id)}
                            className='bg-red-100 text-red-700 hover:bg-red-200 px-3 py-2 rounded-lg 
                              font-medium text-sm transition-all duration-200'
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    // Renderizar registro individual (código existente)
                    const treatmentInfo = getTreatmentInfo(
                      registro.nombreTratamiento
                    );
                    return (
                      <div
                        key={registro._id}
                        className='bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden'
                      >
                        {/* Card Header */}
                        <div className={`${treatmentInfo.color} p-4`}>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center'>
                              <span className='text-2xl mr-3'>
                                {treatmentInfo.icon}
                              </span>
                              <h4 className='font-bold text-lg'>
                                {registro.nombreTratamiento}
                              </h4>
                            </div>
                            <span className='bg-white bg-opacity-30 rounded-full px-3 py-1 text-xs font-medium'>
                              {new Date(
                                registro.creadoEn || Date.now()
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className='p-6'>
                          {/* Dates */}
                          <div className='mb-4'>
                            <p className='text-sm font-medium text-gray-700 mb-2 flex items-center'>
                              <span className='mr-2'>📅</span>
                              Fechas de Administración
                            </p>
                            <div className='bg-gray-50 rounded-lg p-3 min-h-[60px]'>
                              {registro.diasTratamiento &&
                              registro.diasTratamiento.length > 0 ? (
                                <div className='flex flex-wrap gap-1'>
                                  {registro.diasTratamiento
                                    .sort(
                                      (a, b) =>
                                        new Date(a.fecha) - new Date(b.fecha)
                                    )
                                    .map((d, index) => (
                                      <span
                                        key={index}
                                        className='bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs font-medium'
                                      >
                                        {new Date(d.fecha).toLocaleDateString()}
                                      </span>
                                    ))}
                                </div>
                              ) : (
                                <p className='text-gray-500 text-sm text-center py-2'>
                                  Sin fechas programadas
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Notes */}
                          {registro.notasAdicionales && (
                            <div className='mb-4'>
                              <p className='text-sm font-medium text-gray-700 mb-2 flex items-center'>
                                <span className='mr-2'>📝</span>
                                Notas
                              </p>
                              <p className='text-sm text-gray-600 bg-gray-50 rounded-lg p-3'>
                                {registro.notasAdicionales}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className='bg-gray-50 p-4 flex gap-2'>
                          <button
                            onClick={() => manejarEdicion(registro)}
                            className='flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-lg 
                              font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-1'
                          >
                            <span>✏️</span>
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => eliminarRegistro(registro._id)}
                            className='bg-red-100 text-red-700 hover:bg-red-200 px-3 py-2 rounded-lg 
                              font-medium text-sm transition-all duration-200'
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistroTratamiento;
