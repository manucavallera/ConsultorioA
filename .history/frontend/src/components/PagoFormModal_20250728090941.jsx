// components/PagoFormModal.jsx
import React, { useState, useEffect } from "react";
import {
  METODOS_PAGO,
  ESTADOS_PAGO,
  TIPOS_TRATAMIENTO,
} from "../constants/pagosConstants";

const PagoFormModal = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  editando = false,
}) => {
  const [citas, setCitas] = useState([]);
  const [cargandoCitas, setCargandoCitas] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      const response = await fetch("http://localhost:5000/citas");
      const data = await response.json();
      setCitas(data);
    } catch (error) {
      console.error("Error al cargar citas:", error);
    } finally {
      setCargandoCitas(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      await onSubmit(formData);
    } finally {
      setGuardando(false);
    }
  };

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const citaSeleccionada = citas.find((cita) => cita._id === formData.citaId);

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-white/20'>
        {/* Header */}
        <div className='bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 rounded-t-3xl'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='bg-white/20 rounded-2xl p-3'>
                <span className='text-2xl'>{editando ? "✏️" : "💰"}</span>
              </div>
              <div>
                <h3 className='text-3xl font-bold'>
                  {editando ? "Editar Pago" : "Registrar Pago"}
                </h3>
                <p className='text-green-100 mt-1'>
                  {editando
                    ? "Modifica los datos del pago"
                    : "Registra un nuevo pago en el sistema"}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className='text-white hover:bg-white/20 rounded-2xl p-3 transition-all duration-200'
            >
              ✕
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className='p-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Selección de Cita */}
            <div className='lg:col-span-2'>
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-blue-100 rounded-lg p-2 mr-3'>📅</span>
                Cita Relacionada
              </label>
              {cargandoCitas ? (
                <div className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl bg-gray-100 flex items-center justify-center'>
                  <span className='text-gray-500'>Cargando citas...</span>
                </div>
              ) : (
                <select
                  value={formData.citaId}
                  onChange={(e) => handleChange("citaId", e.target.value)}
                  required
                  disabled={editando} // No permitir cambiar cita en edición
                  className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white text-gray-800 font-medium disabled:bg-gray-100'
                >
                  <option value=''>Seleccionar cita</option>
                  {citas.map((cita) => (
                    <option key={cita._id} value={cita._id}>
                      {new Date(cita.fecha).toLocaleDateString("es-AR")} -{" "}
                      {cita.hora} - {cita.pacienteId.nombre}{" "}
                      {cita.pacienteId.apellido}
                    </option>
                  ))}
                </select>
              )}

              {/* Información de la cita seleccionada */}
              {citaSeleccionada && (
                <div className='mt-3 bg-blue-50 rounded-xl p-4'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                    <div>
                      <span className='font-semibold text-blue-800'>
                        Paciente:
                      </span>
                      <p className='text-blue-700'>
                        {citaSeleccionada.pacienteId.nombre}{" "}
                        {citaSeleccionada.pacienteId.apellido}
                      </p>
                    </div>
                    <div>
                      <span className='font-semibold text-blue-800'>Tipo:</span>
                      <p className='text-blue-700'>
                        {citaSeleccionada.tipoConsulta}
                      </p>
                    </div>
                    <div>
                      <span className='font-semibold text-blue-800'>
                        Fecha:
                      </span>
                      <p className='text-blue-700'>
                        {new Date(citaSeleccionada.fecha).toLocaleDateString(
                          "es-AR"
                        )}{" "}
                        - {citaSeleccionada.hora}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Monto */}
            <div>
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-green-100 rounded-lg p-2 mr-3'>💵</span>
                Monto del Pago
              </label>
              <input
                type='number'
                value={formData.monto}
                onChange={(e) => handleChange("monto", e.target.value)}
                placeholder='15000'
                required
                min='0'
                step='0.01'
                className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white'
              />
            </div>

            {/* Método de Pago */}
            <div>
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-purple-100 rounded-lg p-2 mr-3'>💳</span>
                Método de Pago
              </label>
              <select
                value={formData.metodoPago}
                onChange={(e) => handleChange("metodoPago", e.target.value)}
                required
                className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white'
              >
                <option value=''>Seleccionar método</option>
                {METODOS_PAGO.map((metodo) => (
                  <option key={metodo} value={metodo}>
                    {metodo === "Efectivo" && "💵"}
                    {metodo === "Transferencia" && "🏦"}
                    {metodo === "Mercado Pago" && "🔵"} {metodo}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado del Pago */}
            <div>
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-orange-100 rounded-lg p-2 mr-3'>📊</span>
                Estado del Pago
              </label>
              <select
                value={formData.estado}
                onChange={(e) => handleChange("estado", e.target.value)}
                required
                className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white'
              >
                {ESTADOS_PAGO.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Tratamiento */}
            <div>
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-indigo-100 rounded-lg p-2 mr-3'>🔄</span>
                Tipo de Tratamiento
              </label>
              <select
                value={formData.tipoTratamiento}
                onChange={(e) =>
                  handleChange("tipoTratamiento", e.target.value)
                }
                className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white'
              >
                {TIPOS_TRATAMIENTO.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha de Pago */}
            <div>
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-red-100 rounded-lg p-2 mr-3'>📅</span>
                Fecha de Pago
              </label>
              <input
                type='date'
                value={formData.fechaPago}
                onChange={(e) => handleChange("fechaPago", e.target.value)}
                required
                className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white'
              />
            </div>

            {/* Fecha de Vencimiento (solo si es Pendiente) */}
            {formData.estado === "Pendiente" && (
              <div>
                <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                  <span className='bg-yellow-100 rounded-lg p-2 mr-3'>⏰</span>
                  Fecha de Vencimiento
                </label>
                <input
                  type='date'
                  value={formData.fechaVencimiento || ""}
                  onChange={(e) =>
                    handleChange("fechaVencimiento", e.target.value)
                  }
                  min={formData.fechaPago}
                  className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white'
                />
              </div>
            )}

            {/* Observaciones */}
            <div className='lg:col-span-2'>
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-gray-100 rounded-lg p-2 mr-3'>📝</span>
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => handleChange("observaciones", e.target.value)}
                placeholder='Notas adicionales sobre el pago...'
                rows='4'
                className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 resize-none bg-white'
              />
            </div>

            {/* Información adicional por método de pago */}
            {formData.metodoPago === "Mercado Pago" && (
              <div className='lg:col-span-2 bg-blue-50 rounded-xl p-6'>
                <h4 className='font-bold text-blue-800 mb-4 flex items-center'>
                  <span className='text-xl mr-3'>🔵</span>
                  Información de Mercado Pago
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-semibold text-blue-700 mb-2'>
                      Link de Pago (opcional)
                    </label>
                    <input
                      type='url'
                      placeholder='https://mpago.la/...'
                      className='w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-semibold text-blue-700 mb-2'>
                      ID de Preferencia (opcional)
                    </label>
                    <input
                      type='text'
                      placeholder='123456789-abc-def'
                      className='w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white'
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.metodoPago === "Transferencia" && (
              <div className='lg:col-span-2 bg-purple-50 rounded-xl p-6'>
                <h4 className='font-bold text-purple-800 mb-4 flex items-center'>
                  <span className='text-xl mr-3'>🏦</span>
                  Información de Transferencia
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-semibold text-purple-700 mb-2'>
                      Número de Transferencia
                    </label>
                    <input
                      type='text'
                      placeholder='TRF-2025-001234'
                      className='w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all bg-white'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-semibold text-purple-700 mb-2'>
                      Banco Origen
                    </label>
                    <input
                      type='text'
                      placeholder='Banco Nación'
                      className='w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all bg-white'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-semibold text-purple-700 mb-2'>
                      Fecha de Transferencia
                    </label>
                    <input
                      type='datetime-local'
                      className='w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all bg-white'
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.metodoPago === "Efectivo" &&
              formData.estado === "Pagado" && (
                <div className='lg:col-span-2 bg-green-50 rounded-xl p-6'>
                  <h4 className='font-bold text-green-800 mb-4 flex items-center'>
                    <span className='text-xl mr-3'>💵</span>
                    Información de Pago en Efectivo
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-semibold text-green-700 mb-2'>
                        Monto Recibido
                      </label>
                      <input
                        type='number'
                        placeholder={formData.monto}
                        min={formData.monto}
                        step='0.01'
                        className='w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all bg-white'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-semibold text-green-700 mb-2'>
                        Vuelto
                      </label>
                      <input
                        type='number'
                        placeholder='0'
                        min='0'
                        step='0.01'
                        className='w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all bg-white'
                      />
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Botones */}
          <div className='flex flex-col sm:flex-row justify-end gap-4 mt-10'>
            <button
              type='button'
              onClick={onCancel}
              disabled={guardando}
              className='px-8 py-4 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl 
                transition-all duration-200 font-semibold order-2 sm:order-1 disabled:opacity-50'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={guardando}
              className={`px-10 py-4 rounded-2xl transition-all duration-200 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 order-1 sm:order-2 ${
                guardando
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
              }`}
            >
              {guardando ? (
                <span className='flex items-center'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                  Guardando...
                </span>
              ) : editando ? (
                "💾 Actualizar Pago"
              ) : (
                "✅ Registrar Pago"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PagoFormModal;
