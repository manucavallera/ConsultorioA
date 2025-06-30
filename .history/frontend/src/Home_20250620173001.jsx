import { Link } from "react-router-dom";

function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 relative overflow-hidden'>
      {/* Background decorative elements */}
      <div className='absolute inset-0'>
        <div className='absolute top-20 left-20 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl'></div>
        <div className='absolute bottom-20 right-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-300 opacity-20 rounded-full blur-3xl'></div>
      </div>

      {/* Main content */}
      <div className='relative z-10 min-h-screen flex items-center justify-center p-4'>
        <div className='max-w-4xl mx-auto'>
          {/* Hero section */}
          <div className='text-center mb-12'>
            <div className='inline-flex items-center justify-center w-24 h-24 bg-white bg-opacity-20 rounded-full mb-8 backdrop-blur-sm'>
              <span className='text-4xl'>🏥</span>
            </div>

            <h1 className='text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl'>
              Consultorio
              <span className='block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent'>
                Alopecia
              </span>
            </h1>

            <p className='text-xl md:text-2xl text-white opacity-90 mb-12 leading-relaxed max-w-2xl mx-auto'>
              Sistema integral de gestión médica especializado en tratamientos
              capilares
            </p>
          </div>

          {/* Main card */}
          <div className='bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl mx-auto'>
            {/* Image */}
            <div className='relative mb-8'>
              <img
                src='images/capilar.jpg'
                alt='Consultorio Alopecia'
                className='w-full max-w-md mx-auto rounded-2xl shadow-xl hover:scale-105 transition-all duration-500 cursor-default'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black opacity-20 rounded-2xl'></div>
            </div>

            {/* Content */}
            <div className='text-center'>
              <h2 className='text-3xl font-bold text-gray-800 mb-6'>
                Bienvenido al Sistema
              </h2>

              <p className='text-lg text-gray-600 mb-8 leading-relaxed'>
                Gestiona pacientes, historiales clínicos y tratamientos de forma
                eficiente y profesional
              </p>

              {/* Features */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
                <div className='text-center p-4'>
                  <div className='w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                    <span className='text-2xl'>👥</span>
                  </div>
                  <h3 className='font-semibold text-gray-800 mb-2'>
                    Gestión de Pacientes
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Registro completo y organizado
                  </p>
                </div>

                <div className='text-center p-4'>
                  <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                    <span className='text-2xl'>📋</span>
                  </div>
                  <h3 className='font-semibold text-gray-800 mb-2'>
                    Historial Clínico
                  </h3>
                  <p className='text-sm text-gray-600'>Seguimiento detallado</p>
                </div>

                <div className='text-center p-4'>
                  <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                    <span className='text-2xl'>💊</span>
                  </div>
                  <h3 className='font-semibold text-gray-800 mb-2'>
                    Tratamientos
                  </h3>
                  <p className='text-sm text-gray-600'>Control de medicación</p>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                to='/pacientes'
                className='group inline-flex items-center justify-center bg-gradient-to-r from-teal-600 to-blue-600 
                  hover:from-teal-700 hover:to-blue-700 text-white font-bold text-lg px-10 py-4 rounded-2xl 
                  shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 
                  hover:scale-105'
              >
                <span className='mr-3'>🚀</span>
                <span>Comenzar Gestión</span>
                <span className='ml-3 group-hover:translate-x-1 transition-transform duration-300'>
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Bottom info */}
          <div className='text-center mt-12'>
            <div className='inline-flex items-center space-x-8 text-white opacity-80'>
              <div className='flex items-center space-x-2'>
                <span className='text-lg'>🔒</span>
                <span className='text-sm'>Datos Seguros</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='text-lg'>⚡</span>
                <span className='text-sm'>Acceso Rápido</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='text-lg'>💻</span>
                <span className='text-sm'>Fácil de Usar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute top-1/4 left-1/4 w-2 h-2 bg-white opacity-30 rounded-full animate-pulse'></div>
        <div className='absolute top-3/4 right-1/4 w-3 h-3 bg-yellow-300 opacity-40 rounded-full animate-pulse delay-1000'></div>
        <div className='absolute bottom-1/4 left-1/3 w-2 h-2 bg-blue-300 opacity-50 rounded-full animate-pulse delay-500'></div>
        <div className='absolute top-1/2 right-1/3 w-1 h-1 bg-white opacity-60 rounded-full animate-pulse delay-700'></div>
      </div>
    </div>
  );
}

export default Home;
