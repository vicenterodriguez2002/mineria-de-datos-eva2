import Header from './components/Header';
import Hero from './components/Hero';

import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7fbfa]">
      <Header />
      <main id="contenido" className="flex-1">
       <br></br>
        <Hero />
       
   
      </main>
      <Footer />
    </div>
  );
}
