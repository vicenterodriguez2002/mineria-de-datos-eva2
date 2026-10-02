import Image from 'next/image';

const COURSE = [
  { label: 'Asignatura', value: 'Minería de Datos' },
  { label: 'Profesor', value: 'Florentino Vargas' },
  { label: 'Dataset', value: 'Customer Personality Analysis' },
];

const TEAM = [
  'Vicente Rodríguez',
  'Agustina Poblete',
  'Luis Riquelme',
  'Benjamín Ponce',
  'Luis Romero',
  'Adrián Ramírez',
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-st-darker text-white">
      <div className="h-1 bg-st-light" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/logo-st.svg"
              alt="Logo Santo Tomás"
              width={40}
              height={46}
              className="h-11 w-auto"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-st-lighter">
                Santo Tomás
              </p>
              <p className="font-bold">Minería de Datos</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Presentación del proyecto Customer Personality Analysis: del dato al
            conocimiento para comprender a los clientes.
          </p>
        </div>

        <nav aria-label="Información del curso">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-st-lighter">
            Curso
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            {COURSE.map((item) => (
              <div key={item.label}>
                <dt className="text-white/60">{item.label}</dt>
                <dd className="font-semibold text-white">{item.value}</dd>
              </div>
            ))}
          </dl>
        </nav>

        <nav aria-label="Equipo del proyecto">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-st-lighter">
            Equipo
          </h2>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/80">
            {TEAM.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-white/60">
          <p>Santo Tomás © {year} todos los derechos reservados</p>
          <p>Presentación académica · Minería de Datos</p>
        </div>
      </div>
    </footer>
  );
}
