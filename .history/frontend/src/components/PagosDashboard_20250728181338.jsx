import React, { useState, useEffect } from "react";

const PagosSimple = () => {
  const [pagos, setPagos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form data
  const [selectedPaciente, setSelectedPaciente] = useState("");
  const [tipoTratamiento, setTipoTratamiento] = useState("sesion");
  const [monto, setMonto] = useState("");

  // Cargar datos
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [pagosRes, pacientesRes, citasRes] = await Promise.all([
        fetch("/pagos"),
        fetch("/pacientes"),
        fetch("/citas"),
      ]);

      const pagosData = await pagosRes.json();
      const pacientesData = await pacientesRes.json();
      const citasData = await citasRes.json();

      setPagos(pagosData.data || []);
      setPacientes(pacientesData.data || []);
      setCitas(citasData.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  // Crear pago
  const crearPago = async () => {
    if (!selectedPaciente || !monto) {
      alert("Faltan datos");
      return;
    }

    try {
      const response = await fetch("/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pacienteId: selectedPaciente,
          tipoTratamiento,
          monto: parseFloat(monto),
        }),
      });

      if (response.ok) {
        alert("Pago creado");
        setShowForm(false);
        setSelectedPaciente("");
        setMonto("");
        cargarDatos();
      }
    } catch (error) {
      alert("Error creando pago");
    }
  };

  // Cambiar estado del pago
  const cambiarEstado = async (pagoId, nuevoEstado) => {
    try {
      const response = await fetch(`/pagos/${pagoId}/confirmar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nuevoEstado === "pagado" ? "approved" : "pending",
        }),
      });

      if (response.ok) {
        cargarDatos();
      }
    } catch (error) {
      alert("Error cambiando estado");
    }
  };

  // Anexar cita
  const anexarCita = async (pagoId, citaId) => {
    try {
      const response = await fetch(`/pagos/${pagoId}/anexar-cita`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citaId }),
      });

      if (response.ok) {
        alert("Cita anexada");
        cargarDatos();
      } else {
        const error = await response.json();
        alert(error.message || "Error anexando cita");
      }
    } catch (error) {
      alert("Error anexando cita");
    }
  };

  // Enviar alerta
  const enviarAlerta = async (pagoId) => {
    try {
      await fetch(`/pagos/${pagoId}/alerta`, { method: "POST" });
      alert("Alerta enviada");
      cargarDatos();
    } catch (error) {
      alert("Error enviando alerta");
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
                  (c) => c.pacienteId === pago.pacienteId._id
                )}
                onCambiarEstado={cambiarEstado}
                onAnexarCita={anexarCita}
                onEnviarAlerta={enviarAlerta}
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

  const getSesionesText = (pago) => {
    return `${pago.sesionesUsadas || 0}/${pago.sesionesIncluidas || 1}`;
  };

  const puedeUsarSesion =
    pago.estado === "pagado" &&
    (pago.sesionesUsadas || 0) < (pago.sesionesIncluidas || 1);

  const citasDisponibles = citas.filter(
    (c) => c.estado === "confirmada" && !c.pagoId
  );

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
                {pago.tipoTratamiento} - ${pago.monto?.toLocaleString()}
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
              onClick={() => setShowCitas(!showCitas)}
              className='bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700'
            >
              🔗 Anexar Cita
            </button>
          )}
        </div>
      </div>

      {/* Lista de citas para anexar */}
      {showCitas && puedeUsarSesion && (
        <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
          <h5 className='font-medium mb-3'>Citas disponibles para anexar:</h5>
          {citasDisponibles.length === 0 ? (
            <p className='text-gray-500 text-sm'>No hay citas disponibles</p>
          ) : (
            <div className='space-y-2'>
              {citasDisponibles.map((cita) => (
                <div
                  key={cita._id}
                  className='flex items-center justify-between bg-white rounded p-3'
                >
                  <div>
                    <p className='font-medium'>
                      {new Date(cita.fecha).toLocaleDateString()} - {cita.hora}
                    </p>
                    <p className='text-sm text-gray-600'>{cita.tipoConsulta}</p>
                  </div>
                  <button
                    onClick={() => onAnexarCita(pago._id, cita._id)}
                    className='bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700'
                  >
                    Anexar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PagosSimple;
