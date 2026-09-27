import Link from 'next/link';
import Image from 'next/image';

const META = [
  { label: 'Asignatura', value: 'Minería de Datos' },
  { label: 'Profesor', value: 'Florentino Vargas' },
  { label: 'Dataset', value: 'Customer Personality Analysis' },
];

const STATS = [
  { value: '2.240', label: 'Registros de clientes' },
  { value: '29', label: 'Atributos por cliente' },
  { value: '6', label: 'Integrantes del equipo' },
];

export default function Hero() {
  return (
    
    <section id="inicio" aria-labelledby="hero-title" className="relative overflow-hidden bg-st-darker text-white">
      {/* Fondo: degradado + trama + resplandores */}
      <div className="absolute inset-0 bg-gradient-to-br from-st-darker via-st-dark to-st" aria-hidden="true" />
      <div className="absolute inset-0 bg-dot-grid opacity-60" aria-hidden="true" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-st-light/30 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-40 -left-24 w-[28rem] h-[28rem] rounded-full bg-st-lighter/20 blur-3xl" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 sm:pt-10 sm:pb-10 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12 lg:items-center">
        <div className="min-w-0">
     

        <h1 id="hero-title" style={{ animationDelay: '80ms' }} className="mt-4 max-w-3xl text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.05] tracking-tight animate-st-fade-up">
          Customer Personality{' '}
          <span className="text-st-lighter">Analysis</span>
        </h1>


        {/* Ficha del curso */}
        <dl style={{ animationDelay: '160ms' }} className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl animate-st-fade-up">
          {META.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/15 bg-white/5 backdrop-blur px-4 py-2.5">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-st-lighter">
                {item.label}
              </dt>
              <dd className="mt-0.5 text-sm font-semibold text-white">{item.value}</dd>
            </div>
          ))}
        </dl>

        {/* Acciones */}
        <div style={{ animationDelay: '240ms' }} className="mt-6 flex flex-wrap gap-3 animate-st-fade-up">
          <Link
            href="/diagnostico-campana"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-st-darker hover:bg-st-mist transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Empezar presentación
          </Link>
        </div>

        {/* Cifras */}
        <dl style={{ animationDelay: '320ms' }} className="mt-8 grid grid-cols-3 gap-3 max-w-2xl border-t border-white/15 pt-5 animate-st-fade-up">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <dd className="order-1 text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</dd>
              <dt className="order-2 mt-0.5 text-[11px] sm:text-xs text-white/70">{stat.label}</dt>
            </div>
          ))}
        </dl>
        </div>

        {/* Emblema institucional */}
        <div className="hidden lg:flex relative items-center justify-center w-80 h-80 shrink-0 animate-st-fade-up" style={{ animationDelay: '200ms' }} aria-hidden="true">
          {/* Halo con respiración sutil */}
          <div className="absolute w-60 h-60 rounded-full bg-st-lighter/15 blur-2xl animate-st-breathe" />
          {/* Aro de brillo girando muy lento */}
          <svg viewBox="0 0 288 288" className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] animate-st-orbit-60">
            <defs>
              <linearGradient id="st-sheen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="144" cy="144" r="138" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <circle cx="144" cy="144" r="138" fill="none" stroke="url(#st-sheen)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="110 757" />
          </svg>
          {/* Aro interior fijo */}
          <div className="absolute inset-10 rounded-full border border-white/10" />
          {/* Escudo */}
          <div className="relative rounded-full border border-white/15 bg-white/5 px-12 py-10">
            <Image
              src="/logo-st.svg"
              alt=""
              width={120}
              height={140}
              priority
              className="h-28 w-auto drop-shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Transición curva hacia la sección clara */}
      <svg className="relative block w-full h-6 sm:h-8 text-[#f7fbfa]" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0,60 L0,30 C360,60 1080,0 1440,30 L1440,60 Z" />
      </svg>
    </section>
  );
}
