import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Utilidad para saber el tipo de archivo
const getFileType = (nombreArchivo) => {
  if (!nombreArchivo) return "";
  const ext = nombreArchivo.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext))
    return "image";
  if (ext === "pdf") return "pdf";
  return "other";
};

// Utilidad para obtener icono según tipo de archivo
const getFileIcon = (nombreArchivo) => {
  const type = getFileType(nombreArchivo);
  switch (type) {
    case "image":
      return "🖼️";
    case "pdf":
      return "📄";
    default:
      return "📎";
  }
};

// ✅ FUNCIÓN PARA RENDERIZAR ANÁLISIS SIN ERROR
const renderAnalisis = (analisis) => {
  if (typeof analisis === "string") {
    return analisis;
  }
  if (typeof analisis === "object" && analisis !== null) {
    if (analisis.nombre) {
      return analisis.nombre;
    }
    if (analisis.valor && analisis.unidad) {
      return `${analisis.valor} ${analisis.unidad}`;
    }
    return Object.values(analisis).filter(Boolean).join(" - ");
  }
  return "Análisis sin especificar";
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SubirEstudioAnalisis = (props) => {
  const params = useParams();
  const navigate = useNavigate();
  const pacienteId = props.pacienteId || params.pacienteId;
  const solicitudIdProp = props.solicitudId || params.solicitudId;

  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudId, setSolicitudId] = useState(solicitudIdProp || "");
  const [detalleSolicitud, setDetalleSolicitud] = useState(null);
  const [detalleError, setDetalleError] = useState("");

  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubir, setErrorSubir] = useState("");
  const [exitoSubir, setExitoSubir] = useState(""); // ✅ NUEVO: mensaje de éxito
  const [estudios, setEstudios] = useState([]);
  const [cargandoEstudios, setCargandoEstudios] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (solicitudIdProp) {
      setSolicitudId(solicitudIdProp);
      setSolicitudes([]);
      return;
    }
    if (!pacienteId) return;
    fetch(`${API_URL}/solicitudes/paciente/${pacienteId}`)
      .then((res) => res.json())
      .then((data) => {
        setSolicitudes(data);
        if (data.length > 0) setSolicitudId(data[0]._id);
      })
      .catch(() => setSolicitudes([]));
  }, [pacienteId, solicitudIdProp]);

  useEffect(() => {
    if (!solicitudId) {
      setDetalleSolicitud(null);
      setDetalleError("");
      return;
    }
    setDetalleError("");
    fetch(`http://localhost:5000/solicitudes/${solicitudId}`)
      .then((res) => {
        if (!res.ok) {
          setDetalleError(`Error: código ${res.status}`);
          throw new Error("No se encontró la solicitud");
        }
        return res.json();
      })
      .then((data) => {
        setDetalleSolicitud(data);
        setDetalleError("");
      })
      .catch((err) => {
        setDetalleSolicitud(null);
        setDetalleError("No se pudo cargar el detalle de la solicitud.");
      });
  }, [solicitudId]);

  // ✅ CARGAR ESTUDIOS CADA VEZ QUE CAMBIE LA SOLICITUD
  useEffect(() => {
    cargarEstudios();
  }, [solicitudId]);

  // ✅ FUNCIÓN SEPARADA PARA CARGAR ESTUDIOS - SIN /api/
  const cargarEstudios = async () => {
    if (!solicitudId) {
      setEstudios([]);
      return;
    }
    setCargandoEstudios(true);
    try {
      // ✅ CORREGIDO: Sin /api/ para coincidir con tu servidor
      const response = await fetch(
        `${API_URL}/estudios/solicitud/${solicitudId}`
      );
      if (response.ok) {
        const data = await response.json();
        setEstudios(data);
        console.log("Estudios cargados:", data); // ✅ DEBUG
      } else {
        console.error("Error al cargar estudios:", response.status);
        setEstudios([]);
      }
    } catch (error) {
      console.error("Error al cargar estudios:", error);
      setEstudios([]);
    } finally {
      setCargandoEstudios(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo || !solicitudId) return;

    setSubiendo(true);
    setErrorSubir("");
    setExitoSubir(""); // ✅ Limpiar mensaje de éxito anterior

    const formData = new FormData();
    formData.append("solicitudId", solicitudId);
    formData.append("archivo", archivo);

    try {
      console.log("Subiendo archivo..."); // ✅ DEBUG
      // ✅ CORREGIDO: Sin /api/ para coincidir con tu servidor
      const res = await fetch("http://localhost:5000/estudios", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al subir el estudio");
      }

      const resultado = await res.json();
      console.log("Archivo subido exitosamente:", resultado); // ✅ DEBUG

      // ✅ LIMPIAR FORMULARIO
      setArchivo(null);

      // ✅ MOSTRAR MENSAJE DE ÉXITO
      setExitoSubir("¡Archivo subido exitosamente!");

      // ✅ RECARGAR ESTUDIOS INMEDIATAMENTE
      await cargarEstudios();

      // ✅ LIMPIAR MENSAJE DE ÉXITO DESPUÉS DE 5 SEGUNDOS
      setTimeout(() => setExitoSubir(""), 5000);
    } catch (err) {
      console.error("Error al subir:", err); // ✅ DEBUG
      setErrorSubir(err.message || "Error al subir el estudio");
    }
    setSubiendo(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setArchivo(files[0]);
      setErrorSubir(""); // ✅ Limpiar errores al seleccionar archivo
      setExitoSubir(""); // ✅ Limpiar éxito al seleccionar nuevo archivo
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

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-100 p-3 sm:p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <div className='flex items-center w-full sm:w-auto'>
              <button
                onClick={() => navigate(-1)}
                className='mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all'
              >
                ← Volver
              </button>
              <div className='flex-1 sm:flex-none'>
                <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center'>
                  <span className='bg-emerald-100 text-emerald-600 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 text-lg sm:text-xl'>
                    📤
                  </span>
                  <span className='leading-tight'>
                    Subir Estudios de Laboratorio
                  </span>
                </h1>
                <p className='text-sm sm:text-base text-gray-600 mt-1'>
                  Carga y gestión de resultados de análisis clínicos
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6'>
            <div className='bg-gradient-to-r from-emerald-500 to-green-600 text-white p-3 sm:p-4 rounded-xl'>
              <div className='flex items-center'>
                <span className='text-xl sm:text-2xl mr-3'>📋</span>
                <div>
                  <p className='text-xs sm:text-sm opacity-90'>
                    Solicitudes Disponibles
                  </p>
                  <p className='text-xl sm:text-2xl font-bold'>
                    {solicitudes.length}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4 rounded-xl'>
              <div className='flex items-center'>
                <span className='text-xl sm:text-2xl mr-3'>📤</span>
                <div>
                  <p className='text-xs sm:text-sm opacity-90'>
                    Estudios Subidos
                  </p>
                  <p className='text-xl sm:text-2xl font-bold'>
                    {estudios.length}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 sm:p-4 rounded-xl sm:col-span-2 lg:col-span-1'>
              <div className='flex items-center'>
                <span className='text-xl sm:text-2xl mr-3'>🗂️</span>
                <div>
                  <p className='text-xs sm:text-sm opacity-90'>
                    Formatos Soportados
                  </p>
                  <p className='text-base sm:text-lg font-bold'>
                    PDF, Imágenes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {detalleError && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0'>
            <span className='text-xl mr-0 sm:mr-3'>⚠️</span>
            <span className='text-sm sm:text-base'>{detalleError}</span>
          </div>
        )}

        {/* ✅ MENSAJE DE ÉXITO */}
        {exitoSubir && (
          <div className='bg-green-100 border border-green-400 text-green-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0'>
            <span className='text-xl mr-0 sm:mr-3'>✅</span>
            <span className='text-sm sm:text-base'>{exitoSubir}</span>
          </div>
        )}

        {/* Detalle de Solicitud */}
        {detalleSolicitud ? (
          <div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8'>
            <h3 className='text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center'>
              <span className='bg-blue-100 text-blue-600 rounded-full p-2 mr-3 text-sm sm:text-base'>
                🔍
              </span>
              <span className='text-base sm:text-xl'>
                Detalle de la Solicitud
              </span>
            </h3>

            <div className='grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6'>
              {/* Información de la solicitud */}
              <div className='space-y-3 sm:space-y-4'>
                <div className='bg-blue-50 rounded-xl p-3 sm:p-4'>
                  <h4 className='font-semibold text-blue-800 mb-2 flex items-center text-sm sm:text-base'>
                    <span className='mr-2'>📝</span>
                    Descripción
                  </h4>
                  <p className='text-blue-700 text-sm sm:text-base'>
                    {detalleSolicitud.descripcion || "Sin descripción"}
                  </p>
                </div>

                <div className='bg-green-50 rounded-xl p-3 sm:p-4'>
                  <h4 className='font-semibold text-green-800 mb-2 flex items-center text-sm sm:text-base'>
                    <span className='mr-2'>📅</span>
                    Fecha de Solicitud
                  </h4>
                  <p className='text-green-700 text-sm sm:text-base'>
                    {detalleSolicitud.fechaSolicitud
                      ? new Date(
                          detalleSolicitud.fechaSolicitud
                        ).toLocaleString("es-AR")
                      : "No especificada"}
                  </p>
                </div>
              </div>

              {/* Información del paciente */}
              {detalleSolicitud.pacienteId && (
                <div className='bg-gray-50 rounded-xl p-3 sm:p-4'>
                  <h4 className='font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base'>
                    <span className='mr-2'>👤</span>
                    Información del Paciente
                  </h4>
                  <div className='space-y-2'>
                    <p className='text-gray-700 text-sm sm:text-base'>
                      <span className='font-medium'>Nombre:</span>{" "}
                      {detalleSolicitud.pacienteId.nombre || ""}{" "}
                      {detalleSolicitud.pacienteId.apellido || ""}
                    </p>
                    <p className='text-gray-700 text-sm sm:text-base'>
                      <span className='font-medium'>DNI:</span>{" "}
                      {detalleSolicitud.pacienteId.dni || ""}
                    </p>
                    <p className='text-gray-700 text-sm sm:text-base'>
                      <span className='font-medium'>Género:</span>{" "}
                      {detalleSolicitud.pacienteId.genero || ""}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Análisis solicitados */}
            <div className='mt-4 sm:mt-6'>
              <h4 className='font-semibold text-purple-800 mb-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 text-sm sm:text-base'>
                <span className='flex items-center'>
                  <span className='mr-2'>🧪</span>
                  Análisis Solicitados
                </span>
                {detalleSolicitud.analisis && (
                  <span className='text-xs sm:text-sm sm:ml-2'>
                    (
                    {Array.isArray(detalleSolicitud.analisis)
                      ? detalleSolicitud.analisis.length
                      : 1}
                    )
                  </span>
                )}
              </h4>
              <div className='flex flex-wrap gap-2'>
                {detalleSolicitud.analisis ? (
                  Array.isArray(detalleSolicitud.analisis) ? (
                    detalleSolicitud.analisis.map((analisis, index) => (
                      <span
                        key={index}
                        className='bg-purple-100 text-purple-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full'
                      >
                        {renderAnalisis(analisis)}
                      </span>
                    ))
                  ) : (
                    <span className='bg-purple-100 text-purple-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full'>
                      {renderAnalisis(detalleSolicitud.analisis)}
                    </span>
                  )
                ) : (
                  <span className='bg-gray-100 text-gray-600 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full'>
                    Sin análisis especificados
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          !detalleError && (
            <div className='bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center mb-6 sm:mb-8'>
              <div className='text-3xl sm:text-4xl mb-4'>⏳</div>
              <p className='text-gray-600 text-sm sm:text-base'>
                Cargando detalle de la solicitud...
              </p>
            </div>
          )
        )}

        {/* Selector de solicitud */}
        {!solicitudIdProp && (
          <div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8'>
            <h3 className='text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center'>
              <span className='bg-orange-100 text-orange-600 rounded-full p-2 mr-3 text-sm sm:text-base'>
                📋
              </span>
              <span className='text-base sm:text-xl'>
                Seleccionar Solicitud
              </span>
            </h3>

            <div className='max-w-full sm:max-w-md'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Solicitud de análisis:
              </label>
              <select
                value={solicitudId}
                onChange={(e) => setSolicitudId(e.target.value)}
                className='w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
                  bg-white hover:border-gray-300 text-sm sm:text-base'
              >
                {solicitudes.length === 0 ? (
                  <option value=''>No hay solicitudes disponibles</option>
                ) : (
                  solicitudes.map((s) => (
                    <option key={s._id} value={s._id}>
                      {`${new Date(s.fechaSolicitud).toLocaleDateString()} - `}
                      {Array.isArray(s.analisis)
                        ? s.analisis.map((a) => renderAnalisis(a)).join(", ")
                        : renderAnalisis(s.analisis)}
                      {s.descripcion ? ` (${s.descripcion})` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        )}

        {/* Formulario de subida */}
        <div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8'>
          <h3 className='text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center'>
            <span className='bg-green-100 text-green-600 rounded-full p-2 mr-3 text-sm sm:text-base'>
              ⬆️
            </span>
            <span className='text-base sm:text-xl'>
              Subir Archivo de Estudio
            </span>
          </h3>

          <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-6'>
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-200 ${
                dragOver
                  ? "border-blue-400 bg-blue-50"
                  : solicitudId
                  ? "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  : "border-gray-200 bg-gray-50"
              } ${
                !solicitudId
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() =>
                solicitudId && document.getElementById("file-input").click()
              }
            >
              <div className='text-3xl sm:text-4xl mb-4'>
                {archivo ? "✅" : dragOver ? "📤" : "📁"}
              </div>
              <div className='space-y-2'>
                <p className='text-base sm:text-lg font-medium text-gray-700'>
                  {archivo
                    ? `Archivo seleccionado: ${archivo.name}`
                    : dragOver
                    ? "Suelta el archivo aquí"
                    : "Arrastra un archivo aquí o haz clic para seleccionar"}
                </p>
                <p className='text-xs sm:text-sm text-gray-500'>
                  Formatos soportados: PDF, JPG, PNG, GIF, BMP, WEBP
                </p>
                <p className='text-xs text-gray-400'>Tamaño máximo: 10MB</p>
              </div>

              <input
                id='file-input'
                type='file'
                accept='application/pdf,image/*'
                onChange={(e) => setArchivo(e.target.files[0])}
                disabled={!solicitudId}
                className='hidden'
              />
            </div>

            {/* Archivo seleccionado */}
            {archivo && (
              <div className='bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center flex-1 min-w-0'>
                    <span className='text-xl sm:text-2xl mr-3 flex-shrink-0'>
                      {getFileIcon(archivo.name)}
                    </span>
                    <div className='min-w-0 flex-1'>
                      <p className='font-medium text-green-800 truncate text-sm sm:text-base'>
                        {archivo.name}
                      </p>
                      <p className='text-xs sm:text-sm text-green-600'>
                        {(archivo.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={() => setArchivo(null)}
                    className='text-red-600 hover:text-red-800 transition-colors ml-3 flex-shrink-0'
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}

            {/* Error de subida */}
            {errorSubir && (
              <div className='bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0'>
                <span className='text-xl mr-0 sm:mr-3'>❌</span>
                <span className='text-sm sm:text-base'>{errorSubir}</span>
              </div>
            )}

            {/* Botón de subida */}
            <div className='flex justify-center'>
              <button
                type='submit'
                disabled={subiendo || !archivo || !solicitudId}
                className={`px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-medium text-white transition-all duration-200 
                  flex items-center space-x-2 text-sm sm:text-base ${
                    subiendo || !archivo || !solicitudId
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  }`}
              >
                <span>{subiendo ? "⏳" : "📤"}</span>
                <span>{subiendo ? "Subiendo..." : "Subir Estudio"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Lista de estudios */}
        <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
          <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 border-b'>
            <h3 className='text-lg sm:text-xl font-bold text-gray-800 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0'>
              <span className='flex items-center'>
                <span className='bg-indigo-100 text-indigo-600 rounded-full p-2 mr-3 text-sm sm:text-base'>
                  📊
                </span>
                <span className='text-base sm:text-xl'>
                  Estudios Subidos ({estudios.length})
                </span>
              </span>
              {/* ✅ BOTÓN PARA RECARGAR MANUALMENTE */}
              <button
                onClick={cargarEstudios}
                disabled={cargandoEstudios}
                className='sm:ml-4 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs sm:text-sm rounded-lg transition-colors w-fit'
              >
                {cargandoEstudios ? "🔄" : "🔄 Actualizar"}
              </button>
            </h3>
          </div>

          {cargandoEstudios ? (
            <div className='p-8 sm:p-12 text-center'>
              <div className='text-3xl sm:text-4xl mb-4'>⏳</div>
              <p className='text-gray-600 text-sm sm:text-base'>
                Cargando estudios...
              </p>
            </div>
          ) : estudios.length === 0 ? (
            <div className='p-8 sm:p-12 text-center'>
              <div className='text-4xl sm:text-6xl mb-4'>📁</div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-700 mb-2'>
                No hay estudios subidos
              </h3>
              <p className='text-gray-500 text-sm sm:text-base'>
                Los archivos que subas aparecerán aquí
              </p>
            </div>
          ) : (
            <div className='p-4 sm:p-6'>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                {estudios.map((est, idx) => (
                  <div
                    key={est._id}
                    className='bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 
                      hover:shadow-lg transition-all duration-200'
                  >
                    {/* Preview */}
                    <div className='text-center mb-4'>
                      {getFileType(est.nombreArchivo) === "image" ? (
                        <a
                          href={est.archivoUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='block'
                        >
                          <img
                            src={est.archivoUrl}
                            alt={est.nombreArchivo}
                            className='w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-200 
                              hover:scale-105 transition-transform duration-200'
                          />
                        </a>
                      ) : getFileType(est.nombreArchivo) === "pdf" ? (
                        <a
                          href={est.archivoUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex flex-col items-center justify-center h-24 sm:h-32 bg-red-50 rounded-lg 
                            border border-red-200 hover:bg-red-100 transition-colors duration-200'
                        >
                          <span className='text-3xl sm:text-4xl mb-2'>📄</span>
                          <span className='text-red-700 font-medium text-xs sm:text-sm'>
                            Ver PDF
                          </span>
                        </a>
                      ) : (
                        <div className='flex flex-col items-center justify-center h-24 sm:h-32 bg-gray-50 rounded-lg border border-gray-200'>
                          <span className='text-3xl sm:text-4xl mb-2'>📎</span>
                          <span className='text-gray-600 text-xs sm:text-sm'>
                            Archivo
                          </span>
                        </div>
                      )}
                    </div>

                    {/* File info */}
                    <div className='space-y-2'>
                      <h4
                        className='font-medium text-gray-800 truncate text-sm sm:text-base'
                        title={est.nombreArchivo}
                      >
                        {est.nombreArchivo}
                      </h4>
                      <p className='text-xs sm:text-sm text-gray-600 flex items-center'>
                        <span className='mr-2'>📅</span>
                        <span className='truncate'>
                          {est.fechaSubida
                            ? new Date(est.fechaSubida).toLocaleString("es-AR")
                            : "Fecha no disponible"}
                        </span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className='mt-4'>
                      <a
                        href={est.archivoUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='w-full bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 sm:px-4 py-2 rounded-lg 
                          font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-center space-x-2'
                      >
                        <span>👁️</span>
                        <span>Ver archivo</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubirEstudioAnalisis;
