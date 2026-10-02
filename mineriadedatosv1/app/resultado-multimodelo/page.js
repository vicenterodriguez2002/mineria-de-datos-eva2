import { Suspense } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageButton from '../components/PageButton';
import ApiStatus from '../components/ApiStatus';
import ResultadoView from '../components/ResultadoView';

export const metadata = {
  title: 'Resultado de Multimodelo | Santo Tomás',
  description: 'Resultado de multimodelo — Proyecto de Minería de Datos, Santo Tomás',
};

export default function ResultadoMultimodelo() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7fbfa]">
      <Header />

      <main id="contenido" className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid-light opacity-70 pointer-events-none" aria-hidden="true" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-72 rounded-full bg-st-light/15 blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-10">
          <section aria-labelledby="res-title" className="text-center max-w-4xl mx-auto">
            <p className="inline-flex items-center gap-2 rounded-full border border-st-dark/15 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-st-dark">
              Paso 3 · Resultado
            </p>
            <h1 id="res-title" className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-st-darker">
              Resultado de <span className="text-st">Multimodelo</span>
            </h1>
            <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-st-light" aria-hidden="true" />
            <p className="mx-auto mt-6 max-w-2xl text-lg text-st-darker/70 leading-relaxed">
              Decisión del modelo, segmento asignado y productos sugeridos.
              Se carga desde <code className="font-mono text-sm">GET /api/resultado?id=…</code>
            </p>
            <div className="mt-6 flex justify-center">
              <ApiStatus compact />
            </div>
          </section>

          <section aria-labelledby="res-data-title">
            <h2 id="res-data-title" className="sr-only">Detalle del resultado</h2>
            <Suspense fallback={<p className="text-center text-sm text-slate-500">Cargando resultado…</p>}>
              <ResultadoView />
            </Suspense>
          </section>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <PageButton href="/evaluador-cliente" dir="back">
              Volver a Evaluador de Clientes
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
