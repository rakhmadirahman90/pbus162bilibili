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
  // 1. STATE MANAGEMENT
  // State untuk tab di section 'About'
  const [aboutActiveTab, setAboutActiveTab] = useState('sejarah');
  
  // State untuk filter atlet (Semua, Senior, Muda)
  // State ini dikirim ke Navbar untuk memicu perubahan dan ke Players untuk memfilter data
  const [playerActiveTab, setPlayerActiveTab] = useState('Semua');

  /**
   * 2. LOGIKA NAVIGASI & SCROLL
   * Fungsi ini dipanggil dari Navbar saat user mengklik menu
   */
  const handleNavigation = useCallback((sectionId: string, tabId?: string) => {
    
    // A. Update State Tab About jika tujuannya section about
    if (sectionId === 'about' && tabId) {
      setAboutActiveTab(tabId);
    }

    // B. Update State Filter Atlet (Senior/Muda/Semua)
    if (sectionId === 'atlet') {
      // Jika tabId ada (misal dari dropdown Navbar), set filter tersebut.
      // Jika tidak ada (klik menu Atlet utama), default ke 'Semua'.
      setPlayerActiveTab(tabId || 'Semua');
    }

    // C. Eksekusi Smooth Scroll
    // Menggunakan setTimeout agar React sempat melakukan re-render filter 
    // sebelum browser menghitung posisi koordinat elemen.
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const navbarHeight = 80; // Tinggi navbar (h-20 = 80px)
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navbarHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 50); 
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-600 selection:text-white">
      {/* NAVBAR: 
        Menerima fungsi handleNavigation untuk mengontrol seluruh aplikasi 
      */}
      <Navbar onNavigate={handleNavigation} />
      
      <main>
        {/* Setiap section memiliki ID yang unik untuk target scroll */}
        
        <section id="home">
          <Hero />
        </section>

        <section id="news" className="scroll-mt-20">
          <News />
        </section>
        
        {/* PLAYERS SECTION:
          Menerima 'externalFilter' dari state App agar sinkron dengan klik di Navbar
        */}
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
        
        {/* ABOUT SECTION:
          Menerima activeTab agar jika diklik 'Visi Misi' di footer/navbar, tab langsung terbuka
        */}
        <section id="about" className="scroll-mt-20">
          <About 
            activeTab={aboutActiveTab} 
            onTabChange={(newTab) => setAboutActiveTab(newTab)} 
          />
        </section>
      </main>
      
      {/* FOOTER: Bisa juga ditambahkan onNavigate jika ada link di bawah */}
      <Footer />
    </div>
  );
}

export default App;