import Header from '../components/Header';
import Footer from '../components/Footer';
import PageButton from '../components/PageButton';
import DiagnosticoContent from './DiagnosticoContent';

export const metadata = {
  title: 'Diagnóstico de Campaña | Santo Tomás',
  description: 'Diagnóstico de campañas de marketing — Proyecto de Minería de Datos, Santo Tomás',
};

export default function DiagnosticoCampana() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7fbfa]">
      <Header />

      <main id="contenido" className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid-light opacity-70 pointer-events-none" aria-hidden="true" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-72 rounded-full bg-st-light/15 blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-12">

          <section aria-labelledby="diag-title" className="text-center max-w-4xl mx-auto">
            <p className="inline-flex items-center gap-2 rounded-full border border-st-dark/15 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-st-dark">
              Paso 1 · Diagnóstico
            </p>
            <h1 id="diag-title" className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-st-darker">
              Diagnóstico de <span className="text-st">Campaña</span>
            </h1>
            <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-st-light" aria-hidden="true" />
            <p className="mx-auto mt-6 max-w-2xl text-lg text-st-darker/70 leading-relaxed">
              Análisis de la aceptación de las campañas y la respuesta de los clientes:
              qué perfiles responden, dónde se concentran y qué oportunidades revelan los datos.
            </p>
          </section>

          <DiagnosticoContent />

          <section aria-labelledby="siguiente-title" className="rounded-2xl bg-st-darker text-white px-6 py-8 sm:px-10 flex flex-col sm:flex-row sm:items-center gap-6 justify-between shadow-lg">
            <div>
              <h2 id="siguiente-title" className="text-lg sm:text-xl font-bold">
                ¿Listo para evaluar a un cliente?
              </h2>
              <p className="mt-1 text-sm text-white/70">
                Usa el umbral del 27,3% y los segmentos para priorizar a quién contactar.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <PageButton href="/evaluador-cliente">
                Ir al Evaluador de Clientes
              </PageButton>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
