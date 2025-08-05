import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Utilidad para saber el tipo de archivo (solo imágenes para fotos)
const getFileType = (nombreArchivo) => {
  if (!nombreArchivo) return "";
  const ext = nombreArchivo.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext))
    return "image";
  return "other";
};

// Utilidad para obtener icono según tipo de archivo
const getFileIcon = (nombreArchivo) => {
  const type = getFileType(nombreArchivo);
  return type === "image" ? "🖼️" : "📎";
};

const FotosAntesDespues = (props) => {
  const params = useParams();
  const navigate = useNavigate();
  const pacienteId = props.pacienteId || params.pacienteId;

  // Estados principales
  const [paciente, setPaciente] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Estados para formulario
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubir, setErrorSubir] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Estados del formulario
  const [tipoFoto, setTipoFoto] = useState("foto_antes");
  const [descripcion, setDescripcion] = useState("");
  const [zona, setZona] = useState("");
  const [angulo, setAngulo] = useState("");
  const [tratamientoId, setTratamientoId] = useState("");

  // Estados para filtros y vista
  const [filtroTipo, setFiltroTipo] = useState("todas");
  const [filtroZona, setFiltroZona] = useState("");
  const [vistaActual, setVistaActual] = useState("galeria"); // 'galeria' o 'comparacion'
  const [comparacion, setComparacion] = useState({
    antes: [],
    despues: [],
    durante: [],
  });

  // Opciones para los selectores
  const zonasCorporales = [
    "rostro",
    "cuerpo",
    "brazos",
    "piernas",
    "abdomen",
    "espalda",
    "pecho",
    "cuello",
    "manos",
    "pies",
    "otros",
  ];

  const angulosFoto = [
    "frontal",
    "perfil izquierdo",
    "perfil derecho",
    "lateral",
    "posterior",
    "superior",
    "inferior",
  ];

  useEffect(() => {
    cargarDatos();
  }, [pacienteId]);

  const cargarDatos = async () => {
    if (!pacienteId) return;

    setCargando(true);
    try {
      // Cargar datos del paciente y estadísticas en paralelo
      const [pacienteRes, estadisticasRes] = await Promise.all([
        fetch(`http://localhost:5000/pacientes/${pacienteId}`),
        fetch(
          `http://localhost:5000/estudios/fotos/estadisticas/${pacienteId}`
        ),
      ]);

      if (pacienteRes.ok) {
        const pacienteData = await pacienteRes.json();
        setPaciente(pacienteData);
      }

      if (estadisticasRes.ok) {
        const estadisticasData = await estadisticasRes.json();
        setEstadisticas(estadisticasData);
      }

      // Cargar fotos
      cargarFotos();
    } catch (err) {
      setError("Error al cargar los datos");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const cargarFotos = async () => {
    try {
      let url = `http://localhost:5000/estudios/fotos/paciente/${pacienteId}`;
      const params = new URLSearchParams();

      if (filtroTipo !== "todas") {
        // Convertir "antes" a "foto_antes" para la API
        const tipoApi =
          filtroTipo === "antes"
            ? "antes"
            : filtroTipo === "despues"
            ? "despues"
            : filtroTipo === "durante"
            ? "durante"
            : filtroTipo;
        params.append("tipo", tipoApi);
      }
      if (filtroZona) params.append("zona", filtroZona);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const fotosData = await response.json();
      setFotos(fotosData);
    } catch (error) {
      console.error("Error cargando fotos:", error);
      setFotos([]);
    }
  };

  const cargarComparacion = async () => {
    try {
      let url = `http://localhost:5000/estudios/fotos/comparacion/${pacienteId}`;
      const params = new URLSearchParams();

      if (filtroZona) params.append("zona", filtroZona);
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const comparacionData = await response.json();
      setComparacion(comparacionData);
    } catch (error) {
      console.error("Error cargando comparación:", error);
      setComparacion({ antes: [], despues: [], durante: [] });
    }
  };

  useEffect(() => {
    if (pacienteId) {
      if (vistaActual === "galeria") {
        cargarFotos();
      } else {
        cargarComparacion();
      }
    }
  }, [filtroTipo, filtroZona, vistaActual, pacienteId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo || !pacienteId) return;

    setSubiendo(true);
    setErrorSubir("");

    const formData = new FormData();
    formData.append("foto", archivo);
    formData.append("pacienteId", pacienteId);
    formData.append("tipoArchivo", tipoFoto);
    formData.append("descripcion", descripcion);
    formData.append("zona", zona);
    formData.append("angulo", angulo);
    if (tratamientoId) formData.append("tratamientoId", tratamientoId);

    try {
      const res = await fetch("http://localhost:5000/estudios/foto", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al subir la foto");
      }

      // Limpiar formulario
      setArchivo(null);
      setDescripcion("");
      setZona("");
      setAngulo("");
      setTratamientoId("");

      // Recargar datos
      cargarDatos();
      if (vistaActual === "galeria") {
        cargarFotos();
      } else {
        cargarComparacion();
      }
    } catch (err) {
      console.error("Error subiendo foto:", err);
      setErrorSubir(err.message || "Error al subir la foto");
    }
    setSubiendo(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Validar que sea una imagen
      if (file.type.startsWith("image/")) {
        setArchivo(file);
      } else {
        setErrorSubir("Solo se permiten archivos de imagen");
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  if (cargando) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='relative'>
            <div className='w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4'></div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-2xl'>📸</span>
            </div>
          </div>
          <p className='text-xl text-gray-600 font-medium'>Cargando fotos...</p>
          <p className='text-sm text-gray-500 mt-2'>
            Preparando galería de fotos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 p-6'>
      <div className='max-w-7xl mx-auto'>
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
                <div className='bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 mr-6 shadow-lg'>
                  <span className='text-3xl text-white'>📸</span>
                </div>
                <div>
                  <h1 className='text-4xl font-bold text-gray-900 mb-2'>
                    Fotos Antes y Después
                  </h1>
                  {paciente && (
                    <p className='text-gray-600 text-lg'>
                      {paciente.nombre} {paciente.apellido} - DNI:{" "}
                      {paciente.dni}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-white/30'>
                <button
                  onClick={() => setVistaActual("galeria")}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                    vistaActual === "galeria"
                      ? "bg-white text-purple-600 shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                  }`}
                >
                  🖼️ Galería
                </button>
                <button
                  onClick={() => setVistaActual("comparacion")}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                    vistaActual === "comparacion"
                      ? "bg-white text-purple-600 shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                  }`}
                >
                  🔄 Comparación
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8'>
            <div className='bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-blue-100 text-sm font-medium mb-1'>
                    Fotos Antes
                  </p>
                  <p className='text-3xl font-bold'>
                    {estadisticas.resumen?.antes || 0}
                  </p>
                </div>
                <div className='bg-white/20 rounded-xl p-3'>
                  <span className='text-2xl'>📷</span>
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-green-100 text-sm font-medium mb-1'>
                    Fotos Después
                  </p>
                  <p className='text-3xl font-bold'>
                    {estadisticas.resumen?.despues || 0}
                  </p>
                </div>
                <div className='bg-white/20 rounded-xl p-3'>
                  <span className='text-2xl'>✨</span>
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-orange-100 text-sm font-medium mb-1'>
                    Fotos Durante
                  </p>
                  <p className='text-3xl font-bold'>
                    {estadisticas.resumen?.durante || 0}
                  </p>
                </div>
                <div className='bg-white/20 rounded-xl p-3'>
                  <span className='text-2xl'>🔄</span>
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-purple-100 text-sm font-medium mb-1'>
                    Total Fotos
                  </p>
                  <p className='text-3xl font-bold'>
                    {estadisticas.total || 0}
                  </p>
                </div>
                <div className='bg-white/20 rounded-xl p-3'>
                  <span className='text-2xl'>📊</span>
                </div>
              </div>
            </div>
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

        {/* Formulario de subida */}
        <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8'>
          <h3 className='text-2xl font-bold text-gray-800 mb-6 flex items-center'>
            <span className='bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-3 mr-4'>
              <span className='text-xl text-purple-600'>📸</span>
            </span>
            Subir Nueva Foto
          </h3>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Tipo de foto y campos adicionales */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  Tipo de foto
                </label>
                <select
                  value={tipoFoto}
                  onChange={(e) => setTipoFoto(e.target.value)}
                  className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-white'
                >
                  <option value='foto_antes'>📷 Antes</option>
                  <option value='foto_despues'>✨ Después</option>
                  <option value='foto_durante'>🔄 Durante</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  Zona corporal
                </label>
                <select
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-white'
                >
                  <option value=''>Seleccionar zona</option>
                  {zonasCorporales.map((z) => (
                    <option key={z} value={z}>
                      {z.charAt(0).toUpperCase() + z.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>
                  Ángulo
                </label>
                <select
                  value={angulo}
                  onChange={(e) => setAngulo(e.target.value)}
                  className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-white'
                >
                  <option value=''>Seleccionar ángulo</option>
                  {angulosFoto.map((a) => (
                    <option key={a} value={a}>
                      {a.charAt(0).toUpperCase() + a.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-3'>
                Descripción (opcional)
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder='Describe la foto, tratamiento aplicado, observaciones...'
                rows='3'
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 resize-none bg-white'
              />
            </div>

            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragOver
                  ? "border-purple-400 bg-purple-50"
                  : "border-gray-300 hover:border-purple-400 hover:bg-purple-50 cursor-pointer"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById("foto-input").click()}
            >
              <div className='text-4xl mb-4'>
                {archivo ? "✅" : dragOver ? "📸" : "🖼️"}
              </div>
              <div className='space-y-2'>
                <p className='text-lg font-medium text-gray-700'>
                  {archivo
                    ? `Foto seleccionada: ${archivo.name}`
                    : dragOver
                    ? "Suelta la foto aquí"
                    : "Arrastra una foto aquí o haz clic para seleccionar"}
                </p>
                <p className='text-sm text-gray-500'>
                  Formatos soportados: JPG, PNG, GIF, BMP, WEBP
                </p>
                <p className='text-xs text-gray-400'>Tamaño máximo: 10MB</p>
              </div>

              <input
                id='foto-input'
                type='file'
                accept='image/*'
                onChange={(e) => setArchivo(e.target.files[0])}
                className='hidden'
              />
            </div>

            {/* Archivo seleccionado */}
            {archivo && (
              <div className='bg-purple-50 border border-purple-200 rounded-xl p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <span className='text-2xl mr-3'>🖼️</span>
                    <div>
                      <p className='font-medium text-purple-800'>
                        {archivo.name}
                      </p>
                      <p className='text-sm text-purple-600'>
                        {(archivo.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={() => setArchivo(null)}
                    className='text-red-600 hover:text-red-800 transition-colors'
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}

            {/* Error de subida */}
            {errorSubir && (
              <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center'>
                <span className='text-xl mr-3'>❌</span>
                <span>{errorSubir}</span>
              </div>
            )}

            {/* Botón de subida */}
            <div className='flex justify-center'>
              <button
                type='submit'
                disabled={subiendo || !archivo}
                className={`px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-200 
                  flex items-center space-x-3 ${
                    subiendo || !archivo
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  }`}
              >
                <span>{subiendo ? "⏳" : "📸"}</span>
                <span>{subiendo ? "Subiendo..." : "Subir Foto"}</span>
              </button>
            </div>
          </form>
        </div>

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
                Tipo de foto
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-white'
              >
                <option value='todas'>Todas las fotos</option>
                <option value='antes'>📷 Solo Antes</option>
                <option value='despues'>✨ Solo Después</option>
                <option value='durante'>🔄 Solo Durante</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-3'>
                Zona corporal
              </label>
              <select
                value={filtroZona}
                onChange={(e) => setFiltroZona(e.target.value)}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-white'
              >
                <option value=''>Todas las zonas</option>
                {zonasCorporales.map((z) => (
                  <option key={z} value={z}>
                    {z.charAt(0).toUpperCase() + z.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex items-end'>
              <button
                onClick={() => {
                  setFiltroTipo("todas");
                  setFiltroZona("");
                }}
                className='w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 px-6 py-3 rounded-xl 
                  font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
              >
                🔄 Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Vista de Galería */}
        {vistaActual === "galeria" && (
          <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden'>
            <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-8 border-b border-gray-200'>
              <div className='flex items-center'>
                <div className='bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-3 mr-4'>
                  <span className='text-xl text-purple-600'>🖼️</span>
                </div>
                <h3 className='text-2xl font-bold text-gray-900'>
                  Galería de Fotos ({fotos.length})
                </h3>
              </div>
            </div>

            {fotos.length === 0 ? (
              <div className='p-16 text-center'>
                <div className='bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6'>
                  <span className='text-4xl'>📸</span>
                </div>
                <h3 className='text-2xl font-bold text-gray-700 mb-3'>
                  No hay fotos subidas
                </h3>
                <p className='text-gray-500 mb-8 text-lg'>
                  Comienza subiendo la primera foto para documentar el progreso
                  del tratamiento
                </p>
              </div>
            ) : (
              <div className='p-8'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                  {fotos.map((foto) => (
                    <div
                      key={foto._id}
                      className='bg-white rounded-2xl border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden'
                    >
                      {/* Indicador de tipo */}
                      <div
                        className={`h-2 ${
                          foto.tipoArchivo === "foto_antes"
                            ? "bg-blue-500"
                            : foto.tipoArchivo === "foto_despues"
                            ? "bg-green-500"
                            : "bg-orange-500"
                        }`}
                      ></div>

                      {/* Imagen */}
                      <div className='p-4'>
                        <a
                          href={foto.archivoUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='block'
                        >
                          <img
                            src={foto.archivoUrl}
                            alt={foto.nombreArchivo}
                            className='w-full h-48 object-cover rounded-xl border border-gray-200 
                              hover:scale-105 transition-transform duration-200'
                          />
                        </a>

                        {/* Info de la foto */}
                        <div className='mt-4 space-y-2'>
                          <div className='flex items-center justify-between'>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                foto.tipoArchivo === "foto_antes"
                                  ? "bg-blue-100 text-blue-800"
                                  : foto.tipoArchivo === "foto_despues"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {foto.tipoArchivo === "foto_antes"
                                ? "📷 Antes"
                                : foto.tipoArchivo === "foto_despues"
                                ? "✨ Después"
                                : "🔄 Durante"}
                            </span>
                            <span className='text-xs text-gray-500'>
                              {new Date(foto.fechaSubida).toLocaleDateString(
                                "es-AR"
                              )}
                            </span>
                          </div>

                          {(foto.zona || foto.angulo) && (
                            <div className='flex flex-wrap gap-1'>
                              {foto.zona && (
                                <span className='bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded'>
                                  📍 {foto.zona}
                                </span>
                              )}
                              {foto.angulo && (
                                <span className='bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded'>
                                  📐 {foto.angulo}
                                </span>
                              )}
                            </div>
                          )}

                          {foto.descripcion && (
                            <p className='text-sm text-gray-600 line-clamp-2'>
                              {foto.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vista de Comparación */}
        {vistaActual === "comparacion" && (
          <div className='space-y-8'>
            {/* Comparación Antes vs Después */}
            <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden'>
              <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-8 border-b border-gray-200'>
                <div className='flex items-center'>
                  <div className='bg-gradient-to-br from-blue-100 to-green-200 rounded-xl p-3 mr-4'>
                    <span className='text-xl'>🔄</span>
                  </div>
                  <h3 className='text-2xl font-bold text-gray-900'>
                    Comparación Antes vs Después (
                    {comparacion.antes.length + comparacion.despues.length}{" "}
                    fotos)
                  </h3>
                </div>
              </div>

              <div className='p-8'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                  {/* Fotos Antes */}
                  <div>
                    <h4 className='text-xl font-bold text-blue-800 mb-6 flex items-center'>
                      <span className='bg-blue-100 rounded-lg p-2 mr-3'>
                        📷
                      </span>
                      Antes ({comparacion.antes.length})
                    </h4>

                    {comparacion.antes.length === 0 ? (
                      <div className='text-center py-12 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200'>
                        <span className='text-4xl mb-4 block'>📷</span>
                        <p className='text-blue-600 font-medium'>
                          No hay fotos de "antes"
                        </p>
                      </div>
                    ) : (
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {comparacion.antes.map((foto) => (
                          <div
                            key={foto._id}
                            className='bg-white rounded-xl border border-blue-200 overflow-hidden hover:shadow-lg transition-all'
                          >
                            <a
                              href={foto.archivoUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='block'
                            >
                              <img
                                src={foto.archivoUrl}
                                alt={foto.nombreArchivo}
                                className='w-full h-32 object-cover hover:scale-105 transition-transform duration-200'
                              />
                            </a>
                            <div className='p-3'>
                              <div className='flex justify-between items-center text-xs text-gray-600'>
                                <span>
                                  {new Date(
                                    foto.fechaSubida
                                  ).toLocaleDateString("es-AR")}
                                </span>
                                {foto.zona && <span>📍 {foto.zona}</span>}
                              </div>
                              {foto.descripcion && (
                                <p className='text-xs text-gray-500 mt-1 line-clamp-2'>
                                  {foto.descripcion}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fotos Después */}
                  <div>
                    <h4 className='text-xl font-bold text-green-800 mb-6 flex items-center'>
                      <span className='bg-green-100 rounded-lg p-2 mr-3'>
                        ✨
                      </span>
                      Después ({comparacion.despues.length})
                    </h4>

                    {comparacion.despues.length === 0 ? (
                      <div className='text-center py-12 bg-green-50 rounded-2xl border-2 border-dashed border-green-200'>
                        <span className='text-4xl mb-4 block'>✨</span>
                        <p className='text-green-600 font-medium'>
                          No hay fotos de "después"
                        </p>
                      </div>
                    ) : (
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {comparacion.despues.map((foto) => (
                          <div
                            key={foto._id}
                            className='bg-white rounded-xl border border-green-200 overflow-hidden hover:shadow-lg transition-all'
                          >
                            <a
                              href={foto.archivoUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='block'
                            >
                              <img
                                src={foto.archivoUrl}
                                alt={foto.nombreArchivo}
                                className='w-full h-32 object-cover hover:scale-105 transition-transform duration-200'
                              />
                            </a>
                            <div className='p-3'>
                              <div className='flex justify-between items-center text-xs text-gray-600'>
                                <span>
                                  {new Date(
                                    foto.fechaSubida
                                  ).toLocaleDateString("es-AR")}
                                </span>
                                {foto.zona && <span>📍 {foto.zona}</span>}
                              </div>
                              {foto.descripcion && (
                                <p className='text-xs text-gray-500 mt-1 line-clamp-2'>
                                  {foto.descripcion}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Fotos Durante el Tratamiento */}
            {comparacion.durante.length > 0 && (
              <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden'>
                <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-8 border-b border-gray-200'>
                  <div className='flex items-center'>
                    <div className='bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-3 mr-4'>
                      <span className='text-xl text-orange-600'>🔄</span>
                    </div>
                    <h3 className='text-2xl font-bold text-gray-900'>
                      Durante el Tratamiento ({comparacion.durante.length}{" "}
                      fotos)
                    </h3>
                  </div>
                </div>

                <div className='p-8'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {comparacion.durante.map((foto) => (
                      <div
                        key={foto._id}
                        className='bg-white rounded-xl border border-orange-200 overflow-hidden hover:shadow-lg transition-all'
                      >
                        <a
                          href={foto.archivoUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='block'
                        >
                          <img
                            src={foto.archivoUrl}
                            alt={foto.nombreArchivo}
                            className='w-full h-32 object-cover hover:scale-105 transition-transform duration-200'
                          />
                        </a>
                        <div className='p-3'>
                          <div className='flex justify-between items-center text-xs text-gray-600 mb-1'>
                            <span>
                              {new Date(foto.fechaSubida).toLocaleDateString(
                                "es-AR"
                              )}
                            </span>
                            {foto.zona && <span>📍 {foto.zona}</span>}
                          </div>
                          {foto.descripcion && (
                            <p className='text-xs text-gray-500 line-clamp-2'>
                              {foto.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FotosAntesDespues;
