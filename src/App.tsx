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
  // Pastikan defaultnya 'Semua' agar saat awal semua atlet tampil
  const [playerActiveTab, setPlayerActiveTab] = useState('Semua');

  const handleNavigation = (sectionId: string, tabId?: string) => {
    // 1. LOGIKA TAB: Update state tab sebelum melakukan scroll
    if (sectionId === 'about' && tabId) {
      setAboutActiveTab(tabId);
    }

    // Ini yang menyambungkan Navbar "Atlet Senior/Muda" ke filter di Players.tsx
    if (sectionId === 'atlet' && tabId) {
      setPlayerActiveTab(tabId);
    }

    // 2. LOGIKA SCROLL: Cari elemen berdasarkan ID
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80; // Sesuaikan dengan h-20 di Navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-600 selection:text-white">
      <Navbar onNavigate={handleNavigation} />
      
      <main>
        {/* Setiap section HARUS memiliki ID yang sama dengan yang dipanggil di Navbar */}
        <section id="home">
          <Hero />
        </section>

        <section id="news">
          <News />
        </section>
        
        {/* ID 'atlet' digunakan untuk scroll, props digunakan untuk filter */}
        <section id="atlet">
          <Athletes 
            externalFilter={playerActiveTab} 
            onFilterChange={(id) => setPlayerActiveTab(id)} 
          />
        </section>

        <section id="rankings">
          <Ranking />
        </section>

        <section id="gallery">
          <Gallery />
        </section>
        
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