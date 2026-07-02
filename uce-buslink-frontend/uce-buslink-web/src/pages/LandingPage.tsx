import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, Bus, Satellite, Shield, Cpu, ListChecks } from 'lucide-react';
import logoHorizontal from '../assets/brand/LogoHorizontal.png';
import heroBg from '../assets/brand/FacePage.webp';

const FEATURES = [
  {
    icon: Shield,
    title: 'Seguridad',
    text: 'Acceso exclusivo para estudiantes y docentes verificados. Viaja con tranquilidad en horarios nocturnos.',
    iconClass: 'bg-blue-500/15 text-blue-400',
  },
  {
    icon: Cpu,
    title: 'Inteligencia',
    text: 'Rastreo en tiempo real, estimación de llegada precisa y notificaciones automáticas sobre tu ruta.',
    iconClass: 'bg-orange-500/15 text-orange-400',
  },
  {
    icon: ListChecks,
    title: 'Organización',
    text: 'Reserva tu asiento con anticipación. Adiós a las filas interminables y la incertidumbre de cupo.',
    iconClass: 'bg-emerald-500/15 text-emerald-400',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-white font-sans">
      {/* HEADER */}
      <header className="absolute top-0 inset-x-0 z-30 px-6 lg:px-10 py-5 flex items-center justify-between">
        <img src={logoHorizontal} alt="UCE Bus-Link" className="h-10 w-auto object-contain" />
        <Link
          to="/login"
          className="text-sm font-semibold text-white bg-white/10 border border-white/15 backdrop-blur-md px-5 py-2.5 rounded-xl hover:bg-white/20 transition-colors"
        >
          Iniciar sesión
        </Link>
      </header>

      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/10 to-navy-950/40" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-28">
          <div className="max-w-2xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs md:text-sm font-medium text-slate-100">
              <GraduationCap size={16} className="text-cyan-400" />
              Exclusivo comunidad UCE · Inicia sesión con tu correo institucional.
            </div>

            <h1 className="mt-7 text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              Transporte Universitario
              <br />
              <span className="text-cyan-400">Inteligente</span>
            </h1>

            <p className="mt-6 text-2xl lg:text-3xl font-medium text-slate-100 leading-snug">
              El transporte universitario más seguro, inteligente y organizado.
            </p>

            <p className="mt-5 text-base lg:text-lg text-slate-300/90 leading-relaxed max-w-lg">
              Asegura tu asiento, conoce tu ruta y viaja seguro. La plataforma oficial para la
              gestión eficiente del transporte en la UCE.
            </p>

            <Link
              to="/login"
              className="mt-9 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-10 py-4 font-semibold text-white text-lg shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:from-blue-600 hover:to-cyan-500 hover:scale-[1.02]"
            >
              Comenzar ahora
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Floating cards */}
        <div className="hidden lg:flex items-center gap-3 absolute top-[22%] right-10 xl:right-16 z-10 rounded-2xl bg-navy-900/80 backdrop-blur-md border border-white/10 px-5 py-4 shadow-2xl animate-fade-in">
          <div className="w-11 h-11 rounded-full bg-orange-500/90 flex items-center justify-center flex-shrink-0">
            <Bus size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Ruta Nocturna Activa</p>
            <p className="text-xs text-slate-400">Próxima salida en 15 min</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3 absolute top-[46%] right-44 xl:right-72 z-10 rounded-2xl bg-navy-900/80 backdrop-blur-md border border-white/10 px-5 py-4 shadow-2xl animate-fade-in">
          <div className="w-11 h-11 rounded-full bg-cyan-400/15 flex items-center justify-center flex-shrink-0">
            <Satellite size={20} className="text-cyan-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Rastreo en vivo</p>
            <p className="text-xs text-slate-400">GPS Conectado</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-navy-950 px-6 lg:px-10 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center mb-16">
            <span className="inline-block bg-cyan-400 text-navy-950 font-bold text-lg px-5 py-1.5 rounded-lg shadow-[0_0_30px_rgba(34,211,238,0.55)]">
              Por qué elegir UCE Bus-Link
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-navy-900/40 border border-white/10 p-7 hover:border-cyan-400/30 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.iconClass}`}>
                  <feature.icon size={22} />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-navy-950 border-t border-white/10 px-6 lg:px-10 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={logoHorizontal} alt="UCE Bus-Link" className="h-8 w-auto object-contain opacity-80" />
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} UCE Bus-Link · Diseñado para la comunidad universitaria.
          </p>
        </div>
      </footer>
    </div>
  );
}
