import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const PatientHistoryForm = () => {
  const { pacienteId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const paciente = state?.paciente;

  const [historial, setHistorial] = useState([]);
  const [formData, setFormData] = useState(initialFormState());
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPatientInfo, setShowPatientInfo] = useState(false); // Toggle para móvil

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/historial/${pacienteId}`);

        if (!res.ok) throw new Error("Error al cargar el historial clínico.");
        setHistorial(await res.json());
      } catch (err) {
        console.error(err);
      }
    })();
  }, [pacienteId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const url = `${API_URL}/historial/${isEditing ? editId : ""}`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, pacienteId }),
      });
      if (!res.ok) throw new Error("Error al guardar el historial clínico.");
      const updatedEntry = await res.json();
      setHistorial((prev) =>
        isEditing
          ? prev.map((entry) =>
              entry._id === updatedEntry._id ? updatedEntry : entry
            )
          : [...prev, updatedEntry]
      );
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entry) => {
    setFormData(entry);
    setIsEditing(true);
    setEditId(entry._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;
    try {
      const res = await fetch(`${API_URL}/historial/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar el historial clínico.");
      setHistorial((prev) => prev.filter((entry) => entry._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState());
    setIsEditing(false);
    setEditId(null);
  };

  const handleNewRecord = () => {
    resetForm();
    setShowForm(true);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 sm:p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header - Responsive */}
        <div className='bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/20'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0'>
            <div className='flex items-center'>
              <button
                onClick={() => navigate(-1)}
                className='mr-3 sm:mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all'
              >
                <span className='text-sm sm:text-base'>← Volver</span>
              </button>
              <div className='min-w-0 flex-1'>
                <h1 className='text-xl sm:text-3xl font-bold text-gray-800 flex items-center'>
                  <span className='bg-blue-100 text-blue-600 rounded-full p-2 sm:p-3 mr-2 sm:mr-4 text-lg sm:text-xl'>
                    📋
                  </span>
                  <span className='truncate'>Historial Clínico</span>
                </h1>
                <p className='text-gray-600 mt-1 text-sm sm:text-base'>
                  Gestión completa del historial médico
                  <span className='hidden sm:inline'> del paciente</span>
                </p>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-2 sm:gap-4'>
              {/* Toggle info paciente - Solo móvil */}
              {paciente && (
                <button
                  onClick={() => setShowPatientInfo(!showPatientInfo)}
                  className='sm:hidden bg-teal-100 text-teal-700 px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center justify-center space-x-2'
                >
                  <span>👤</span>
                  <span>
                    {showPatientInfo ? "Ocultar Info" : "Ver Info Paciente"}
                  </span>
                </button>
              )}

              <button
                onClick={handleNewRecord}
                className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 
                  rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 
                  font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                  flex items-center justify-center space-x-2 text-sm sm:text-base'
              >
                <span>➕</span>
                <span className='hidden sm:inline'>Nuevo Registro</span>
                <span className='sm:hidden'>Nuevo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Patient Info - Responsive */}
        {paciente && (
          <div className={`${showPatientInfo ? "block" : "hidden"} sm:block`}>
            <PatientInfo paciente={paciente} />
          </div>
        )}

        {/* Form Modal - Responsive */}
        {showForm && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-white/20'>
              <div className='bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-xl sm:text-2xl font-bold'>
                    {isEditing ? "✏️ Editar Registro" : "📝 Nuevo Registro"}
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className='text-white hover:bg-white/20 rounded-lg p-2 transition-all'
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className='p-4 sm:p-6'>
                <FormFields formData={formData} setFormData={setFormData} />
                <div className='flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8 pt-4 border-t border-gray-200'>
                  <button
                    type='button'
                    onClick={() => setShowForm(false)}
                    className='w-full sm:w-auto px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 
                      transition-all duration-200 font-medium order-2 sm:order-1'
                  >
                    Cancelar
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                      rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 
                      font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                      order-1 sm:order-2'
                  >
                    {isSubmitting
                      ? "⏳ Guardando..."
                      : isEditing
                      ? "💾 Actualizar"
                      : "✅ Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* History Records - Responsive */}
        <div className='bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-white/20'>
          <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 border-b'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg sm:text-xl font-bold text-gray-800 flex items-center'>
                <span className='bg-green-100 text-green-600 rounded-full p-2 mr-2 sm:mr-3 text-sm sm:text-base'>
                  📊
                </span>
                <span className='truncate'>
                  Registros
                  <span className='hidden sm:inline'> del Historial</span>
                  <span className='ml-1 sm:ml-2'>({historial.length})</span>
                </span>
              </h3>
            </div>
          </div>

          {historial.length === 0 ? (
            <div className='p-8 sm:p-12 text-center'>
              <div className='text-4xl sm:text-6xl mb-4'>🏥</div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-700 mb-2'>
                No hay registros en el historial
              </h3>
              <p className='text-gray-500 mb-6 text-sm sm:text-base'>
                Comienza agregando el primer registro clínico
                <span className='hidden sm:inline'> del paciente</span>
              </p>
              <button
                onClick={handleNewRecord}
                className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 
                  rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 
                  font-medium text-sm sm:text-base'
              >
                ➕ Crear Primer Registro
              </button>
            </div>
          ) : (
            <HistoryCards
              historial={historial}
              onEdit={handleEdit}
              onDelete={handleDelete}
              paciente={paciente}
              navigate={navigate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const PatientInfo = ({ paciente }) => (
  <div className='bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 border border-white/20'>
    <h3 className='text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center'>
      <span className='bg-teal-100 text-teal-600 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 text-lg sm:text-xl'>
        👤
      </span>
      <span className='truncate'>
        Información
        <span className='hidden sm:inline'> Completa</span>
        <span className='hidden lg:inline'> del Paciente</span>
      </span>
    </h3>

    {/* Datos Personales - Responsive */}
    <div className='mb-8 sm:mb-10'>
      <h4 className='text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center'>
        <span className='bg-teal-100 text-teal-600 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 text-sm sm:text-base'>
          👤
        </span>
        Datos Personales
      </h4>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6'>
        {[
          { key: "nombre", label: "Nombre", icon: "👤" },
          { key: "apellido", label: "Apellido", icon: "👤" },
          { key: "dni", label: "DNI", icon: "🆔" },
          { key: "edad", label: "Edad", icon: "📅" },
          { key: "genero", label: "Género", icon: "⚧" },
        ].map(({ key, label, icon }) => (
          <div key={key} className='bg-gray-50 rounded-xl p-4 sm:p-5'>
            <div className='flex items-center'>
              <span className='text-lg sm:text-xl mr-2 sm:mr-3'>{icon}</span>
              <div className='flex-1 min-w-0'>
                <p className='text-xs sm:text-sm text-gray-600 font-medium mb-1'>
                  {label}
                </p>
                <p className='text-gray-800 font-semibold text-base sm:text-lg truncate'>
                  {paciente[key] || "No especificado"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Información de Contacto - Responsive */}
    <div className='mb-8 sm:mb-10'>
      <h4 className='text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center'>
        <span className='bg-blue-100 text-blue-600 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 text-sm sm:text-base'>
          📞
        </span>
        Información de Contacto
      </h4>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
        {[
          { key: "telefono", label: "Teléfono", icon: "📱" },
          { key: "email", label: "Email", icon: "✉️" },
        ].map(({ key, label, icon }) => (
          <div key={key} className='bg-gray-50 rounded-xl p-4 sm:p-5'>
            <div className='flex items-center'>
              <span className='text-lg sm:text-xl mr-2 sm:mr-3'>{icon}</span>
              <div className='flex-1 min-w-0'>
                <p className='text-xs sm:text-sm text-gray-600 font-medium mb-1'>
                  {label}
                </p>
                <p className='text-gray-800 font-semibold text-base sm:text-lg truncate'>
                  {paciente[key] || "No especificado"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Información Médica - Responsive y colapsible en móvil */}
    <details className='mb-8 sm:mb-10 sm:open'>
      <summary className='cursor-pointer bg-red-50 rounded-xl p-3 sm:p-4 hover:bg-red-100 transition-colors sm:pointer-events-none'>
        <h4 className='text-lg sm:text-xl font-semibold text-gray-800 flex items-center inline'>
          <span className='bg-red-100 text-red-600 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 text-sm sm:text-base'>
            🏥
          </span>
          Información Médica
          <span className='ml-auto text-xs sm:hidden'>👁️ Ver más</span>
        </h4>
      </summary>

      <div className='mt-4 sm:mt-6 space-y-4 sm:space-y-6'>
        {/* Antecedentes */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
          <div className='bg-gray-50 rounded-xl p-4 sm:p-5'>
            <div className='flex items-start'>
              <span className='text-lg sm:text-xl mr-2 sm:mr-3 mt-1'>🩺</span>
              <div className='flex-1 min-w-0'>
                <p className='text-xs sm:text-sm text-gray-600 font-medium mb-2 sm:mb-3'>
                  Antecedentes de Enfermedad
                </p>
                <p className='text-gray-800 text-sm sm:text-base leading-relaxed break-words'>
                  {paciente.antecedentesEnfermedad || "No especificado"}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-gray-50 rounded-xl p-4 sm:p-5'>
            <div className='flex items-start'>
              <span className='text-lg sm:text-xl mr-2 sm:mr-3 mt-1'>👨‍👩‍👧‍👦</span>
              <div className='flex-1 min-w-0'>
                <p className='text-xs sm:text-sm text-gray-600 font-medium mb-2 sm:mb-3'>
                  Antecedentes Familiares
                </p>
                <p className='text-gray-800 text-sm sm:text-base leading-relaxed break-words'>
                  {paciente.antecedentesFamiliares || "No especificado"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alergias */}
        <div className='bg-gray-50 rounded-xl p-4 sm:p-5'>
          <div className='flex items-center'>
            <span className='text-lg sm:text-xl mr-2 sm:mr-3'>⚠️</span>
            <div className='flex-1 min-w-0'>
              <p className='text-xs sm:text-sm text-gray-600 font-medium mb-1'>
                Alergias
              </p>
              <p className='text-gray-800 font-semibold text-base sm:text-lg break-words'>
                {paciente.alergias || "No especificado"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </details>

    {/* Información Adicional - Responsive */}
    <details className='mb-6 sm:mb-10 sm:open'>
      <summary className='cursor-pointer bg-purple-50 rounded-xl p-3 sm:p-4 hover:bg-purple-100 transition-colors sm:pointer-events-none'>
        <h4 className='text-lg sm:text-xl font-semibold text-gray-800 flex items-center inline'>
          <span className='bg-purple-100 text-purple-600 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 text-sm sm:text-base'>
            📋
          </span>
          Información Adicional
          <span className='ml-auto text-xs sm:hidden'>👁️ Ver más</span>
        </h4>
      </summary>

      <div className='mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
        {[
          {
            key: "horasSueno",
            label: "Horas de Sueño",
            icon: "😴",
            suffix: " horas",
          },
          { key: "obraSocial", label: "Obra Social", icon: "🏥" },
          { key: "tipoShampoo", label: "Tipo de Shampoo", icon: "🧴" },
        ].map(({ key, label, icon, suffix }) => (
          <div key={key} className='bg-gray-50 rounded-xl p-4 sm:p-5'>
            <div className='flex items-center'>
              <span className='text-lg sm:text-xl mr-2 sm:mr-3'>{icon}</span>
              <div className='flex-1 min-w-0'>
                <p className='text-xs sm:text-sm text-gray-600 font-medium mb-1'>
                  {label}
                </p>
                <p className='text-gray-800 font-semibold text-base sm:text-lg break-words'>
                  {paciente[key]
                    ? `${paciente[key]}${suffix || ""}`
                    : "No especificado"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </details>

    {/* Información de Registro - Colapsible en móvil */}
    <details className='sm:open'>
      <summary className='cursor-pointer bg-gray-50 rounded-xl p-3 sm:p-4 hover:bg-gray-100 transition-colors sm:pointer-events-none'>
        <h4 className='text-lg sm:text-xl font-semibold text-gray-800 flex items-center inline'>
          <span className='bg-gray-100 text-gray-600 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 text-sm sm:text-base'>
            📊
          </span>
          Información de Registro
          <span className='ml-auto text-xs sm:hidden'>👁️ Ver más</span>
        </h4>
      </summary>

      <div className='mt-4 sm:mt-6 bg-gray-50 rounded-xl p-4 sm:p-5'>
        <div className='flex items-center'>
          <span className='text-lg sm:text-xl mr-2 sm:mr-3'>📅</span>
          <div className='min-w-0 flex-1'>
            <p className='text-xs sm:text-sm text-gray-600 font-medium mb-1'>
              Fecha de Registro
            </p>
            <p className='text-gray-800 font-semibold text-sm sm:text-lg break-words'>
              {paciente.creadoEn
                ? new Date(paciente.creadoEn).toLocaleDateString() +
                  " a las " +
                  new Date(paciente.creadoEn).toLocaleTimeString()
                : "No disponible"}
            </p>
          </div>
        </div>
      </div>
    </details>
  </div>
);

const FormFields = ({ formData, setFormData }) => {
  const inputs = [
    {
      label: "Tipo de Cuero Cabelludo",
      name: "tipoCueroCabelludo",
      icon: "🧴",
      options: ["Normal", "Graso", "Deshidratado"],
    },
    {
      label: "Frecuencia de Lavado Capilar",
      name: "frecuenciaLavadoCapilar",
      icon: "🚿",
      options: ["Diaria", "Día 1/2", "Semanal"],
    },
    {
      label: "Tricoscopia Digital",
      name: "tricoscopiaDigital",
      icon: "🔬",
      options: [
        "Ptiarisis simple",
        "Ptiarisis esteatoide",
        "Seborrea",
        "Sensible",
        "Deshidratación",
      ],
    },
    {
      label: "Tipo de Alopecia",
      name: "tipoAlopecia",
      icon: "💊",
      options: [
        "Alopecia carencial",
        "Efluvio telógeno",
        "Alopecia androgénica",
        "Otros",
      ],
    },
  ];

  return (
    <div className='space-y-6 sm:space-y-8'>
      {/* Dropdowns - Responsive */}
      <div>
        <h4 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
          <span className='bg-blue-100 text-blue-600 rounded-full p-2 mr-3 text-sm sm:text-base'>
            🔍
          </span>
          Evaluación Clínica
        </h4>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
          {inputs.map(({ label, name, icon, options }) => (
            <div key={name}>
              <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center'>
                <span className='mr-2'>{icon}</span>
                <span className='text-sm sm:text-base'>{label}</span>
              </label>
              <select
                value={formData[name]}
                onChange={(e) =>
                  setFormData({ ...formData, [name]: e.target.value })
                }
                className='w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
                  bg-white hover:border-gray-300 text-gray-700 text-sm sm:text-base'
                required
              >
                <option value=''>Selecciona una opción</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Text Areas - Responsive */}
      <div>
        <h4 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
          <span className='bg-green-100 text-green-600 rounded-full p-2 mr-3 text-sm sm:text-base'>
            📝
          </span>
          Notas Adicionales
        </h4>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
          {[
            { field: "observaciones", label: "Observaciones", icon: "👁️" },
            { field: "antecedentes", label: "Antecedentes", icon: "📜" },
          ].map(({ field, label, icon }) => (
            <div key={field}>
              <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center'>
                <span className='mr-2'>{icon}</span>
                <span className='text-sm sm:text-base'>{label}</span>
              </label>
              <textarea
                value={formData[field]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                rows='4'
                placeholder={`Ingresa ${label.toLowerCase()}...`}
                className='w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
                  bg-white hover:border-gray-300 placeholder-gray-400 text-gray-700 resize-none text-sm sm:text-base'
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HistoryCards = ({ historial, onEdit, onDelete, paciente, navigate }) => (
  <div className='p-4 sm:p-6'>
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'>
      {historial.map((entry, index) => (
        <div
          key={entry._id}
          className='bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden'
        >
          {/* Card Header */}
          <div className='bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4'>
            <div className='flex items-center justify-between'>
              <h4 className='font-bold text-base sm:text-lg'>
                Registro #{index + 1}
              </h4>
              <span className='bg-white/20 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm'>
                {new Date(entry.createdAt || Date.now()).toLocaleDateString(
                  "es-ES",
                  {
                    day: "2-digit",
                    month: "2-digit",
                  }
                )}
              </span>
            </div>
          </div>

          {/* Card Content */}
          <div className='p-4 sm:p-6 space-y-3 sm:space-y-4'>
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
              { key: "tricoscopiaDigital", label: "Tricoscopia", icon: "🔬" },
              { key: "tipoAlopecia", label: "Tipo Alopecia", icon: "💊" },
            ].map(({ key, label, icon }) => (
              <div key={key} className='flex items-center space-x-3'>
                <span className='text-base sm:text-lg flex-shrink-0'>
                  {icon}
                </span>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
                    {label}
                  </p>
                  <p className='text-gray-800 font-medium text-sm sm:text-base truncate'>
                    {entry[key] || "No especificado"}
                  </p>
                </div>
              </div>
            ))}

            {/* Observaciones y Antecedentes */}
            {(entry.observaciones || entry.antecedentes) && (
              <div className='border-t pt-3 sm:pt-4 mt-3 sm:mt-4'>
                {entry.observaciones && (
                  <div className='mb-3'>
                    <p className='text-xs text-gray-500 uppercase tracking-wide font-medium mb-1'>
                      📝 Observaciones
                    </p>
                    <p className='text-xs sm:text-sm text-gray-700 bg-gray-50 rounded-lg p-2 sm:p-3 leading-relaxed'>
                      {entry.observaciones}
                    </p>
                  </div>
                )}
                {entry.antecedentes && (
                  <div>
                    <p className='text-xs text-gray-500 uppercase tracking-wide font-medium mb-1'>
                      📜 Antecedentes
                    </p>
                    <p className='text-xs sm:text-sm text-gray-700 bg-gray-50 rounded-lg p-2 sm:p-3 leading-relaxed'>
                      {entry.antecedentes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Actions - Responsive */}
          <div className='bg-gray-50 p-3 sm:p-4 flex flex-col sm:flex-row gap-2'>
            <div className='flex gap-2'>
              <button
                onClick={() => onEdit(entry)}
                className='flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 sm:px-3 py-2 rounded-lg 
                  font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-center space-x-1'
              >
                <span>✏️</span>
                <span>Editar</span>
              </button>
              <button
                onClick={() =>
                  navigate(`/tratamientos/${paciente._id}`, {
                    state: {
                      paciente,
                      historialClinicoId: entry._id,
                    },
                  })
                }
                className='flex-1 bg-green-100 text-green-700 hover:bg-green-200 px-2 sm:px-3 py-2 rounded-lg 
                  font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-center space-x-1'
              >
                <span>💊</span>
                <span className='hidden sm:inline'>Tratamiento</span>
                <span className='sm:hidden'>Trat.</span>
              </button>
              <button
                onClick={() => onDelete(entry._id)}
                className='bg-red-100 text-red-700 hover:bg-red-200 px-2 sm:px-3 py-2 rounded-lg 
                  font-medium text-xs sm:text-sm transition-all duration-200 flex-shrink-0'
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const initialFormState = () => ({
  tipoCueroCabelludo: "",
  frecuenciaLavadoCapilar: "",
  tricoscopiaDigital: "",
  tipoAlopecia: "",
  observaciones: "",
  antecedentes: "",
});

export default PatientHistoryForm;
