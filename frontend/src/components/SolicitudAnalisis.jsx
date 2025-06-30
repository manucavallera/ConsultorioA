import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "http://localhost:5000/solicitudes";

// Opciones de análisis agrupadas por categoría
const CATEGORIAS_ANALISIS = {
  "Hemograma y Básicos": [
    "Hemograma",
    "VSG",
    "PCR",
    "Glucosa",
    "Urea",
    "Creatinina",
  ],
  "Perfil Lipídico": ["Colesterol", "Trigliceridos", "HDL", "LDL"],
  "Función Hepática": ["Hepatograma", "LDH"],
  Minerales: ["Ionograma", "Calcio", "Fosforo", "Magnesio", "Acido urico"],
  Hierro: ["Ferremia", "Transferrina", "Ferritina"],
  "Hormonas Sexuales": [
    "Testosterona Total",
    "Testosterona Libre",
    "SHBG-GLAE",
    "DHEA SULFATO",
    "17 OH Progesterona",
    "FSH",
    "LH",
    "Prolactina",
    "Estradiol",
  ],
  "Función Tiroidea": ["Tsh", "t3", "t4", "t4 libre"],
  "Otras Hormonas": ["Cortisol", "Insulina"],
  Vitaminas: ["Vitamina D", "Vitamina b12", "Ac Folico"],
  Otros: ["Zing", "igE"],
};

export default function SolicitudAnalisis() {
  const { pacienteId } = useParams();
  const navigate = useNavigate();

  const [descripcion, setDescripcion] = useState("");
  const [analisis, setAnalisis] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState("");
  const [detalle, setDetalle] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [descripcionEdit, setDescripcionEdit] = useState("");
  const [analisisEdit, setAnalisisEdit] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!pacienteId) return;
    fetch(`${API_URL}/paciente/${pacienteId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => setSolicitudes(data))
      .catch(() => setError("No se pudieron cargar las solicitudes"));
  }, [pacienteId]);

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setAnalisis((prev) =>
      checked ? [...prev, value] : prev.filter((a) => a !== value)
    );
  };

  const handleCheckboxChangeEdit = (e) => {
    const { value, checked } = e.target;
    setAnalisisEdit((prev) =>
      checked ? [...prev, value] : prev.filter((a) => a !== value)
    );
  };

  const AnalysisCheckboxes = ({
    currentAnalisis,
    onCheckboxChange,
    isForEdit = false,
  }) => {
    const [localSearchTerm, setLocalSearchTerm] = useState("");
    const [localCategoriaExpandida, setLocalCategoriaExpandida] = useState({});

    const toggleCategoria = (categoria) => {
      setLocalCategoriaExpandida((prev) => ({
        ...prev,
        [categoria]: !prev[categoria],
      }));
    };

    const seleccionarTodaCategoria = (categoria) => {
      const analisisCategoria = CATEGORIAS_ANALISIS[categoria];
      const todosMarcados = analisisCategoria.every((item) =>
        currentAnalisis.includes(item)
      );

      if (todosMarcados) {
        // Desmarcar todos
        analisisCategoria.forEach((item) => {
          if (currentAnalisis.includes(item)) {
            onCheckboxChange({ target: { value: item, checked: false } });
          }
        });
      } else {
        // Marcar todos
        analisisCategoria.forEach((item) => {
          if (!currentAnalisis.includes(item)) {
            onCheckboxChange({ target: { value: item, checked: true } });
          }
        });
      }
    };

    return (
      <div className='space-y-4'>
        {/* Buscador */}
        <div className='relative'>
          <input
            type='text'
            placeholder='Buscar análisis...'
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className='w-full px-4 py-2 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          <span className='absolute left-3 top-2.5 text-gray-400'>🔍</span>
        </div>

        {/* Categorías */}
        <div className='max-h-80 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50 p-4'>
          {Object.entries(CATEGORIAS_ANALISIS).map(([categoria, items]) => {
            const itemsFiltrados = items.filter((item) =>
              item.toLowerCase().includes(localSearchTerm.toLowerCase())
            );

            if (itemsFiltrados.length === 0 && localSearchTerm) return null;

            const todosMarcados = itemsFiltrados.every((item) =>
              currentAnalisis.includes(item)
            );
            const algunosMarcados = itemsFiltrados.some((item) =>
              currentAnalisis.includes(item)
            );

            return (
              <div key={categoria} className='mb-4'>
                <div className='flex items-center justify-between mb-2'>
                  <button
                    type='button'
                    onClick={() => toggleCategoria(categoria)}
                    className='flex items-center space-x-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors'
                  >
                    <span>
                      {localCategoriaExpandida[categoria] ? "📂" : "📁"}
                    </span>
                    <span>
                      {categoria} ({itemsFiltrados.length})
                    </span>
                  </button>
                  <button
                    type='button'
                    onClick={() => seleccionarTodaCategoria(categoria)}
                    className={`text-xs px-3 py-1 rounded-full transition-all ${
                      todosMarcados
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : algunosMarcados
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {todosMarcados ? "Desmarcar todos" : "Marcar todos"}
                  </button>
                </div>

                {(localCategoriaExpandida[categoria] || localSearchTerm) && (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-2 ml-4'>
                    {itemsFiltrados.map((item) => (
                      <label
                        key={item}
                        className='flex items-center space-x-2 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer'
                      >
                        <input
                          type='checkbox'
                          value={item}
                          checked={currentAnalisis.includes(item)}
                          onChange={onCheckboxChange}
                          className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                        />
                        <span className='text-sm text-gray-700'>{item}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Análisis seleccionados */}
        {currentAnalisis.length > 0 && (
          <div className='bg-blue-50 rounded-xl p-4'>
            <p className='text-sm font-medium text-blue-800 mb-2'>
              Análisis seleccionados ({currentAnalisis.length}):
            </p>
            <div className='flex flex-wrap gap-2'>
              {currentAnalisis.map((item) => (
                <span
                  key={item}
                  className='bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full'
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setError("");
    if (!descripcion || analisis.length === 0) {
      setError("Completa todos los campos.");
      return;
    }
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pacienteId,
          analisis,
          descripcion,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      const nueva = await res.json();
      const resPop = await fetch(`${API_URL}/${nueva._id}`);
      const nuevaPopulada = await resPop.json();
      setSolicitudes([nuevaPopulada, ...solicitudes]);
      setDescripcion("");
      setAnalisis([]);
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Error al crear solicitud");
    }
  };

  const handleVerDetalle = async (id) => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error("No encontrada");
      const data = await res.json();
      setDetalle(data);
    } catch {
      setError("No se pudo cargar el detalle");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta solicitud?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      setSolicitudes(solicitudes.filter((s) => s._id !== id));
    } catch (err) {
      setError(err.message || "Error al eliminar");
    }
  };

  const handleEditar = (solicitud) => {
    setEditandoId(solicitud._id);
    setDescripcionEdit(solicitud.descripcion);
    setAnalisisEdit(
      Array.isArray(solicitud.analisis) ? solicitud.analisis : []
    );
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    setError("");
    if (!descripcionEdit || analisisEdit.length === 0) {
      setError("Completa todos los campos para editar.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/${editandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion: descripcionEdit,
          analisis: analisisEdit,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      const actualizada = await res.json();
      setSolicitudes(
        solicitudes.map((s) => (s._id === editandoId ? actualizada : s))
      );
      setEditandoId(null);
      setDescripcionEdit("");
      setAnalisisEdit([]);
    } catch (err) {
      setError(err.message || "Error al editar solicitud");
    }
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setDescripcionEdit("");
    setAnalisisEdit([]);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Solicitudes de Análisis", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["Descripción", "Fecha", "Paciente", "DNI", "Género", "Análisis"]],
      body: solicitudes.map((s) => [
        s.descripcion,
        new Date(s.fechaSolicitud).toLocaleString(),
        s.pacienteId ? `${s.pacienteId.nombre} ${s.pacienteId.apellido}` : "",
        s.pacienteId ? s.pacienteId.dni : "",
        s.pacienteId ? s.pacienteId.genero : "",
        Array.isArray(s.analisis) ? s.analisis.join(", ") : s.analisis,
      ]),
    });
    doc.save("solicitudes_analisis.pdf");
  };

  const exportarDetallePDF = () => {
    if (!detalle) return;
    const doc = new jsPDF();
    doc.text("Detalle de Solicitud de Análisis", 14, 16);
    autoTable(doc, {
      startY: 24,
      head: [["Campo", "Valor"]],
      body: [
        ["Descripción", detalle.descripcion],
        ["Fecha", new Date(detalle.fechaSolicitud).toLocaleString()],
        [
          "Paciente",
          detalle.pacienteId
            ? `${detalle.pacienteId.nombre} ${detalle.pacienteId.apellido}`
            : "",
        ],
        ["DNI", detalle.pacienteId ? detalle.pacienteId.dni : ""],
        ["Género", detalle.pacienteId ? detalle.pacienteId.genero : ""],
        [
          "Análisis",
          Array.isArray(detalle.analisis)
            ? detalle.analisis.join(", ")
            : detalle.analisis,
        ],
      ],
    });
    doc.save(
      `solicitud_analisis_${
        detalle.pacienteId ? detalle.pacienteId.dni : "sinDNI"
      }.pdf`
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6'>
      <div className='max-w-6xl mx-auto'>
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
                    🧪
                  </span>
                  Solicitudes de Análisis
                </h1>
                <p className='text-gray-600 mt-1'>
                  Gestión completa de análisis clínicos y estudios médicos
                </p>
              </div>
            </div>
            <div className='flex space-x-3'>
              <button
                onClick={exportarPDF}
                disabled={solicitudes.length === 0}
                className='bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-xl 
                  font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center space-x-2'
              >
                <span>📄</span>
                <span>Exportar PDF</span>
              </button>
              <button
                onClick={() => {
                  console.log("Botón Nueva Solicitud clickeado"); // Debug
                  setShowForm(true);
                }}
                className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 
                  rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 
                  font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                  flex items-center space-x-2'
              >
                <span>➕</span>
                <span>Nueva Solicitud</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
            <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl'>
              <div className='flex items-center'>
                <span className='text-2xl mr-3'>📋</span>
                <div>
                  <p className='text-sm opacity-90'>Total Solicitudes</p>
                  <p className='text-2xl font-bold'>{solicitudes.length}</p>
                </div>
              </div>
            </div>
            <div className='bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl'>
              <div className='flex items-center'>
                <span className='text-2xl mr-3'>🧪</span>
                <div>
                  <p className='text-sm opacity-90'>Análisis Disponibles</p>
                  <p className='text-2xl font-bold'>
                    {Object.values(CATEGORIAS_ANALISIS).flat().length}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl'>
              <div className='flex items-center'>
                <span className='text-2xl mr-3'>📊</span>
                <div>
                  <p className='text-sm opacity-90'>Última Solicitud</p>
                  <p className='text-lg font-bold'>
                    {solicitudes.length > 0
                      ? new Date(
                          solicitudes[0]?.fechaSolicitud
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
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
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
              <div className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-2xl font-bold'>
                    🧪 Nueva Solicitud de Análisis
                  </h3>
                  <button
                    onClick={() => {
                      console.log("Cerrando modal"); // Debug
                      setShowForm(false);
                    }}
                    className='text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all'
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleCrear} className='p-6'>
                <div className='mb-6'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    📝 Descripción de la solicitud
                  </label>
                  <input
                    type='text'
                    placeholder='Ej: Análisis de rutina, Control post-tratamiento, etc.'
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                    className='w-full px-4 py-3 border border-gray-200 rounded-xl 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                  />
                </div>

                <div className='mb-6'>
                  <label className='block text-sm font-medium text-gray-700 mb-3'>
                    🧪 Seleccione los análisis necesarios
                  </label>
                  <AnalysisCheckboxes
                    currentAnalisis={analisis}
                    onCheckboxChange={handleCheckboxChange}
                  />
                </div>

                <div className='flex justify-end space-x-4'>
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
                    className='px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
                      rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 
                      font-medium shadow-lg hover:shadow-xl'
                  >
                    ✅ Crear Solicitud
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Solicitudes List */}
        <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
          <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b'>
            <h3 className='text-xl font-bold text-gray-800 flex items-center'>
              <span className='bg-blue-100 text-blue-600 rounded-full p-2 mr-3'>
                📊
              </span>
              Lista de Solicitudes ({solicitudes.length})
            </h3>
          </div>

          {solicitudes.length === 0 ? (
            <div className='p-12 text-center'>
              <div className='text-6xl mb-4'>🧪</div>
              <h3 className='text-xl font-semibold text-gray-700 mb-2'>
                No hay solicitudes de análisis
              </h3>
              <p className='text-gray-500 mb-6'>
                Comienza creando la primera solicitud de análisis para este
                paciente
              </p>
              <button
                onClick={() => setShowForm(true)}
                className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 
                  rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 
                  font-medium'
              >
                ➕ Crear Primera Solicitud
              </button>
            </div>
          ) : (
            <div className='p-6'>
              <div className='space-y-4'>
                {solicitudes.map((s) =>
                  editandoId === s._id ? (
                    <div
                      key={s._id}
                      className='bg-yellow-50 border border-yellow-200 rounded-xl p-6'
                    >
                      <form
                        onSubmit={handleGuardarEdicion}
                        className='space-y-4'
                      >
                        <input
                          type='text'
                          value={descripcionEdit}
                          onChange={(e) => setDescripcionEdit(e.target.value)}
                          required
                          className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500'
                          placeholder='Descripción'
                        />
                        <AnalysisCheckboxes
                          currentAnalisis={analisisEdit}
                          onCheckboxChange={handleCheckboxChangeEdit}
                          isForEdit={true}
                        />
                        <div className='flex gap-3'>
                          <button
                            type='submit'
                            className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl 
                              font-medium transition-all duration-200'
                          >
                            ✅ Guardar
                          </button>
                          <button
                            type='button'
                            className='bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-xl 
                              font-medium transition-all duration-200'
                            onClick={handleCancelarEdicion}
                          >
                            ❌ Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div
                      key={s._id}
                      className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 
                        hover:shadow-lg transition-all duration-200'
                    >
                      <div className='flex flex-col lg:flex-row lg:items-center justify-between'>
                        <div className='flex-1'>
                          <h4 className='text-lg font-bold text-blue-900 mb-2 flex items-center'>
                            <span className='mr-2'>📋</span>
                            {s.descripcion}
                          </h4>
                          {s.pacienteId && (
                            <div className='space-y-1 mb-3'>
                              <p className='text-sm text-gray-700 flex items-center'>
                                <span className='mr-2'>👤</span>
                                <span className='font-medium'>
                                  {s.pacienteId.nombre} {s.pacienteId.apellido}
                                </span>
                              </p>
                              <p className='text-sm text-gray-600 flex items-center'>
                                <span className='mr-2'>🆔</span>
                                <span>DNI: {s.pacienteId.dni}</span>
                                <span className='mx-2'>•</span>
                                <span>Género: {s.pacienteId.genero}</span>
                              </p>
                            </div>
                          )}
                          <p className='text-xs text-gray-500 flex items-center'>
                            <span className='mr-2'>📅</span>
                            {new Date(s.fechaSolicitud).toLocaleString()}
                          </p>

                          {/* Análisis solicitados preview */}
                          <div className='mt-3'>
                            <p className='text-xs text-gray-600 mb-1'>
                              Análisis solicitados:
                            </p>
                            <div className='flex flex-wrap gap-1'>
                              {(Array.isArray(s.analisis) ? s.analisis : [])
                                .slice(0, 3)
                                .map((analisis, index) => (
                                  <span
                                    key={index}
                                    className='bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full'
                                  >
                                    {analisis}
                                  </span>
                                ))}
                              {s.analisis && s.analisis.length > 3 && (
                                <span className='bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full'>
                                  +{s.analisis.length - 3} más
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className='flex flex-wrap gap-2 mt-4 lg:mt-0 lg:ml-6'>
                          <button
                            className='bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-lg 
                              font-medium text-sm transition-all duration-200 flex items-center space-x-1'
                            onClick={() => handleVerDetalle(s._id)}
                          >
                            <span>👁️</span>
                            <span>Ver detalle</span>
                          </button>
                          <button
                            className='bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-3 py-2 rounded-lg 
                              font-medium text-sm transition-all duration-200 flex items-center space-x-1'
                            onClick={() => handleEditar(s)}
                          >
                            <span>✏️</span>
                            <span>Editar</span>
                          </button>
                          <button
                            className='bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-2 rounded-lg 
                              font-medium text-sm transition-all duration-200 flex items-center space-x-1'
                            onClick={() =>
                              navigate(
                                `/pacientes/${pacienteId}/solicitudes/${s._id}/estudios`
                              )
                            }
                          >
                            <span>📤</span>
                            <span>Subir estudio</span>
                          </button>
                          <button
                            className='bg-red-100 text-red-700 hover:bg-red-200 px-3 py-2 rounded-lg 
                              font-medium text-sm transition-all duration-200'
                            onClick={() => handleEliminar(s._id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {detalle && (
          <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
              <div className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl'>
                <div className='flex items-center justify-between'>
                  <h4 className='text-2xl font-bold flex items-center'>
                    <span className='mr-3'>🔍</span>
                    Detalle de Solicitud
                  </h4>
                  <button
                    onClick={() => setDetalle(null)}
                    className='text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all'
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className='p-6'>
                {/* Patient Info */}
                <div className='mb-6 p-4 bg-gray-50 rounded-xl'>
                  <h5 className='font-semibold text-gray-800 mb-3 flex items-center'>
                    <span className='mr-2'>👤</span>
                    Información del Paciente
                  </h5>
                  {detalle.pacienteId ? (
                    <div className='space-y-2'>
                      <p className='text-gray-700'>
                        <span className='font-medium'>Nombre:</span>{" "}
                        {detalle.pacienteId.nombre}{" "}
                        {detalle.pacienteId.apellido}
                      </p>
                      <p className='text-gray-700'>
                        <span className='font-medium'>DNI:</span>{" "}
                        {detalle.pacienteId.dni}
                      </p>
                      <p className='text-gray-700'>
                        <span className='font-medium'>Género:</span>{" "}
                        {detalle.pacienteId.genero}
                      </p>
                    </div>
                  ) : (
                    <p className='text-gray-500'>
                      Información del paciente no disponible
                    </p>
                  )}
                </div>

                {/* Request Details */}
                <div className='space-y-4 mb-6'>
                  <div className='p-4 bg-blue-50 rounded-xl'>
                    <h5 className='font-semibold text-blue-800 mb-2 flex items-center'>
                      <span className='mr-2'>📋</span>
                      Descripción
                    </h5>
                    <p className='text-blue-700'>{detalle.descripcion}</p>
                  </div>

                  <div className='p-4 bg-green-50 rounded-xl'>
                    <h5 className='font-semibold text-green-800 mb-2 flex items-center'>
                      <span className='mr-2'>📅</span>
                      Fecha de Solicitud
                    </h5>
                    <p className='text-green-700'>
                      {new Date(detalle.fechaSolicitud).toLocaleString()}
                    </p>
                  </div>

                  <div className='p-4 bg-purple-50 rounded-xl'>
                    <h5 className='font-semibold text-purple-800 mb-3 flex items-center'>
                      <span className='mr-2'>🧪</span>
                      Análisis Solicitados (
                      {Array.isArray(detalle.analisis)
                        ? detalle.analisis.length
                        : 0}
                      )
                    </h5>
                    <div className='flex flex-wrap gap-2'>
                      {Array.isArray(detalle.analisis) ? (
                        detalle.analisis.map((analisis, index) => (
                          <span
                            key={index}
                            className='bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full'
                          >
                            {analisis}
                          </span>
                        ))
                      ) : (
                        <span className='bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full'>
                          {detalle.analisis}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className='flex flex-col sm:flex-row gap-3'>
                  <button
                    className='flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 
                      text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 
                      shadow-lg hover:shadow-xl flex items-center justify-center space-x-2'
                    onClick={exportarDetallePDF}
                  >
                    <span>📄</span>
                    <span>Exportar PDF</span>
                  </button>
                  <button
                    className='flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl 
                      font-medium transition-all duration-200 flex items-center justify-center space-x-2'
                    onClick={() => setDetalle(null)}
                  >
                    <span>❌</span>
                    <span>Cerrar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
