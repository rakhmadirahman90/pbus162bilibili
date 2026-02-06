import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import News from './components/News';
import Athletes from './components/Players'; 
import Ranking from './components/Rankings'; 
import Gallery from './components/Gallery';
import RegistrationForm from './components/RegistrationForm'; // <-- Impor Komponen Pendaftaran
import Contact from './components/Contact'; 
import Footer from './components/Footer';

function App() {
  // --- STATE MANAGEMENT ---
  
  // Mengontrol tab aktif di section About (sejarah, visi-misi, fasilitas)
  const [aboutActiveTab, setAboutActiveTab] = useState('sejarah');
  
  // Mengontrol filter atlet (Semua, Senior, Muda)
  const [playerActiveTab, setPlayerActiveTab] = useState('Semua');

  /**
   * Fungsi Navigasi Utama
   * Digunakan untuk menangani klik dari Navbar maupun Footer
   */
  const handleNavigation = (sectionId: string, tabId?: string) => {
    
    // 1. UPDATE STATE SINKRONISASI
    // Jika navigasi mengarah ke 'about'
    if (sectionId === 'about' && tabId) {
      setAboutActiveTab(tabId);
    }

    // Jika navigasi mengarah ke 'atlet'
    if (sectionId === 'atlet') {
      setPlayerActiveTab(tabId || 'Semua');
    }

    // 2. LOGIKA SCROLL KE TARGET
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80; // Sesuai dengan h-20 di Navbar (80px)
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-600 selection:text-white antialiased">
      
      {/* NAVBAR */}
      <Navbar onNavigate={handleNavigation} />
      
      <main className="relative">
        {/* --- SECTION HERO / HOME --- */}
        <section id="home">
          <Hero onNavigate={handleNavigation} />
        </section>

        {/* --- SECTION BERITA --- */}
        <section id="news" className="scroll-mt-20">
          <News />
        </section>
        
        {/* --- SECTION ATLET --- */}
        <section id="atlet" className="scroll-mt-20">
          <Athletes 
            activeTab={playerActiveTab} 
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

        {/* --- SECTION PENDAFTARAN ATLET (BARU) --- */}
        <section id="register" className="scroll-mt-20">
          <RegistrationForm />
        </section>
        
        {/* --- SECTION TENTANG KAMI --- */}
        <section id="about" className="scroll-mt-20">
          <About 
            activeTab={aboutActiveTab} 
            onTabChange={(id) => setAboutActiveTab(id)} 
          />
        </section>

        {/* --- SECTION KONTAK --- */}
        <section id="contact" className="scroll-mt-20">
          <Contact />
        </section>
      </main>
      
      {/* FOOTER */}
      <Footer onNavigate={handleNavigation} />
    </div>
  );
}

export default App;