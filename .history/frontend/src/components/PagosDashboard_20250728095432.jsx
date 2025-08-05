// PagosDashboard.jsx - Componente principal
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import PagoCard from "./PagoCard";
import PagoFormModal from "./PagoFormModal";
import EstadisticasPagos from "./EstadisticasPagos";
import FiltrosPagos from "./FiltrosPagos";
import { usePagos } from "../hooks/usePagos";
import { ESTADO_INICIAL_FORM } from "../constants/pagosConstants";

const PagosDashboard = () => {
  const navigate = useNavigate();
  const { citaId } = useParams();
  const { state } = useLocation();

  const {
    pagos,
    estadisticas,
    cargando,
    error,
    mensaje,
    crearPago,
    actualizarPago,
    eliminarPago,
    enviarWhatsApp,
    cargarDatos,
  } = usePagos();

  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState(ESTADO_INICIAL_FORM);
  const [filtros, setFiltros] = useState({
    estado: "Todos",
    metodo: "Todos",
    fecha: "",
  });

  useEffect(() => {
    if (citaId && state?.cita) {
      setFormData((prev) => ({
        ...prev,
        citaId,
        monto: state.cita.costo || "",
      }));
    }
  }, [citaId, state]);

  const handleSubmit = async (datos) => {
    const exito = editandoId
      ? await actualizarPago(editandoId, datos)
      : await crearPago(datos);

    if (exito) {
      setShowForm(false);
      setEditandoId(null);
      setFormData(ESTADO_INICIAL_FORM);
    }
  };

  const handleEditar = (pago) => {
    setFormData({
      citaId: pago.citaId._id,
      monto: pago.monto.toString(),
      metodoPago: pago.metodoPago,
      estado: pago.estado,
      fechaPago: new Date(pago.fechaPago).toISOString().split("T")[0],
      observaciones: pago.observaciones || "",
      tipoTratamiento: pago.tipoTratamiento || "Sesion Individual",
    });
    setEditandoId(pago._id);
    setShowForm(true);
  };

  const pagosFiltrados = pagos.filter((pago) => {
    const cumpleEstado =
      filtros.estado === "Todos" || pago.estado === filtros.estado;
    const cumpleMetodo =
      filtros.metodo === "Todos" || pago.metodoPago === filtros.metodo;
    const cumpleFecha =
      !filtros.fecha ||
      new Date(pago.fechaPago).toISOString().split("T")[0] === filtros.fecha;
    return cumpleEstado && cumpleMetodo && cumpleFecha;
  });

  if (cargando) {
    return <LoadingScreen />;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <Header
          onVolver={() => navigate(-1)}
          onNuevoPago={() => setShowForm(true)}
        />

        {/* Estadísticas */}
        <EstadisticasPagos estadisticas={estadisticas} />

        {/* Alertas */}
        {error && <AlertError mensaje={error} />}
        {mensaje && <AlertExito mensaje={mensaje} />}

        {/* Filtros */}
        <FiltrosPagos filtros={filtros} onCambiarFiltros={setFiltros} />

        {/* Modal Form */}
        {showForm && (
          <PagoFormModal
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditandoId(null);
              setFormData(ESTADO_INICIAL_FORM);
            }}
            editando={!!editandoId}
          />
        )}

        {/* Lista de Pagos */}
        <ListaPagos
          pagos={pagosFiltrados}
          onEditar={handleEditar}
          onEliminar={eliminarPago}
          onWhatsApp={enviarWhatsApp}
          onNuevoPago={() => setShowForm(true)}
        />
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

const Header = ({ onVolver, onNuevoPago }) => (
  <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8'>
    <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
      <div className='flex items-center'>
        <button
          onClick={onVolver}
          className='mr-6 p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-2xl transition-all duration-200'
        >
          ← Volver
        </button>
        <div className='flex items-center'>
          <div className='bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 mr-6 shadow-lg'>
            <span className='text-3xl text-white'>💰</span>
          </div>
          <div>
            <h1 className='text-4xl font-bold text-gray-900 mb-2'>
              Gestión de Pagos
            </h1>
            <p className='text-gray-600 text-lg'>
              Control financiero y facturación
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onNuevoPago}
        className='bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 
          rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 
          font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1
          flex items-center justify-center gap-3'
      >
        <span className='text-xl'>➕</span>
        <span>Registrar Pago</span>
      </button>
    </div>
  </div>
);

const LoadingScreen = () => (
  <div className='min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center'>
    <div className='text-center'>
      <div className='relative'>
        <div className='w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4'></div>
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='text-2xl'>💰</span>
        </div>
      </div>
      <p className='text-xl text-gray-600 font-medium'>Cargando pagos...</p>
    </div>
  </div>
);

const AlertError = ({ mensaje }) => (
  <div className='bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-2xl mb-8 flex items-center shadow-lg'>
    <span className='text-xl mr-4'>⚠️</span>
    <p>{mensaje}</p>
  </div>
);

const AlertExito = ({ mensaje }) => (
  <div className='bg-green-50 border-l-4 border-green-400 text-green-700 px-6 py-4 rounded-2xl mb-8 flex items-center shadow-lg'>
    <span className='text-xl mr-4'>✅</span>
    <p>{mensaje}</p>
  </div>
);

const ListaPagos = ({
  pagos,
  onEditar,
  onEliminar,
  onWhatsApp,
  onNuevoPago,
}) => (
  <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden'>
    <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-8 border-b border-gray-200'>
      <div className='flex items-center'>
        <div className='bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-3 mr-4'>
          <span className='text-xl text-green-600'>💰</span>
        </div>
        <h3 className='text-2xl font-bold text-gray-900'>
          Lista de Pagos ({pagos.length})
        </h3>
      </div>
    </div>

    {pagos.length === 0 ? (
      <EstadoVacio onNuevoPago={onNuevoPago} />
    ) : (
      <div className='p-8'>
        <div className='space-y-6'>
          {pagos.map((pago) => (
            <PagoCard
              key={pago._id}
              pago={pago}
              onEditar={onEditar}
              onEliminar={onEliminar}
              onWhatsApp={onWhatsApp}
            />
          ))}
        </div>
      </div>
    )}
  </div>
);

const EstadoVacio = ({ onNuevoPago }) => (
  <div className='p-16 text-center'>
    <div className='bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6'>
      <span className='text-4xl'>💰</span>
    </div>
    <h3 className='text-2xl font-bold text-gray-700 mb-3'>
      No hay pagos registrados
    </h3>
    <p className='text-gray-500 mb-8 text-lg'>
      Comienza registrando el primer pago para llevar control financiero
    </p>
    <button
      onClick={onNuevoPago}
      className='bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 
        rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 
        font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1'
    >
      ➕ Registrar Primer Pago
    </button>
  </div>
);

export default PagosDashboard;
