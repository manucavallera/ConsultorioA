// components/EstadisticasPagos.jsx
import React from "react";

const EstadisticasPagos = ({ estadisticas }) => {
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(monto || 0);
  };

  const estadisticasData = [
    {
      titulo: "Ingresos Hoy",
      valor: formatearMoneda(estadisticas.ingresosHoy),
      cantidad: estadisticas.cantidadPagosHoy || 0,
      color: "green",
      icono: "📅",
      descripcion: "Pagos de hoy",
    },
    {
      titulo: "Este Mes",
      valor: formatearMoneda(estadisticas.ingresosMes),
      cantidad: estadisticas.cantidadPagosMes || 0,
      color: "blue",
      icono: "📊",
      descripcion: "Facturación mensual",
    },
    {
      titulo: "Pendientes",
      valor: formatearMoneda(estadisticas.montosPendientes),
      cantidad: estadisticas.cantidadPendientes || 0,
      color: "orange",
      icono: "⏳",
      descripcion: "Por cobrar",
    },
    {
      titulo: "Tratamientos",
      valor: estadisticas.tratamientosActivos || 0,
      cantidad: estadisticas.alertasPendientes || 0,
      color: "purple",
      icono: "🔄",
      descripcion: "Activos / Alertas",
      esNumero: true,
    },
  ];

  return (
    <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8'>
      <div className='flex items-center mb-6'>
        <div className='bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-3 mr-4'>
          <span className='text-xl'>📈</span>
        </div>
        <h3 className='text-2xl font-bold text-gray-900'>Resumen Financiero</h3>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {estadisticasData.map((stat, index) => (
          <EstadisticaCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
};

const EstadisticaCard = ({
  titulo,
  valor,
  cantidad,
  color,
  icono,
  descripcion,
  esNumero = false,
}) => {
  const obtenerColorClases = (color) => {
    const colores = {
      green: {
        bg: "from-green-500 to-green-600",
        text: "text-green-100",
        textSecondary: "text-green-200",
      },
      blue: {
        bg: "from-blue-500 to-blue-600",
        text: "text-blue-100",
        textSecondary: "text-blue-200",
      },
      orange: {
        bg: "from-orange-500 to-orange-600",
        text: "text-orange-100",
        textSecondary: "text-orange-200",
      },
      purple: {
        bg: "from-purple-500 to-purple-600",
        text: "text-purple-100",
        textSecondary: "text-purple-200",
      },
    };
    return colores[color] || colores.green;
  };

  const colorClases = obtenerColorClases(color);

  return (
    <div
      className={`bg-gradient-to-br ${colorClases.bg} text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1`}
    >
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <p className={`${colorClases.text} text-sm font-medium mb-1`}>
            {titulo}
          </p>
          <p className='text-2xl font-bold mb-1'>{esNumero ? valor : valor}</p>
          <div className='flex items-center justify-between'>
            <p className={`${colorClases.textSecondary} text-xs`}>
              {descripcion}
            </p>
            {!esNumero && cantidad > 0 && (
              <span
                className={`${colorClases.text} text-xs bg-white/20 px-2 py-1 rounded-full`}
              >
                {cantidad} {cantidad === 1 ? "pago" : "pagos"}
              </span>
            )}
            {esNumero && cantidad > 0 && (
              <span
                className={`${colorClases.text} text-xs bg-white/20 px-2 py-1 rounded-full`}
              >
                {cantidad} alertas
              </span>
            )}
          </div>
        </div>
        <div className='bg-white/20 rounded-xl p-3 ml-4'>
          <span className='text-2xl'>{icono}</span>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasPagos;
