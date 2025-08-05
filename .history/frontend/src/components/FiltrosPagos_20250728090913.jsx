// components/FiltrosPagos.jsx
import React from "react";
import { ESTADOS_PAGO, METODOS_PAGO } from "../constants/pagosConstants";

const FiltrosPagos = ({ filtros, onCambiarFiltros }) => {
  const handleCambiarFiltro = (campo, valor) => {
    onCambiarFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const limpiarFiltros = () => {
    onCambiarFiltros({
      estado: "Todos",
      metodo: "Todos",
      fecha: "",
    });
  };

  return (
    <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8'>
      <div className='flex items-center mb-6'>
        <div className='bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-3 mr-4'>
          <span className='text-xl'>🔍</span>
        </div>
        <h3 className='text-2xl font-bold text-gray-900'>Filtros</h3>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        {/* Filtro por Estado */}
        <div>
          <label className='block text-sm font-semibold text-gray-700 mb-3'>
            Estado del pago
          </label>
          <select
            value={filtros.estado}
            onChange={(e) => handleCambiarFiltro("estado", e.target.value)}
            className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white'
          >
            <option value='Todos'>Todos los estados</option>
            {ESTADOS_PAGO.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Método de Pago */}
        <div>
          <label className='block text-sm font-semibold text-gray-700 mb-3'>
            Método de pago
          </label>
          <select
            value={filtros.metodo}
            onChange={(e) => handleCambiarFiltro("metodo", e.target.value)}
            className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white'
          >
            <option value='Todos'>Todos los métodos</option>
            {METODOS_PAGO.map((metodo) => (
              <option key={metodo} value={metodo}>
                {metodo}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Fecha */}
        <div>
          <label className='block text-sm font-semibold text-gray-700 mb-3'>
            Fecha específica
          </label>
          <input
            type='date'
            value={filtros.fecha}
            onChange={(e) => handleCambiarFiltro("fecha", e.target.value)}
            className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white'
          />
        </div>

        {/* Botón Limpiar */}
        <div className='flex items-end'>
          <button
            onClick={limpiarFiltros}
            className='w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 px-6 py-3 rounded-xl 
              font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2'
          >
            <span>🔄</span>
            <span>Limpiar filtros</span>
          </button>
        </div>
      </div>

      {/* Resumen de filtros aplicados */}
      {(filtros.estado !== "Todos" ||
        filtros.metodo !== "Todos" ||
        filtros.fecha) && (
        <div className='mt-6 pt-6 border-t border-gray-200'>
          <div className='flex items-center flex-wrap gap-2'>
            <span className='text-sm font-medium text-gray-600 mr-2'>
              Filtros aplicados:
            </span>

            {filtros.estado !== "Todos" && (
              <FiltroChip
                texto={`Estado: ${filtros.estado}`}
                onRemover={() => handleCambiarFiltro("estado", "Todos")}
              />
            )}

            {filtros.metodo !== "Todos" && (
              <FiltroChip
                texto={`Método: ${filtros.metodo}`}
                onRemover={() => handleCambiarFiltro("metodo", "Todos")}
              />
            )}

            {filtros.fecha && (
              <FiltroChip
                texto={`Fecha: ${new Date(filtros.fecha).toLocaleDateString(
                  "es-AR"
                )}`}
                onRemover={() => handleCambiarFiltro("fecha", "")}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FiltroChip = ({ texto, onRemover }) => (
  <span className='inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full'>
    {texto}
    <button
      onClick={onRemover}
      className='ml-2 text-green-600 hover:text-green-800 transition-colors'
    >
      ✕
    </button>
  </span>
);

export default FiltrosPagos;
