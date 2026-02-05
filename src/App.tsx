import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero'; // Pastikan import ini ada
import About from './components/About';
import News from './components/News'; // Asumsi nama komponen berita Anda
import Athletes from './components/Athletes'; // Asumsi nama komponen atlet Anda

function App() {
  // 1. State untuk navigasi menu utama (Beranda, Tentang, Berita, dll)
  const [activeSection, setActiveSection] = useState('home');
  
  // 2. State khusus untuk tab di dalam komponen About
  const [aboutTab, setAboutTab] = useState('sejarah');

  // Fungsi untuk menangani navigasi dari Navbar
  const handleNavigation = (sectionId: string, tabId?: string) => {
    setActiveSection(sectionId);
    
    // Jika user mengklik dropdown di "Tentang", kita update tab-nya juga
    if (tabId) {
      setAboutTab(tabId);
    }

    // Scroll otomatis ke section tersebut agar user tahu halaman berpindah
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 3. Navbar sekarang menerima fungsi navigasi utama dan fungsi ganti tab */}
      <Navbar 
        activeSection={activeSection}
        onNavigate={handleNavigation} 
      />
      
      <main>
        {/* Render komponen berdasarkan activeSection */}
        {activeSection === 'home' && <Hero />}
        
        {/* Section About biasanya tetap muncul atau di-scroll, 
            tapi pastikan props dikirim dengan benar */}
        <section id="about">
          <About 
            activeTab={aboutTab} 
            onTabChange={(id) => setAboutTab(id)} 
          />
        </section>

        {/* Contoh render section lain jika Anda menggunakan sistem conditional rendering */}
        {activeSection === 'berita' && <News />}
        {activeSection === 'atlet' && <Athletes />}
      </main>
    </div>
  );
}

export default App;