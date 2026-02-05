import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import News from './components/News';
import Athletes from './components/Players'; 
import Ranking from './components/Rankings'; 
import Gallery from './components/Gallery';
import Footer from './components/Footer';

function App() {
  // --- STATE MANAGEMENT ---
  
  // Mengontrol tab aktif di section About (sejarah, visi-misi, fasilitas)
  const [aboutActiveTab, setAboutActiveTab] = useState('sejarah');
  
  // Mengontrol filter atlet (Semua, Senior, Muda)
  // State ini yang akan "memerintah" komponen Players.tsx
  const [playerActiveTab, setPlayerActiveTab] = useState('Semua');

  /**
   * Fungsi Navigasi Utama
   * Digunakan untuk menangani klik dari Navbar maupun Footer
   * @param sectionId ID elemen tujuan (home, news, atlet, rankings, dll)
   * @param tabId Parameter opsional untuk langsung memicu filter/tab tertentu
   */
  const handleNavigation = (sectionId: string, tabId?: string) => {
    
    // 1. UPDATE STATE SINKRONISASI
    // Jika navigasi mengarah ke 'about' (Tentang Kami)
    if (sectionId === 'about' && tabId) {
      setAboutActiveTab(tabId);
    }

    // Jika navigasi mengarah ke 'atlet' (Profil Pemain)
    if (sectionId === 'atlet') {
      // Jika ada tabId (Senior/Muda), gunakan itu. Jika klik menu utama, gunakan 'Semua'.
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

  // Opsional: Logika untuk memantau scroll dan mengupdate state Navbar jika diperlukan
  useEffect(() => {
    // Memastikan saat aplikasi dimuat, posisi scroll berada di paling atas
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-600 selection:text-white antialiased">
      
      {/* NAVBAR: 
          Menerima prop onNavigate untuk menghubungkan dropdown ke fungsi handleNavigation 
      */}
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
        
        {/* --- SECTION ATLET --- 
            Prop 'externalFilter' akan ditangkap oleh useEffect di Players.tsx
            Prop 'onFilterChange' memastikan jika user klik filter di dalam section, state di App ikut berubah
        */}
        <section id="atlet" className="scroll-mt-20">
          <Athletes 
            activeTab={playerActiveTab} // Pastikan di Players.tsx menggunakan nama prop 'activeTab'
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
        
        {/* --- SECTION TENTANG KAMI --- */}
        <section id="about" className="scroll-mt-20">
          <About 
            activeTab={aboutActiveTab} 
            onTabChange={(id) => setAboutActiveTab(id)} 
          />
        </section>
      </main>
      
      {/* FOOTER:
          Bisa juga ditambahkan handleNavigation agar link di footer berfungsi sama 
      */}
      <Footer onNavigate={handleNavigation} />
    </div>
  );
}

export default App;