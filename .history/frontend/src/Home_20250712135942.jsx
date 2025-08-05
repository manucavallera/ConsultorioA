import { Link } from "react-router-dom";

function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden'>
      {/* Advanced Background Elements */}
      <div className='absolute inset-0'>
        {/* Animated gradient orbs */}
        <div className='absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-teal-400 to-blue-500 opacity-20 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-500 opacity-25 rounded-full blur-3xl animate-pulse delay-1000'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-15 rounded-full blur-3xl animate-pulse delay-500'></div>

        {/* Geometric patterns */}
        <div className='absolute top-20 right-1/4 w-32 h-32 border border-white/10 rounded-full animate-spin-slow'></div>
        <div className='absolute bottom-32 left-1/4 w-24 h-24 border border-teal-400/20 rounded-full animate-bounce'></div>

        {/* Grid pattern overlay */}
        <div className='absolute inset-0 bg-grid-pattern opacity-5'></div>
      </div>

      {/* Navigation */}
      <nav className='relative z-20 p-6'>
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
          <div className='flex items-center space-x-3'>
            <div className='w-12 h-12 bg-gradient-to-r from-teal-400 to-blue-500 rounded-lg flex items-center justify-center'>
              <span className='text-2xl'>🏥</span>
            </div>
            <span className='text-white font-bold text-xl'>MediCare Pro</span>
          </div>

          <div className='hidden md:flex items-center space-x-8 text-white/80'>
            <a href='#features' className='hover:text-white transition-colors'>
              Características
            </a>
            <a href='#about' className='hover:text-white transition-colors'>
              Acerca de
            </a>
            <a href='#contact' className='hover:text-white transition-colors'>
              Contacto
            </a>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className='relative z-10 min-h-screen flex items-center justify-center p-4 pt-0'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            {/* Left Column - Text Content */}
            <div className='text-left space-y-8'>
              {/* Badge */}
              <div className='inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2'>
                <span className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></span>
                <span className='text-white/80 text-sm font-medium'>
                  Sistema Activo
                </span>
              </div>

              {/* Hero Title */}
              <div className='space-y-4'>
                <h1 className='text-5xl md:text-7xl font-bold leading-tight'>
                  <span className='text-white'>Consultorio</span>
                  <br />
                  <span className='bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent'>
                    Alopecia
                  </span>
                  <br />
                  <span className='text-white/80 text-3xl md:text-4xl font-light'>
                    Digital
                  </span>
                </h1>

                <p className='text-xl md:text-2xl text-white/70 leading-relaxed max-w-2xl'>
                  Revoluciona la gestión de tu consultorio con tecnología de
                  vanguardia.
                  <span className='text-teal-400 font-semibold'>
                    {" "}
                    Especializado en tratamientos capilares avanzados.
                  </span>
                </p>
              </div>

              {/* Feature highlights */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center'>
                      <span className='text-teal-400'>👥</span>
                    </div>
                    <div>
                      <h3 className='text-white font-semibold text-sm'>
                        500+ Pacientes
                      </h3>
                      <p className='text-white/60 text-xs'>Gestión integral</p>
                    </div>
                  </div>
                </div>

                <div className='bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center'>
                      <span className='text-blue-400'>📊</span>
                    </div>
                    <div>
                      <h3 className='text-white font-semibold text-sm'>
                        Análisis IA
                      </h3>
                      <p className='text-white/60 text-xs'>
                        Diagnósticos precisos
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center'>
                      <span className='text-purple-400'>🔒</span>
                    </div>
                    <div>
                      <h3 className='text-white font-semibold text-sm'>
                        100% Seguro
                      </h3>
                      <p className='text-white/60 text-xs'>Datos protegidos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className='flex flex-col sm:flex-row gap-4'>
                <Link
                  to='/pacientes'
                  className='group relative inline-flex items-center justify-center bg-gradient-to-r from-teal-500 to-blue-600 
                    hover:from-teal-600 hover:to-blue-700 text-white font-bold text-lg px-8 py-4 rounded-2xl 
                    shadow-2xl hover:shadow-teal-500/25 transition-all duration-300 transform hover:-translate-y-1 
                    hover:scale-105 overflow-hidden'
                >
                  <div className='absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                  <span className='relative flex items-center'>
                    <span className='mr-3'>🚀</span>
                    <span>Comenzar Ahora</span>
                    <span className='ml-3 group-hover:translate-x-1 transition-transform duration-300'>
                      →
                    </span>
                  </span>
                </Link>

                <button
                  className='group inline-flex items-center justify-center bg-white/10 backdrop-blur-sm
                  hover:bg-white/20 text-white font-semibold text-lg px-8 py-4 rounded-2xl 
                  border border-white/20 hover:border-white/40 transition-all duration-300'
                >
                  <span className='mr-3'>📽️</span>
                  <span>Ver Demo</span>
                </button>
              </div>
            </div>

            {/* Right Column - Visual Content */}
            <div className='relative'>
              {/* Main card with advanced styling */}
              <div className='relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20'>
                {/* Floating decoration */}
                <div className='absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full animate-bounce'></div>
                <div className='absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse'></div>

                {/* Image container */}
                <div className='relative mb-8 group'>
                  <div className='absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300'></div>
                  <img
                    src='images/images.jpeg'
                    alt='Consultorio Alopecia Moderno'
                    className='relative w-full h-64 object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-all duration-500'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl'></div>

                  {/* Overlay content */}
                  <div className='absolute bottom-4 left-4 right-4'>
                    <div className='bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20'>
                      <h3 className='text-white font-semibold text-lg'>
                        Tecnología Avanzada
                      </h3>
                      <p className='text-white/80 text-sm'>
                        Equipamiento de última generación
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature grid */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors duration-300'>
                    <div className='w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-3'>
                      <span className='text-2xl'>👨‍⚕️</span>
                    </div>
                    <h3 className='text-white font-semibold mb-1'>
                      Especialistas
                    </h3>
                    <p className='text-white/60 text-sm'>
                      Profesionales certificados
                    </p>
                  </div>

                  <div className='bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors duration-300'>
                    <div className='w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3'>
                      <span className='text-2xl'>🔬</span>
                    </div>
                    <h3 className='text-white font-semibold mb-1'>
                      Investigación
                    </h3>
                    <p className='text-white/60 text-sm'>
                      Últimos avances médicos
                    </p>
                  </div>

                  <div className='bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors duration-300'>
                    <div className='w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3'>
                      <span className='text-2xl'>💊</span>
                    </div>
                    <h3 className='text-white font-semibold mb-1'>
                      Tratamientos
                    </h3>
                    <p className='text-white/60 text-sm'>
                      Planes personalizados
                    </p>
                  </div>

                  <div className='bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors duration-300'>
                    <div className='w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-3'>
                      <span className='text-2xl'>📱</span>
                    </div>
                    <h3 className='text-white font-semibold mb-1'>Digital</h3>
                    <p className='text-white/60 text-sm'>
                      Plataforma integrada
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating elements around the card */}
              <div className='absolute -z-10 top-10 left-10 w-20 h-20 bg-teal-400/20 rounded-full animate-pulse'></div>
              <div className='absolute -z-10 bottom-10 right-10 w-16 h-16 bg-blue-400/20 rounded-full animate-bounce delay-300'></div>
              <div className='absolute -z-10 top-1/2 -left-8 w-12 h-12 bg-purple-400/20 rounded-full animate-pulse delay-700'></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section with enhanced styling */}
      <div className='relative z-10 pb-8'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
              <div className='text-center'>
                <div className='w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mx-auto mb-3'>
                  <span className='text-teal-400 text-xl'>🔒</span>
                </div>
                <h3 className='text-white font-semibold text-sm mb-1'>
                  Seguridad
                </h3>
                <p className='text-white/60 text-xs'>Encriptación avanzada</p>
              </div>

              <div className='text-center'>
                <div className='w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3'>
                  <span className='text-blue-400 text-xl'>⚡</span>
                </div>
                <h3 className='text-white font-semibold text-sm mb-1'>
                  Velocidad
                </h3>
                <p className='text-white/60 text-xs'>Respuesta instantánea</p>
              </div>

              <div className='text-center'>
                <div className='w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3'>
                  <span className='text-purple-400 text-xl'>🌐</span>
                </div>
                <h3 className='text-white font-semibold text-sm mb-1'>Cloud</h3>
                <p className='text-white/60 text-xs'>
                  Acceso desde cualquier lugar
                </p>
              </div>

              <div className='text-center'>
                <div className='w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3'>
                  <span className='text-emerald-400 text-xl'>📞</span>
                </div>
                <h3 className='text-white font-semibold text-sm mb-1'>
                  Soporte
                </h3>
                <p className='text-white/60 text-xs'>24/7 disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced floating particles */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        {/* Large floating particles */}
        <div className='absolute top-1/4 left-1/4 w-3 h-3 bg-teal-400/30 rounded-full animate-float'></div>
        <div className='absolute top-3/4 right-1/4 w-4 h-4 bg-blue-400/40 rounded-full animate-float-delayed'></div>
        <div className='absolute bottom-1/4 left-1/3 w-2 h-2 bg-purple-400/50 rounded-full animate-pulse'></div>
        <div className='absolute top-1/2 right-1/3 w-3 h-3 bg-emerald-400/30 rounded-full animate-bounce'></div>

        {/* Small particles */}
        <div className='absolute top-1/3 left-1/2 w-1 h-1 bg-white/60 rounded-full animate-twinkle'></div>
        <div className='absolute bottom-1/3 right-1/2 w-1 h-1 bg-teal-300/60 rounded-full animate-twinkle delay-500'></div>
        <div className='absolute top-2/3 left-3/4 w-1 h-1 bg-blue-300/60 rounded-full animate-twinkle delay-1000'></div>
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .bg-grid-pattern {
          background-image: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.1) 1px,
            transparent 1px
          );
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}

export default Home;
