import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import News from './components/News';
import Athletes from './components/Athletes';
import Gallery from './components/Gallery'; // Tambahkan jika ada
import Ranking from './components/Ranking'; // Tambahkan jika ada

function App() {
  // State untuk melacak posisi scroll (aktif menu di navbar)
  const [activeSection, setActiveSection] = useState('home');
  
  // State untuk tab di dalam komponen About (Sejarah/Fasilitas/Prestasi)
  const [aboutTab, setAboutTab] = useState('sejarah');

  // Fungsi navigasi yang sinkron dengan Navbar
  const handleNavigation = (sectionId: string, tabId?: string) => {
    // 1. Update state section agar Navbar tahu menu mana yang aktif
    setActiveSection(sectionId);
    
    // 2. Jika ada tabId (dari dropdown Tentang), update tab di komponen About
    if (tabId) {
      setAboutTab(tabId);
    }

    // 3. Scroll ke section yang dituju
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Sesuaikan dengan tinggi Navbar Anda
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
      {/* Navbar menerima state aktif dan fungsi navigasi */}
      <Navbar 
        activeSection={activeSection}
        onNavigate={handleNavigation} 
      />
      
      <main>
        {/* Gunakan ID pada setiap section agar fungsi scroll bekerja */}
        <section id="home">
          <Hero />
        </section>

        <section id="about">
          <About 
            activeTab={aboutTab} 
            onTabChange={(id) => setAboutTab(id)} 
          />
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

      {/* Footer bisa ditambahkan di sini */}
    </div>
  );
}

export default App;