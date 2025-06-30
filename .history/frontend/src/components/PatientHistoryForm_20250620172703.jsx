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

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/historial/${pacienteId}`
        );
        if (!res.ok) throw new Error("Error al cargar el historial clínico.");
        setHistorial(await res.json());
      } catch (err) {
        console.error(err);
      }
    })();
  }, [pacienteId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `http://localhost:5000/historial/${isEditing ? editId : ""}`;
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
      const res = await fetch(`http://localhost:5000/historial/${id}`, {
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
                    📋
                  </span>
                  Historial Clínico
                </h1>
                <p className='text-gray-600 mt-1'>
                  Gestión completa del historial médico del paciente
                </p>
              </div>
            </div>
            <button
              onClick={handleNewRecord}
              className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 
                rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 
                font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                flex items-center space-x-2'
            >
              <span>➕</span>
              <span>Nuevo Registro</span>
            </button>
          </div>
        </div>

        {/* Patient Info */}
        {paciente && <PatientInfo paciente={paciente} />}

        {/* Form Modal */}
        {showForm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
              <div className='bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-2xl font-bold'>
                    {isEditing ? "✏️ Editar Registro" : "📝 Nuevo Registro"}
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className='text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all'
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className='p-6'>
                <FormFields formData={formData} setFormData={setFormData} />
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
                    className='px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                      rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 
                      font-medium shadow-lg hover:shadow-xl'
                  >
                    {isEditing ? "💾 Actualizar" : "✅ Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* History Records */}
        <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
          <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b'>
            <div className='flex items-center justify-between'>
              <h3 className='text-xl font-bold text-gray-800 flex items-center'>
                <span className='bg-green-100 text-green-600 rounded-full p-2 mr-3'>
                  📊
                </span>
                Registros del Historial ({historial.length})
              </h3>
            </div>
          </div>

          {historial.length === 0 ? (
            <div className='p-12 text-center'>
              <div className='text-6xl mb-4'>🏥</div>
              <h3 className='text-xl font-semibold text-gray-700 mb-2'>
                No hay registros en el historial
              </h3>
              <p className='text-gray-500 mb-6'>
                Comienza agregando el primer registro clínico del paciente
              </p>
              <button
                onClick={handleNewRecord}
                className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 
                  rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 
                  font-medium'
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
  <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
    <h3 className='text-2xl font-bold text-gray-800 mb-8 flex items-center'>
      <span className='bg-teal-100 text-teal-600 rounded-full p-3 mr-4'>
        👤
      </span>
      Información Completa del Paciente
    </h3>

    {/* Datos Personales - EXACTOS del PacienteForm */}
    <div className='mb-10'>
      <h4 className='text-xl font-semibold text-gray-800 mb-6 flex items-center'>
        <span className='bg-teal-100 text-teal-600 rounded-full p-3 mr-4'>
          👤
        </span>
        Datos Personales
      </h4>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {[
          { key: "nombre", label: "Nombre", icon: "👤" },
          { key: "apellido", label: "Apellido", icon: "👤" },
          { key: "dni", label: "DNI", icon: "🆔" },
          { key: "edad", label: "Edad", icon: "📅" },
          { key: "genero", label: "Género", icon: "⚧" },
        ].map(({ key, label, icon }) => (
          <div key={key} className='bg-gray-50 rounded-xl p-5'>
            <div className='flex items-center'>
              <span className='text-xl mr-3'>{icon}</span>
              <div className='flex-1 min-w-0'>
                <p className='text-sm text-gray-600 font-medium mb-1'>
                  {label}
                </p>
                <p className='text-gray-800 font-semibold text-lg truncate'>
                  {paciente[key] || "No especificado"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Información de Contacto - EXACTOS del PacienteForm */}
    <div className='mb-10'>
      <h4 className='text-xl font-semibold text-gray-800 mb-6 flex items-center'>
        <span className='bg-blue-100 text-blue-600 rounded-full p-3 mr-4'>
          📞
        </span>
        Información de Contacto
      </h4>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {[
          { key: "telefono", label: "Teléfono", icon: "📱" },
          { key: "email", label: "Email", icon: "✉️" },
        ].map(({ key, label, icon }) => (
          <div key={key} className='bg-gray-50 rounded-xl p-5'>
            <div className='flex items-center'>
              <span className='text-xl mr-3'>{icon}</span>
              <div className='flex-1 min-w-0'>
                <p className='text-sm text-gray-600 font-medium mb-1'>
                  {label}
                </p>
                <p className='text-gray-800 font-semibold text-lg truncate'>
                  {paciente[key] || "No especificado"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Información Médica - EXACTOS del PacienteForm */}
    <div className='mb-10'>
      <h4 className='text-xl font-semibold text-gray-800 mb-6 flex items-center'>
        <span className='bg-red-100 text-red-600 rounded-full p-3 mr-4'>
          🏥
        </span>
        Información Médica
      </h4>
      <div className='space-y-6'>
        {/* Antecedentes en textarea como en el form */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='bg-gray-50 rounded-xl p-5'>
            <div className='flex items-start'>
              <span className='text-xl mr-3 mt-1'>🩺</span>
              <div className='flex-1'>
                <p className='text-sm text-gray-600 font-medium mb-3'>
                  Antecedentes de Enfermedad
                </p>
                <p className='text-gray-800 text-base leading-relaxed'>
                  {paciente.antecedentesEnfermedad || "No especificado"}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-gray-50 rounded-xl p-5'>
            <div className='flex items-start'>
              <span className='text-xl mr-3 mt-1'>👨‍👩‍👧‍👦</span>
              <div className='flex-1'>
                <p className='text-sm text-gray-600 font-medium mb-3'>
                  Antecedentes Familiares
                </p>
                <p className='text-gray-800 text-base leading-relaxed'>
                  {paciente.antecedentesFamiliares || "No especificado"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alergias */}
        <div className='bg-gray-50 rounded-xl p-5'>
          <div className='flex items-center'>
            <span className='text-xl mr-3'>⚠️</span>
            <div className='flex-1'>
              <p className='text-sm text-gray-600 font-medium mb-1'>Alergias</p>
              <p className='text-gray-800 font-semibold text-lg'>
                {paciente.alergias || "No especificado"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Información Adicional - EXACTOS del PacienteForm */}
    <div className='mb-10'>
      <h4 className='text-xl font-semibold text-gray-800 mb-6 flex items-center'>
        <span className='bg-purple-100 text-purple-600 rounded-full p-3 mr-4'>
          📋
        </span>
        Información Adicional
      </h4>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
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
          <div key={key} className='bg-gray-50 rounded-xl p-5'>
            <div className='flex items-center'>
              <span className='text-xl mr-3'>{icon}</span>
              <div className='flex-1'>
                <p className='text-sm text-gray-600 font-medium mb-1'>
                  {label}
                </p>
                <p className='text-gray-800 font-semibold text-lg'>
                  {paciente[key]
                    ? `${paciente[key]}${suffix || ""}`
                    : "No especificado"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Información de Registro */}
    <div>
      <h4 className='text-xl font-semibold text-gray-800 mb-6 flex items-center'>
        <span className='bg-gray-100 text-gray-600 rounded-full p-3 mr-4'>
          📊
        </span>
        Información de Registro
      </h4>
      <div className='bg-gray-50 rounded-xl p-5'>
        <div className='flex items-center'>
          <span className='text-xl mr-3'>📅</span>
          <div>
            <p className='text-sm text-gray-600 font-medium mb-1'>
              Fecha de Registro
            </p>
            <p className='text-gray-800 font-semibold text-lg'>
              {paciente.creadoEn
                ? new Date(paciente.creadoEn).toLocaleDateString() +
                  " a las " +
                  new Date(paciente.creadoEn).toLocaleTimeString()
                : "No disponible"}
            </p>
          </div>
        </div>
      </div>
    </div>
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
    <div className='space-y-8'>
      {/* Dropdowns */}
      <div>
        <h4 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
          <span className='bg-blue-100 text-blue-600 rounded-full p-2 mr-3'>
            🔍
          </span>
          Evaluación Clínica
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {inputs.map(({ label, name, icon, options }) => (
            <div key={name}>
              <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center'>
                <span className='mr-2'>{icon}</span>
                {label}
              </label>
              <select
                value={formData[name]}
                onChange={(e) =>
                  setFormData({ ...formData, [name]: e.target.value })
                }
                className='w-full px-4 py-3 border border-gray-200 rounded-xl 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
                  bg-white hover:border-gray-300 text-gray-700'
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

      {/* Text Areas */}
      <div>
        <h4 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
          <span className='bg-green-100 text-green-600 rounded-full p-2 mr-3'>
            📝
          </span>
          Notas Adicionales
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {[
            { field: "observaciones", label: "Observaciones", icon: "👁️" },
            { field: "antecedentes", label: "Antecedentes", icon: "📜" },
          ].map(({ field, label, icon }) => (
            <div key={field}>
              <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center'>
                <span className='mr-2'>{icon}</span>
                {label}
              </label>
              <textarea
                value={formData[field]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                rows='4'
                placeholder={`Ingresa ${label.toLowerCase()}...`}
                className='w-full px-4 py-3 border border-gray-200 rounded-xl 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
                  bg-white hover:border-gray-300 placeholder-gray-400 text-gray-700 resize-none'
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HistoryCards = ({ historial, onEdit, onDelete, paciente, navigate }) => (
  <div className='p-6'>
    <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
      {historial.map((entry, index) => (
        <div
          key={entry._id}
          className='bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden'
        >
          {/* Card Header */}
          <div className='bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4'>
            <div className='flex items-center justify-between'>
              <h4 className='font-bold text-lg'>Registro #{index + 1}</h4>
              <span className='bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm'>
                {new Date(entry.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Card Content */}
          <div className='p-6 space-y-4'>
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
                <span className='text-lg'>{icon}</span>
                <div className='flex-1'>
                  <p className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
                    {label}
                  </p>
                  <p className='text-gray-800 font-medium'>
                    {entry[key] || "No especificado"}
                  </p>
                </div>
              </div>
            ))}

            {/* Observaciones y Antecedentes */}
            {(entry.observaciones || entry.antecedentes) && (
              <div className='border-t pt-4 mt-4'>
                {entry.observaciones && (
                  <div className='mb-3'>
                    <p className='text-xs text-gray-500 uppercase tracking-wide font-medium mb-1'>
                      📝 Observaciones
                    </p>
                    <p className='text-sm text-gray-700 bg-gray-50 rounded-lg p-3'>
                      {entry.observaciones}
                    </p>
                  </div>
                )}
                {entry.antecedentes && (
                  <div>
                    <p className='text-xs text-gray-500 uppercase tracking-wide font-medium mb-1'>
                      📜 Antecedentes
                    </p>
                    <p className='text-sm text-gray-700 bg-gray-50 rounded-lg p-3'>
                      {entry.antecedentes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Actions */}
          <div className='bg-gray-50 p-4 flex flex-wrap gap-2'>
            <button
              onClick={() => onEdit(entry)}
              className='flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-lg 
                font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-1'
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
              className='flex-1 bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded-lg 
                font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-1'
            >
              <span>💊</span>
              <span>Tratamiento</span>
            </button>
            <button
              onClick={() => onDelete(entry._id)}
              className='bg-red-100 text-red-700 hover:bg-red-200 px-3 py-2 rounded-lg 
                font-medium text-sm transition-all duration-200'
            >
              🗑️
            </button>
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
