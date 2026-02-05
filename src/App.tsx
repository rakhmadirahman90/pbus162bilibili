import React, { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import News from './components/News';
import Athletes from './components/Players'; 
import Ranking from './components/Rankings'; 
import Gallery from './components/Gallery';
import Footer from './components/Footer';

function App() {
  const [aboutActiveTab, setAboutActiveTab] = useState('sejarah');
  const [playerActiveTab, setPlayerActiveTab] = useState('Semua');

  const handleNavigation = useCallback((sectionId: string, tabId?: string) => {
    // 1. Sinkronisasi State
    if (sectionId === 'about' && tabId) {
      setAboutActiveTab(tabId);
    }

    if (sectionId === 'atlet') {
      // Memastikan string yang dikirim sesuai ('Senior', 'Muda', atau 'Semua')
      setPlayerActiveTab(tabId || 'Semua');
    }

    // 2. Logika Scroll dengan Re-calculation
    // Timeout diperlukan agar DOM selesai render ulang (karena filter berubah) 
    // sebelum kita menghitung posisi scroll.
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const navbarHeight = 80;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navbarHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 50); // Delay 50ms agar filter atlet sempat berubah dulu
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-600 selection:text-white">
      <Navbar onNavigate={handleNavigation} />
      
      <main>
        <section id="home">
          <Hero />
        </section>

        <section id="news" className="scroll-mt-20">
          <News />
        </section>
        
        <section id="atlet" className="scroll-mt-20">
          <Athletes 
            externalFilter={playerActiveTab} 
            onFilterChange={(newFilter) => setPlayerActiveTab(newFilter)} 
          />
        </section>

        <section id="rankings" className="scroll-mt-20">
          <Ranking />
        </section>

        <section id="gallery" className="scroll-mt-20">
          <Gallery />
        </section>
        
        <section id="about" className="scroll-mt-20">
          <About 
            activeTab={aboutActiveTab} 
            onTabChange={(newTab) => setAboutActiveTab(newTab)} 
          />
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;