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

  useEffect(() => {
    cargarDatos();
  }, [pacienteId]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Cargar comparación y estadísticas
      const [compRes, statsRes] = await Promise.all([
        fetch(`http://localhost:5000/fotos/comparacion/${pacienteId}`),
        fetch(`http://localhost:5000/fotos/estadisticas/${pacienteId}`),
      ]);

      if (compRes.ok) {
        const compData = await compRes.json();
        setComparacion(compData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setEstadisticas(statsData);
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
      const res = await fetch("http://localhost:5000/fotos", {
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
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>📸</div>
          <p className='text-xl text-gray-600'>Cargando fotos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 p-6'>
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
                  <span className='bg-purple-100 text-purple-600 rounded-full p-3 mr-4'>
                    📸
                  </span>
                  Fotos Antes y Después
                </h1>
                <p className='text-gray-600 mt-1'>
                  {comparacion?.paciente
                    ? `${comparacion.paciente.nombre} ${comparacion.paciente.apellido}`
                    : "Gestión de fotos de tratamiento"}
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          {estadisticas && (
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mt-6'>
              <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl'>
                <div className='flex items-center'>
                  <span className='text-2xl mr-3'>📷</span>
                  <div>
                    <p className='text-sm opacity-90'>Fotos Antes</p>
                    <p className='text-2xl font-bold'>{estadisticas.antes}</p>
                  </div>
                </div>
              </div>

              <div className='bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl'>
                <div className='flex items-center'>
                  <span className='text-2xl mr-3'>📸</span>
                  <div>
                    <p className='text-sm opacity-90'>Fotos Después</p>
                    <p className='text-2xl font-bold'>{estadisticas.despues}</p>
                  </div>
                </div>
              </div>

              <div className='bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl'>
                <div className='flex items-center'>
                  <span className='text-2xl mr-3'>📊</span>
                  <div>
                    <p className='text-sm opacity-90'>Total Fotos</p>
                    <p className='text-2xl font-bold'>{estadisticas.total}</p>
                  </div>
                </div>
              </div>

              <div className='bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl'>
                <div className='flex items-center'>
                  <span className='text-2xl mr-3'>✨</span>
                  <div>
                    <p className='text-sm opacity-90'>Comparación</p>
                    <p className='text-lg font-bold'>
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

        {/* Mensajes */}
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center'>
            <span className='text-xl mr-3'>❌</span>
            <span>{error}</span>
          </div>
        )}

        {exito && (
          <div className='bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl mb-6 flex items-center'>
            <span className='text-xl mr-3'>✅</span>
            <span>{exito}</span>
          </div>
        )}

        {/* Formulario de subida */}
        <div className='bg-white rounded-2xl shadow-lg p-6 mb-8'>
          <h3 className='text-xl font-bold text-gray-800 mb-6 flex items-center'>
            <span className='bg-blue-100 text-blue-600 rounded-full p-2 mr-3'>
              ⬆️
            </span>
            Subir Nueva Foto
          </h3>

          <form onSubmit={handleSubir} className='space-y-6'>
            {/* Selector de tipo */}
            <div className='flex space-x-4'>
              <label className='flex items-center'>
                <input
                  type='radio'
                  value='antes'
                  checked={tipoSubida === "antes"}
                  onChange={(e) => setTipoSubida(e.target.value)}
                  className='mr-2'
                />
                <span className='text-lg'>📷 Antes del tratamiento</span>
              </label>
              <label className='flex items-center'>
                <input
                  type='radio'
                  value='despues'
                  checked={tipoSubida === "despues"}
                  onChange={(e) => setTipoSubida(e.target.value)}
                  className='mr-2'
                />
                <span className='text-lg'>📸 Después del tratamiento</span>
              </label>
            </div>

            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
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
              <div className='text-4xl mb-4'>
                {archivo ? "✅" : dragOver ? "📤" : "📁"}
              </div>
              <div className='space-y-2'>
                <p className='text-lg font-medium text-gray-700'>
                  {archivo
                    ? `Imagen seleccionada: ${archivo.name}`
                    : dragOver
                    ? "Suelta la imagen aquí"
                    : "Arrastra una imagen aquí o haz clic para seleccionar"}
                </p>
                <p className='text-sm text-gray-500'>
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

            {/* Descripción */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Descripción (opcional)
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder='Ej: Primera sesión, lado derecho, vista frontal...'
                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                rows='3'
              />
            </div>

            {/* Botón de subida */}
            <div className='flex justify-center'>
              <button
                type='submit'
                disabled={subiendo || !archivo}
                className={`px-8 py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center space-x-2 ${
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

        {/* Comparación de fotos */}
        {comparacion && (
         {/* Comparación de fotos */}
{comparacion && (
  <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
    <div className='bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-b'>
      <h3 className='text-xl font-bold text-gray-800 flex items-center'>
        <span className='bg-purple-100 text-purple-600 rounded-full p-2 mr-3'>
          🔄
        </span>
        Comparación Antes y Después
        <button
          onClick={cargarDatos}
          className='ml-4 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded-lg transition-colors'
        >
          🔄 Actualizar
        </button>
      </h3>
    </div>

    <div className='p-6'>
      {/* 🆕 VISTA DE COMPARACIÓN LADO A LADO */}
      {comparacion.tieneComparacion && comparacion.antes.fotos.length > 0 && comparacion.despues.fotos.length > 0 && (
        <div className='mb-8'>
          <h4 className='text-lg font-bold text-gray-800 mb-6 text-center flex items-center justify-center'>
            <span className='mr-2'>⚡</span>
            Comparación Directa
            <span className='ml-2'>⚡</span>
          </h4>
          
          {/* Comparación de las fotos más recientes */}
          <div className='bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 rounded-2xl p-6 mb-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {/* ANTES */}
              <div className='relative group'>
                <div className='absolute -top-4 left-1/2 transform -translate-x-1/2 z-10'>
                  <span className='bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg'>
                    📷 ANTES
                  </span>
                </div>
                <div className='bg-white rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
                  <img
                    src={comparacion.antes.fotos[0].archivoUrl}
                    alt="Antes del tratamiento"
                    className='w-full h-80 object-cover rounded-lg cursor-pointer'
                    onClick={() => window.open(comparacion.antes.fotos[0].archivoUrl, "_blank")}
                  />
                  <div className='mt-3 text-center'>
                    <p className='text-sm text-blue-700 font-medium'>
                      {new Date(comparacion.antes.fotos[0].fechaSubida).toLocaleDateString("es-AR")}
                    </p>
                    {comparacion.antes.fotos[0].descripcion && (
                      <p className='text-xs text-blue-600 mt-1'>
                        {comparacion.antes.fotos[0].descripcion}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* DESPUÉS */}
              <div className='relative group'>
                <div className='absolute -top-4 left-1/2 transform -translate-x-1/2 z-10'>
                  <span className='bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg'>
                    📸 DESPUÉS
                  </span>
                </div>
                <div className='bg-white rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
                  <img
                    src={comparacion.despues.fotos[0].archivoUrl}
                    alt="Después del tratamiento"
                    className='w-full h-80 object-cover rounded-lg cursor-pointer'
                    onClick={() => window.open(comparacion.despues.fotos[0].archivoUrl, "_blank")}
                  />
                  <div className='mt-3 text-center'>
                    <p className='text-sm text-green-700 font-medium'>
                      {new Date(comparacion.despues.fotos[0].fechaSubida).toLocaleDateString("es-AR")}
                    </p>
                    {comparacion.despues.fotos[0].descripcion && (
                      <p className='text-xs text-green-600 mt-1'>
                        {comparacion.despues.fotos[0].descripcion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Separador visual */}
            <div className='flex items-center justify-center my-4'>
              <div className='flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>
              <div className='mx-4 bg-purple-100 text-purple-600 rounded-full p-2'>
                <span className='text-lg'>✨</span>
              </div>
              <div className='flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>
            </div>
            
            <div className='text-center'>
              <p className='text-gray-600 text-sm'>
                Haz clic en cualquier imagen para verla en tamaño completo
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 TODAS LAS FOTOS ORGANIZADAS */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Fotos ANTES */}
        <div>
          <h4 className='text-lg font-semibold text-blue-800 mb-4 flex items-center'>
            <span className='mr-2'>📷</span>
            Todas las fotos ANTES ({comparacion.antes.total})
          </h4>

          {comparacion.antes.fotos.length === 0 ? (
            <div className='bg-blue-50 rounded-xl p-8 text-center'>
              <div className='text-4xl mb-2'>📷</div>
              <p className='text-blue-600'>No hay fotos de "antes" aún</p>
              <p className='text-sm text-blue-500 mt-2'>
                Sube la primera foto arriba
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
                      className='w-full h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200'
                      onClick={() => window.open(foto.archivoUrl, "_blank")}
                    />
                  </div>
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <p className='text-xs text-blue-700 font-medium'>
                        {new Date(foto.fechaSubida).toLocaleDateString("es-AR")}
                      </p>
                      {foto.descripcion && (
                        <p className='text-xs text-blue-600 mt-1'>
                          {foto.descripcion}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleEliminar(foto._id, "antes")}
                      className='text-red-500 hover:text-red-700 p-1 transition-colors'
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
          <h4 className='text-lg font-semibold text-green-800 mb-4 flex items-center'>
            <span className='mr-2'>📸</span>
            Todas las fotos DESPUÉS ({comparacion.despues.total})
          </h4>

          {comparacion.despues.fotos.length === 0 ? (
            <div className='bg-green-50 rounded-xl p-8 text-center'>
              <div className='text-4xl mb-2'>📸</div>
              <p className='text-green-600'>No hay fotos de "después" aún</p>
              <p className='text-sm text-green-500 mt-2'>
                Sube la primera foto arriba
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
                      className='w-full h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200'
                      onClick={() => window.open(foto.archivoUrl, "_blank")}
                    />
                  </div>
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <p className='text-xs text-green-700 font-medium'>
                        {new Date(foto.fechaSubida).toLocaleDateString("es-AR")}
                      </p>
                      {foto.descripcion && (
                        <p className='text-xs text-green-600 mt-1'>
                          {foto.descripcion}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleEliminar(foto._id, "después")}
                      className='text-red-500 hover:text-red-700 p-1 transition-colors'
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

      {/* Mensaje de comparación */}
      {comparacion.tieneComparacion && (
        <div className='mt-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 text-center'>
          <div className='text-4xl mb-2'>🎉</div>
          <h3 className='text-xl font-bold text-gray-800 mb-2'>
            ¡Comparación completa!
          </h3>
          <p className='text-gray-600'>
            Ya tienes fotos de antes y después del tratamiento. La comparación principal muestra 
            las fotos más recientes de cada categoría.
          </p>
        </div>
      )}
    </div>
  </div>
)}

export default FotosAntesDepues;
