import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';

// Komponen-komponen ini harus ada filenya di folder components
import News from './components/News'; 
import Athletes from './components/Athletes';
import Ranking from './components/Ranking';
import Gallery from './components/Gallery';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [aboutTab, setAboutTab] = useState('sejarah');

  const handleNavigation = (sectionId: string, tabId?: string) => {
    setActiveSection(sectionId);
    if (tabId) setAboutTab(tabId);

    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      window.scrollTo({
        top: element.offsetTop - offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar activeSection={activeSection} onNavigate={handleNavigation} />
      
      <main>
        {/* Konten Beranda */}
        <section id="home">
          <Hero />
        </section>

        {/* Konten Tentang (About) */}
        <section id="about">
          <About activeTab={aboutTab} onTabChange={(id) => setAboutTab(id)} />
        </section>

        {/* Konten Berita */}
        <section id="berita">
          <News />
        </section>

        {/* Konten Atlet */}
        <section id="atlet">
          <Athletes />
        </section>

        {/* Konten Peringkat */}
        <section id="peringkat">
          <Ranking />
        </section>

        {/* Konten Galeri */}
        <section id="galeri">
          <Gallery />
        </section>
      </main>
    </div>
  );
}

export default App;