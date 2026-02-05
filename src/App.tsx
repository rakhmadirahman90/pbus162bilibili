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
  const [activeSection, setActiveSection] = useState('home');

  // Fungsi navigasi untuk menangani klik menu agar tidak blank
  const handleNavigation = (sectionId: string, tabId?: string) => {
    setActiveSection(sectionId);
    if (tabId) {
      setAboutActiveTab(tabId);
    }

    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        activeSection={activeSection} 
        onNavigate={handleNavigation}
        onTabChange={(id) => {
          setAboutActiveTab(id);
          handleNavigation('about'); // Otomatis scroll ke About jika tab diklik
        }} 
      />
      
      <main>
        <section id="home"><Hero /></section>
        <section id="news"><News /></section>
        <section id="players"><Athletes /></section>
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