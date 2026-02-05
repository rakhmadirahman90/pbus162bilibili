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
  
  // Mengontrol tab aktif di section About
  const [aboutActiveTab, setAboutActiveTab] = useState('sejarah');
  
  // Mengontrol filter atlet yang disinkronkan dengan Navbar dan tombol internal
  const [playerActiveTab, setPlayerActiveTab] = useState('Semua');

  /**
   * --- 2. LOGIKA NAVIGASI UTAMA ---
   * Menangani perpindahan section, update state tab, dan smooth scrolling.
   */
  const handleNavigation = useCallback((sectionId: string, tabId?: string) => {
    
    // Update state About jika navigasi mengarah ke sana
    if (sectionId === 'about' && tabId) {
      setAboutActiveTab(tabId);
    }

    // Update state Atlet jika navigasi mengarah ke kategori tertentu
    if (sectionId === 'atlet') {
      // tabId bisa berisi 'Senior', 'Muda', atau undefined (default 'Semua')
      setPlayerActiveTab(tabId || 'Semua');
    }

    // Eksekusi Smooth Scroll
    // Delay 50ms memastikan komponen telah render ulang dengan filter baru
    // sebelum browser menghitung koordinat scroll.
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const navbarHeight = 80; // Sesuai dengan h-20 di Navbar
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
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
      {/* NAVBAR: Mengirimkan fungsi navigasi ke logo dan menu link.
          Memungkinkan klik logo kembali ke 'home' atau klik 'Atlet Muda' langsung memfilter.
      */}
      <Navbar onNavigate={handleNavigation} />
      
      <main>
        {/* SECTION HOME / HERO */}
        <section id="home">
          <Hero />
        </section>

        {/* SECTION BERITA */}
        <section id="news" className="scroll-mt-20">
          <News />
        </section>
        
        {/* SECTION ATLET (PLAYERS)
            Menggunakan externalFilter untuk sinkronisasi dengan Navbar
        */}
        <section id="atlet" className="scroll-mt-20">
          <Athletes 
            externalFilter={playerActiveTab} 
            onFilterChange={(newFilter) => setPlayerActiveTab(newFilter)} 
          />
        </section>

        {/* SECTION RANKING */}
        <section id="rankings" className="scroll-mt-20">
          <Ranking />
        </section>

        {/* SECTION GALERI */}
        <section id="gallery" className="scroll-mt-20">
          <Gallery />
        </section>
        
        {/* SECTION TENTANG (ABOUT)
            Menggunakan activeTab untuk sinkronisasi tab sejarah/visi-misi
        */}
        <section id="about" className="scroll-mt-20">
          <About 
            activeTab={aboutActiveTab} 
            onTabChange={(newTab) => setAboutActiveTab(newTab)} 
          />
        </section>
      </main>
      
      {/* FOOTER: Menyediakan akses navigasi cepat di bagian bawah halaman */}
      <Footer onNavigate={handleNavigation} />
    </div>
  );
}

export default App;