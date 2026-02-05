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
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar activeSection={activeSection} onNavigate={handleNavigation} />
      
      <main>
        <section id="home"><Hero /></section>
        <section id="about">
          <About activeTab={aboutTab} onTabChange={(id) => setAboutTab(id)} />
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