import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5000";

const PagosSimple = () => {
  const [pagos, setPagos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCitasModal, setShowCitasModal] = useState(false);
  const [selectedPago, setSelectedPago] = useState(null);

  // Form data
  const [selectedPaciente, setSelectedPaciente] = useState("");
  const [tipoTratamiento, setTipoTratamiento] = useState("sesion");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [monto, setMonto] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const [pagosRes, pacientesRes, citasRes] = await Promise.all([
        fetch(`${API_URL}/pagos`),
        fetch(`${API_URL}/pacientes`),
        fetch(`${API_URL}/citas`),
      ]);

      if (pagosRes.ok) {
        const pagosData = await pagosRes.json();
        setPagos(Array.isArray(pagosData) ? pagosData : []);
      }

      if (pacientesRes.ok) {
        const pacientesData = await pacientesRes.json();
        setPacientes(Array.isArray(pacientesData) ? pacientesData : []);
      }

      if (citasRes.ok) {
        const citasData = await citasRes.json();
        setCitas(Array.isArray(citasData) ? citasData : []);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setLoading(false);
      setPagos([]);
      setPacientes([]);
      setCitas([]);
    }
  };

  // Cargar citas disponibles para anexar
  const cargarCitasDisponibles = async (pacienteId) => {
    try {
      const response = await fetch(
        `${API_URL}/citas?pacienteId=${pacienteId}&estado=confirmada`
      );
      if (response.ok) {
        const data = await response.json();
        setCitas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error cargando citas:", error);
    }
  };

  // Crear nuevo pago
  const crearPago = async () => {
    if (!selectedPaciente || !monto) {
      alert("Faltan datos obligatorios");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pacienteId: selectedPaciente,
          tipoTratamiento,
          metodoPago,
          monto: parseFloat(monto),
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setSelectedPaciente("");
        setMetodoPago("efectivo");
        setMonto("");
        cargarDatos();
        alert("Pago creado exitosamente");
      } else {
        const error = await response.json();
        alert(error.mensaje || "Error al crear el pago");
      }
    } catch (error) {
      console.error("Error creando pago:", error);
      alert("Error al crear el pago");
    }
  };

  // Cambiar estado del pago
  const cambiarEstado = async (pagoId, nuevoEstado) => {
    try {
      const response = await fetch(`${API_URL}/pagos/${pagoId}/confirmar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nuevoEstado === "pagado" ? "approved" : "pending",
        }),
      });

      if (response.ok) {
        cargarDatos();
        alert("Estado actualizado exitosamente");
      }
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert("Error al cambiar estado");
    }
  };

  // Anexar cita
  const anexarCita = async (pagoId, citaId) => {
    try {
      const response = await fetch(`${API_URL}/pagos/${pagoId}/anexar-cita`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citaId }),
      });

      if (response.ok) {
        setShowCitasModal(false);
        cargarDatos();
        alert("Cita anexada exitosamente");
      } else {
        const error = await response.json();
        alert(error.mensaje || "Error anexando cita");
      }
    } catch (error) {
      console.error("Error anexando cita:", error);
      alert("Error al anexar la cita");
    }
  };

  // Enviar alerta
  const enviarAlerta = async (pagoId) => {
    try {
      const response = await fetch(`${API_URL}/pagos/${pagoId}/alerta`, {
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

  // Generar Mercado Pago
  const generarMercadoPago = async (pagoId) => {
    try {
      const response = await fetch(`${API_URL}/pagos/${pagoId}/mercadopago`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data.paymentUrl, "_blank");
      }
    } catch (error) {
      console.error("Error generando MP:", error);
      alert("Error al generar el link de pago");
    }
  };

  if (loading) {
    return (
      <div className='p-8 text-center'>
        <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <p className='mt-2'>Cargando...</p>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow p-6 mb-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              💰 Gestión de Pagos
            </h1>
            <p className='text-gray-600'>Tratamientos y pagos de pacientes</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
          >
            ➕ Nuevo Pago
          </button>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
          <h3 className='font-semibold text-green-800'>Pagos Confirmados</h3>
          <p className='text-2xl font-bold text-green-600'>
            {pagos.filter((p) => p.estado === "pagado").length}
          </p>
        </div>
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <h3 className='font-semibold text-yellow-800'>Pendientes</h3>
          <p className='text-2xl font-bold text-yellow-600'>
            {pagos.filter((p) => p.estado === "pendiente").length}
          </p>
        </div>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <h3 className='font-semibold text-red-800'>Vencidos</h3>
          <p className='text-2xl font-bold text-red-600'>
            {pagos.filter((p) => p.estado === "vencido").length}
          </p>
        </div>
      </div>

      {/* Lista de Pagos */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold'>
            Lista de Pagos ({pagos.length})
          </h2>
        </div>

        {pagos.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            No hay pagos registrados
          </div>
        ) : (
          <div className='divide-y divide-gray-200'>
            {pagos.map((pago) => (
              <PagoRow
                key={pago._id}
                pago={pago}
                citas={citas.filter(
                  (c) => c.pacienteId === pago.pacienteId?._id
                )}
                onCambiarEstado={cambiarEstado}
                onAnexarCita={(pago) => {
                  setSelectedPago(pago);
                  cargarCitasDisponibles(pago.pacienteId._id);
                  setShowCitasModal(true);
                }}
                onEnviarAlerta={enviarAlerta}
                onGenerarMP={generarMercadoPago}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
            <h3 className='text-lg font-semibold mb-4'>Nuevo Pago</h3>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Paciente
                </label>
                <select
                  value={selectedPaciente}
                  onChange={(e) => setSelectedPaciente(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded'
                  required
                >
                  <option value=''>Seleccionar paciente</option>
                  {pacientes.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nombre} {p.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>Tipo</label>
                <select
                  value={tipoTratamiento}
                  onChange={(e) => setTipoTratamiento(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded'
                >
                  <option value='sesion'>Por Sesión (1 sesión)</option>
                  <option value='quincenal'>Quincenal (2 sesiones)</option>
                  <option value='mensual'>Mensual (4 sesiones)</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  Método de Pago
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded'
                >
                  <option value='efectivo'>💵 Efectivo</option>
                  <option value='transferencia'>🏦 Transferencia</option>
                  <option value='mercadopago'>💳 Mercado Pago</option>
                  <option value='tarjeta'>💳 Tarjeta</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>Monto</label>
                <input
                  type='number'
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded'
                  required
                  min='0'
                  step='0.01'
                />
              </div>
            </div>

            <div className='flex gap-2 mt-6'>
              <button
                onClick={crearPago}
                className='flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700'
              >
                Crear
              </button>
              <button
                onClick={() => setShowForm(false)}
                className='flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400'
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Citas */}
      {showCitasModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-lg mx-4'>
            <h3 className='text-lg font-semibold mb-4'>
              Anexar Cita - {selectedPago?.pacienteId?.nombre}
            </h3>
            <p className='text-gray-600 mb-4'>
              Sesiones disponibles:{" "}
              {(selectedPago?.sesionesIncluidas || 0) -
                (selectedPago?.sesionesUsadas || 0)}
            </p>

            {citas.length === 0 ? (
              <p className='text-center text-gray-500 py-8'>
                No hay citas disponibles
              </p>
            ) : (
              <div className='space-y-3 max-h-64 overflow-y-auto'>
                {citas
                  .filter((c) => c.estado === "confirmada" && !c.pagoId)
                  .map((cita) => (
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
                        onClick={() => anexarCita(selectedPago._id, cita._id)}
                        className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700'
                      >
                        Anexar
                      </button>
                    </div>
                  ))}
              </div>
            )}

            <button
              onClick={() => setShowCitasModal(false)}
              className='w-full mt-6 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400'
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para cada fila de pago
const PagoRow = ({
  pago,
  citas,
  onCambiarEstado,
  onAnexarCita,
  onEnviarAlerta,
  onGenerarMP,
}) => {
  const [showCitas, setShowCitas] = useState(false);

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

  const getMetodoIcon = (metodo) => {
    switch (metodo) {
      case "efectivo":
        return "💵";
      case "transferencia":
        return "🏦";
      case "mercadopago":
        return "💳";
      case "tarjeta":
        return "💳";
      default:
        return "💰";
    }
  };

  const getSesionesText = (pago) => {
    return `${pago.sesionesUsadas || 0}/${pago.sesionesIncluidas || 1}`;
  };

  const puedeUsarSesion =
    pago.estado === "pagado" &&
    (pago.sesionesUsadas || 0) < (pago.sesionesIncluidas || 1);

  return (
    <div className='p-4'>
      {/* Info principal */}
      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
        <div className='flex-1'>
          <div className='flex items-center mb-2'>
            <span className='text-xl mr-2'>
              {getTipoIcon(pago.tipoTratamiento)}
            </span>
            <div>
              <h4 className='font-semibold text-gray-900'>
                {pago.pacienteId?.nombre} {pago.pacienteId?.apellido}
              </h4>
              <p className='text-sm text-gray-600 capitalize'>
                {pago.tipoTratamiento} - ${pago.monto?.toLocaleString()} -{" "}
                {getMetodoIcon(pago.metodoPago)} {pago.metodoPago}
              </p>
            </div>
          </div>

          <div className='flex flex-wrap gap-4 text-sm'>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(
                pago.estado
              )}`}
            >
              {pago.estado}
            </span>
            <span className='text-gray-600'>
              Sesiones: {getSesionesText(pago)}
            </span>
            <span className='text-gray-600'>
              Vence: {new Date(pago.fechaVencimiento).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className='flex flex-wrap gap-2'>
          {pago.estado === "pendiente" && (
            <>
              <button
                onClick={() => onCambiarEstado(pago._id, "pagado")}
                className='bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700'
              >
                ✅ Confirmar
              </button>
              {pago.metodoPago === "mercadopago" && (
                <button
                  onClick={() => onGenerarMP(pago._id)}
                  className='bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700'
                >
                  💳 Pagar MP
                </button>
              )}
              <button
                onClick={() => onEnviarAlerta(pago._id)}
                className='bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700'
              >
                📱 Alerta
              </button>
            </>
          )}

          {puedeUsarSesion && (
            <button
              onClick={() => onAnexarCita(pago)}
              className='bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700'
            >
              🔗 Anexar Cita
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PagosSimple;
