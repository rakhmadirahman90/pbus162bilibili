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
  // State untuk tab About agar bisa dikontrol dari Navbar
  const [aboutTab, setAboutTab] = useState('sejarah');

  // PERBAIKAN: Tambahkan parameter tabId? agar Navbar tidak error
  const handleNavigation = (sectionId: string, tabId?: string) => {
    setActiveSection(sectionId);
    
    // Jika ada tabId (dari dropdown Navbar), update state tab About
    if (tabId) {
      setAboutTab(tabId);
    }

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
      {/* Kirim handleNavigation ke Navbar */}
      <Navbar onNavigate={handleNavigation} />
      
      <main>
        <section id="home"><Hero /></section>
        
        <section id="about">
          <About 
            activeTab={aboutTab} 
            onTabChange={(id: string) => setAboutTab(id)} 
          />
        </section>

        <section id="berita"><News /></section>
        <section id="atlet"><Athletes /></section>
        <section id="peringkat"><Ranking /></section>
        <section id="galeri"><Gallery /></section>
      </main>
    </div>
  );
}

export default App;