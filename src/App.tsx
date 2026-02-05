import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import News from './components/News';
import Athletes from './components/Athletes';
import Ranking from './components/Ranking';
import Gallery from './components/Gallery';

function App() {
  // State navigasi sederhana
  const [activeSection, setActiveSection] = useState('home');

  // Fungsi navigasi standar awal
  const handleNavigation = (sectionId: string) => {
    setActiveSection(sectionId);

    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Menggunakan prop standar: onNavigate */}
      <Navbar activeSection={activeSection} onNavigate={handleNavigation} />
      
      <main>
        <section id="home">
          <Hero />
        </section>

        <section id="about">
          {/* Mengembalikan About ke kondisi awal (tanpa kontrol state dari luar) */}
          <About />
        </section>

        <section id="berita">
          <News />
        </section>

        <section id="atlet">
          <Athletes />
        </section>

        <section id="peringkat">
          <Ranking />
        </section>

        <section id="galeri">
          <Gallery />
        </div>
      </main>
    </div>
  );
}

export default App;