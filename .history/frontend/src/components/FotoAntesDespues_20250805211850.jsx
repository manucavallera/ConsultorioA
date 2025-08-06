import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const FotosAntesDepues = () => {
  const { pacienteId } = useParams();
  const navigate = useNavigate();

  const [comparacion, setComparacion] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [tipoSubida, setTipoSubida] = useState("antes");
  const [archivo, setArchivo] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [modoComparacion, setModoComparacion] = useState("lado"); // "lado" o "vertical"

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    cargarDatos();
  }, [pacienteId]);

  // 🔧 FUNCIÓN CORREGIDA PARA MANEJAR ERROR 500
  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Cargar comparación (principal)
      const compRes = await fetch(`${API_URL}/fotos/comparacion/${pacienteId}`);

      if (compRes.ok) {
        const compData = await compRes.json();
        setComparacion(compData);

        // 🆕 CALCULAR ESTADÍSTICAS DESDE COMPARACIÓN
        if (compData) {
          const estadisticasCalculadas = {
            antes: compData.antes?.total || 0,
            despues: compData.despues?.total || 0,
            total:
              (compData.antes?.total || 0) + (compData.despues?.total || 0),
          };
          setEstadisticas(estadisticasCalculadas);
        }
      }

      // 🔧 INTENTAR cargar estadísticas (opcional)
      try {
        const statsRes = await fetch(
          `${API_URL}/fotos/estadisticas/${pacienteId}`
        );
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setEstadisticas(statsData);
        }
      } catch (statsError) {
        console.log("Usando estadísticas calculadas desde comparación");
        // Ya tenemos estadísticas calculadas arriba
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      setError("Error al cargar los datos");
    } finally {
      setCargando(false);
    }
  };

  const handleSubir = async (e) => {
    e.preventDefault();
    if (!archivo) return;

    setSubiendo(true);
    setError("");
    setExito("");

    const formData = new FormData();
    formData.append("pacienteId", pacienteId);
    formData.append("tipoFoto", tipoSubida);
    formData.append("archivo", archivo);
    formData.append("descripcion", descripcion);

    try {
      const res = await fetch(`${API_URL}/fotos`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al subir la foto");
      }

      setExito(`¡Foto "${tipoSubida}" subida exitosamente!`);
      setArchivo(null);
      setDescripcion("");

      // Recargar datos
      await cargarDatos();

      setTimeout(() => setExito(""), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendo(false);
    }
  };

  const handleEliminar = async (fotoId, tipoFoto) => {
    if (!window.confirm(`¿Estás seguro de eliminar esta foto "${tipoFoto}"?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/fotos/${fotoId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setExito("Foto eliminada exitosamente");
        await cargarDatos();
        setTimeout(() => setExito(""), 3000);
      } else {
        const errData = await res.json();
        setError(errData.message || "Error al eliminar la foto");
      }
    } catch (error) {
      setError("Error al eliminar la foto");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      setArchivo(files[0]);
      setError("");
    } else {
      setError("Solo se permiten archivos de imagen");
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
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4'>
        <div className='text-center'>
          <div className='text-4xl sm:text-6xl mb-4'>📸</div>
          <p className='text-lg sm:text-xl text-gray-600'>Cargando fotos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 p-4 sm:p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header - Responsive */}
        <div className='bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/20'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0'>
            <div className='flex items-center min-w-0 flex-1'>
              <button
                onClick={() => navigate(-1)}
                className='mr-3 sm:mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0'
              >
                <span className='text-sm sm:text-base'>← Volver</span>
              </button>
              <div className='min-w-0 flex-1'>
                <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center'>
                  <span className='bg-purple-100 text-purple-600 rounded-full p-2 sm:p-3 mr-2 sm:mr-4 text-lg sm:text-xl flex-shrink-0'>
                    📸
                  </span>
                  <span className='truncate'>Fotos Antes y Después</span>
                </h1>
                <p className='text-gray-600 mt-1 text-sm sm:text-base truncate'>
                  {comparacion?.paciente
                    ? `${comparacion.paciente.nombre} ${comparacion.paciente.apellido}`
                    : "Gestión de fotos de tratamiento"}
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas - Responsive Grid */}
          {estadisticas && (
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6'>
              <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4 rounded-xl'>
                <div className='flex items-center'>
                  <span className='text-lg sm:text-2xl mr-2 sm:mr-3 flex-shrink-0'>
                    📷
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs sm:text-sm opacity-90'>Fotos Antes</p>
                    <p className='text-lg sm:text-2xl font-bold'>
                      {estadisticas.antes}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-4 rounded-xl'>
                <div className='flex items-center'>
                  <span className='text-lg sm:text-2xl mr-2 sm:mr-3 flex-shrink-0'>
                    📸
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs sm:text-sm opacity-90'>
                      Fotos Después
                    </p>
                    <p className='text-lg sm:text-2xl font-bold'>
                      {estadisticas.despues}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 sm:p-4 rounded-xl'>
                <div className='flex items-center'>
                  <span className='text-lg sm:text-2xl mr-2 sm:mr-3 flex-shrink-0'>
                    📊
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs sm:text-sm opacity-90'>Total Fotos</p>
                    <p className='text-lg sm:text-2xl font-bold'>
                      {estadisticas.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 sm:p-4 rounded-xl'>
                <div className='flex items-center'>
                  <span className='text-lg sm:text-2xl mr-2 sm:mr-3 flex-shrink-0'>
                    ✨
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs sm:text-sm opacity-90'>Comparación</p>
                    <p className='text-sm sm:text-lg font-bold'>
                      {estadisticas.antes > 0 && estadisticas.despues > 0
                        ? "Lista"
                        : "Pendiente"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mensajes - Responsive */}
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-4 sm:mb-6 flex items-center'>
            <span className='text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0'>
              ❌
            </span>
            <span className='text-sm sm:text-base'>{error}</span>
          </div>
        )}

        {exito && (
          <div className='bg-green-100 border border-green-400 text-green-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-4 sm:mb-6 flex items-center'>
            <span className='text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0'>
              ✅
            </span>
            <span className='text-sm sm:text-base'>{exito}</span>
          </div>
        )}

        {/* Formulario de subida - Responsive */}
        <div className='bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-white/20'>
          <h3 className='text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center'>
            <span className='bg-blue-100 text-blue-600 rounded-full p-2 mr-3 flex-shrink-0'>
              ⬆️
            </span>
            <span className='truncate'>Subir Nueva Foto</span>
          </h3>

          <form onSubmit={handleSubir} className='space-y-4 sm:space-y-6'>
            {/* Selector de tipo - Responsive */}
            <div className='flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-6'>
              <label className='flex items-center'>
                <input
                  type='radio'
                  value='antes'
                  checked={tipoSubida === "antes"}
                  onChange={(e) => setTipoSubida(e.target.value)}
                  className='mr-2 sm:mr-3'
                />
                <span className='text-sm sm:text-lg'>
                  📷 Antes del tratamiento
                </span>
              </label>
              <label className='flex items-center'>
                <input
                  type='radio'
                  value='despues'
                  checked={tipoSubida === "despues"}
                  onChange={(e) => setTipoSubida(e.target.value)}
                  className='mr-2 sm:mr-3'
                />
                <span className='text-sm sm:text-lg'>
                  📸 Después del tratamiento
                </span>
              </label>
            </div>

            {/* Drop Zone - Responsive */}
            <div
              className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-all duration-200 cursor-pointer
                ${
                  dragOver
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById("file-input").click()}
            >
              <div className='text-2xl sm:text-4xl mb-2 sm:mb-4'>
                {archivo ? "✅" : dragOver ? "📤" : "📁"}
              </div>
              <div className='space-y-2'>
                <p className='text-sm sm:text-lg font-medium text-gray-700'>
                  {archivo
                    ? `Imagen seleccionada: ${archivo.name}`
                    : dragOver
                    ? "Suelta la imagen aquí"
                    : "Arrastra una imagen aquí o haz clic para seleccionar"}
                </p>
                <p className='text-xs sm:text-sm text-gray-500'>
                  Solo imágenes: JPG, PNG, GIF, WEBP
                </p>
              </div>

              <input
                id='file-input'
                type='file'
                accept='image/*'
                onChange={(e) => setArchivo(e.target.files[0])}
                className='hidden'
              />
            </div>

            {/* Descripción - Responsive */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Descripción (opcional)
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder='Ej: Primera sesión, lado derecho, vista frontal...'
                className='w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base'
                rows='3'
              />
            </div>

            {/* Botón de subida - Responsive */}
            <div className='flex justify-center'>
              <button
                type='submit'
                disabled={subiendo || !archivo}
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base ${
                  subiendo || !archivo
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                <span>{subiendo ? "⏳" : "📤"}</span>
                <span>
                  {subiendo ? "Subiendo..." : `Subir foto ${tipoSubida}`}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Comparación de fotos - Responsive */}
        {comparacion && (
          <div className='bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden border border-white/20'>
            <div className='bg-gradient-to-r from-purple-50 to-blue-50 p-4 sm:p-6 border-b'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0'>
                <h3 className='text-lg sm:text-xl font-bold text-gray-800 flex items-center'>
                  <span className='bg-purple-100 text-purple-600 rounded-full p-2 mr-3 flex-shrink-0'>
                    🔄
                  </span>
                  <span className='truncate'>Comparación Antes y Después</span>
                </h3>
                <div className='flex flex-col sm:flex-row gap-2'>
                  <button
                    onClick={cargarDatos}
                    className='px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded-lg transition-colors'
                  >
                    🔄 Actualizar
                  </button>
                  {/* Toggle modo comparación - Solo desktop */}
                  <div className='hidden sm:flex bg-gray-100 rounded-lg p-1'>
                    <button
                      onClick={() => setModoComparacion("lado")}
                      className={`px-3 py-1 text-xs rounded-md transition-all ${
                        modoComparacion === "lado"
                          ? "bg-white shadow-sm text-gray-900"
                          : "text-gray-600"
                      }`}
                    >
                      Lado a lado
                    </button>
                    <button
                      onClick={() => setModoComparacion("vertical")}
                      className={`px-3 py-1 text-xs rounded-md transition-all ${
                        modoComparacion === "vertical"
                          ? "bg-white shadow-sm text-gray-900"
                          : "text-gray-600"
                      }`}
                    >
                      Vertical
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className='p-4 sm:p-6'>
              {/* 🆕 VISTA DE COMPARACIÓN RESPONSIVE */}
              {comparacion.tieneComparacion &&
                comparacion.antes.fotos.length > 0 &&
                comparacion.despues.fotos.length > 0 && (
                  <div className='mb-6 sm:mb-8'>
                    <h4 className='text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6 text-center flex items-center justify-center'>
                      <span className='mr-2'>⚡</span>
                      Comparación Directa
                      <span className='ml-2'>⚡</span>
                    </h4>

                    {/* Comparación responsive */}
                    <div className='bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 rounded-2xl p-3 sm:p-6 mb-4 sm:mb-6'>
                      <div className='relative bg-black rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto'>
                        {/* Desktop: Lado a lado | Móvil: Vertical */}
                        <div
                          className={`flex ${
                            modoComparacion === "vertical" ||
                            window.innerWidth < 640
                              ? "flex-col"
                              : "flex-row"
                          }`}
                        >
                          {/* IMAGEN ANTES */}
                          <div
                            className={`${
                              modoComparacion === "vertical" ||
                              window.innerWidth < 640
                                ? "w-full"
                                : "w-1/2"
                            } relative group cursor-pointer`}
                          >
                            <img
                              src={comparacion.antes.fotos[0].archivoUrl}
                              alt='Antes del tratamiento'
                              className={`w-full ${
                                modoComparacion === "vertical" ||
                                window.innerWidth < 640
                                  ? "h-48 sm:h-64"
                                  : "h-64 sm:h-96"
                              } object-cover`}
                              onClick={() =>
                                window.open(
                                  comparacion.antes.fotos[0].archivoUrl,
                                  "_blank"
                                )
                              }
                            />
                            {/* Overlay responsive */}
                            <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent group-hover:from-black/50 transition-all duration-300'>
                              <div className='absolute top-2 sm:top-4 left-2 sm:left-4'>
                                <span className='bg-blue-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg'>
                                  📷 ANTES
                                </span>
                              </div>
                              <div className='absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white'>
                                <p className='text-xs sm:text-sm font-medium'>
                                  {new Date(
                                    comparacion.antes.fotos[0].fechaSubida
                                  ).toLocaleDateString("es-AR")}
                                </p>
                                {comparacion.antes.fotos[0].descripcion && (
                                  <p className='text-xs opacity-90 mt-1 hidden sm:block'>
                                    {comparacion.antes.fotos[0].descripcion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* LÍNEA DIVISORIA */}
                          <div
                            className={`${
                              modoComparacion === "vertical" ||
                              window.innerWidth < 640
                                ? "h-1 w-full"
                                : "w-1 h-full"
                            } bg-white relative z-10 shadow-xl`}
                          >
                            <div
                              className={`absolute ${
                                modoComparacion === "vertical" ||
                                window.innerWidth < 640
                                  ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                  : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                              }`}
                            >
                              <div className='bg-white text-gray-800 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shadow-lg text-xs sm:text-sm font-bold'>
                                VS
                              </div>
                            </div>
                          </div>

                          {/* IMAGEN DESPUÉS */}
                          <div
                            className={`${
                              modoComparacion === "vertical" ||
                              window.innerWidth < 640
                                ? "w-full"
                                : "w-1/2"
                            } relative group cursor-pointer`}
                          >
                            <img
                              src={comparacion.despues.fotos[0].archivoUrl}
                              alt='Después del tratamiento'
                              className={`w-full ${
                                modoComparacion === "vertical" ||
                                window.innerWidth < 640
                                  ? "h-48 sm:h-64"
                                  : "h-64 sm:h-96"
                              } object-cover`}
                              onClick={() =>
                                window.open(
                                  comparacion.despues.fotos[0].archivoUrl,
                                  "_blank"
                                )
                              }
                            />
                            {/* Overlay responsive */}
                            <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent group-hover:from-black/50 transition-all duration-300'>
                              <div className='absolute top-2 sm:top-4 right-2 sm:right-4'>
                                <span className='bg-green-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg'>
                                  📸 DESPUÉS
                                </span>
                              </div>
                              <div className='absolute bottom-2 sm:bottom-4 right-2 sm:right-4 text-white text-right'>
                                <p className='text-xs sm:text-sm font-medium'>
                                  {new Date(
                                    comparacion.despues.fotos[0].fechaSubida
                                  ).toLocaleDateString("es-AR")}
                                </p>
                                {comparacion.despues.fotos[0].descripcion && (
                                  <p className='text-xs opacity-90 mt-1 hidden sm:block'>
                                    {comparacion.despues.fotos[0].descripcion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Título flotante responsive */}
                        <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                          <div className='bg-white text-gray-800 px-3 sm:px-6 py-1 sm:py-2 rounded-full shadow-xl border-2 sm:border-4 border-gray-100'>
                            <span className='font-bold text-xs sm:text-sm'>
                              COMPARACIÓN
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Separador y descripción */}
                      <div className='mt-4 sm:mt-6 text-center'>
                        <div className='flex items-center justify-center mb-3 sm:mb-4'>
                          <div className='flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>
                          <div className='mx-4 bg-purple-100 text-purple-600 rounded-full p-2'>
                            <span className='text-sm sm:text-lg'>✨</span>
                          </div>
                          <div className='flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>
                        </div>
                        <p className='text-gray-600 text-xs sm:text-sm'>
                          Haz clic en cualquier lado de la imagen para verla en
                          tamaño completo
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* 🆕 TODAS LAS FOTOS ORGANIZADAS - Responsive */}
              <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8'>
                {/* Fotos ANTES */}
                <div>
                  <h4 className='text-base sm:text-lg font-semibold text-blue-800 mb-3 sm:mb-4 flex items-center'>
                    <span className='mr-2'>📷</span>
                    <span className='truncate'>
                      Fotos ANTES ({comparacion.antes.total})
                    </span>
                  </h4>

                  {comparacion.antes.fotos.length === 0 ? (
                    <div className='bg-blue-50 rounded-xl p-6 sm:p-8 text-center'>
                      <div className='text-3xl sm:text-4xl mb-2'>📷</div>
                      <p className='text-blue-600 text-sm sm:text-base'>
                        No hay fotos de "antes" aún
                      </p>
                      <p className='text-xs sm:text-sm text-blue-500 mt-2'>
                        Sube la primera foto arriba
                      </p>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                      {comparacion.antes.fotos.map((foto, index) => (
                        <div
                          key={foto._id}
                          className='bg-blue-50 rounded-xl p-3 hover:shadow-md transition-all duration-200 relative'
                        >
                          {index === 0 && (
                            <div className='absolute -top-2 -right-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full font-bold z-10'>
                              ⭐ Principal
                            </div>
                          )}
                          <div className='aspect-w-16 aspect-h-12 mb-3'>
                            <img
                              src={foto.archivoUrl}
                              alt={foto.descripcion || "Foto antes"}
                              className='w-full h-24 sm:h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200'
                              onClick={() =>
                                window.open(foto.archivoUrl, "_blank")
                              }
                            />
                          </div>
                          <div className='flex justify-between items-start'>
                            <div className='flex-1 min-w-0'>
                              <p className='text-xs text-blue-700 font-medium'>
                                {new Date(foto.fechaSubida).toLocaleDateString(
                                  "es-AR"
                                )}
                              </p>
                              {foto.descripcion && (
                                <p className='text-xs text-blue-600 mt-1 truncate'>
                                  {foto.descripcion}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleEliminar(foto._id, "antes")}
                              className='text-red-500 hover:text-red-700 p-1 transition-colors flex-shrink-0'
                              title='Eliminar foto'
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fotos DESPUÉS */}
                <div>
                  <h4 className='text-base sm:text-lg font-semibold text-green-800 mb-3 sm:mb-4 flex items-center'>
                    <span className='mr-2'>📸</span>
                    <span className='truncate'>
                      Fotos DESPUÉS ({comparacion.despues.total})
                    </span>
                  </h4>

                  {comparacion.despues.fotos.length === 0 ? (
                    <div className='bg-green-50 rounded-xl p-6 sm:p-8 text-center'>
                      <div className='text-3xl sm:text-4xl mb-2'>📸</div>
                      <p className='text-green-600 text-sm sm:text-base'>
                        No hay fotos de "después" aún
                      </p>
                      <p className='text-xs sm:text-sm text-green-500 mt-2'>
                        Sube la primera foto arriba
                      </p>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                      {comparacion.despues.fotos.map((foto, index) => (
                        <div
                          key={foto._id}
                          className='bg-green-50 rounded-xl p-3 hover:shadow-md transition-all duration-200 relative'
                        >
                          {index === 0 && (
                            <div className='absolute -top-2 -right-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full font-bold z-10'>
                              ⭐ Principal
                            </div>
                          )}
                          <div className='aspect-w-16 aspect-h-12 mb-3'>
                            <img
                              src={foto.archivoUrl}
                              alt={foto.descripcion || "Foto después"}
                              className='w-full h-24 sm:h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200'
                              onClick={() =>
                                window.open(foto.archivoUrl, "_blank")
                              }
                            />
                          </div>
                          <div className='flex justify-between items-start'>
                            <div className='flex-1 min-w-0'>
                              <p className='text-xs text-green-700 font-medium'>
                                {new Date(foto.fechaSubida).toLocaleDateString(
                                  "es-AR"
                                )}
                              </p>
                              {foto.descripcion && (
                                <p className='text-xs text-green-600 mt-1 truncate'>
                                  {foto.descripcion}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                handleEliminar(foto._id, "después")
                              }
                              className='text-red-500 hover:text-red-700 p-1 transition-colors flex-shrink-0'
                              title='Eliminar foto'
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mensaje de comparación - Responsive */}
              {comparacion.tieneComparacion && (
                <div className='mt-6 sm:mt-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 sm:p-6 text-center'>
                  <div className='text-3xl sm:text-4xl mb-2'>🎉</div>
                  <h3 className='text-lg sm:text-xl font-bold text-gray-800 mb-2'>
                    ¡Comparación completa!
                  </h3>
                  <p className='text-gray-600 text-sm sm:text-base'>
                    Ya tienes fotos de antes y después del tratamiento. La
                    comparación principal muestra las fotos más recientes de
                    cada categoría.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FotosAntesDepues;
