// components/PagoFormModal.jsx
import React, { useState, useEffect } from 'react';
import { METODOS_PAGO, ESTADOS_PAGO, TIPOS_TRATAMIENTO } from '../constants/pagosConstants';

const PagoFormModal = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  editando = false 
}) => {
  const [citas, setCitas] = useState([]);
  const [cargandoCitas, setCargandoCitas] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      const response = await fetch('http://localhost:5000/citas');
      const data = await response.json();
      setCitas(data);
    } catch (error) {
      console.error('Error al cargar citas:', error);
    } finally {
      setCargandoCitas(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    
    try {
      await onSubmit(formData);
    } finally {
      setGuardando(false);
    }
  };

  const handleChange = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const citaSeleccionada = citas.find(cita => cita._id === formData.citaId);

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-white/20'>
        
        {/* Header */}
        <div className='bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 rounded-t-3xl'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='bg-white/20 rounded-2xl p-3'>
                <span className='text-2xl'>{editando ? "✏️" : "💰"}</span>
              </div>
              <div>
                <h3 className='text-3xl font-bold'>
                  {editando ? "Editar Pago" : "Registrar Pago"}
                </h3>
                <p className='text-green-100 mt-1'>
                  {editando 
                    ? "Modifica los datos del pago" 
                    : "Registra un nuevo pago en el sistema"
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className='text-white hover:bg-white/20 rounded-2xl p-3 transition-all duration-200'
            >
              ✕
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className='p-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            
            {/* Selección de Cita */}
            <div className='lg:col-span-2'>
              <label className='block text-sm font-bold text-gray-800 mb-3 flex items-center'>
                <span className='bg-blue-100 rounded-lg p-2 mr-3'>📅</span>
                Cita Relacionada
              </label>
              {cargandoCitas ? (
                <div className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl bg-gray-100 flex items-center justify-center'>
                  <span className='text-gray-500'>Cargando citas...</span>
                </div>
              ) : (
                <select
                  value={formData.citaId}
                  onChange={(e) => handleChange('citaId', e.target.value)}
                  required
                  disabled={editando} // No permitir cambiar cita en edición
                  className='w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white text-gray-800 font-medium disabled:bg-gray-100'
                >
                  <option value=''>Seleccionar cita</option>
                  {citas.map((cita) => (
                    <option key={cita._id} value={cita._id}>
                      {new Date(