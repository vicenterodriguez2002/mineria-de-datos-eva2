import Header from '../components/Header';
import Footer from '../components/Footer';
import PageButton from '../components/PageButton';

export const metadata = {
  title: 'Diagnóstico de Campaña | Santo Tomás',
  description: 'Diagnóstico de campañas de marketing — Proyecto de Minería de Datos, Santo Tomás',
};

export default function DiagnosticoCampana() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7fbfa]">
      <Header />

      <main id="contenido" className="flex-1 flex items-center relative overflow-hidden">
        {/* Trama decorativa sutil */}
        <div className="absolute inset-0 bg-dot-grid-light opacity-70" aria-hidden="true" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-72 rounded-full bg-st-light/15 blur-3xl" aria-hidden="true" />

        <section aria-labelledby="diag-title" className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">

          <h1 id="diag-title" className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-st-darker">
            Diagnóstico de <span className="text-st">Campaña</span>
          </h1>

          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-st-light" aria-hidden="true" />

          <p className="mx-auto mt-6 max-w-2xl text-lg text-st-darker/70 leading-relaxed">
            Análisis de la aceptación de las campañas y la respuesta de los clientes:
            qué perfiles responden, dónde se concentran y qué oportunidades revelan los datos.
          </p>

          {/* Boton para pasar a evaluador de clientes */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <PageButton href="/evaluador-cliente">
              Ir al Evaluador de Clientes
            </PageButton>
          </div>

        </section>
      </main>

      <Footer />
    </div>
  );
}
