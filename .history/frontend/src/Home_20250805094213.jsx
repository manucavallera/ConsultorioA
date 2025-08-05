import { Link } from "react-router-dom";

function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden'>
      {/* Responsive Background Elements */}
      <div className='absolute inset-0'>
        {/* Adjusted for mobile */}
        <div className='absolute top-10 sm:top-20 left-10 sm:left-20 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-r from-teal-400 to-blue-500 opacity-15 rounded-full blur-3xl'></div>
        <div className='absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-purple-400 to-pink-500 opacity-10 rounded-full blur-3xl'></div>
      </div>

      {/* Responsive Navigation */}
      <nav className='relative z-20 p-4 sm:p-6'>
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
          <div className='flex items-center space-x-2 sm:space-x-3'>
            <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-teal-400 to-blue-500 rounded-lg flex items-center justify-center'>
              <span className='text-lg sm:text-2xl'>🏥</span>
            </div>
            <span className='text-white font-bold text-lg sm:text-xl'>
              Consultorio Alopecia
            </span>
          </div>
        </div>
      </nav>

      {/* Responsive Main Content */}
      <div className='relative z-10 min-h-screen flex items-center justify-center p-3 sm:p-4 pt-0'>
        <div className='max-w-6xl mx-auto w-full'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center'>
            {/* Left Column - Text Content */}
            <div className='text-left space-y-6 sm:space-y-8 order-2 lg:order-1'>
              {/* Hero Title - Responsive */}
              <div className='space-y-4 sm:space-y-6'>
                <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight'>
                  <span className='text-white'>Consultorio</span>
                  <br />
                  <span className='bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent'>
                    Alopecia
                  </span>
                </h1>

                <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 leading-relaxed'>
                  Sistema integral de gestión médica especializado en
                  <span className='text-teal-400 font-semibold'>
                    {" "}
                    tratamientos capilares avanzados
                  </span>
                </p>
              </div>

              {/* Responsive Feature Highlights */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                <div className='flex items-center space-x-3 sm:space-x-4'>
                  <div className='w-10 h-10 sm:w-12 sm:h-12 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                    <span className='text-teal-400 text-lg sm:text-xl'>👥</span>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold text-sm sm:text-base'>
                      Gestión de Pacientes
                    </h3>
                    <p className='text-white/60 text-xs sm:text-sm'>
                      Registro completo y organizado
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-3 sm:space-x-4'>
                  <div className='w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                    <span className='text-blue-400 text-lg sm:text-xl'>📋</span>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold text-sm sm:text-base'>
                      Historial Clínico
                    </h3>
                    <p className='text-white/60 text-xs sm:text-sm'>
                      Seguimiento detallado
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-3 sm:space-x-4'>
                  <div className='w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                    <span className='text-purple-400 text-lg sm:text-xl'>
                      💊
                    </span>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold text-sm sm:text-base'>
                      Tratamientos
                    </h3>
                    <p className='text-white/60 text-xs sm:text-sm'>
                      Control de medicación
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-3 sm:space-x-4'>
                  <div className='w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                    <span className='text-emerald-400 text-lg sm:text-xl'>
                      🔒
                    </span>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold text-sm sm:text-base'>
                      Seguridad
                    </h3>
                    <p className='text-white/60 text-xs sm:text-sm'>
                      Datos protegidos
                    </p>
                  </div>
                </div>
              </div>

              {/* Responsive CTA Button */}
              <div className='pt-2 sm:pt-4'>
                <Link
                  to='/pacientes'
                  className='group inline-flex items-center justify-center bg-gradient-to-r from-teal-500 to-blue-600 
                    hover:from-teal-600 hover:to-blue-700 text-white font-bold text-base sm:text-lg lg:text-xl 
                    px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl 
                    shadow-2xl hover:shadow-teal-500/25 transition-all duration-300 transform hover:-translate-y-1 
                    hover:scale-105 w-full sm:w-auto'
                >
                  <span className='mr-2 sm:mr-3 lg:mr-4 text-lg sm:text-xl'>
                    🚀
                  </span>
                  <span>Comenzar Gestión</span>
                  <span className='ml-2 sm:ml-3 lg:ml-4 group-hover:translate-x-2 transition-transform duration-300'>
                    →
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Column - Responsive Image */}
            <div className='relative order-1 lg:order-2'>
              {/* Responsive card */}
              <div className='relative bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-white/10'>
                {/* Main Image - Responsive */}
                <div className='relative group'>
                  {/* Responsive glow effect */}
                  <div className='absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-teal-400/20 to-blue-500/20 rounded-2xl sm:rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500'></div>

                  <img
                    src='images/images.jpeg'
                    alt='Consultorio Alopecia'
                    className='relative w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-xl sm:rounded-2xl shadow-2xl group-hover:scale-[1.02] transition-all duration-500'
                  />

                  {/* Overlay */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-xl sm:rounded-2xl'></div>

                  {/* Responsive overlay content */}
                  <div className='absolute bottom-3 sm:bottom-4 lg:bottom-6 left-3 sm:left-4 lg:left-6 right-3 sm:right-4 lg:right-6'>
                    <div className='bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20'>
                      <h3 className='text-white font-bold text-sm sm:text-base lg:text-xl mb-1'>
                        Tecnología Avanzada
                      </h3>
                      <p className='text-white/90 text-xs sm:text-sm lg:text-base'>
                        Equipamiento de última generación para tratamientos
                        capilares
                      </p>
                    </div>
                  </div>
                </div>

                {/* Responsive feature cards below image */}
                <div className='grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6'>
                  <div className='bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center'>
                    <div className='text-xl sm:text-2xl lg:text-3xl mb-1 sm:mb-2'>
                      👨‍⚕️
                    </div>
                    <h4 className='text-white font-semibold text-xs sm:text-sm mb-1'>
                      Especialistas
                    </h4>
                    <p className='text-white/60 text-xs'>
                      Profesionales certificados
                    </p>
                  </div>

                  <div className='bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center'>
                    <div className='text-xl sm:text-2xl lg:text-3xl mb-1 sm:mb-2'>
                      🔬
                    </div>
                    <h4 className='text-white font-semibold text-xs sm:text-sm mb-1'>
                      Investigación
                    </h4>
                    <p className='text-white/60 text-xs'>Últimos avances</p>
                  </div>
                </div>
              </div>

              {/* Responsive floating elements */}
              <div className='absolute -top-4 sm:-top-6 lg:-top-8 -right-4 sm:-right-6 lg:-right-8 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-teal-400/20 rounded-full animate-pulse'></div>
              <div className='absolute -bottom-3 sm:-bottom-4 lg:-bottom-6 -left-3 sm:-left-4 lg:-left-6 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-blue-400/20 rounded-full animate-bounce'></div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive bottom section */}
      <div className='relative z-10 pb-8 sm:pb-12'>
        <div className='max-w-6xl mx-auto px-4'>
          <div className='text-center'>
            <div className='flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 lg:space-x-12 text-white/70'>
              <div className='flex items-center space-x-2 sm:space-x-3'>
                <span className='text-lg sm:text-xl lg:text-2xl'>🔒</span>
                <span className='font-medium text-sm sm:text-base'>
                  Datos Seguros
                </span>
              </div>
              <div className='flex items-center space-x-2 sm:space-x-3'>
                <span className='text-lg sm:text-xl lg:text-2xl'>⚡</span>
                <span className='font-medium text-sm sm:text-base'>
                  Acceso Rápido
                </span>
              </div>
              <div className='flex items-center space-x-2 sm:space-x-3'>
                <span className='text-lg sm:text-xl lg:text-2xl'>💻</span>
                <span className='font-medium text-sm sm:text-base'>
                  Fácil de Usar
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive floating particles */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-1/4 left-1/4 w-1 h-1 sm:w-2 sm:h-2 bg-teal-400/40 rounded-full animate-pulse'></div>
        <div className='absolute top-3/4 right-1/4 w-2 h-2 sm:w-3 sm:h-3 bg-blue-400/30 rounded-full animate-bounce'></div>
        <div className='absolute bottom-1/3 left-1/2 w-1 h-1 bg-white/50 rounded-full animate-pulse delay-1000'></div>
      </div>
    </div>
  );
}

export default Home;
