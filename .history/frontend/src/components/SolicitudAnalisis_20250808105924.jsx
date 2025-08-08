import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BASE_URL}/solicitudes`;
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

  // NUEVO: Estado para manejar valores
  const [editandoValores, setEditandoValores] = useState(null);
  const [valoresTemp, setValoresTemp] = useState({});

  useEffect(() => {
    if (!pacienteId) return;
    fetch(`${API_URL}/paciente/${pacienteId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => setSolicitudes(data))
      .catch(() => setError("No se pudieron cargar las solicitudes"));
  }, [pacienteId]);

  // FUNCIONES HELPERS PARA ANÁLISIS
  const convertirAnalisisStringAObjeto = (analisis) => {
    return analisis.map((item) =>
      typeof item === "string"
        ? { nombre: item, valor: null, unidad: "" }
        : item
    );
  };

  const extraerNombresAnalisis = (analisis) => {
    return analisis.map((item) =>
      typeof item === "string" ? item : item.nombre
    );
  };

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
    // ✅ CAMBIO: Inicializar TODAS las categorías como expandidas por defecto
    const [localCategoriaExpandida, setLocalCategoriaExpandida] = useState(
      Object.keys(CATEGORIAS_ANALISIS).reduce((acc, categoria) => {
        acc[categoria] = true; // ✅ Todas expandidas por defecto
        return acc;
      }, {})
    );

    const toggleCategoria = (categoria) => {
      setLocalCategoriaExpandida((prev) => ({
        ...prev,
        [categoria]: !prev[categoria],
      }));
    };

    const seleccionarTodaCategoria = (categoria) => {
      const analisisCategoria = CATEGORIAS_ANALISIS[categoria];
      const currentNames = extraerNombresAnalisis(currentAnalisis);
      const todosMarcados = analisisCategoria.every((item) =>
        currentNames.includes(item)
      );

      if (todosMarcados) {
        analisisCategoria.forEach((item) => {
          if (currentNames.includes(item)) {
            onCheckboxChange({ target: { value: item, checked: false } });
          }
        });
      } else {
        analisisCategoria.forEach((item) => {
          if (!currentNames.includes(item)) {
            onCheckboxChange({ target: { value: item, checked: true } });
          }
        });
      }
    };

    // ✅ FUNCIÓN PARA EXPANDIR/COLAPSAR TODAS
    const toggleTodasCategorias = () => {
      const todasExpandidas = Object.values(localCategoriaExpandida).every(
        Boolean
      );
      const nuevoEstado = Object.keys(CATEGORIAS_ANALISIS).reduce(
        (acc, categoria) => {
          acc[categoria] = !todasExpandidas;
          return acc;
        },
        {}
      );
      setLocalCategoriaExpandida(nuevoEstado);
    };

    const currentNames = extraerNombresAnalisis(currentAnalisis);

    return (
      <div className='space-y-3 sm:space-y-4'>
        {/* Buscador y controles - Responsive */}
        <div className='space-y-3'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Buscar análisis...'
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className='w-full px-3 sm:px-4 py-2 pl-8 sm:pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base'
            />
            <span className='absolute left-2 sm:left-3 top-2 sm:top-2.5 text-gray-400'>
              🔍
            </span>
          </div>

          {/* ✅ BOTÓN PARA EXPANDIR/COLAPSAR TODAS */}
          <div className='flex items-center justify-between'>
            <button
              type='button'
              onClick={toggleTodasCategorias}
              className='text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1'
            >
              <span>
                {Object.values(localCategoriaExpandida).every(Boolean)
                  ? "📂"
                  : "📁"}
              </span>
              <span>
                {Object.values(localCategoriaExpandida).every(Boolean)
                  ? "Colapsar todas"
                  : "Expandir todas"}
              </span>
            </button>

            <span className='text-xs sm:text-sm text-gray-500'>
              💡 Las categorías permanecen abiertas para facilitar la selección
            </span>
          </div>
        </div>

        {/* Categorías - Responsive */}
        <div className='max-h-60 sm:max-h-80 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50 p-3 sm:p-4'>
          {Object.entries(CATEGORIAS_ANALISIS).map(([categoria, items]) => {
            const itemsFiltrados = items.filter((item) =>
              item.toLowerCase().includes(localSearchTerm.toLowerCase())
            );

            if (itemsFiltrados.length === 0 && localSearchTerm) return null;

            const todosMarcados = itemsFiltrados.every((item) =>
              currentNames.includes(item)
            );
            const algunosMarcados = itemsFiltrados.some((item) =>
              currentNames.includes(item)
            );

            return (
              <div key={categoria} className='mb-3 sm:mb-4'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0'>
                  <button
                    type='button'
                    onClick={() => toggleCategoria(categoria)}
                    className='flex items-center space-x-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors text-left'
                  >
                    <span>
                      {localCategoriaExpandida[categoria] ? "📂" : "📁"}
                    </span>
                    <span className='truncate'>
                      {categoria} ({itemsFiltrados.length})
                    </span>
                    {/* ✅ INDICADOR VISUAL DE SELECCIONES */}
                    {algunosMarcados && (
                      <span className='ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full'>
                        {
                          currentNames.filter((name) =>
                            itemsFiltrados.includes(name)
                          ).length
                        }{" "}
                        seleccionados
                      </span>
                    )}
                  </button>
                  <button
                    type='button'
                    onClick={() => seleccionarTodaCategoria(categoria)}
                    className={`text-xs px-2 sm:px-3 py-1 rounded-full transition-all flex-shrink-0 ${
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

                {/* ✅ MOSTRAR SIEMPRE SI ESTÁ EXPANDIDO O HAY BÚSQUEDA */}
                {(localCategoriaExpandida[categoria] || localSearchTerm) && (
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 ml-3 sm:ml-4'>
                    {itemsFiltrados.map((item) => (
                      <label
                        key={item}
                        className={`flex items-center space-x-2 p-2 rounded-lg transition-colors cursor-pointer
                        ${
                          currentNames.includes(item)
                            ? "bg-blue-50 hover:bg-blue-100 border border-blue-200"
                            : "hover:bg-white border border-transparent"
                        }`}
                      >
                        <input
                          type='checkbox'
                          value={item}
                          checked={currentNames.includes(item)}
                          onChange={onCheckboxChange}
                          className='w-3 h-3 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                        />
                        <span
                          className={`text-xs sm:text-sm truncate transition-colors
                        ${
                          currentNames.includes(item)
                            ? "text-blue-800 font-medium"
                            : "text-gray-700"
                        }`}
                        >
                          {item}
                        </span>
                        {/* ✅ INDICADOR VISUAL CUANDO ESTÁ SELECCIONADO */}
                        {currentNames.includes(item) && (
                          <span className='text-blue-600 text-xs flex-shrink-0'>
                            ✓
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Análisis seleccionados - Responsive y mejorado */}
        {currentAnalisis.length > 0 && (
          <div className='bg-blue-50 rounded-xl p-3 sm:p-4 border border-blue-200'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-xs sm:text-sm font-medium text-blue-800'>
                Análisis seleccionados ({currentAnalisis.length}):
              </p>
              {/* ✅ BOTÓN PARA LIMPIAR TODOS */}
              <button
                type='button'
                onClick={() => {
                  currentNames.forEach((nombre) => {
                    onCheckboxChange({
                      target: { value: nombre, checked: false },
                    });
                  });
                }}
                className='text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors'
              >
                🗑️ Limpiar todos
              </button>
            </div>
            <div className='flex flex-wrap gap-1 sm:gap-2'>
              {currentNames.map((item) => (
                <span
                  key={item}
                  className='bg-blue-100 text-blue-800 text-xs px-2 sm:px-3 py-1 rounded-full flex items-center space-x-1 group'
                >
                  <span>{item}</span>
                  {/* ✅ BOTÓN X PARA QUITAR INDIVIDUAL */}
                  <button
                    type='button'
                    onClick={() =>
                      onCheckboxChange({
                        target: { value: item, checked: false },
                      })
                    }
                    className='text-blue-600 hover:text-red-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    ✕
                  </button>
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
      const analisisObjetos = convertirAnalisisStringAObjeto(analisis);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pacienteId,
          analisis: analisisObjetos,
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
    const nombresAnalisis = extraerNombresAnalisis(solicitud.analisis || []);
    setAnalisisEdit(nombresAnalisis);
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    setError("");
    if (!descripcionEdit || analisisEdit.length === 0) {
      setError("Completa todos los campos para editar.");
      return;
    }
    try {
      const analisisObjetos = convertirAnalisisStringAObjeto(analisisEdit);
      const res = await fetch(`${API_URL}/${editandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion: descripcionEdit,
          analisis: analisisObjetos,
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

  // NUEVAS FUNCIONES PARA MANEJAR VALORES
  const handleEditarValores = (solicitud) => {
    setEditandoValores(solicitud._id);
    const valoresIniciales = {};

    if (solicitud.analisis) {
      solicitud.analisis.forEach((item) => {
        const nombre = typeof item === "string" ? item : item.nombre;
        const valor = typeof item === "string" ? "" : item.valor || "";
        const unidad = typeof item === "string" ? "" : item.unidad || "";
        valoresIniciales[nombre] = { valor, unidad };
      });
    }

    setValoresTemp(valoresIniciales);
  };

  const handleCambioValor = (nombreAnalisis, campo, valor) => {
    setValoresTemp((prev) => ({
      ...prev,
      [nombreAnalisis]: {
        ...prev[nombreAnalisis],
        [campo]: valor,
      },
    }));
  };

  const handleGuardarValores = async () => {
    setError("");
    try {
      console.log("📊 Datos a enviar:", valoresTemp);

      // ✅ CORREGIDO: Obtener la solicitud actual para mantener su estructura
      const solicitudActual = solicitudes.find(
        (s) => s._id === editandoValores
      );

      if (!solicitudActual) {
        throw new Error("No se encontró la solicitud");
      }

      // ✅ NUEVO: Actualizar solo los valores en el array existente
      const analisisActualizado = solicitudActual.analisis.map((item) => {
        const nombre = typeof item === "string" ? item : item.nombre;

        // Si hay valores temporales para este análisis, actualizarlos
        if (valoresTemp[nombre]) {
          return {
            nombre: nombre,
            valor: valoresTemp[nombre].valor
              ? isNaN(parseFloat(valoresTemp[nombre].valor))
                ? valoresTemp[nombre].valor
                : parseFloat(valoresTemp[nombre].valor)
              : null,
            unidad: valoresTemp[nombre].unidad || "",
          };
        }

        // Si no hay cambios, mantener el formato original
        return typeof item === "string"
          ? { nombre: item, valor: null, unidad: "" }
          : item;
      });

      console.log("📊 Análisis actualizado:", analisisActualizado);

      // ✅ ENVIAR: Mantener toda la estructura original
      const res = await fetch(`${API_URL}/${editandoValores}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion: solicitudActual.descripcion,
          analisis: analisisActualizado, // ✅ Array completo actualizado
          pacienteId:
            solicitudActual.pacienteId._id || solicitudActual.pacienteId,
        }),
      });

      console.log("🔍 Respuesta del servidor:", res.status, res.statusText);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Error del servidor:", errorText);
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const actualizada = await res.json();
      console.log("✅ Actualización exitosa:", actualizada);

      setSolicitudes(
        solicitudes.map((s) => (s._id === editandoValores ? actualizada : s))
      );
      setEditandoValores(null);
      setValoresTemp({});

      setError(""); // Limpiar errores
      alert("✅ Valores guardados correctamente");
    } catch (err) {
      console.error("❌ Error completo:", err);
      setError(`Error al guardar valores: ${err.message}`);
    }
  };

  const handleCancelarValores = () => {
    setEditandoValores(null);
    setValoresTemp({});
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Solicitudes de Análisis", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [
        [
          "Descripción",
          "Fecha",
          "Paciente",
          "DNI",
          "Género",
          "Análisis",
          "Estado",
        ],
      ],
      body: solicitudes.map((s) => [
        s.descripcion,
        new Date(s.fechaSolicitud).toLocaleString(),
        s.pacienteId ? `${s.pacienteId.nombre} ${s.pacienteId.apellido}` : "",
        s.pacienteId ? s.pacienteId.dni : "",
        s.pacienteId ? s.pacienteId.genero : "",
        Array.isArray(s.analisis)
          ? s.analisis
              .map((a) => (typeof a === "string" ? a : a.nombre))
              .join(", ")
          : s.analisis,
        s.estado || "Pendiente",
      ]),
    });
    doc.save("solicitudes_analisis.pdf");
  };

  const exportarDetallePDF = () => {
    if (!detalle) return;
    const doc = new jsPDF();
    doc.text("Detalle de Solicitud de Análisis", 14, 16);

    // Información básica
    autoTable(doc, {
      startY: 24,
      head: [["Campo", "Valor"]],
      body: [
        ["Descripción", detalle.descripcion],
        ["Fecha", new Date(detalle.fechaSolicitud).toLocaleString()],
        ["Estado", detalle.estado || "Pendiente"],
        [
          "Paciente",
          detalle.pacienteId
            ? `${detalle.pacienteId.nombre} ${detalle.pacienteId.apellido}`
            : "",
        ],
        ["DNI", detalle.pacienteId ? detalle.pacienteId.dni : ""],
        ["Género", detalle.pacienteId ? detalle.pacienteId.genero : ""],
      ],
    });

    // Análisis con valores
    if (detalle.analisis && detalle.analisis.length > 0) {
      const analisisData = Array.isArray(detalle.analisis)
        ? detalle.analisis.map((item) => {
            if (typeof item === "string") {
              return [item, "Pendiente", ""];
            } else {
              return [
                item.nombre,
                item.valor !== null ? item.valor : "Pendiente",
                item.unidad || "",
              ];
            }
          })
        : [[detalle.analisis, "Pendiente", ""]];

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Análisis", "Valor", "Unidad"]],
        body: analisisData,
      });
    }

    doc.save(
      `solicitud_analisis_${
        detalle.pacienteId ? detalle.pacienteId.dni : "sinDNI"
      }.pdf`
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 sm:p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header - Responsive */}
        <div className='bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/20'>
          <div className='flex flex-col space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center min-w-0 flex-1'>
                <button
                  onClick={() => navigate(-1)}
                  className='mr-3 sm:mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0'
                >
                  <span className='text-sm sm:text-base'>← Volver</span>
                </button>
                <div className='min-w-0 flex-1'>
                  <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center'>
                    <span className='bg-blue-100 text-blue-600 rounded-full p-2 sm:p-3 mr-2 sm:mr-4 text-lg sm:text-xl flex-shrink-0'>
                      🧪
                    </span>
                    <span className='truncate'>Solicitudes de Análisis</span>
                  </h1>
                  <p className='text-gray-600 mt-1 text-sm sm:text-base'>
                    Gestión completa de análisis clínicos
                    <span className='hidden sm:inline'> y resultados</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción - Responsive */}
            <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3'>
              <button
                onClick={exportarPDF}
                disabled={solicitudes.length === 0}
                className='bg-green-100 text-green-700 hover:bg-green-200 px-3 sm:px-4 py-2 rounded-xl 
                  font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center space-x-2 text-sm sm:text-base'
              >
                <span>📄</span>
                <span>Exportar PDF</span>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2 
                  rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 
                  font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                  flex items-center justify-center space-x-2 text-sm sm:text-base'
              >
                <span>➕</span>
                <span>Nueva Solicitud</span>
              </button>
            </div>

            {/* Stats - Responsive Grid */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
              <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4 rounded-xl'>
                <div className='flex items-center'>
                  <span className='text-lg sm:text-2xl mr-2 sm:mr-3 flex-shrink-0'>
                    📋
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs sm:text-sm opacity-90'>Total</p>
                    <p className='text-lg sm:text-2xl font-bold'>
                      {solicitudes.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className='bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-4 rounded-xl'>
                <div className='flex items-center'>
                  <span className='text-lg sm:text-2xl mr-2 sm:mr-3 flex-shrink-0'>
                    ✅
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs sm:text-sm opacity-90'>Completadas</p>
                    <p className='text-lg sm:text-2xl font-bold'>
                      {
                        solicitudes.filter((s) => s.estado === "Completado")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className='bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-3 sm:p-4 rounded-xl'>
                <div className='flex items-center'>
                  <span className='text-lg sm:text-2xl mr-2 sm:mr-3 flex-shrink-0'>
                    ⏳
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs sm:text-sm opacity-90'>Pendientes</p>
                    <p className='text-lg sm:text-2xl font-bold'>
                      {
                        solicitudes.filter((s) => s.estado !== "Completado")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className='bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 sm:p-4 rounded-xl col-span-2 lg:col-span-1'>
                <div className='flex items-center'>
                  <span className='text-lg sm:text-2xl mr-2 sm:mr-3 flex-shrink-0'>
                    🧪
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs sm:text-sm opacity-90'>
                      Análisis Disponibles
                    </p>
                    <p className='text-lg sm:text-2xl font-bold'>
                      {Object.values(CATEGORIAS_ANALISIS).flat().length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert - Responsive */}
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-4 sm:mb-6 flex items-center'>
            <span className='text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0'>
              ⚠️
            </span>
            <span className='flex-1 text-sm sm:text-base'>{error}</span>
            <button
              onClick={() => setError("")}
              className='ml-2 text-red-700 hover:text-red-900 flex-shrink-0'
            >
              ✕
            </button>
          </div>
        )}

        {/* Form Modal - Responsive */}
        {showForm && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-white/20'>
              <div className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg sm:text-2xl font-bold'>
                    🧪 Nueva Solicitud de Análisis
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className='text-white hover:bg-white/20 rounded-lg p-2 transition-all'
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleCrear} className='p-4 sm:p-6'>
                <div className='mb-4 sm:mb-6'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    📝 Descripción de la solicitud
                  </label>
                  <input
                    type='text'
                    placeholder='Ej: Análisis de rutina, Control post-tratamiento, etc.'
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                    className='w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base'
                  />
                </div>

                <div className='mb-4 sm:mb-6'>
                  <label className='block text-sm font-medium text-gray-700 mb-3'>
                    🧪 Seleccione los análisis necesarios
                  </label>
                  <AnalysisCheckboxes
                    currentAnalisis={analisis}
                    onCheckboxChange={handleCheckboxChange}
                  />
                </div>

                <div className='flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200'>
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
                    className='w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
                      rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 
                      font-medium shadow-lg hover:shadow-xl order-1 sm:order-2'
                  >
                    ✅ Crear Solicitud
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para editar valores - Responsive */}
        {editandoValores && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-white/20'>
              <div className='bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg sm:text-2xl font-bold'>
                    📊 Ingresar Valores de Análisis
                  </h3>
                  <button
                    onClick={handleCancelarValores}
                    className='text-white hover:bg-white/20 rounded-lg p-2 transition-all'
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className='p-4 sm:p-6'>
                <div className='space-y-3 sm:space-y-4'>
                  {Object.entries(valoresTemp).map(
                    ([nombreAnalisis, datos]) => (
                      <div
                        key={nombreAnalisis}
                        className='p-3 sm:p-4 bg-gray-50 rounded-xl'
                      >
                        <h4 className='font-medium text-gray-800 mb-3 flex items-center text-sm sm:text-base'>
                          <span className='mr-2'>🧪</span>
                          <span className='truncate'>{nombreAnalisis}</span>
                        </h4>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                          <div>
                            <label className='block text-xs sm:text-sm text-gray-600 mb-1'>
                              Valor
                            </label>
                            <input
                              type='text'
                              value={datos.valor}
                              onChange={(e) =>
                                handleCambioValor(
                                  nombreAnalisis,
                                  "valor",
                                  e.target.value
                                )
                              }
                              placeholder='Ej: 120, Normal, Positivo, Negativo'
                              className='w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-lg 
  focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base'
                            />
                            {/* ✅ AGREGAR ESTA LÍNEA */}
                            <p className='text-xs text-gray-500 mt-1'>
                              Puedes ingresar números (120) o texto (Normal,
                              Positivo, etc.)
                            </p>
                          </div>
                          <div>
                            <label className='block text-xs sm:text-sm text-gray-600 mb-1'>
                              Unidad
                            </label>
                            <input
                              type='text'
                              value={datos.unidad}
                              onChange={(e) =>
                                handleCambioValor(
                                  nombreAnalisis,
                                  "unidad",
                                  e.target.value
                                )
                              }
                              placeholder='mg/dl, g/dl, etc.'
                              className='w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-lg 
                              focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base'
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className='flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6 pt-4 border-t border-gray-200'>
                  <button
                    onClick={handleCancelarValores}
                    className='w-full sm:w-auto px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 
                      transition-all duration-200 font-medium order-2 sm:order-1'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardarValores}
                    className='w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white 
                      rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 
                      font-medium shadow-lg hover:shadow-xl order-1 sm:order-2'
                  >
                    💾 Guardar Valores
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Solicitudes List - Responsive */}
        <div className='bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-white/20'>
          <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 border-b'>
            <h3 className='text-lg sm:text-xl font-bold text-gray-800 flex items-center'>
              <span className='bg-blue-100 text-blue-600 rounded-full p-2 mr-3 flex-shrink-0'>
                📊
              </span>
              <span className='truncate'>
                Lista de Solicitudes
                <span className='ml-1 sm:ml-2'>({solicitudes.length})</span>
              </span>
            </h3>
          </div>

          {solicitudes.length === 0 ? (
            <div className='p-8 sm:p-12 text-center'>
              <div className='text-4xl sm:text-6xl mb-4'>🧪</div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-700 mb-2'>
                No hay solicitudes de análisis
              </h3>
              <p className='text-gray-500 mb-6 text-sm sm:text-base'>
                Comienza creando la primera solicitud de análisis
                <span className='hidden sm:inline'> para este paciente</span>
              </p>
              <button
                onClick={() => setShowForm(true)}
                className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 
                  rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 
                  font-medium text-sm sm:text-base'
              >
                ➕ Crear Primera Solicitud
              </button>
            </div>
          ) : (
            <div className='p-4 sm:p-6'>
              <div className='space-y-3 sm:space-y-4'>
                {solicitudes.map((s) =>
                  editandoId === s._id ? (
                    <div
                      key={s._id}
                      className='bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6'
                    >
                      <form
                        onSubmit={handleGuardarEdicion}
                        className='space-y-3 sm:space-y-4'
                      >
                        <input
                          type='text'
                          value={descripcionEdit}
                          onChange={(e) => setDescripcionEdit(e.target.value)}
                          required
                          className='w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm sm:text-base'
                          placeholder='Descripción'
                        />
                        <AnalysisCheckboxes
                          currentAnalisis={analisisEdit}
                          onCheckboxChange={handleCheckboxChangeEdit}
                          isForEdit={true}
                        />
                        <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
                          <button
                            type='submit'
                            className='bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 rounded-xl 
                              font-medium transition-all duration-200 text-sm sm:text-base'
                          >
                            ✅ Guardar
                          </button>
                          <button
                            type='button'
                            className='bg-gray-400 hover:bg-gray-500 text-white px-4 sm:px-6 py-2 rounded-xl 
                              font-medium transition-all duration-200 text-sm sm:text-base'
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
                      className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 sm:p-6 
                        hover:shadow-lg transition-all duration-200'
                    >
                      <div className='flex flex-col space-y-4'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0'>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center justify-between mb-3'>
                              <h4 className='text-base sm:text-lg font-bold text-blue-900 flex items-center'>
                                <span className='mr-2'>📋</span>
                                <span className='truncate'>
                                  {s.descripcion}
                                </span>
                              </h4>
                              <span
                                className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                  s.estado === "Completado"
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : s.estado === "En proceso"
                                    ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                    : "bg-gray-100 text-gray-700 border border-gray-200"
                                }`}
                              >
                                {s.estado || "Pendiente"}
                              </span>
                            </div>

                            {s.pacienteId && (
                              <div className='space-y-1 mb-3'>
                                <p className='text-xs sm:text-sm text-gray-700 flex items-center'>
                                  <span className='mr-2'>👤</span>
                                  <span className='font-medium truncate'>
                                    {s.pacienteId.nombre}{" "}
                                    {s.pacienteId.apellido}
                                  </span>
                                </p>
                                <p className='text-xs sm:text-sm text-gray-600 flex items-center flex-wrap'>
                                  <span className='mr-2'>🆔</span>
                                  <span>DNI: {s.pacienteId.dni}</span>
                                  <span className='mx-2 hidden sm:inline'>
                                    •
                                  </span>
                                  <span className='sm:inline block mt-1 sm:mt-0'>
                                    Género: {s.pacienteId.genero}
                                  </span>
                                </p>
                              </div>
                            )}
                            <p className='text-xs text-gray-500 flex items-center'>
                              <span className='mr-2'>📅</span>
                              {new Date(s.fechaSolicitud).toLocaleDateString(
                                "es-ES",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year:
                                    window.innerWidth < 640
                                      ? "2-digit"
                                      : "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>

                            {/* Análisis solicitados preview con valores - Responsive */}
                            <div className='mt-3'>
                              <p className='text-xs sm:text-sm text-gray-600 mb-1'>
                                Análisis solicitados:
                              </p>
                              <div className='flex flex-wrap gap-1'>
                                {(Array.isArray(s.analisis) ? s.analisis : [])
                                  .slice(0, window.innerWidth < 640 ? 2 : 3)
                                  .map((analisis, index) => {
                                    const nombre =
                                      typeof analisis === "string"
                                        ? analisis
                                        : analisis.nombre;
                                    const valor =
                                      typeof analisis === "string"
                                        ? null
                                        : analisis.valor;
                                    const unidad =
                                      typeof analisis === "string"
                                        ? ""
                                        : analisis.unidad;

                                    return (
                                      <span
                                        key={index}
                                        className={`text-xs px-2 py-1 rounded-full ${
                                          valor !== null && valor !== ""
                                            ? "bg-green-100 text-green-700 border border-green-200"
                                            : "bg-blue-100 text-blue-700 border border-blue-200"
                                        }`}
                                        title={
                                          valor !== null && valor !== ""
                                            ? `${nombre}: ${valor} ${unidad}`
                                            : nombre
                                        }
                                      >
                                        <span className='truncate max-w-20 sm:max-w-none inline-block'>
                                          {nombre}
                                        </span>
                                        {valor !== null &&
                                          valor !== "" &&
                                          ` (${valor}${
                                            unidad ? " " + unidad : ""
                                          })`}
                                      </span>
                                    );
                                  })}
                                {s.analisis &&
                                  s.analisis.length >
                                    (window.innerWidth < 640 ? 2 : 3) && (
                                    <span className='bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full'>
                                      +
                                      {s.analisis.length -
                                        (window.innerWidth < 640 ? 2 : 3)}
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Botones de acción - Responsive */}
                        <div className='flex flex-wrap gap-2'>
                          <button
                            className='bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg 
                              font-medium text-xs sm:text-sm transition-all duration-200 flex items-center space-x-1 flex-1 sm:flex-none justify-center'
                            onClick={() => handleVerDetalle(s._id)}
                          >
                            <span>👁️</span>
                            <span>Detalle</span>
                          </button>

                          <button
                            className='bg-green-100 text-green-700 hover:bg-green-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg 
                              font-medium text-xs sm:text-sm transition-all duration-200 flex items-center space-x-1 flex-1 sm:flex-none justify-center'
                            onClick={() => handleEditarValores(s)}
                          >
                            <span>📊</span>
                            <span>Valores</span>
                          </button>

                          <button
                            className='bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg 
                              font-medium text-xs sm:text-sm transition-all duration-200 flex items-center space-x-1 flex-1 sm:flex-none justify-center'
                            onClick={() => handleEditar(s)}
                          >
                            <span>✏️</span>
                            <span>Editar</span>
                          </button>

                          <button
                            className='bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg 
                              font-medium text-xs sm:text-sm transition-all duration-200 flex items-center space-x-1 flex-1 sm:flex-none justify-center'
                            onClick={() =>
                              navigate(
                                `/pacientes/${pacienteId}/solicitudes/${s._id}/estudios`
                              )
                            }
                          >
                            <span>📤</span>
                            <span className='hidden sm:inline'>
                              Subir estudio
                            </span>
                            <span className='sm:hidden'>Estudio</span>
                          </button>

                          <button
                            className='bg-red-100 text-red-700 hover:bg-red-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg 
                              font-medium text-xs sm:text-sm transition-all duration-200 flex-shrink-0'
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

        {/* Detail Modal - Responsive */}
        {detalle && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-white/20'>
              <div className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl'>
                <div className='flex items-center justify-between'>
                  <h4 className='text-lg sm:text-2xl font-bold flex items-center'>
                    <span className='mr-3'>🔍</span>
                    <span className='truncate'>Detalle de Solicitud</span>
                  </h4>
                  <button
                    onClick={() => setDetalle(null)}
                    className='text-white hover:bg-white/20 rounded-lg p-2 transition-all flex-shrink-0'
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className='p-4 sm:p-6'>
                {/* Patient Info - Responsive */}
                <div className='mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl'>
                  <h5 className='font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base'>
                    <span className='mr-2'>👤</span>
                    Información del Paciente
                  </h5>
                  {detalle.pacienteId ? (
                    <div className='space-y-2'>
                      <p className='text-gray-700 text-sm sm:text-base'>
                        <span className='font-medium'>Nombre:</span>{" "}
                        {detalle.pacienteId.nombre}{" "}
                        {detalle.pacienteId.apellido}
                      </p>
                      <p className='text-gray-700 text-sm sm:text-base'>
                        <span className='font-medium'>DNI:</span>{" "}
                        {detalle.pacienteId.dni}
                      </p>
                      <p className='text-gray-700 text-sm sm:text-base'>
                        <span className='font-medium'>Género:</span>{" "}
                        {detalle.pacienteId.genero}
                      </p>
                    </div>
                  ) : (
                    <p className='text-gray-500 text-sm sm:text-base'>
                      Información del paciente no disponible
                    </p>
                  )}
                </div>

                {/* Request Details - Responsive */}
                <div className='space-y-3 sm:space-y-4 mb-4 sm:mb-6'>
                  <div className='p-3 sm:p-4 bg-blue-50 rounded-xl'>
                    <h5 className='font-semibold text-blue-800 mb-2 flex items-center text-sm sm:text-base'>
                      <span className='mr-2'>📋</span>
                      Descripción
                    </h5>
                    <p className='text-blue-700 text-sm sm:text-base'>
                      {detalle.descripcion}
                    </p>
                  </div>

                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4'>
                    <div className='p-3 sm:p-4 bg-green-50 rounded-xl'>
                      <h5 className='font-semibold text-green-800 mb-2 flex items-center text-sm sm:text-base'>
                        <span className='mr-2'>📅</span>
                        Fecha de Solicitud
                      </h5>
                      <p className='text-green-700 text-sm sm:text-base'>
                        {new Date(detalle.fechaSolicitud).toLocaleString()}
                      </p>
                    </div>

                    <div className='p-3 sm:p-4 bg-purple-50 rounded-xl'>
                      <h5 className='font-semibold text-purple-800 mb-2 flex items-center text-sm sm:text-base'>
                        <span className='mr-2'>📊</span>
                        Estado
                      </h5>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          detalle.estado === "Completado"
                            ? "bg-green-100 text-green-700"
                            : detalle.estado === "En proceso"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {detalle.estado || "Pendiente"}
                      </span>
                    </div>
                  </div>

                  <div className='p-3 sm:p-4 bg-orange-50 rounded-xl'>
                    <h5 className='font-semibold text-orange-800 mb-3 flex items-center text-sm sm:text-base'>
                      <span className='mr-2'>🧪</span>
                      Análisis y Resultados (
                      {Array.isArray(detalle.analisis)
                        ? detalle.analisis.length
                        : 0}
                      )
                    </h5>
                    {Array.isArray(detalle.analisis) ? (
                      <div className='space-y-2 sm:space-y-3'>
                        {detalle.analisis.map((analisis, index) => {
                          const nombre =
                            typeof analisis === "string"
                              ? analisis
                              : analisis.nombre;
                          const valor =
                            typeof analisis === "string"
                              ? null
                              : analisis.valor;
                          const unidad =
                            typeof analisis === "string" ? "" : analisis.unidad;

                          return (
                            <div
                              key={index}
                              className='flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 bg-white rounded-lg border space-y-1 sm:space-y-0'
                            >
                              <span className='font-medium text-gray-800 text-sm sm:text-base'>
                                {nombre}
                              </span>
                              <div className='text-left sm:text-right'>
                                {valor !== null && valor !== "" ? (
                                  <span className='text-green-700 font-semibold text-sm sm:text-base'>
                                    {valor} {unidad}
                                  </span>
                                ) : (
                                  <span className='text-gray-500 text-sm'>
                                    Pendiente
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className='bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full'>
                        {detalle.analisis}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions - Responsive */}
                <div className='flex flex-col sm:flex-row gap-3'>
                  <button
                    className='flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 
                      text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 
                      shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm sm:text-base'
                    onClick={exportarDetallePDF}
                  >
                    <span>📄</span>
                    <span>Exportar PDF</span>
                  </button>
                  <button
                    className='flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl 
                      font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base'
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
