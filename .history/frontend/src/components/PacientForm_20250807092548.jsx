import { useState, useEffect, useCallback } from "react"; // ← AGREGAR useCallback

import InputField from "./InputField";

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

  // ✅ FIX DEFINITIVO: Memoizar handleChange
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []); // ← Sin dependencias porque usa función updater

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = pacienteEditando
        ? `${API_URL}/pacientes/${pacienteEditando._id}`
        : `${API_URL}/pacientes`;

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const TextAreaField = ({ name, placeholder, label, rows = 3 }) => (
    <div>
      <label className='block text-sm sm:text-base font-medium text-gray-700 mb-2'>
        {label}
      </label>
      <textarea
        name={name}
        placeholder={placeholder}
        value={formData[name] || ""}
        onChange={handleChange}
        rows={rows}
        className='w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-xl 
          focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200
          bg-white hover:border-gray-300 placeholder-gray-400 text-gray-700
          shadow-sm hover:shadow-md resize-none text-sm sm:text-base'
      />
    </div>
  );

  const SectionHeader = ({ icon, title, bgColor, textColor }) => (
    <h3 className='text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center'>
      <span
        className={`${bgColor} ${textColor} rounded-full p-2 sm:p-3 mr-3 sm:mr-4 text-sm sm:text-base`}
      >
        {icon}
      </span>
      {title}
    </h3>
  );

  // Stepper para móvil
  const StepIndicator = () => (
    <div className='flex justify-center mb-6 sm:mb-8 md:hidden'>
      <div className='flex space-x-2'>
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === currentStep
                ? "bg-teal-600 text-white"
                : step < currentStep
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {step < currentStep ? "✓" : step}
          </div>
        ))}
      </div>
    </div>
  );

  // Navegación del stepper
  const StepNavigation = () => (
    <div className='flex justify-between mt-6 md:hidden'>
      <button
        type='button'
        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
        disabled={currentStep === 1}
        className='px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 
          disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm'
      >
        ← Anterior
      </button>

      {currentStep < 4 ? (
        <button
          type='button'
          onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
          className='px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-sm'
        >
          Siguiente →
        </button>
      ) : (
        <button
          type='submit'
          disabled={isSubmitting}
          className='px-6 py-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white 
            rounded-lg hover:from-teal-700 hover:to-blue-700 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium'
        >
          {isSubmitting
            ? "⏳ Guardando..."
            : pacienteEditando
            ? "💾 Actualizar"
            : "✅ Guardar"}
        </button>
      )}
    </div>
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-100 py-4 sm:py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-white/20'>
          {/* Header */}
          <div className='bg-gradient-to-r from-teal-600 to-blue-600 px-4 sm:px-8 py-4 sm:py-6'>
            <h2 className='text-2xl sm:text-3xl font-bold text-white'>
              {pacienteEditando ? "✏️ Editar Paciente" : "👥 Nuevo Paciente"}
            </h2>
            <p className='text-teal-100 mt-1 sm:mt-2 text-sm sm:text-base'>
              {pacienteEditando
                ? "Actualiza la información del paciente"
                : "Completa los datos del nuevo paciente"}
            </p>
          </div>

          {/* Progress indicator */}
          <StepIndicator />

          {/* Form */}
          <form onSubmit={handleSubmit} className='p-4 sm:p-8'>
            {/* Step 1: Datos Personales - Siempre visible en desktop, condicional en móvil */}
            <div
              className={`${currentStep !== 1 ? "hidden md:block" : ""} mb-8`}
            >
              <SectionHeader
                icon='👤'
                title='Datos Personales'
                bgColor='bg-teal-100'
                textColor='text-teal-600'
              />

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                <InputField
                  name='nombre'
                  placeholder='Nombre'
                  required
                  icon='👤'
                  className='sm:col-span-1'
                  value={formData.nombre}
                  onChange={handleChange}
                />
                <InputField
                  name='apellido'
                  placeholder='Apellido'
                  required
                  icon='👤'
                  className='sm:col-span-1'
                  value={formData.apellido}
                  onChange={handleChange}
                />
                <InputField
                  name='dni'
                  placeholder='DNI'
                  required
                  icon='🆔'
                  className='sm:col-span-1 lg:col-span-1'
                  value={formData.dni}
                  onChange={handleChange}
                />
                <InputField
                  name='edad'
                  placeholder='Edad'
                  type='number'
                  min='0'
                  icon='📅'
                  className='sm:col-span-1'
                  value={formData.edad}
                  onChange={handleChange}
                />
                <InputField
                  name='genero'
                  placeholder='Género'
                  icon='⚧'
                  className='sm:col-span-1'
                  value={formData.genero}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Step 2: Contacto */}
            <div
              className={`${currentStep !== 2 ? "hidden md:block" : ""} mb-8`}
            >
              <SectionHeader
                icon='📞'
                title='Información de Contacto'
                bgColor='bg-blue-100'
                textColor='text-blue-600'
              />

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                <InputField
                  name='telefono'
                  placeholder='Teléfono'
                  icon='📱'
                  value={formData.telefono}
                  onChange={handleChange}
                />

                <InputField
                  name='email'
                  placeholder='Email'
                  type='email'
                  icon='✉️'
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Step 3: Información Médica */}
            <div
              className={`${currentStep !== 3 ? "hidden md:block" : ""} mb-8`}
            >
              <SectionHeader
                icon='🏥'
                title='Información Médica'
                bgColor='bg-red-100'
                textColor='text-red-600'
              />

              <div className='space-y-4 sm:space-y-6'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
                  <TextAreaField
                    name='antecedentesEnfermedad'
                    placeholder='Describe antecedentes médicos...'
                    label='Antecedentes de Enfermedad'
                    rows={4}
                  />
                  <TextAreaField
                    name='antecedentesFamiliares'
                    placeholder='Describe antecedentes familiares...'
                    label='Antecedentes Familiares'
                    rows={4}
                  />
                </div>
                <InputField
                  name='alergias'
                  placeholder='Alergias conocidas'
                  icon='⚠️'
                />
              </div>
            </div>

            {/* Step 4: Información Adicional */}
            <div
              className={`${currentStep !== 4 ? "hidden md:block" : ""} mb-8`}
            >
              <SectionHeader
                icon='📋'
                title='Información Adicional'
                bgColor='bg-purple-100'
                textColor='text-purple-600'
              />

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                <InputField
                  name='horasSueno'
                  placeholder='Horas de sueño'
                  type='number'
                  min='0'
                  max='24'
                  icon='😴'
                  value={formData.horasSueno}
                  onChange={handleChange}
                />
                <InputField
                  name='obraSocial'
                  placeholder='Obra Social'
                  icon='🏥'
                  value={formData.obraSocial}
                  onChange={handleChange}
                />
                <InputField
                  name='tipoShampoo'
                  placeholder='Tipo de Shampoo'
                  icon='🧴'
                  value={formData.tipoShampoo}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Mobile Step Navigation */}
            <StepNavigation />

            {/* Desktop Submit Buttons */}
            <div className='hidden md:flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200'>
              <button
                type='button'
                className='px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 
                  transition-all duration-200 font-medium'
                onClick={() => window.history.back()}
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={isSubmitting}
                className='px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white 
                  rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all duration-200 
                  font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                  flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:transform-none'
              >
                <span>
                  {isSubmitting
                    ? "⏳ Guardando..."
                    : pacienteEditando
                    ? "💾 Actualizar"
                    : "✅ Guardar"}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Form Progress Summary - Solo móvil */}
        <div className='md:hidden mt-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
          <div className='text-center text-sm text-gray-600'>
            <p>Paso {currentStep} de 4</p>
            <div className='w-full bg-gray-200 rounded-full h-2 mt-2'>
              <div
                className='bg-teal-600 h-2 rounded-full transition-all duration-300'
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
