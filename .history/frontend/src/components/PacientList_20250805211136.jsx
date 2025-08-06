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
  const [vistaTabla, setVistaTabla] = useState(true); // Toggle entre tabla y tarjetas

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

    // ✅ ORDENAR ALFABÉTICAMENTE POR APELLIDO Y LUEGO NOMBRE
    const sortedFiltered = filtered.sort((a, b) => {
      const apellidoA = a.apellido.toLowerCase();
      const apellidoB = b.apellido.toLowerCase();

      if (apellidoA < apellidoB) return -1;
      if (apellidoA > apellidoB) return 1;

      // Si los apellidos son iguales, ordenar por nombre
      const nombreA = a.nombre.toLowerCase();
      const nombreB = b.nombre.toLowerCase();

      if (nombreA < nombreB) return -1;
      if (nombreA > nombreB) return 1;
      return 0;
    });

    setFilteredPacientes(sortedFiltered);
  }, [pacientes, searchTerm]);

  const fetchPacientes = async () => {
    try {
      const res = await fetch(`${API_URL}/pacientes`);
      const data = await res.json();

      // ✅ ORDENAR TAMBIÉN LA LISTA INICIAL
      const sortedData = data.sort((a, b) => {
        const apellidoA = a.apellido.toLowerCase();
        const apellidoB = b.apellido.toLowerCase();

        if (apellidoA < apellidoB) return -1;
        if (apellidoA > apellidoB) return 1;

        const nombreA = a.nombre.toLowerCase();
        const nombreB = b.nombre.toLowerCase();

        if (nombreA < nombreB) return -1;
        if (nombreA > nombreB) return 1;
        return 0;
      });

      setPacientes(sortedData);
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

  // ✅ FUNCIÓN PARA FOTOS ANTES/DESPUÉS
  const handleVerFotos = (paciente) => {
    navigate(`/pacientes/${paciente._id}/fotos`, { state: { paciente } });
  };

  // ✅ FUNCIÓN PARA PAGOS
  const handleVerPagos = (paciente) => {
    navigate(`/pacientes/${paciente._id}/pagos`, { state: { paciente } });
  };

  const eliminarPaciente = async (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este paciente?"
    );
    if (!confirmar) return;

    try {
      await fetch(`${API_URL}/pacientes/${id}`, {
        method: "DELETE",
      });
      setPacientes((prev) => prev.filter((paciente) => paciente._id !== id));
    } catch (err) {
      console.error("Error al eliminar paciente:", err);
    }
  };

  const ActionButton = ({
    onClick,
    className,
    icon,
    children,
    title,
    compact = false,
  }) => (
    <button
      onClick={onClick}
      className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 
      transform hover:scale-105 shadow-sm hover:shadow-md ${className} min-h-[44px] flex items-center justify-center`}
      title={title}
    >
      <span className='flex flex-col sm:flex-row items-center justify-center space-y-0.5 sm:space-y-0 sm:space-x-1'>
        <span className='text-base sm:text-lg'>{icon}</span>
        {/* ✅ TEXTO SIEMPRE VISIBLE - SIN HIDDEN */}
        {children && (
          <span className='text-xs sm:text-sm font-medium leading-tight text-center'>
            {children}
          </span>
        )}
      </span>
    </button>
  );

  // 📱 COMPONENTE TARJETA PARA MÓVILES
  const PacienteCard = ({ paciente, index }) => (
    <div
      className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 ${
        index % 2 === 0
          ? "bg-gradient-to-br from-white to-blue-50"
          : "bg-gradient-to-br from-white to-teal-50"
      }`}
    >
      {/* Header de la tarjeta */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center'>
          <div
            className='w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-teal-400 to-blue-500 
            rounded-full flex items-center justify-center text-white font-bold text-lg mr-3'
          >
            {paciente.nombre[0]}
            {paciente.apellido[0]}
          </div>
          <div>
            <h3 className='text-lg sm:text-xl font-bold text-gray-900'>
              {paciente.apellido}, {paciente.nombre}
            </h3>
            <p className='text-sm text-gray-500 flex items-center'>
              <span className='mr-1'>🆔</span>
              {paciente.dni}
            </p>
          </div>
        </div>
      </div>

      {/* Información principal en grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
        {/* Contacto */}
        <div className='bg-gray-50 rounded-xl p-3'>
          <h4 className='font-semibold text-gray-700 text-sm mb-2 flex items-center'>
            <span className='mr-1'>📞</span>
            Contacto
          </h4>
          <div className='space-y-1'>
            <div className='text-sm text-gray-600 flex items-center'>
              <span className='mr-1'>📱</span>
              {paciente.telefono || "N/A"}
            </div>
            <div className='text-sm text-gray-600 flex items-center'>
              <span className='mr-1'>✉️</span>
              <span className='truncate'>{paciente.email || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Info Personal */}
        <div className='bg-gray-50 rounded-xl p-3'>
          <h4 className='font-semibold text-gray-700 text-sm mb-2 flex items-center'>
            <span className='mr-1'>👤</span>
            Personal
          </h4>
          <div className='space-y-1'>
            <div className='text-sm text-gray-600 flex items-center'>
              <span className='mr-1'>⚧</span>
              {paciente.genero || "N/A"}
            </div>
            <div className='text-sm text-gray-600 flex items-center'>
              <span className='mr-1'>📅</span>
              {paciente.edad || "N/A"} años
            </div>
          </div>
        </div>
      </div>

      {/* Información médica expandible */}
      <details className='mb-4'>
        <summary className='cursor-pointer bg-blue-50 rounded-xl p-3 hover:bg-blue-100 transition-colors'>
          <span className='font-semibold text-gray-700 text-sm flex items-center'>
            <span className='mr-1'>🏥</span>
            Información Médica
            <span className='ml-auto text-xs'>👁️ Ver más</span>
          </span>
        </summary>
        <div className='mt-3 space-y-2 px-3'>
          <div className='text-sm text-gray-600'>
            <strong>Alergias:</strong> {paciente.alergias || "Ninguna"}
          </div>
          <div className='text-sm text-gray-600'>
            <strong>Antecedentes Médicos:</strong>{" "}
            {paciente.antecedentesEnfermedad || "Ninguno"}
          </div>
          <div className='text-sm text-gray-600'>
            <strong>Antecedentes Familiares:</strong>{" "}
            {paciente.antecedentesFamiliares || "Ninguno"}
          </div>
        </div>
      </details>

      {/* Otros datos */}
      <div className='bg-purple-50 rounded-xl p-3 mb-4'>
        <h4 className='font-semibold text-gray-700 text-sm mb-2 flex items-center'>
          <span className='mr-1'>📋</span>
          Otros Datos
        </h4>
        <div className='grid grid-cols-2 gap-2 text-xs text-gray-600'>
          <div className='flex items-center'>
            <span className='mr-1'>😴</span>
            {paciente.horasSueno || "N/A"}h sueño
          </div>
          <div className='flex items-center'>
            <span className='mr-1'>🏥</span>
            {paciente.obraSocial ? "Con obra social" : "Sin obra social"}
          </div>
          <div className='flex items-center col-span-2'>
            <span className='mr-1'>🧴</span>
            {paciente.tipoShampoo || "N/A"}
          </div>
        </div>
      </div>

      {/* Acciones - Layout mejorado para móvil */}
      {/* Acciones - Layout mejorado para móvil CON TEXTO VISIBLE */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3'>
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
          Análisis
        </ActionButton>

        <ActionButton
          onClick={() => handleVerFotos(paciente)}
          className='bg-pink-100 text-pink-700 hover:bg-pink-200'
          icon='📸'
          title='Ver fotos antes y después del tratamiento'
        >
          Fotos
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
    </div>
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/20'>
          <div className='flex flex-col space-y-4'>
            {/* Título y descripción */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
              <div className='mb-4 sm:mb-0'>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 flex items-center'>
                  <span className='bg-teal-100 text-teal-600 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 text-lg sm:text-xl'>
                    👥
                  </span>
                  Lista de Pacientes
                </h1>
                <p className='text-gray-600 mt-2 text-sm sm:text-base'>
                  Gestiona la información de todos los pacientes registrados
                  <span className='hidden sm:inline'>
                    {" "}
                    (ordenados alfabéticamente)
                  </span>
                </p>
              </div>

              {/* Toggle de vista (solo visible en desktop) */}
              <div className='hidden lg:flex bg-gray-100 rounded-xl p-1'>
                <button
                  onClick={() => setVistaTabla(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    vistaTabla
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📊 Tabla
                </button>
                <button
                  onClick={() => setVistaTabla(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    !vistaTabla
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  🃏 Tarjetas
                </button>
              </div>
            </div>

            {/* Search */}
            <div className='w-full sm:max-w-md lg:max-w-lg'>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <span className='text-gray-400 text-lg'>🔍</span>
                </div>
                <input
                  type='text'
                  placeholder='Buscar por nombre o DNI...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl 
                    focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                    bg-gray-50 placeholder-gray-400 text-sm sm:text-base'
                />
              </div>
            </div>

            {/* Stats - Responsive grid */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
              <div className='bg-gradient-to-r from-teal-500 to-teal-600 text-white p-3 sm:p-4 rounded-xl'>
                <div className='flex items-center'>
                  <span className='text-xl sm:text-2xl mr-2 sm:mr-3'>👥</span>
                  <div>
                    <p className='text-xs sm:text-sm opacity-90'>
                      Total Pacientes
                    </p>
                    <p className='text-xl sm:text-2xl font-bold'>
                      {pacientes.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4 rounded-xl'>
                <div className='flex items-center'>
                  <span className='text-xl sm:text-2xl mr-2 sm:mr-3'>🔍</span>
                  <div>
                    <p className='text-xs sm:text-sm opacity-90'>Mostrando</p>
                    <p className='text-xl sm:text-2xl font-bold'>
                      {filteredPacientes.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className='bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 sm:p-4 rounded-xl sm:col-span-1 col-span-1'>
                <div className='flex items-center'>
                  <span className='text-xl sm:text-2xl mr-2 sm:mr-3'>📅</span>
                  <div>
                    <p className='text-xs sm:text-sm opacity-90'>
                      Último registro
                    </p>
                    <p className='text-sm sm:text-lg font-bold'>
                      {pacientes.length > 0
                        ? new Date(pacientes[0]?.creadoEn).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredPacientes.length === 0 ? (
          <div className='bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg p-8 sm:p-12 text-center border border-white/20'>
            <div className='text-4xl sm:text-6xl mb-4'>😔</div>
            <h3 className='text-lg sm:text-xl font-semibold text-gray-700 mb-2'>
              {searchTerm
                ? "No se encontraron pacientes"
                : "No hay pacientes registrados"}
            </h3>
            <p className='text-gray-500 text-sm sm:text-base'>
              {searchTerm
                ? "Intenta con otro término de búsqueda"
                : "Agrega tu primer paciente para comenzar"}
            </p>
          </div>
        ) : (
          <>
            {/* Vista Tarjetas - Móvil y tablet, también disponible en desktop */}
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:hidden'>
              {filteredPacientes.map((paciente, index) => (
                <PacienteCard
                  key={paciente._id}
                  paciente={paciente}
                  index={index}
                />
              ))}
            </div>

            {/* Vista Tarjetas para Desktop cuando se selecciona */}
            {!vistaTabla && (
              <div className='hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6'>
                {filteredPacientes.map((paciente, index) => (
                  <PacienteCard
                    key={paciente._id}
                    paciente={paciente}
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* Vista Tabla - Solo desktop */}
            {vistaTabla && (
              <div className='hidden lg:block bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20'>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead className='bg-gradient-to-r from-gray-50 to-gray-100'>
                      <tr>
                        <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Paciente 🔤
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
                                  {paciente.apellido}, {paciente.nombre}
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

                              {/* BOTÓN DE FOTOS ANTES/DESPUÉS */}
                              <ActionButton
                                onClick={() => handleVerFotos(paciente)}
                                className='bg-pink-100 text-pink-700 hover:bg-pink-200'
                                icon='📸'
                                title='Ver fotos antes y después del tratamiento'
                              >
                                Fotos
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
          </>
        )}
      </div>
    </div>
  );
}
