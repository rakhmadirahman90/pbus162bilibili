import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
// Hapus atau beri komentar pada baris yang menyebabkan error
// import News from './components/News'; 
// import Athletes from './components/Athletes';
// import Gallery from './components/Gallery';
// import Ranking from './components/Ranking';

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
        <section id="home"><Hero /></section>
        <section id="about">
          <About activeTab={aboutTab} onTabChange={(id) => setAboutTab(id)} />
        </section>
        
        {/* Sementara beri teks placeholder agar tidak error */}
        <section id="berita" className="py-20 text-center">Konten Berita Segera Hadir</section>
      </main>
    </div>
  );
}

export default App;