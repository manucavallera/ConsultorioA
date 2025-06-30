import { useState, useEffect } from "react";

export default function PacienteForm({ onPacienteSubmit, pacienteEditando }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    email: "",
    genero: "",
    edad: "",
    antecedentesEnfermedad: "",
    antecedentesFamiliares: "",
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
        edad: pacienteEditando.edad || "",
        antecedentesEnfermedad: pacienteEditando.antecedentesEnfermedad || "",
        antecedentesFamiliares: pacienteEditando.antecedentesFamiliares || "",
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
          edad: "",
          antecedentesEnfermedad: "",
          antecedentesFamiliares: "",
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

  const InputField = ({
    name,
    placeholder,
    type = "text",
    required = false,
    icon,
    min,
  }) => (
    <div className='relative'>
      {icon && (
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <span className='text-gray-400 text-sm'>{icon}</span>
        </div>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        min={min}
        className={`w-full ${
          icon ? "pl-10" : "pl-4"
        } pr-4 py-3 border border-gray-200 rounded-xl 
          focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200
          bg-white hover:border-gray-300 placeholder-gray-400 text-gray-700
          shadow-sm hover:shadow-md`}
      />
    </div>
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-100 py-8 px-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
          {/* Header */}
          <div className='bg-gradient-to-r from-teal-600 to-blue-600 px-8 py-6'>
            <h2 className='text-3xl font-bold text-white'>
              {pacienteEditando ? "✏️ Editar Paciente" : "👥 Nuevo Paciente"}
            </h2>
            <p className='text-teal-100 mt-2'>
              {pacienteEditando
                ? "Actualiza la información del paciente"
                : "Completa los datos del nuevo paciente"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='p-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Datos Personales */}
              <div className='md:col-span-2'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                  <span className='bg-teal-100 text-teal-600 rounded-full p-2 mr-3'>
                    👤
                  </span>
                  Datos Personales
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <InputField
                    name='nombre'
                    placeholder='Nombre'
                    required
                    icon='👤'
                  />
                  <InputField
                    name='apellido'
                    placeholder='Apellido'
                    required
                    icon='👤'
                  />
                  <InputField name='dni' placeholder='DNI' required icon='🆔' />
                  <InputField name='edad' placeholder='Edad' icon='📅' />
                  <InputField name='genero' placeholder='Género' icon='⚧' />
                </div>
              </div>

              {/* Contacto */}
              <div className='md:col-span-2'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                  <span className='bg-blue-100 text-blue-600 rounded-full p-2 mr-3'>
                    📞
                  </span>
                  Información de Contacto
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <InputField
                    name='telefono'
                    placeholder='Teléfono'
                    icon='📱'
                  />
                  <InputField
                    name='email'
                    placeholder='Email'
                    type='email'
                    icon='✉️'
                  />
                </div>
              </div>

              {/* Información Médica */}
              <div className='md:col-span-2'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                  <span className='bg-red-100 text-red-600 rounded-full p-2 mr-3'>
                    🏥
                  </span>
                  Información Médica
                </h3>
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Antecedentes de Enfermedad
                      </label>
                      <textarea
                        name='antecedentesEnfermedad'
                        placeholder='Describe antecedentes médicos...'
                        value={formData.antecedentesEnfermedad}
                        onChange={handleChange}
                        rows='3'
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl 
                          focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200
                          bg-white hover:border-gray-300 placeholder-gray-400 text-gray-700
                          shadow-sm hover:shadow-md resize-none'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Antecedentes Familiares
                      </label>
                      <textarea
                        name='antecedentesFamiliares'
                        placeholder='Describe antecedentes familiares...'
                        value={formData.antecedentesFamiliares}
                        onChange={handleChange}
                        rows='3'
                        className='w-full px-4 py-3 border border-gray-200 rounded-xl 
                          focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200
                          bg-white hover:border-gray-300 placeholder-gray-400 text-gray-700
                          shadow-sm hover:shadow-md resize-none'
                      />
                    </div>
                  </div>
                  <InputField
                    name='alergias'
                    placeholder='Alergias conocidas'
                    icon='⚠️'
                  />
                </div>
              </div>

              {/* Información Adicional */}
              <div className='md:col-span-2'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                  <span className='bg-purple-100 text-purple-600 rounded-full p-2 mr-3'>
                    📋
                  </span>
                  Información Adicional
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <InputField
                    name='horasSueno'
                    placeholder='Horas de sueño'
                    type='number'
                    min='0'
                    icon='😴'
                  />
                  <InputField
                    name='obraSocial'
                    placeholder='Obra Social'
                    icon='🏥'
                  />
                  <InputField
                    name='tipoShampoo'
                    placeholder='Tipo de Shampoo'
                    icon='🧴'
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className='mt-8 flex justify-end space-x-4'>
              <button
                type='button'
                className='px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 
                  transition-all duration-200 font-medium'
              >
                Cancelar
              </button>
              <button
                type='submit'
                className='px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white 
                  rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all duration-200 
                  font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                  flex items-center space-x-2'
              >
                <span>{pacienteEditando ? "💾 Actualizar" : "✅ Guardar"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
