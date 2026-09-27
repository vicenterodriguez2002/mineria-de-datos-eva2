import Header from '../components/Header';
import Footer from '../components/Footer';
import PageButton from '../components/PageButton';

export const metadata = {
  title: 'Resultado de Multimodelo | Santo Tomás',
  description: 'Resultado de multimodelo — Proyecto de Minería de Datos, Santo Tomás',
};

export default function ResultadoMultimodelo() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7fbfa]">
      <Header />

      <main id="contenido" className="flex-1 flex items-center relative overflow-hidden">
        {/* Trama decorativa sutil */}
        <div className="absolute inset-0 bg-dot-grid-light opacity-70" aria-hidden="true" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-72 rounded-full bg-st-light/15 blur-3xl" aria-hidden="true" />

        <section aria-labelledby="diag-title" className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">

          <h1 id="diag-title" className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-st-darker">
            Resultado de <span className="text-st">Multimodelo</span>
          </h1>

          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-st-light" aria-hidden="true" />

          <p className="mx-auto mt-6 max-w-2xl text-lg text-st-darker/70 leading-relaxed">
            Formulario para evaluar la satisfacción y el comportamiento de los clientes.
          </p>


{/* Botón para pasar a resultado de multimodelo y volver a diagnóstico de campaña */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <PageButton href="/evaluador-cliente" dir="back">
                Volver a Evaluador de Clientes
            </PageButton>
            <PageButton href="/diagnostico-campana" variant="secondary" dir="back">
                Volver a Diagnóstico de Campaña
            </PageButton>
        </div>

       
        </section>
      </main>

      <Footer />
    </div>
  );
}
