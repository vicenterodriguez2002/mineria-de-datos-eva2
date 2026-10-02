import Header from '../components/Header';
import Footer from '../components/Footer';
import PageButton from '../components/PageButton';
import EvaluadorForm from '../components/EvaluadorForm';

export const metadata = {
  title: 'Evaluador de Clientes | Santo Tomás',
  description: 'Evaluador de clientes — Proyecto de Minería de Datos, Santo Tomás',
};

export default function EvaluadorCliente() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7fbfa]">
      <Header />

      <main id="contenido" className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid-light opacity-70 pointer-events-none" aria-hidden="true" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-72 rounded-full bg-st-light/15 blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-10">
          <section aria-labelledby="eval-title" className="text-center max-w-4xl mx-auto">
            <p className="inline-flex items-center gap-2 rounded-full border border-st-dark/15 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-st-dark">
              Paso 2 · Evaluación
            </p>
            <h1 id="eval-title" className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-st-darker">
              Evaluador de <span className="text-st">Clientes</span>
            </h1>
            <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-st-light" aria-hidden="true" />
            <p className="mx-auto mt-6 max-w-2xl text-lg text-st-darker/70 leading-relaxed">
              Completa los datos del cliente y obtén la predicción del multimodelo
              (Árbol + K-Means + Apriori).
            </p>
          </section>

          <section aria-labelledby="eval-form-title">
            <h2 id="eval-form-title" className="sr-only">Formulario de evaluación</h2>
            <EvaluadorForm />
          </section>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <PageButton href="/resultado-multimodelo" variant="secondary">
              Ver Resultado de Multimodelo
            </PageButton>
            <PageButton href="/diagnostico-campana" variant="secondary" dir="back">
              Volver a Diagnóstico de Campaña
            </PageButton>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
