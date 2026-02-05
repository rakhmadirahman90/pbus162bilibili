import React, { useState, useEffect } from 'react';
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

  // Perbaikan 1: Logika scroll yang lebih aman
  const handleNavigation = (sectionId: string, tabId?: string) => {
    setActiveSection(sectionId);
    if (tabId) setAboutTab(tabId);

    // Gunakan setTimeout kecil untuk memastikan DOM sudah siap jika ada render ulang
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 80; 
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 10);
  };

  // Perbaikan 2: (Opsional) Deteksi scroll otomatis untuk update menu Navbar yang aktif
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'berita', 'atlet', 'peringkat', 'galeri'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          if (
            element.offsetTop <= scrollPosition &&
            element.offsetTop + element.offsetHeight > scrollPosition
          ) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar activeSection={activeSection} onNavigate={handleNavigation} />
      
      <main>
        {/* Tambahkan min-h-screen agar scroll memiliki ruang yang cukup */}
        <section id="home" className="min-h-[50vh]">
          <Hero />
        </section>

        <section id="about" className="min-h-screen">
          <About activeTab={aboutTab} onTabChange={(id) => setAboutTab(id)} />
        </section>

        <section id="berita" className="min-h-screen">
          <News />
        </section>

        <section id="atlet" className="min-h-screen">
          <Athletes />
        </section>

        <section id="peringkat" className="min-h-screen">
          <Ranking />
        </section>

        <section id="galeri" className="min-h-screen">
          <Gallery />
        </section>
      </main>
    </div>
  );
}

export default App;