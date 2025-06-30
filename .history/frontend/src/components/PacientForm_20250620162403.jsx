import { useState, useEffect } from "react";

export default function PacienteForm({ onPacienteSubmit, pacienteEditando }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    email: "",
    genero: "",
    edad: "", // Nuevo campo agregado
    antecedentesEnfermedad: "",
    antecedentesFamiliares: "", // Nuevo campo agregado
    alergias: "",
    horasSueno: "",
    obraSocial: "",
    tipoShampoo: "",
  });

  useEffect(() => {
    if (pacienteEditando) {
      setFormData({
        nombre: pacienteEditando.nombre || "",
        apellido: pacienteEditando.apellido || "",
        dni: pacienteEditando.dni || "",
        telefono: pacienteEditando.telefono || "",
        email: pacienteEditando.email || "",
        genero: pacienteEditando.genero || "",
        edad: pacienteEditando.edad || "", // Nuevo campo agregado
        antecedentesEnfermedad: pacienteEditando.antecedentesEnfermedad || "",
        antecedentesFamiliares: pacienteEditando.antecedentesFamiliares || "", // Nuevo campo agregado
        alergias: pacienteEditando.alergias || "",
        horasSueno: pacienteEditando.horasSueno || "",
        obraSocial: pacienteEditando.obraSocial || "",
        tipoShampoo: pacienteEditando.tipoShampoo || "",
      });
    }
  }, [pacienteEditando]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = pacienteEditando
        ? `http://localhost:5000/pacientes/${pacienteEditando._id}`
        : "http://localhost:5000/pacientes";

      const method = pacienteEditando ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      onPacienteSubmit(data, pacienteEditando ? "editado" : "creado");

      if (!pacienteEditando) {
        setFormData({
          nombre: "",
          apellido: "",
          dni: "",
          telefono: "",
          email: "",
          genero: "",
          edad: "", // Nuevo campo agregado
          antecedentesEnfermedad: "",
          antecedentesFamiliares: "", // Nuevo campo agregado
          alergias: "",
          horasSueno: "",
          obraSocial: "",
          tipoShampoo: "",
        });
      }
    } catch (err) {
      console.error("Error al guardar paciente:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='max-w-md mx-auto p-6 bg-white rounded-lg shadow-md'
    >
      <h2 className='text-2xl font-bold mb-4 text-teal-700'>
        {pacienteEditando ? "Editar Paciente" : "Nuevo Paciente"}
      </h2>
      <input
        type='text'
        name='nombre'
        placeholder='Nombre'
        value={formData.nombre}
        onChange={handleChange}
        required
        className='border border-gray-300 rounded-lg p-2 mb-4 w-full'
      />
      <input
        type='text'
        name='apellido'
        placeholder='Apellido'
        value={formData.apellido}
        onChange={handleChange}
        required
        className='border border-gray-300 rounded-lg p-2 mb-4 w-full'
      />
      <input
        type='text'
        name='dni'
        placeholder='DNI'
        value={formData.dni}
        onChange={handleChange}
        required
        className='border border-gray-300 rounded-lg p-2 mb-4 w-full'
      />
      <input
        type='text'
        name='telefono'
        placeholder='Teléfono'
        value={formData.telefono}
        onChange={handleChange}
        className='border border-gray-300 rounded-lg p-2 mb-4 w-full'
      />
      <input
        type='email'
        name='email'
        placeholder='Email'
        value={formData.email}
        onChange={handleChange}
        className='border border-gray-300 rounded-lg p-2 mb-4 w-full'
      />
      <input
        type='text'
        name='genero'
        placeholder='Género'
        value={formData.genero}
        onChange={handleChange}
        className='border border-gray-300 rounded-lg p-2 mb-4 w-full'
      />
      <input
        type='text'
        name='edad'
        placeholder='Edad'
        value={formData.edad}
        onChange={handleChange}
        className='border border-gray-300 rounded-lg p-2 mb-4 w-full'
      />
      <input
        type='text'
        name='antecedentesEnfermedad'
        placeholder='Antecedentes de Enfermedad'
        value={formData.antecedentesEnfermedad}
        onChange={handleChange}
        className='border border-gray-300 rounded-lg p-2 mb-4 w-full'
      />
      <input
        type='text'
        name='antecedentesFamiliares'
        placeholder='Antecedentes Familiares'
        value={formData.antecedentesFamiliares}
        onChange={handleChange}
        className='border border-gray-300 rounded-lg p-2 mb-4 w-full'
      />
      <input
        type='text'
        name='alergias'
        placeholder='Alergias'
        value={formData.alergias}
        onChange={handleChange}
        className='border border-gray-300 rounded-lg p-2 mb-4 w-full'
      />
      <input
        type='number'
        name='horasSueno'
        placeholder='Horas de Sueño'
        value={formData.horasSueno}
        onChange={handleChange}
        min='0'
        className='border border-gray-300 rounded-lg p-2 mb-4 w-full'
      />
      <input
        type='text'
        name='obraSocial'
        placeholder='Obra Social'
        value={formData.obraSocial}
        onChange={handleChange}
        className='border border-gray-300 rounded-lg p-2 mb-4 w-full'
      />
      <input
        type='text'
        name='tipoShampoo'
        placeholder='Tipo de Shampoo'
        value={formData.tipoShampoo}
        onChange={handleChange}
        className='border border-gray-300 rounded-lg p-2 mb-4 w-full'
      />
      <button
        type='submit'
        className='w-full bg-teal-700 hover:bg-teal-900 text-white font-semibold py-2 rounded-lg transition-colors duration-300'
      >
        {pacienteEditando ? "Actualizar Paciente" : "Agregar"}
      </button>
    </form>
  );
}
