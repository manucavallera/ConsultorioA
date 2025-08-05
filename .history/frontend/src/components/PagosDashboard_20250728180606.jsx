import React, { useState, useEffect } from "react";

const PagosDashboard = () => {
  const [pagos, setPagos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [alertas, setAlertas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCitasModal, setShowCitasModal] = useState(false);
  const [selectedPago, setSelectedPago] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    pacienteId: "",
    tipoTratamiento: "sesion",
    monto: "",
    descripcion: "",
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [pagosRes, statsRes, alertasRes, pacientesRes] = await Promise.all([
        fetch("/pagos"),
        fetch("/pagos/estadisticas"),
        fetch("/pagos/alertas"),
        fetch("/pacientes"),
      ]);

      const [pagosData, statsData, alertasData, pacientesData] =
        await Promise.all([
          pagosRes.json(),
          statsRes.json(),
          alertasRes.json(),
          pacientesRes.json(),
        ]);

      setPagos(pagosData.data || []);
      setEstadisticas(statsData.data || {});
      setAlertas(alertasData.data || []);
      setPacientes(pacientesData.data || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar citas disponibles para anexar
  const cargarCitasDisponibles = async (pacienteId) => {
    try {
      const response = await fetch(
        `/citas?pacienteId=${pacienteId}&estado=confirmada`
      );
      const data = await response.json();
      setCitas(data.data || []);
    } catch (error) {
      console.error("Error cargando citas:", error);
    }
  };

  // Crear nuevo pago
  const crearPago = async () => {
    try {
      const response = await fetch("/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          pacienteId: "",
          tipoTratamiento: "sesion",
          monto: "",
          descripcion: "",
        });
        cargarDatos();
        alert("Pago creado exitosamente");
      }
    } catch (error) {
      console.error("Error creando pago:", error);
      alert("Error al crear el pago");
    }
  };

  // Generar link de Mercado Pago
  const generarMercadoPago = async (pagoId) => {
    try {
      const response = await fetch(`/pagos/${pagoId}/mercadopago`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data.data.paymentUrl, "_blank");
      }
    } catch (error) {
      console.error("Error generando MP:", error);
      alert("Error al generar el link de pago");
    }
  };

  // Confirmar pago manualmente
  const confirmarPago = async (pagoId) => {
    try {
      const response = await fetch(`/pagos/${pagoId}/confirmar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "approved",
          paymentId: "MANUAL_" + Date.now(),
        }),
      });

      if (response.ok) {
        cargarDatos();
        alert("Pago confirmado exitosamente");
      }
    } catch (error) {
      console.error("Error confirmando pago:", error);
      alert("Error al confirmar el pago");
    }
  };

  // Anexar cita a pago
  const anexarCita = async (pagoId, citaId) => {
    try {
      const response = await fetch(`/pagos/${pagoId}/anexar-cita`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citaId }),
      });

      if (response.ok) {
        setShowCitasModal(false);
        cargarDatos();
        alert("Cita anexada exitosamente");
      }
    } catch (error) {
      console.error("Error anexando cita:", error);
      alert("Error al anexar la cita");
    }
  };

  // Enviar alerta
  const enviarAlerta = async (pagoId) => {
    try {
      const response = await fetch(`/pagos/${pagoId}/alerta`, {
        method: "POST",
      });

      if (response.ok) {
        cargarDatos();
        alert("Alerta enviada exitosamente");
      }
    } catch (error) {
      console.error("Error enviando alerta:", error);
      alert("Error al enviar la alerta");
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <Header onNuevoPago={() => setShowForm(true)} />

        {/* Estadísticas */}
        <EstadisticasCard
          estadisticas={estadisticas}
          alertas={alertas.length}
        />

        {/* Alertas Pendientes */}
        {alertas.length > 0 && (
          <AlertasCard alertas={alertas} onEnviarAlerta={enviarAlerta} />
        )}

        {/* Lista de Pagos */}
        <PagosCard
          pagos={pagos}
          onGenerarMP={generarMercadoPago}
          onConfirmar={confirmarPago}
          onAnexarCita={(pago) => {
            setSelectedPago(pago);
            cargarCitasDisponibles(pago.pacienteId._id);
            setShowCitasModal(true);
          }}
          onEnviarAlerta={enviarAlerta}
        />

        {/* Modal Nuevo Pago */}
        {showForm && (
          <FormModal
            formData={formData}
            setFormData={setFormData}
            onSubmit={crearPago}
            onClose={() => setShowForm(false)}
            pacientes={pacientes}
          />
        )}

        {/* Modal Anexar Citas */}
        {showCitasModal && (
          <CitasModal
            pago={selectedPago}
            citas={citas}
            onAnexar={anexarCita}
            onClose={() => setShowCitasModal(false)}
          />
        )}
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTES
// ==========================================

const Header = ({ onNuevoPago }) => (
  <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8'>
    <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
      <div className='flex items-center'>
        <div className='bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 mr-6 shadow-lg'>
          <span className='text-3xl text-white'>💰</span>
        </div>
        <div>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>
            Gestión de Pagos
          </h1>
          <p className='text-gray-600 text-lg'>
            Tratamientos mensuales, quincenales y por sesión
          </p>
        </div>
      </div>
      <button
        onClick={onNuevoPago}
        className='bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 
          rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 
          font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1'
      >
        ➕ Nuevo Pago
      </button>
    </div>
  </div>
);

const EstadisticasCard = ({ estadisticas, alertas }) => (
  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
    <StatCard
      title='Ingresos del Mes'
      value={`$${estadisticas.ingresosMes?.toLocaleString() || 0}`}
      subtitle={`${estadisticas.pagosMes || 0} pagos`}
      icon='💵'
      color='green'
    />
    <StatCard
      title='Pagos Pendientes'
      value={estadisticas.pagosPendientes || 0}
      subtitle='Por confirmar'
      icon='⏳'
      color='yellow'
    />
    <StatCard
      title='Pagos Vencidos'
      value={estadisticas.pagosVencidos || 0}
      subtitle='Requieren atención'
      icon='⚠️'
      color='red'
    />
    <StatCard
      title='Sesiones Disponibles'
      value={estadisticas.sesionesDisponibles || 0}
      subtitle='Para usar'
      icon='🎯'
      color='blue'
    />
  </div>
);

const StatCard = ({ title, value, subtitle, icon, color }) => {
  const colors = {
    green: "from-green-500 to-emerald-600",
    yellow: "from-yellow-500 to-orange-600",
    red: "from-red-500 to-pink-600",
    blue: "from-blue-500 to-indigo-600",
  };

  return (
    <div className='bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6'>
      <div className='flex items-center'>
        <div
          className={`bg-gradient-to-br ${colors[color]} rounded-xl p-3 mr-4`}
        >
          <span className='text-2xl text-white'>{icon}</span>
        </div>
        <div>
          <p className='text-sm text-gray-600 font-medium'>{title}</p>
          <p className='text-2xl font-bold text-gray-900'>{value}</p>
          <p className='text-xs text-gray-500'>{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

const AlertasCard = ({ alertas, onEnviarAlerta }) => (
  <div className='bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8'>
    <div className='flex items-center mb-4'>
      <span className='text-2xl mr-3'>🚨</span>
      <h3 className='text-xl font-bold text-yellow-800'>
        {alertas.length} Alerta{alertas.length !== 1 ? "s" : ""} Pendiente
        {alertas.length !== 1 ? "s" : ""}
      </h3>
    </div>
    <div className='space-y-3'>
      {alertas.slice(0, 3).map((pago) => (
        <div
          key={pago._id}
          className='flex items-center justify-between bg-white rounded-xl p-4'
        >
          <div>
            <p className='font-semibold'>
              {pago.pacienteId.nombre} {pago.pacienteId.apellido}
            </p>
            <p className='text-sm text-gray-600'>
              Vence: {new Date(pago.fechaVencimiento).toLocaleDateString()} - $
              {pago.monto}
            </p>
          </div>
          <button
            onClick={() => onEnviarAlerta(pago._id)}
            className='bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors'
          >
            Enviar Alerta
          </button>
        </div>
      ))}
    </div>
  </div>
);

const PagosCard = ({
  pagos,
  onGenerarMP,
  onConfirmar,
  onAnexarCita,
  onEnviarAlerta,
}) => (
  <div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden'>
    <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200'>
      <h3 className='text-2xl font-bold text-gray-900'>
        Lista de Pagos ({pagos.length})
      </h3>
    </div>

    {pagos.length === 0 ? (
      <div className='p-16 text-center'>
        <span className='text-6xl block mb-4'>💰</span>
        <h3 className='text-2xl font-bold text-gray-700 mb-3'>
          No hay pagos registrados
        </h3>
        <p className='text-gray-500'>Comienza creando el primer pago</p>
      </div>
    ) : (
      <div className='p-6 space-y-4'>
        {pagos.map((pago) => (
          <PagoItem
            key={pago._id}
            pago={pago}
            onGenerarMP={onGenerarMP}
            onConfirmar={onConfirmar}
            onAnexarCita={onAnexarCita}
            onEnviarAlerta={onEnviarAlerta}
          />
        ))}
      </div>
    )}
  </div>
);

const PagoItem = ({
  pago,
  onGenerarMP,
  onConfirmar,
  onAnexarCita,
  onEnviarAlerta,
}) => {
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pagado":
        return "bg-green-100 text-green-800";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "vencido":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case "mensual":
        return "📅";
      case "quincenal":
        return "📆";
      case "sesion":
        return "🎯";
      default:
        return "💰";
    }
  };

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6'>
      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
        {/* Info Principal */}
        <div className='flex-1'>
          <div className='flex items-center mb-2'>
            <span className='text-2xl mr-3'>
              {getTipoIcon(pago.tipoTratamiento)}
            </span>
            <div>
              <h4 className='text-lg font-bold text-gray-900'>
                {pago.pacienteId.nombre} {pago.pacienteId.apellido}
              </h4>
              <p className='text-sm text-gray-600 capitalize'>
                {pago.tipoTratamiento} - {pago.sesionesIncluidas} sesiones
              </p>
            </div>
          </div>

          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm'>
            <div>
              <p className='text-gray-500'>Monto</p>
              <p className='font-semibold'>${pago.monto.toLocaleString()}</p>
            </div>
            <div>
              <p className='text-gray-500'>Sesiones</p>
              <p className='font-semibold'>
                {pago.sesionesUsadas}/{pago.sesionesIncluidas}
              </p>
            </div>
            <div>
              <p className='text-gray-500'>Vence</p>
              <p className='font-semibold'>
                {new Date(pago.fechaVencimiento).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getEstadoColor(
                  pago.estado
                )}`}
              >
                {pago.estado}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className='flex flex-wrap gap-2'>
          {pago.estado === "pendiente" && (
            <>
              <button
                onClick={() => onGenerarMP(pago._id)}
                className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm'
              >
                💳 Mercado Pago
              </button>
              <button
                onClick={() => onConfirmar(pago._id)}
                className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm'
              >
                ✅ Confirmar
              </button>
              <button
                onClick={() => onEnviarAlerta(pago._id)}
                className='bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm'
              >
                📱 Alerta
              </button>
            </>
          )}

          {pago.estado === "pagado" && pago.puedeUsarSesion && (
            <button
              onClick={() => onAnexarCita(pago)}
              className='bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm'
            >
              🔗 Anexar Cita
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const FormModal = ({ formData, setFormData, onSubmit, onClose, pacientes }) => (
  <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
    <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-6'>
      <h3 className='text-2xl font-bold text-gray-900 mb-6'>Nuevo Pago</h3>

      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Paciente
          </label>
          <select
            value={formData.pacienteId}
            onChange={(e) =>
              setFormData({ ...formData, pacienteId: e.target.value })
            }
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500'
            required
          >
            <option value=''>Seleccionar paciente</option>
            {pacientes.map((paciente) => (
              <option key={paciente._id} value={paciente._id}>
                {paciente.nombre} {paciente.apellido}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Tipo de Tratamiento
          </label>
          <select
            value={formData.tipoTratamiento}
            onChange={(e) =>
              setFormData({ ...formData, tipoTratamiento: e.target.value })
            }
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500'
          >
            <option value='sesion'>Por Sesión (1 sesión)</option>
            <option value='quincenal'>Quincenal (2 sesiones)</option>
            <option value='mensual'>Mensual (4 sesiones)</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Monto
          </label>
          <input
            type='number'
            value={formData.monto}
            onChange={(e) =>
              setFormData({ ...formData, monto: e.target.value })
            }
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500'
            required
            min='0'
            step='0.01'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500'
            rows={3}
          />
        </div>

        <div className='flex gap-3 pt-4'>
          <button
            type='button'
            onClick={onSubmit}
            className='flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold'
          >
            Crear Pago
          </button>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold'
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
);

const CitasModal = ({ pago, citas, onAnexar, onClose }) => (
  <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
    <div className='bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6'>
      <h3 className='text-2xl font-bold text-gray-900 mb-4'>
        Anexar Cita - {pago?.pacienteId.nombre}
      </h3>
      <p className='text-gray-600 mb-6'>
        Sesiones disponibles: {pago?.sesionesIncluidas - pago?.sesionesUsadas}
      </p>

      {citas.length === 0 ? (
        <p className='text-center text-gray-500 py-8'>
          No hay citas disponibles
        </p>
      ) : (
        <div className='space-y-3 max-h-64 overflow-y-auto'>
          {citas.map((cita) => (
            <div
              key={cita._id}
              className='flex items-center justify-between bg-gray-50 rounded-lg p-4'
            >
              <div>
                <p className='font-semibold'>
                  {new Date(cita.fecha).toLocaleDateString()}
                </p>
                <p className='text-sm text-gray-600'>
                  {cita.hora} - {cita.tipoConsulta}
                </p>
              </div>
              <button
                onClick={() => onAnexar(pago._id, cita._id)}
                className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors'
              >
                Anexar
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onClose}
        className='w-full mt-6 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold'
      >
        Cerrar
      </button>
    </div>
  </div>
);

const LoadingScreen = () => (
  <div className='min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center'>
    <div className='text-center'>
      <div className='w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4'></div>
      <p className='text-xl text-gray-600 font-medium'>Cargando pagos...</p>
    </div>
  </div>
);

export default PagosDashboard;
