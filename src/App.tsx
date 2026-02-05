import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
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

    // Mencari elemen berdasarkan ID section
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Jarak agar tidak tertutup Navbar
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
      <Navbar activeSection={activeSection} onNavigate={handleNavigation} />
      
      <main>
        <section id="home">
          <Hero />
        </section>

        <section id="about">
          <About activeTab={aboutTab} onTabChange={(id) => setAboutTab(id)} />
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
        </section>
      </main>
    </div>
  );
}

export default App;