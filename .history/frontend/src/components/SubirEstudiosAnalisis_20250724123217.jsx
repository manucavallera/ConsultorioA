import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const FotosAntesDespues = (props) => {
  const params = useParams();
  const navigate = useNavigate();
  const pacienteId = props.pacienteId || params.pacienteId;

  // Estados principales
  const [paciente, setPaciente] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({ resumen: { antes: 0, despues: 0 }, total: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Estados para formulario - SIMPLIFICADO
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubir, setErrorSubir] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [tipoFoto, setTipoFoto] = useState("foto_antes");
  const [descripcion, setDescripcion] = useState("");

  // Estados para vista - SIMPLIFICADO
  const [filtroTipo, setFiltroTipo] = useState("todas");
  const [vistaActual, setVistaActual] = useState("galeria");
  const [comparacion, setComparacion] = useState({ antes: [], despues: [] });

  useEffect(() => {
    cargarDatos();
  }, [pacienteId]);

  const cargarDatos = async () => {
    if (!pacienteId) return;
    
    setCargando(true);
    try {
      // Cargar paciente
      try {
        const pacienteRes = await fetch(`http://localhost:5000/pacientes/${pacienteId}`);
        if (pacienteRes.ok) {
          const pacienteData = await pacienteRes.json();
          setPaciente(pacienteData);
        }
      } catch (err) {
        console.error("Error cargando paciente:", err);
      }

      // Cargar estadísticas
      try {
        const estadisticasRes = await fetch(`http://localhost:5000/estudios/fotos/estadisticas/${pacienteId}`);
        if (estadisticasRes.ok) {
          const estadisticasData = await estadisticasRes.json();
          setEstadisticas(estadisticasData);
        }
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
        setEstadisticas({ resumen: { antes: 0, despues: 0 }, total: 0 });
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
      
      if (filtroTipo !== "todas") {
        const tipoApi = filtroTipo === "antes" ? "antes" : "despues";
        url += `?tipo=${tipoApi}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const fotosData = await response.json();
        setFotos(Array.isArray(fotosData) ? fotosData : []);
      } else {
        setFotos([]);
      }
    } catch (error) {
      console.error("Error cargando fotos:", error);
      setFotos([]);
    }
  };

  const cargarComparacion = async () => {
    try {
      const response = await fetch(`http://localhost:5000/estudios/fotos/comparacion/${pacienteId}`);
      if (response.ok) {
        const comparacionData = await response.json();
        setComparacion(comparacionData);
      } else {
        setComparacion({ antes: [], despues: [] });
      }
    } catch (error) {
      console.error("Error cargando comparación:", error);
      setComparacion({ antes: [], despues: [] });
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
  }, [filtroTipo, vistaActual, pacienteId]);

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
      if (file.type.startsWith('image/')) {
        setArchivo(file);
        setErrorSubir("");
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
  );
};

export default FotosAntesDespues;      </div>
          <p className='text-xl text-gray-600 font-medium'>Cargando fotos...</p>
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
                <span className='group-hover:-translate-x-1 transition-transform duration-200'>←</span> Volver
              </button>
              <div className='flex items-center'>
                <div className='bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 mr-6 shadow-lg'>
                  <span className='text-3xl text-white'>📸</span>
                </div>
                <div>
                  <h1 className='text-4xl font-bold text-gray-900 mb-2'>Fotos Antes y Después</h1>
                  {paciente && (
                    <p className='text-gray-600 text-lg'>
                      {paciente.nombre} {paciente.apellido} - DNI: {paciente.dni}
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

          {/* Estadísticas simplificadas */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8'>
            <div className='bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-blue-100 text-sm font-medium mb-1'>Fotos Antes</p>
                  <p className='text-3xl font-bold'>{estadisticas.resumen?.antes || 0}</p>
                </div>
                <div className='bg-white/20 rounded-xl p-3'>
                  <span className='text-2xl'>📷</span>
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-green-100 text-sm font-medium mb-1'>Fotos Después</p>
                  <p className='text-3xl font-bold'>{estadisticas.resumen?.despues || 0}</p>
                </div>
                <div className='bg-white/20 rounded-xl p-3'>
                  <span className='text-2xl'>✨</span>
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-purple-100 text-sm font-medium mb-1'>Total Fotos</p>
                  <p className='text-3xl font-bold'>{estadisticas.total || 0}</p>
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
            <span className='text-xl mr-3'>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Formulario de subida - SIMPLIFICADO */}
        <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8'>
          <h3 className='text-2xl font-bold text-gray-800 mb-6 flex items-center'>
            <span className='bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-3 mr-4'>
              <span className='text-xl text-purple-600'>📸</span>
            </span>
            Subir Nueva Foto
          </h3>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Tipo de foto y descripción */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>Tipo de foto</label>
                <select
                  value={tipoFoto}
                  onChange={(e) => setTipoFoto(e.target.value)}
                  className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-white'
                >
                  <option value="foto_antes">📷 Antes</option>
                  <option value="foto_despues">✨ Después</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-3'>Descripción (opcional)</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder='Describe la foto...'
                  className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-white'
                />
              </div>
            </div>

            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                dragOver
                  ? "border-purple-400 bg-purple-50"
                  : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
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
                <p className='text-sm text-gray-500'>Formatos soportados: JPG, PNG, GIF, BMP, WEBP</p>
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
                      <p className='font-medium text-purple-800'>{archivo.name}</p>
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

        {/* Filtros simplificados */}
        <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8'>
          <div className='flex items-center mb-6'>
            <div className='bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-3 mr-4'>
              <span className='text-xl'>🔍</span>
            </div>
            <h3 className='text-2xl font-bold text-gray-900'>Filtros</h3>
          </div>

          <div className='flex gap-6'>
            <div className='flex-1'>
              <label className='block text-sm font-semibold text-gray-700 mb-3'>Tipo de foto</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-white'
              >
                <option value="todas">Todas las fotos</option>
                <option value="antes">📷 Solo Antes</option>
                <option value="despues">✨ Solo Después</option>
              </select>
            </div>

            <div className='flex items-end'>
              <button
                onClick={() => setFiltroTipo("todas")}
                className='px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 rounded-xl 
                  font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
              >
                🔄 Limpiar
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
                <h3 className='text-2xl font-bold text-gray-900'>Galería de Fotos ({fotos.length})</h3>
              </div>
            </div>

            {fotos.length === 0 ? (
              <div className='p-16 text-center'>
                <div className='bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6'>
                  <span className='text-4xl'>📸</span>
                </div>
                <h3 className='text-2xl font-bold text-gray-700 mb-3'>No hay fotos subidas</h3>
                <p className='text-gray-500 mb-8 text-lg'>
                  Comienza subiendo la primera foto para documentar el progreso del tratamiento
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
                      <div className={`h-2 ${
                        foto.tipoArchivo === 'foto_antes' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>

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
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              foto.tipoArchivo === 'foto_antes' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {foto.tipoArchivo === 'foto_antes' ? '📷 Antes' : '✨ Después'}
                            </span>
                            <span className='text-xs text-gray-500'>
                              {new Date(foto.fechaSubida).toLocaleDateString("es-AR")}
                            </span>
                          </div>

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
          <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden'>
            <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-8 border-b border-gray-200'>
              <div className='flex items-center'>
                <div className='bg-gradient-to-br from-blue-100 to-green-200 rounded-xl p-3 mr-4'>
                  <span className='text-xl'>🔄</span>
                </div>
                <h3 className='text-2xl font-bold text-gray-900'>
                  Comparación Antes vs Después ({comparacion.antes.length + comparacion.despues.length} fotos)
                </h3>
              </div>
            </div>

            <div className='p-8'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Fotos Antes */}
                <div>
                  <h4 className='text-xl font-bold text-blue-800 mb-6 flex items-center'>
                    <span className='bg-blue-100 rounded-lg p-2 mr-3'>📷</span>
                    Antes ({comparacion.antes.length})
                  </h4>
                  
                  {comparacion.antes.length === 0 ? (
                    <div className='text-center py-12 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200'>
                      <span className='text-4xl mb-4 block'>📷</span>
                      <p className='text-blue-600 font-medium'>No hay fotos de "antes"</p>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      {comparacion.antes.map((foto) => (
                        <div key={foto._id} className='bg-white rounded-xl border border-blue-200 overflow-hidden hover:shadow-lg transition-all'>
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
                            <div className='text-xs text-gray-600 mb-1'>
                              {new Date(foto.fechaSubida).toLocaleDateString("es-AR")}
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
                  )}
                </div>

                {/* Fotos Después */}
                <div>
                  <h4 className='text-xl font-bold text-green-800 mb-6 flex items-center'>
                    <span className='bg-green-100 rounded-lg p-2 mr-3'>✨</span>
                    Después ({comparacion.despues.length})
                  </h4>
                  
                  {comparacion.despues.length === 0 ? (
                    <div className='text-center py-12 bg-green-50 rounded-2xl border-2 border-dashed border-green-200'>
                      <span className='text-4xl mb-4 block'>✨</span>
                      <p className='text-green-600 font-medium'>No hay fotos de "después"</p>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      {comparacion.despues.map((foto) => (
                        <div key={foto._id} className='bg-white rounded-xl border border-green-200 overflow-hidden hover:shadow-lg transition-all'>
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
                            <div className='text-xs text-gray-600 mb-1'>
                              {new Date(foto.fechaSubida).toLocaleDateString("es-AR")}
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
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>