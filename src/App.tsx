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
  // --- 1. STATE MANAGEMENT ---
  
  // State untuk mengontrol tab aktif di section About (Sejarah, Visi, Struktur)
  const [aboutActiveTab, setAboutActiveTab] = useState('sejarah');
  
  // State untuk filter atlet (Semua, Senior, Muda)
  // State ini dikirim ke Navbar untuk kontrol dan ke Players untuk penyaringan data
  const [playerActiveTab, setPlayerActiveTab] = useState('Semua');

  /**
   * --- 2. LOGIKA NAVIGASI UTAMA ---
   * Fungsi untuk menangani perpindahan antar section dan sinkronisasi tab
   */
  const handleNavigation = useCallback((sectionId: string, tabId?: string) => {
    
    // Update tab About jika tujuannya adalah section about
    if (sectionId === 'about' && tabId) {
      setAboutActiveTab(tabId);
    }

    // Update filter Atlet (Senior/Muda) jika tujuannya adalah section atlet
    if (sectionId === 'atlet') {
      // Jika tabId tidak ada, default kembali ke 'Semua'
      setPlayerActiveTab(tabId || 'Semua');
    }

    // Eksekusi Smooth Scroll dengan sedikit delay
    // Delay 50ms memberikan waktu bagi React untuk merender ulang filter/tab
    // agar browser bisa menghitung posisi elemen dengan presisi (setelah tinggi konten berubah)
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const navbarHeight = 80; // Sesuaikan dengan tinggi h-20 di Navbar Anda
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
      {/* NAVBAR: Mengontrol navigasi ke seluruh aplikasi 
      */}
      <Navbar onNavigate={handleNavigation} />
      
      <main>
        {/* --- SECTION HOME --- */}
        <section id="home">
          <Hero />
        </section>

        {/* --- SECTION BERITA --- */}
        <section id="news" className="scroll-mt-20">
          <News />
        </section>
        
        {/* --- SECTION ATLET --- 
            Prop externalFilter disinkronkan dengan state playerActiveTab
        */}
        <section id="atlet" className="scroll-mt-20">
          <Athletes 
            externalFilter={playerActiveTab} 
            onFilterChange={(newFilter) => setPlayerActiveTab(newFilter)} 
          />
        </section>

        {/* --- SECTION RANKING --- */}
        <section id="rankings" className="scroll-mt-20">
          <Ranking />
        </section>

        {/* --- SECTION GALERI --- */}
        <section id="gallery" className="scroll-mt-20">
          <Gallery />
        </section>
        
        {/* --- SECTION TENTANG (ABOUT) --- 
            Prop activeTab disinkronkan dengan state aboutActiveTab
        */}
        <section id="about" className="scroll-mt-20">
          <About 
            activeTab={aboutActiveTab} 
            onTabChange={(newTab) => setAboutActiveTab(newTab)} 
          />
        </section>
      </main>
      
      {/* --- FOOTER --- */}
      <Footer onNavigate={handleNavigation} />
    </div>
  );
}

export default App;