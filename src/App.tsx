import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import News from './components/News';
import Athletes from './components/Athletes';
import Ranking from './components/Ranking';
import Gallery from './components/Gallery';

function App() {
  // State navigasi sederhana untuk melacak menu yang aktif
  const [activeSection, setActiveSection] = useState('home');

  // Fungsi navigasi standar untuk scroll ke section
  const handleNavigation = (sectionId: string) => {
    setActiveSection(sectionId);

    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Jarak agar judul section tidak tertutup Navbar
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar menerima fungsi navigasi */}
      <Navbar onNavigate={handleNavigation} />
      
      <main>
        {/* Section Beranda */}
        <section id="home">
          <Hero />
        </section>

        {/* Section Tentang */}
        <section id="about">
          <About />
        </section>

        {/* Section Berita */}
        <section id="berita">
          <News />
        </section>

        {/* Section Atlet */}
        <section id="atlet">
          <Athletes />
        </section>

        {/* Section Peringkat */}
        <section id="peringkat">
          <Ranking />
        </section>

        {/* Section Galeri */}
        <section id="galeri">
          <Gallery />
        </section> 
      </main>

      {/* Footer bisa diletakkan di sini jika diperlukan */}
      <footer className="py-8 bg-slate-900 text-slate-500 text-center text-sm border-t border-slate-800">
        <p>&copy; 2024 PB US 162 BILIBILI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;