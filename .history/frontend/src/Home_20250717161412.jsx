import { Link } from "react-router-dom";

function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden'>
      {/* Simplified Background Elements */}
      <div className='absolute inset-0'>
        {/* Only essential gradient orbs */}
        <div className='absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-teal-400 to-blue-500 opacity-15 rounded-full blur-3xl'></div>
        <div className='absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 opacity-10 rounded-full blur-3xl'></div>
      </div>

      {/* Simplified Navigation */}
      <nav className='relative z-20 p-6'>
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
          <div className='flex items-center space-x-3'>
            <div className='w-12 h-12 bg-gradient-to-r from-teal-400 to-blue-500 rounded-lg flex items-center justify-center'>
              <span className='text-2xl'>🏥</span>
            </div>
            <span className='text-white font-bold text-xl'>
              Consultorio Alopecia
            </span>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className='relative z-10 min-h-screen flex items-center justify-center p-4 pt-0'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
            {/* Left Column - Text Content */}
            <div className='text-left space-y-8'>
              {/* Hero Title */}
              <div className='space-y-6'>
                <h1 className='text-6xl md:text-7xl font-bold leading-tight'>
                  <span className='text-white'>Consultorio</span>
                  <br />
                  <span className='bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent'>
                    Alopecia
                  </span>
                </h1>

                <p className='text-xl md:text-2xl text-white/80 leading-relaxed'>
                  Sistema integral de gestión médica especializado en
                  <span className='text-teal-400 font-semibold'>
                    {" "}
                    tratamientos capilares avanzados
                  </span>
                </p>
              </div>

              {/* Simple Feature highlights */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='flex items-center space-x-4'>
                  <div className='w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center'>
                    <span className='text-teal-400 text-xl'>👥</span>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold'>
                      Gestión de Pacientes
                    </h3>
                    <p className='text-white/60 text-sm'>
                      Registro completo y organizado
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-4'>
                  <div className='w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center'>
                    <span className='text-blue-400 text-xl'>📋</span>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold'>
                      Historial Clínico
                    </h3>
                    <p className='text-white/60 text-sm'>
                      Seguimiento detallado
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-4'>
                  <div className='w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center'>
                    <span className='text-purple-400 text-xl'>💊</span>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold'>Tratamientos</h3>
                    <p className='text-white/60 text-sm'>
                      Control de medicación
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-4'>
                  <div className='w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center'>
                    <span className='text-emerald-400 text-xl'>🔒</span>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold'>Seguridad</h3>
                    <p className='text-white/60 text-sm'>Datos protegidos</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className='pt-4'>
                <Link
                  to='/pacientes'
                  className='group inline-flex items-center justify-center bg-gradient-to-r from-teal-500 to-blue-600 
                    hover:from-teal-600 hover:to-blue-700 text-white font-bold text-xl px-10 py-5 rounded-2xl 
                    shadow-2xl hover:shadow-teal-500/25 transition-all duration-300 transform hover:-translate-y-1 
                    hover:scale-105'
                >
                  <span className='mr-4'>🚀</span>
                  <span>Comenzar Gestión</span>
                  <span className='ml-4 group-hover:translate-x-2 transition-transform duration-300'>
                    →
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Column - Image Destacada */}
            <div className='relative'>
              {/* Simplified card with focus on image */}
              <div className='relative bg-white/5 backdrop-blur-sm rounded-3xl p-4 border border-white/10'>
                {/* Main Image - More prominent */}
                <div className='relative group'>
                  {/* Subtle glow effect */}
                  <div className='absolute -inset-4 bg-gradient-to-r from-teal-400/20 to-blue-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500'></div>

                  <img
                    src='images/images.jpeg'
                    alt='Consultorio Alopecia'
                    className='relative w-full h-96 object-cover rounded-2xl shadow-2xl group-hover:scale-[1.02] transition-all duration-500'
                  />

                  {/* Minimal overlay */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-2xl'></div>

                  {/* Simple overlay content */}
                  <div className='absolute bottom-6 left-6 right-6'>
                    <div className='bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20'>
                      <h3 className='text-white font-bold text-xl mb-1'>
                        Tecnología Avanzada
                      </h3>
                      <p className='text-white/90'>
                        Equipamiento de última generación para tratamientos
                        capilares
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simplified feature cards below image */}
                <div className='grid grid-cols-2 gap-4 mt-6'>
                  <div className='bg-white/5 rounded-xl p-4 text-center'>
                    <div className='text-3xl mb-2'>👨‍⚕️</div>
                    <h4 className='text-white font-semibold text-sm mb-1'>
                      Especialistas
                    </h4>
                    <p className='text-white/60 text-xs'>
                      Profesionales certificados
                    </p>
                  </div>

                  <div className='bg-white/5 rounded-xl p-4 text-center'>
                    <div className='text-3xl mb-2'>🔬</div>
                    <h4 className='text-white font-semibold text-sm mb-1'>
                      Investigación
                    </h4>
                    <p className='text-white/60 text-xs'>Últimos avances</p>
                  </div>
                </div>
              </div>

              {/* Minimal floating elements */}
              <div className='absolute -top-8 -right-8 w-16 h-16 bg-teal-400/20 rounded-full animate-pulse'></div>
              <div className='absolute -bottom-6 -left-6 w-12 h-12 bg-blue-400/20 rounded-full animate-bounce'></div>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified bottom section */}
      <div className='relative z-10 pb-12'>
        <div className='max-w-6xl mx-auto px-4'>
          <div className='text-center'>
            <div className='inline-flex items-center space-x-12 text-white/70'>
              <div className='flex items-center space-x-3'>
                <span className='text-2xl'>🔒</span>
                <span className='font-medium'>Datos Seguros</span>
              </div>
              <div className='flex items-center space-x-3'>
                <span className='text-2xl'>⚡</span>
                <span className='font-medium'>Acceso Rápido</span>
              </div>
              <div className='flex items-center space-x-3'>
                <span className='text-2xl'>💻</span>
                <span className='font-medium'>Fácil de Usar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal floating particles */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-1/4 left-1/4 w-2 h-2 bg-teal-400/40 rounded-full animate-pulse'></div>
        <div className='absolute top-3/4 right-1/4 w-3 h-3 bg-blue-400/30 rounded-full animate-bounce'></div>
        <div className='absolute bottom-1/3 left-1/2 w-1 h-1 bg-white/50 rounded-full animate-pulse delay-1000'></div>
      </div>
    </div>
  );
}

export default Home;
