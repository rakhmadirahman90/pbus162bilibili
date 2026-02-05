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
  // Tambahkan state untuk mengontrol tab di komponen Players
  const [playerActiveTab, setPlayerActiveTab] = useState('Atlet Senior');
  const [activeSection, setActiveSection] = useState('home');

  const handleNavigation = (sectionId: string, tabId?: string) => {
    setActiveSection(sectionId);

    // Logika jika yang diklik adalah bagian 'about'
    if (sectionId === 'about' && tabId) {
      setAboutActiveTab(tabId);
    }

    // Logika jika yang diklik adalah bagian 'atlet' (sesuaikan ID dengan Navbar)
    if (sectionId === 'atlet' && tabId) {
      setPlayerActiveTab(tabId);
    }

    // Scroll ke section tujuan
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar onNavigate={handleNavigation} />
      
      <main>
        <section id="home"><Hero /></section>
        <section id="news"><News /></section>
        
        {/* Update ID menjadi 'atlet' agar sinkron dengan Navbar, 
            lalu kirim props tab-nya */}
        <section id="atlet">
          <Athletes 
            activeTab={playerActiveTab} 
            onTabChange={(id) => setPlayerActiveTab(id)} 
          />
        </section>

        <section id="rankings"><Ranking /></section>
        <section id="gallery"><Gallery /></section>
        <section id="about">
          <About 
            activeTab={aboutActiveTab} 
            onTabChange={(id) => setAboutActiveTab(id)} 
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;