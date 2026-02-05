import React, { useState } from 'react';
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

  const handleNavigation = (sectionId: string, tabId?: string) => {
    // 1. Update tab jika ada parameter tabId
    if (sectionId === 'about' && tabId) setAboutActiveTab(tabId);
    if (sectionId === 'atlet' && tabId) setPlayerActiveTab(tabId);

    // 2. Scroll ke section
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Tinggi Navbar
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-600 selection:text-white">
      <Navbar onNavigate={handleNavigation} />
      <main>
        <section id="home"><Hero onNavigate={handleNavigation}/></section>
        <section id="news"><News /></section>
        
        {/* PROPS DIKIRIM KE PEMAIN */}
        <Athletes 
          externalFilter={playerActiveTab} 
          onFilterChange={setPlayerActiveTab} 
        />

        <section id="rankings"><Ranking /></section>
        <section id="gallery"><Gallery /></section>
        
        <section id="about">
          <About activeTab={aboutActiveTab} onTabChange={setAboutActiveTab} />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;