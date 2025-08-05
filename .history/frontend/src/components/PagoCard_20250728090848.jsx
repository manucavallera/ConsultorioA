// components/PagoCard.jsx
import React, { useState, useRef, useEffect } from "react";

const PagoCard = ({ pago, onEditar, onEliminar, onWhatsApp }) => {
  const [mostrarAcciones, setMostrarAcciones] = useState(false);
  const accionesRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accionesRef.current && !accionesRef.current.contains(event.target)) {
        setMostrarAcciones(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cita = pago.citaId;
  const paciente = cita.pacienteId;

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(monto);
  };

  const obtenerColorEstado = (estado) => {
    const colores = {
      Pendiente:
        "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 border-orange-200",
      Pagado:
        "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200",
      Parcial:
        "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200",
      Vencido:
        "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200",
    };
    return (
      colores[estado] ||
      "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200"
    );
  };

  const obtenerIconoMetodo = (metodo) => {
    const iconos = {
      Efectivo: "💵",
      "Mercado Pago": "🔵",
      Transferencia: "🏦",
    };
    return iconos[metodo] || "💰";
  };

  const obtenerColorMetodo = (metodo) => {
    const colores = {
      Efectivo: "bg-green-500",
      "Mercado Pago": "bg-blue-500",
      Transferencia: "bg-purple-500",
    };
    return colores[metodo] || "bg-gray-500";
  };

  return (
    <div className='bg-white rounded-2xl border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden'>
      <div className={`h-1.5 ${obtenerColorMetodo(pago.metodoPago)}`}></div>

      <div className='p-6'>
        <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
          <div className='flex-1'>
            {/* Header con paciente y estado */}
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center space-x-4'>
                <div className='bg-gray-100 rounded-xl p-3'>
                  <span className='text-2xl'>
                    {obtenerIconoMetodo(pago.metodoPago)}
                  </span>
                </div>
                <div>
                  <h4 className='text-xl font-bold text-gray-900 mb-1'>
                    {paciente.nombre} {paciente.apellido}
                  </h4>
                  <p className='text-gray-600 font-medium'>
                    {formatearMoneda(pago.monto)}
                  </p>
                </div>
              </div>
              <span
                className={`px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm ${obtenerColorEstado(
                  pago.estado
                )}`}
              >
                {pago.estado}
              </span>
            </div>

            {/* Información de la cita */}
            <div className='bg-blue-50 rounded-xl p-4 mb-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-semibold text-blue-800 mb-1'>
                    📅 Cita Relacionada
                  </p>
                  <p className='text-blue-700'>
                    {formatearFecha(cita.fecha)} - {cita.hora}
                  </p>
                  <p className='text-blue-600 text-sm'>{cita.tipoConsulta}</p>
                </div>
                <button
                  onClick={() => window.open(`/citas/${cita._id}`, "_blank")}
                  className='bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-all'
                >
                  Ver Cita →
                </button>
              </div>
            </div>

            {/* Detalles del pago */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              <div className='flex items-center text-gray-600 bg-gray-50 rounded-xl p-3'>
                <span className='mr-3 text-lg'>💳</span>
                <div>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                    Método
                  </p>
                  <p className='font-semibold'>{pago.metodoPago}</p>
                </div>
              </div>

              <div className='flex items-center text-gray-600 bg-gray-50 rounded-xl p-3'>
                <span className='mr-3 text-lg'>📅</span>
                <div>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                    Fecha Pago
                  </p>
                  <p className='font-semibold'>
                    {formatearFecha(pago.fechaPago)}
                  </p>
                </div>
              </div>

              <div className='flex items-center text-gray-600 bg-gray-50 rounded-xl p-3'>
                <span className='mr-3 text-lg'>🔄</span>
                <div>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                    Tratamiento
                  </p>
                  <p className='font-semibold'>{pago.tipoTratamiento}</p>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            {pago.observaciones && (
              <div className='bg-gray-50 rounded-xl p-3 mb-4'>
                <p className='text-sm text-gray-700'>
                  <span className='font-semibold'>Observaciones:</span>{" "}
                  {pago.observaciones}
                </p>
              </div>
            )}

            {/* Progreso del tratamiento */}
            {pago.tipoTratamiento !== "Sesion Individual" &&
              pago.planTratamiento && (
                <div className='bg-indigo-50 rounded-xl p-3'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-semibold text-indigo-800'>
                      Progreso del Tratamiento
                    </span>
                    <span className='text-xs text-indigo-600'>
                      {pago.planTratamiento.sesionesCompletadas || 0} /{" "}
                      {pago.planTratamiento.sesionesTotales || 1}
                    </span>
                  </div>
                  <div className='w-full bg-indigo-200 rounded-full h-2'>
                    <div
                      className='bg-indigo-600 h-2 rounded-full transition-all duration-300'
                      style={{
                        width: `${
                          ((pago.planTratamiento.sesionesCompletadas || 0) /
                            (pago.planTratamiento.sesionesTotales || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
          </div>

          {/* Botones de acción */}
          <div className='flex flex-wrap gap-3 lg:flex-col lg:items-end'>
            {/* Botón WhatsApp */}
            <button
              onClick={() => onWhatsApp(pago)}
              className='bg-green-100 text-green-700 hover:bg-green-200 px-4 py-3 rounded-xl 
                font-semibold text-sm transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md'
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </button>

            {/* Dropdown de estados */}
            <div className='relative' ref={accionesRef}>
              <button
                onClick={() => setMostrarAcciones(!mostrarAcciones)}
                className='bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-3 rounded-xl 
                  font-semibold text-sm transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md'
              >
                <span>⚙️</span>
                <span>Acciones</span>
              </button>

              {mostrarAcciones && (
                <div className='absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-48 overflow-hidden'>
                  <button
                    onClick={() => {
                      onEditar(pago);
                      setMostrarAcciones(false);
                    }}
                    className='w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium transition-all flex items-center space-x-2'
                  >
                    <span>✏️</span>
                    <span>Editar Pago</span>
                  </button>

                  {pago.metodoPago === "Mercado Pago" && (
                    <button
                      onClick={() => {
                        // Aquí iría la lógica para generar link de MP
                        alert("Generar link de Mercado Pago");
                        setMostrarAcciones(false);
                      }}
                      className='w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium transition-all flex items-center space-x-2'
                    >
                      <span>🔵</span>
                      <span>Link de Pago</span>
                    </button>
                  )}

                  {pago.metodoPago === "Transferencia" && (
                    <button
                      onClick={() => {
                        // Aquí iría la lógica para marcar como verificado
                        alert("Marcar transferencia como verificada");
                        setMostrarAcciones(false);
                      }}
                      className='w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium transition-all flex items-center space-x-2'
                    >
                      <span>✅</span>
                      <span>Verificar Transferencia</span>
                    </button>
                  )}

                  <div className='border-t border-gray-200'>
                    <button
                      onClick={() => {
                        onEliminar(pago._id);
                        setMostrarAcciones(false);
                      }}
                      className='w-full text-left px-4 py-3 hover:bg-red-50 text-sm font-medium transition-all text-red-600 flex items-center space-x-2'
                    >
                      <span>🗑️</span>
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoCard;
