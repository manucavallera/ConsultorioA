import { useState, useEffect, useCallback } from "react";
import InputField from "./InputField";
import TextAreaField from "./TextAreaField";

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

  // NUEVO: Estados para historial clínico
  const [historialData, setHistorialData] = useState({
    tipoCueroCabelludo: "",
    frecuenciaLavadoCapilar: "",
    tricoscopiaDigital: "",
    tipoAlopecia: "",
    observaciones: "",
    antecedentes: "",
  });

  const [incluirHistorial, setIncluirHistorial] = useState(false);
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

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // NUEVO: Manejar cambios en historial clínico
  const handleHistorialChange = useCallback((e) => {
    const { name, value } = e.target;
    setHistorialData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // ✅ VALIDACIÓN MEJORADA - Campos básicos requeridos
  const validarCamposBasicos = () => {
    const camposRequeridos = ["nombre", "apellido", "dni"];
    const camposFaltantes = camposRequeridos.filter(
      (campo) => !formData[campo]?.trim()
    );

    if (camposFaltantes.length > 0) {
      alert(
        `Por favor complete los siguientes campos requeridos: ${camposFaltantes.join(
          ", "
        )}`
      );
      return false;
    }

    // Validar formato de email si está presente
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        alert("Por favor ingrese un email válido");
        return false;
      }
    }

    // Validar edad si está presente
    if (
      formData.edad &&
      (isNaN(formData.edad) ||
        parseInt(formData.edad) < 0 ||
        parseInt(formData.edad) > 150)
    ) {
      alert("Por favor ingrese una edad válida (0-150)");
      return false;
    }

    return true;
  };

  // NUEVO: Validar que campos requeridos del historial estén completos
  const validarHistorial = () => {
    if (!incluirHistorial) return true;

    const camposRequeridos = [
      "tipoCueroCabelludo",
      "frecuenciaLavadoCapilar",
      "tricoscopiaDigital",
      "tipoAlopecia",
    ];

    const camposFaltantes = camposRequeridos.filter(
      (campo) => !historialData[campo]
    );

    if (camposFaltantes.length > 0) {
      alert(
        `Por favor complete los siguientes campos requeridos del historial: ${camposFaltantes.join(
          ", "
        )}`
      );
      return false;
    }
    return true;
  };

  // ✅ PREPARAR DATOS - Limpiar y formatear
  const prepararDatos = () => {
    // Limpiar espacios en blanco y convertir tipos
    const pacienteLimpio = {};
    Object.keys(formData).forEach((key) => {
      let valor = formData[key];

      if (typeof valor === "string") {
        valor = valor.trim();
      }

      // Convertir edad a número si existe
      if (key === "edad" && valor) {
        valor = parseInt(valor);
      }

      // Solo incluir campos que no estén vacíos
      if (valor !== "" && valor !== null && valor !== undefined) {
        pacienteLimpio[key] = valor;
      }
    });

    // Si incluye historial y no es edición
    if (incluirHistorial && !pacienteEditando) {
      const historialLimpio = {};
      Object.keys(historialData).forEach((key) => {
        let valor = historialData[key];

        if (typeof valor === "string") {
          valor = valor.trim();
        }

        // Solo incluir campos que no estén vacíos
        if (valor !== "" && valor !== null && valor !== undefined) {
          historialLimpio[key] = valor;
        }
      });

      return {
        ...pacienteLimpio,
        historial: historialLimpio,
      };
    }

    return pacienteLimpio;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ✅ VALIDACIONES
      console.log("🔍 Validando campos...");

      if (!validarCamposBasicos()) {
        setIsSubmitting(false);
        return;
      }

      if (!validarHistorial()) {
        setIsSubmitting(false);
        return;
      }

      // ✅ PREPARAR DATOS
      console.log("📋 Preparando datos...");
      const dataToSend = prepararDatos();

      // ✅ DETERMINAR URL Y MÉTODO
      const url =
        incluirHistorial && !pacienteEditando
          ? `${API_URL}/pacientes/con-historial`
          : pacienteEditando
          ? `${API_URL}/pacientes/${pacienteEditando._id}`
          : `${API_URL}/pacientes`;

      const method = pacienteEditando ? "PUT" : "POST";

      // 🚀 LOG PARA DEBUG
      console.log("🚀 Enviando request:", {
        url,
        method,
        data: dataToSend,
      });

      // ✅ ENVIAR REQUEST CON MEJOR MANEJO DE ERRORES
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      console.log("📨 Response status:", res.status);

      // ✅ MANEJO DETALLADO DE ERRORES
      if (!res.ok) {
        let errorMessage = `Error ${res.status}: ${res.statusText}`;

        try {
          const errorData = await res.json();
          console.error("❌ Error response:", errorData);

          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.errors) {
            if (Array.isArray(errorData.errors)) {
              errorMessage = `Errores: ${errorData.errors.join(", ")}`;
            } else if (typeof errorData.errors === "object") {
              const errorsArray = Object.values(errorData.errors);
              errorMessage = `Errores de validación: ${errorsArray.join(", ")}`;
            }
          }
        } catch (parseError) {
          console.error("❌ No se pudo parsear error response:", parseError);
        }

        alert(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // ✅ PROCESAR RESPUESTA EXITOSA
      const data = await res.json();
      console.log("✅ Paciente guardado exitosamente:", data);

      onPacienteSubmit(data, pacienteEditando ? "editado" : "creado");

      // ✅ LIMPIAR FORMULARIO SI ES CREACIÓN
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
        setHistorialData({
          tipoCueroCabelludo: "",
          frecuenciaLavadoCapilar: "",
          tricoscopiaDigital: "",
          tipoAlopecia: "",
          observaciones: "",
          antecedentes: "",
        });
        setIncluirHistorial(false);
        setCurrentStep(1);
      }
    } catch (err) {
      console.error("❌ Error completo:", err);
      alert(`Error al guardar el paciente: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Stepper para móvil - ACTUALIZADO A 5 PASOS
  const StepIndicator = () => (
    <div className='flex justify-center mb-6 sm:mb-8 md:hidden'>
      <div className='flex space-x-2'>
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
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

  // Navegación del stepper - ACTUALIZADA
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

      {currentStep < 5 ? (
        <button
          type='button'
          onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
          className='px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-sm'
        >
          Siguiente →
        </button>
      ) : (
        <button
          type='button'
          onClick={handleSubmit}
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

          {/* Form Container */}
          <form onSubmit={handleSubmit} className='p-4 sm:p-8'>
            {/* Step 1: Datos Personales */}
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
                  max='150'
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
                    value={formData.antecedentesEnfermedad}
                    onChange={handleChange}
                  />
                  <TextAreaField
                    name='antecedentesFamiliares'
                    placeholder='Describe antecedentes familiares...'
                    label='Antecedentes Familiares'
                    rows={4}
                    value={formData.antecedentesFamiliares}
                    onChange={handleChange}
                  />
                </div>
                <InputField
                  name='alergias'
                  placeholder='Alergias conocidas'
                  icon='⚠️'
                  value={formData.alergias}
                  onChange={handleChange}
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

            {/* NUEVO: Step 5: Historial Clínico */}
            <div
              className={`${currentStep !== 5 ? "hidden md:block" : ""} mb-8`}
            >
              <SectionHeader
                icon='📋'
                title='Historial Clínico'
                bgColor='bg-green-100'
                textColor='text-green-600'
              />

              {/* Toggle para incluir historial */}
              <div className='mb-6 bg-green-50 rounded-xl p-4 border border-green-200'>
                <label className='flex items-center space-x-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={incluirHistorial}
                    onChange={(e) => setIncluirHistorial(e.target.checked)}
                    className='w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500'
                  />
                  <div>
                    <span className='text-base font-medium text-gray-800'>
                      ✅ Incluir Historial Clínico
                    </span>
                    <p className='text-sm text-gray-600 mt-1'>
                      Marca esta opción para crear el historial clínico junto
                      con el paciente
                    </p>
                  </div>
                </label>
              </div>

              {/* Campos del historial - Solo si está habilitado */}
              {incluirHistorial && (
                <div className='space-y-6'>
                  {/* Evaluación Clínica */}
                  <div>
                    <h4 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                      <span className='bg-blue-100 text-blue-600 rounded-full p-2 mr-3 text-sm'>
                        🔍
                      </span>
                      Evaluación Clínica
                    </h4>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
                      {/* Tipo de Cuero Cabelludo */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center'>
                          <span className='mr-2'>🧴</span>
                          Tipo de Cuero Cabelludo *
                        </label>
                        <select
                          name='tipoCueroCabelludo'
                          value={historialData.tipoCueroCabelludo}
                          onChange={handleHistorialChange}
                          className='w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl 
                            focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200
                            bg-white hover:border-gray-300 text-gray-700'
                          required={incluirHistorial}
                        >
                          <option value=''>Selecciona una opción</option>
                          <option value='Normal'>Normal</option>
                          <option value='Graso'>Graso</option>
                          <option value='Deshidratado'>Deshidratado</option>
                        </select>
                      </div>

                      {/* Frecuencia de Lavado */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center'>
                          <span className='mr-2'>🚿</span>
                          Frecuencia de Lavado Capilar *
                        </label>
                        <select
                          name='frecuenciaLavadoCapilar'
                          value={historialData.frecuenciaLavadoCapilar}
                          onChange={handleHistorialChange}
                          className='w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl 
                            focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200
                            bg-white hover:border-gray-300 text-gray-700'
                          required={incluirHistorial}
                        >
                          <option value=''>Selecciona una opción</option>
                          <option value='Diaria'>Diaria</option>
                          <option value='Día 1/2'>Día 1/2</option>
                          <option value='Semanal'>Semanal</option>
                        </select>
                      </div>

                      {/* Tricoscopia Digital */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center'>
                          <span className='mr-2'>🔬</span>
                          Tricoscopia Digital *
                        </label>
                        <select
                          name='tricoscopiaDigital'
                          value={historialData.tricoscopiaDigital}
                          onChange={handleHistorialChange}
                          className='w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl 
                            focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200
                            bg-white hover:border-gray-300 text-gray-700'
                          required={incluirHistorial}
                        >
                          <option value=''>Selecciona una opción</option>
                          <option value='Ptiarisis simple'>
                            Ptiarisis simple
                          </option>
                          <option value='Ptiarisis esteatoide'>
                            Ptiarisis esteatoide
                          </option>
                          <option value='Seborrea'>Seborrea</option>
                          <option value='Sensible'>Sensible</option>
                          <option value='Deshidratación'>Deshidratación</option>
                        </select>
                      </div>

                      {/* Tipo de Alopecia */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center'>
                          <span className='mr-2'>💊</span>
                          Tipo de Alopecia *
                        </label>
                        <select
                          name='tipoAlopecia'
                          value={historialData.tipoAlopecia}
                          onChange={handleHistorialChange}
                          className='w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl 
                            focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200
                            bg-white hover:border-gray-300 text-gray-700'
                          required={incluirHistorial}
                        >
                          <option value=''>Selecciona una opción</option>
                          <option value='Alopecia carencial'>
                            Alopecia carencial
                          </option>
                          <option value='Efluvio telógeno'>
                            Efluvio telógeno
                          </option>
                          <option value='Alopecia androgénica'>
                            Alopecia androgénica
                          </option>
                          <option value='Otros'>Otros</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notas Adicionales */}
                  <div>
                    <h4 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                      <span className='bg-green-100 text-green-600 rounded-full p-2 mr-3 text-sm'>
                        📝
                      </span>
                      Notas Adicionales
                    </h4>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
                      {/* Observaciones */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center'>
                          <span className='mr-2'>👁️</span>
                          Observaciones
                        </label>
                        <textarea
                          name='observaciones'
                          value={historialData.observaciones}
                          onChange={handleHistorialChange}
                          rows='4'
                          placeholder='Ingresa observaciones...'
                          className='w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl 
                            focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200
                            bg-white hover:border-gray-300 placeholder-gray-400 text-gray-700 resize-none'
                        />
                      </div>

                      {/* Antecedentes */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center'>
                          <span className='mr-2'>📜</span>
                          Antecedentes
                        </label>
                        <textarea
                          name='antecedentes'
                          value={historialData.antecedentes}
                          onChange={handleHistorialChange}
                          rows='4'
                          placeholder='Ingresa antecedentes...'
                          className='w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl 
                            focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200
                            bg-white hover:border-gray-300 placeholder-gray-400 text-gray-700 resize-none'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Indicador de campos requeridos */}
                  <div className='bg-amber-50 border border-amber-200 rounded-xl p-4'>
                    <div className='flex items-center'>
                      <span className='text-amber-600 mr-2'>⚠️</span>
                      <p className='text-sm text-amber-700'>
                        Los campos marcados con (*) son obligatorios para el
                        historial clínico.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
                    : incluirHistorial
                    ? "✅ Guardar Paciente + Historial"
                    : "✅ Guardar Paciente"}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Form Progress Summary - Solo móvil - ACTUALIZADO */}
        <div className='md:hidden mt-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
          <div className='text-center text-sm text-gray-600'>
            <p>Paso {currentStep} de 5</p>
            <div className='w-full bg-gray-200 rounded-full h-2 mt-2'>
              <div
                className='bg-teal-600 h-2 rounded-full transition-all duration-300'
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
