import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PacienteList({
  pacientes,
  setPacientes,
  onEditPaciente,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    fetchPacientes();
    // eslint-disable-next-line
  }, []);

  const fetchPacientes = async () => {
    try {
      const res = await fetch("http://localhost:5000/pacientes");
      const data = await res.json();
      setPacientes(data);
    } catch (err) {
      console.error("Error al obtener pacientes:", err);
    }
  };

  const handleViewHistory = (paciente) => {
    navigate(`/historial/${paciente._id}`, { state: { paciente } });
  };

  const handleVerSolicitudes = (paciente) => {
    navigate(`/pacientes/${paciente._id}/solicitudes`, { state: { paciente } });
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

  return (
    <div className='container mx-auto p-4'>
      <h2 className='text-2xl font-bold mb-4'>Lista de Pacientes</h2>
      {pacientes.length === 0 ? (
        <p className='text-gray-500'>No hay pacientes registrados.</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border border-gray-300'>
            <thead>
              <tr className='bg-gray-200 text-gray-700'>
                <th className='py-2 px-4 border-b'>Nombre</th>
                <th className='py-2 px-4 border-b'>DNI</th>
                <th className='py-2 px-4 border-b'>Teléfono</th>
                <th className='py-2 px-4 border-b'>Email</th>
                <th className='py-2 px-4 border-b'>Género</th>
                <th className='py-2 px-4 border-b'>Alergias</th>
                <th className='py-2 px-4 border-b'>Antecedentes</th>
                <th className='py-2 px-4 border-b'>Horas de Sueño</th>
                <th className='py-2 px-4 border-b'>Obra Social</th>
                <th className='py-2 px-4 border-b'>Tipo de Shampoo</th>
                <th className='py-2 px-4 border-b'>Creado En</th>
                <th className='py-2 px-4 border-b'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((paciente) => (
                <tr key={paciente._id} className='hover:bg-gray-100'>
                  <td className='py-2 px-4 border-b'>
                    {paciente.nombre} {paciente.apellido}
                  </td>
                  <td className='py-2 px-4 border-b'>{paciente.dni}</td>
                  <td className='py-2 px-4 border-b'>{paciente.telefono}</td>
                  <td className='py-2 px-4 border-b'>{paciente.email}</td>
                  <td className='py-2 px-4 border-b'>
                    {paciente.genero || "N/A"}
                  </td>
                  <td className='py-2 px-4 border-b'>
                    {paciente.alergias || "N/A"}
                  </td>
                  <td className='py-2 px-4 border-b'>
                    {paciente.antecedentesEnfermedad || "N/A"}
                  </td>
                  <td className='py-2 px-4 border-b'>
                    {paciente.horasSueno || "N/A"}
                  </td>
                  <td className='py-2 px-4 border-b'>
                    {paciente.obraSocial || "N/A"}
                  </td>
                  <td className='py-2 px-4 border-b'>
                    {paciente.tipoShampoo || "N/A"}
                  </td>
                  <td className='py-2 px-4 border-b'>
                    {new Date(paciente.creadoEn).toLocaleDateString()}
                  </td>
                  <td className='py-2 px-4 border-b'>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => onEditPaciente(paciente)}
                        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2'
                        title='Editar paciente'
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarPaciente(paciente._id)}
                        className='bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mr-2'
                        title='Eliminar paciente'
                      >
                        Borrar
                      </button>
                      <button
                        onClick={() => handleViewHistory(paciente)}
                        className='bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded'
                        title='Ver historial clínico'
                      >
                        Ver Historial
                      </button>
                      <button
                        onClick={() => handleVerSolicitudes(paciente)}
                        className='bg-purple-600 hover:bg-purple-800 text-white font-bold py-1 px-2 rounded'
                        title='Ver solicitudes de análisis'
                      >
                        Solicitudes
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
