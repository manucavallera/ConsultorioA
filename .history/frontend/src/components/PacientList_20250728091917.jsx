import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PacienteList({
  pacientes,
  setPacientes,
  onEditPaciente,
}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPacientes, setFilteredPacientes] = useState([]);

  useEffect(() => {
    fetchPacientes();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const filtered = pacientes.filter(
      (paciente) =>
        `${paciente.nombre} ${paciente.apellido}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        paciente.dni.includes(searchTerm)
    );
    setFilteredPacientes(filtered);
  }, [pacientes, searchTerm]);

  const fetchPacientes = async () => {
    try {
      const res = await fetch("http://localhost:5000/pacientes");
      const data = await res.json();
      setPacientes(data);
    } catch (err) {
      console.error("Error al obtener pacientes:", err);
    }
  };

  const handleVerCitas = (paciente) => {
    navigate(`/pacientes/${paciente._id}/citas`, { state: { paciente } });
  };

  const handleViewHistory = (paciente) => {
    navigate(`/historial/${paciente._id}`, { state: { paciente } });
  };

  const handleVerSolicitudes = (paciente) => {
    navigate(`/pacientes/${paciente._id}/solicitudes`, { state: { paciente } });
  };

  // ✅ NUEVA FUNCIÓN PARA FOTOS ANTES/DESPUÉS
  const handleVerFotos = (paciente) => {
    navigate(`/pacientes/${paciente._id}/fotos`, { state: { paciente } });
  };

  // ✅ NUEVA FUNCIÓN PARA PAGOS
  const handleVerPagos = (paciente) => {
    navigate(`/pacientes/${paciente._id}/pagos`, { state: { paciente } });
  };

  const eliminarPaciente = async (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este paciente?"
    );
    if (!confirmar) return;

    try {
      await fetch(`http://localhost:5000/pacientes/${id}`, {
        method: "DELETE",
      });
      setPacientes((prev) => prev.filter((paciente) => paciente._id !== id));
    } catch (err) {
      console.error("Error al eliminar paciente:", err);
    }
  };

  const ActionButton = ({ onClick, className, icon, children, title }) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 
        transform hover:scale-105 shadow-sm hover:shadow-md ${className}`}
      title={title}
    >
      <span className='flex items-center space-x-1'>
        <span>{icon}</span>
        <span className='hidden lg:inline'>{children}</span>
      </span>
    </button>
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-2xl shadow-xl p-6 mb-8'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-800 flex items-center'>
                <span className='bg-teal-100 text-teal-600 rounded-full p-3 mr-4'>
                  👥
                </span>
                Lista de Pacientes
              </h1>
              <p className='text-gray-600 mt-2'>
                Gestiona la información de todos los pacientes registrados
              </p>
            </div>

            {/* Search */}
            <div className='mt-4 lg:mt-0 lg:w-80'>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <span className='text-gray-400'>🔍</span>
                </div>
                <input
                  type='text'
                  placeholder='Buscar por nombre o DNI...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl 
                    focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                    bg-gray-50 placeholder-gray-400'
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
            <div className='bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 rounded-xl'>
              <div className='flex items-center'>
                <span className='text-2xl mr-3'>👥</span>
                <div>
                  <p className='text-sm opacity-90'>Total Pacientes</p>
                  <p className='text-2xl font-bold'>{pacientes.length}</p>
                </div>
              </div>
            </div>
            <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl'>
              <div className='flex items-center'>
                <span className='text-2xl mr-3'>🔍</span>
                <div>
                  <p className='text-sm opacity-90'>Mostrando</p>
                  <p className='text-2xl font-bold'>
                    {filteredPacientes.length}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl'>
              <div className='flex items-center'>
                <span className='text-2xl mr-3'>📅</span>
                <div>
                  <p className='text-sm opacity-90'>Último registro</p>
                  <p className='text-lg font-bold'>
                    {pacientes.length > 0
                      ? new Date(pacientes[0]?.creadoEn).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredPacientes.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-lg p-12 text-center'>
            <div className='text-6xl mb-4'>😔</div>
            <h3 className='text-xl font-semibold text-gray-700 mb-2'>
              {searchTerm
                ? "No se encontraron pacientes"
                : "No hay pacientes registrados"}
            </h3>
            <p className='text-gray-500'>
              {searchTerm
                ? "Intenta con otro término de búsqueda"
                : "Agrega tu primer paciente para comenzar"}
            </p>
          </div>
        ) : (
          <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gradient-to-r from-gray-50 to-gray-100'>
                  <tr>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Paciente
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Contacto
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Info Personal
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Información Médica
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Otros Datos
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {filteredPacientes.map((paciente, index) => (
                    <tr
                      key={paciente._id}
                      className={`hover:bg-gray-50 transition-colors duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-25"
                      }`}
                    >
                      {/* Paciente */}
                      <td className='px-6 py-4'>
                        <div className='flex items-center'>
                          <div
                            className='w-10 h-10 bg-gradient-to-r from-teal-400 to-blue-500 
                            rounded-full flex items-center justify-center text-white font-bold text-sm mr-3'
                          >
                            {paciente.nombre[0]}
                            {paciente.apellido[0]}
                          </div>
                          <div>
                            <div className='text-sm font-medium text-gray-900'>
                              {paciente.nombre} {paciente.apellido}
                            </div>
                            <div className='text-sm text-gray-500 flex items-center'>
                              <span className='mr-1'>🆔</span>
                              {paciente.dni}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className='px-6 py-4'>
                        <div className='space-y-1'>
                          <div className='text-sm text-gray-900 flex items-center'>
                            <span className='mr-1'>📱</span>
                            {paciente.telefono || "N/A"}
                          </div>
                          <div className='text-sm text-gray-500 flex items-center'>
                            <span className='mr-1'>✉️</span>
                            {paciente.email || "N/A"}
                          </div>
                        </div>
                      </td>

                      {/* Info Personal */}
                      <td className='px-6 py-4'>
                        <div className='space-y-1'>
                          <div className='text-sm text-gray-900 flex items-center'>
                            <span className='mr-1'>⚧</span>
                            {paciente.genero || "N/A"}
                          </div>
                          <div className='text-sm text-gray-500 flex items-center'>
                            <span className='mr-1'>📅</span>
                            {paciente.edad || "N/A"} años
                          </div>
                        </div>
                      </td>

                      {/* Info Médica */}
                      <td className='px-6 py-4'>
                        <div className='space-y-1 max-w-xs'>
                          <div className='text-xs text-gray-600'>
                            <strong>Alergias:</strong>{" "}
                            {paciente.alergias || "Ninguna"}
                          </div>
                          <div className='text-xs text-gray-600'>
                            <strong>Ant. Médicos:</strong>{" "}
                            {paciente.antecedentesEnfermedad
                              ? paciente.antecedentesEnfermedad.substring(
                                  0,
                                  30
                                ) + "..."
                              : "Ninguno"}
                          </div>
                          <div className='text-xs text-gray-600'>
                            <strong>Ant. Familiares:</strong>{" "}
                            {paciente.antecedentesFamiliares
                              ? paciente.antecedentesFamiliares.substring(
                                  0,
                                  30
                                ) + "..."
                              : "Ninguno"}
                          </div>
                        </div>
                      </td>

                      {/* Otros Datos */}
                      <td className='px-6 py-4'>
                        <div className='space-y-1'>
                          <div className='text-xs text-gray-600 flex items-center'>
                            <span className='mr-1'>😴</span>
                            {paciente.horasSueno || "N/A"}h sueño
                          </div>
                          <div className='text-xs text-gray-600 flex items-center'>
                            <span className='mr-1'>🏥</span>
                            {paciente.obraSocial || "Sin obra social"}
                          </div>
                          <div className='text-xs text-gray-600 flex items-center'>
                            <span className='mr-1'>🧴</span>
                            {paciente.tipoShampoo || "N/A"}
                          </div>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className='px-6 py-4'>
                        <div className='flex flex-wrap gap-2'>
                          <ActionButton
                            onClick={() => onEditPaciente(paciente)}
                            className='bg-blue-100 text-blue-700 hover:bg-blue-200'
                            icon='✏️'
                            title='Editar paciente'
                          >
                            Editar
                          </ActionButton>

                          <ActionButton
                            onClick={() => handleVerCitas(paciente)}
                            className='bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            icon='📅'
                            title='Ver citas del paciente'
                          >
                            Citas
                          </ActionButton>

                          <ActionButton
                            onClick={() => handleViewHistory(paciente)}
                            className='bg-green-100 text-green-700 hover:bg-green-200'
                            icon='📋'
                            title='Ver historial clínico'
                          >
                            Historial
                          </ActionButton>

                          <ActionButton
                            onClick={() => handleVerSolicitudes(paciente)}
                            className='bg-purple-100 text-purple-700 hover:bg-purple-200'
                            icon='📊'
                            title='Ver solicitudes de análisis'
                          >
                            Solicitudes
                          </ActionButton>

                          {/* ✅ NUEVO BOTÓN DE FOTOS ANTES/DESPUÉS */}
                          <ActionButton
                            onClick={() => handleVerFotos(paciente)}
                            className='bg-pink-100 text-pink-700 hover:bg-pink-200'
                            icon='📸'
                            title='Ver fotos antes y después del tratamiento'
                          >
                            Fotos
                          </ActionButton>

                          {/* ✅ NUEVO BOTÓN DE PAGOS - AGREGAR AQUÍ */}
                          <ActionButton
                            onClick={() => handleVerPagos(paciente)}
                            className='bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            icon='💰'
                            title='Ver pagos del paciente'
                          >
                            Pagos
                          </ActionButton>

                          <ActionButton
                            onClick={() => eliminarPaciente(paciente._id)}
                            className='bg-red-100 text-red-700 hover:bg-red-200'
                            icon='🗑️'
                            title='Eliminar paciente'
                          >
                            Eliminar
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
