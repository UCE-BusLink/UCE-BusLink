import { Link } from 'react-router-dom';
import { Bus, ShieldAlert, Clock, Map, CheckCircle2, XCircle, Users, Activity, Star, Route } from 'lucide-react';
import logoHorizontal from '../assets/brand/LogoHorizontal.png';
import uce_logo from '../assets/brand/uce_logo.png';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-[#0F172A]">
      {/* HEADER */}
      <header className="px-4 md:px-8 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <img src={logoHorizontal} alt="UCE Bus-Link" className="h-10 md:h-12 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm md:text-base font-semibold text-[#0B1F4D] bg-[#F5B700] px-6 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#F5B700]/20"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#071A3D] via-[#0B2458] to-[#123C84] pt-20 pb-0">
          {/* Decorative Blobs & Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute -top-40 -left-32 w-96 h-96 bg-[#F5B700]/20 blur-3xl rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-20">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Hero Copy (Left) */}
              <div className="space-y-8 animate-fade-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#F5B700] text-xs md:text-sm font-semibold uppercase tracking-widest">
                  <Bus size={16} /> Transporte Universitario Inteligente
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                  El transporte universitario <span className="text-[#F5B700]">más seguro,</span> inteligente y organizado.
                </h1>

                <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-xl">
                  Asegura tu asiento, conoce tu ruta y viaja seguro. La plataforma oficial para la gestión eficiente del transporte en la UCE.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5B700] text-[#0B1F4D] px-8 py-4 font-semibold text-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-[#F5B700]/20"
                  >
                    Comenzar ahora
                  </Link>
                </div>

                {/* UCE Apple-style Card */}
                <div className="mt-8 rounded-3xl bg-white/90 backdrop-blur-md p-6 shadow-2xl border border-slate-200 max-w-md transform transition-all duration-500 hover:-translate-y-1">
                  <div className="flex items-center gap-5">
                    <img src={uce_logo} alt="Logo UCE" className="w-14 h-14 object-contain rounded-full drop-shadow-sm" />
                    <div>
                      <h3 className="text-[#0B1F4D] font-bold text-lg leading-tight mb-1">Exclusivo comunidad UCE</h3>
                      <p className="text-slate-600 text-sm font-medium">
                        Inicia sesión con tu <strong>correo institucional</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Mockup Card (Right) */}
              <div className="relative mx-auto w-full max-w-sm lg:max-w-md transform transition-all duration-700 hover:-translate-y-4">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F5B700] to-blue-500 rounded-3xl blur-2xl opacity-20"></div>
                <div className="relative rounded-3xl bg-white/10 backdrop-blur-xl p-8 border border-white/20 shadow-2xl text-white">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">Próxima Salida</span>
                      <h3 className="text-2xl font-bold mt-1">Ruta Norte - San Blas</h3>
                    </div>
                    <span className="bg-[#F5B700] text-[#0B1F4D] text-xs font-bold px-3 py-1 rounded-full">Disponible</span>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div>
                      <div className="flex justify-between text-sm mb-1 font-medium">
                        <span className="text-slate-300">Ocupación</span>
                        <span>28 / 40 asientos</span>
                      </div>
                      <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-[#F5B700] rounded-full w-[70%]"></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10">
                      <Clock size={18} className="text-[#F5B700]" />
                      <span className="text-sm font-medium">Salida estimada: <strong className="text-white">20:30 PM</strong></span>
                    </div>
                  </div>

                  <button className="w-full bg-white text-[#0B1F4D] font-bold py-3 rounded-xl transition-all duration-300 hover:bg-slate-100 hover:scale-[1.02]">
                    Reservar mi asiento
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* SVG Wave Separator */}
          <svg viewBox="0 0 1440 120" className="fill-[#F8FAFC] w-full block relative z-20">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </section>

        {/* STATISTICS SECTION */}
        <section className="px-6 py-12 bg-[#F8FAFC] border-b border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-200">
              <div className="text-center px-4">
                <Route className="mx-auto mb-2 text-[#163B82]" size={28} />
                <h2 className="text-4xl font-bold text-[#0B1F4D]">40+</h2>
                <p className="text-[#64748B] font-medium mt-1">Rutas Activas</p>
              </div>
              <div className="text-center px-4">
                <Users className="mx-auto mb-2 text-[#163B82]" size={28} />
                <h2 className="text-4xl font-bold text-[#0B1F4D]">1.5k+</h2>
                <p className="text-[#64748B] font-medium mt-1">Estudiantes</p>
              </div>
              <div className="text-center px-4">
                <Star className="mx-auto mb-2 text-[#163B82]" size={28} />
                <h2 className="text-4xl font-bold text-[#0B1F4D]">98%</h2>
                <p className="text-[#64748B] font-medium mt-1">Satisfacción</p>
              </div>
              <div className="text-center px-4">
                <Activity className="mx-auto mb-2 text-[#163B82]" size={28} />
                <h2 className="text-4xl font-bold text-[#0B1F4D]">100%</h2>
                <p className="text-[#64748B] font-medium mt-1">Tiempo Real</p>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM & SOLUTION SECTION */}
        <section className="px-6 py-24 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F4D] tracking-tight">
                ¿Por qué usar UCE Bus-Link?
              </h2>
              <p className="text-[#64748B] mt-4 text-lg">La diferencia entre viajar con incertidumbre y viajar seguro.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
              {/* Problem */}
              <div className="space-y-6">
                <div className="inline-block px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-semibold mb-2">
                  El Problema
                </div>
                <ul className="space-y-4">
                  {[
                    "Desconoces si habrá asientos disponibles al llegar.",
                    "No hay certeza del horario exacto de salida.",
                    "Aglomeraciones y esperas inseguras en la noche.",
                    "Rutas poco claras y paradas desorganizadas."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <XCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Solution */}
              <div className="bg-[#F8FAFC] rounded-3xl p-8 border border-slate-200 shadow-xl">
                <div className="inline-block px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-semibold mb-6">
                  Nuestra Solución
                </div>
                <ul className="space-y-5">
                  {[
                    "Reserva de cupos garantizada desde la app.",
                    "Itinerarios fijos y visibilidad en tiempo real.",
                    "Organización inteligente que elimina las filas.",
                    "Trazabilidad exacta de las rutas y paradas."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#0B1F4D] font-medium">
                      <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={22} />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="px-6 py-24 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-[#F5B700]/10 flex items-center justify-center mb-6">
                <ShieldAlert className="text-[#F5B700]" size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#0B1F4D] mb-3">Seguridad y Certeza</h3>
              <p className="text-[#64748B] leading-relaxed">
                Eliminamos la incertidumbre garantizando tu lugar en el bus mediante reservas anticipadas. No más aglomeraciones.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-[#163B82]/10 flex items-center justify-center mb-6">
                <Clock className="text-[#163B82]" size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#0B1F4D] mb-3">Planificación Exacta</h3>
              <p className="text-[#64748B] leading-relaxed">
                Reserva tu viaje con anticipación. Conoce exactamente los horarios de salida y planifica tu retorno a casa.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <Map className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#0B1F4D] mb-3">Rutas en Detalle</h3>
              <p className="text-[#64748B] leading-relaxed">
                Acceso a información detallada sobre rutas, paradas y disponibilidad. Transparencia total en la operación.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#071A3D] text-slate-400 py-16 border-t-[6px] border-[#F5B700]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white text-xl font-bold tracking-tight mb-4">UCE BUS-LINK</h4>
            <p className="text-sm max-w-sm leading-relaxed mb-6">
              Plataforma para la gestión inteligente de flota y reservas. Revolucionando la forma en que la comunidad se moviliza.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"></div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"></div>
            </div>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-4">Plataforma</h5>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-[#F5B700] transition-colors">Reservas</a></li>
              <li><a href="#" className="hover:text-[#F5B700] transition-colors">Rutas y Horarios</a></li>
              <li><a href="#" className="hover:text-[#F5B700] transition-colors">Estado en Vivo</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-4">Soporte</h5>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-[#F5B700] transition-colors">Centro de ayuda</a></li>
              <li><a href="#" className="hover:text-[#F5B700] transition-colors">Correo institucional</a></li>
              <li><a href="#" className="hover:text-[#F5B700] transition-colors">Términos de servicio</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">© {new Date().getFullYear()} UCE BUS-LINK. Todos los derechos reservados.</p>
          <p className="text-xs">Diseñado para la comunidad universitaria.</p>
        </div>
      </footer>
    </div>
  );
}