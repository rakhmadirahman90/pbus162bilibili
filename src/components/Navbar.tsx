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

  // State untuk mengontrol tab aktif di section About

  const [aboutActiveTab, setAboutActiveTab] = useState('sejarah');

  

  // State untuk mengontrol filter atlet (Semua, Senior, Muda)

  // State ini disinkronkan dengan Navbar

  const [playerActiveTab, setPlayerActiveTab] = useState('Semua');



  /**

   * Fungsi Navigasi Utama

   * @param sectionId ID elemen tujuan (home, news, atlet, rankings, dll)

   * @param tabId Parameter opsional untuk langsung membuka kategori tertentu

   */

  const handleNavigation = (sectionId: string, tabId?: string) => {

    // 1. UPDATE STATE (Logika Sinkronisasi Tab)

    if (sectionId === 'about' && tabId) {

      setAboutActiveTab(tabId);

    }



    if (sectionId === 'atlet') {

      // Jika tabId ada (Senior/Muda), set filter tersebut. 

      // Jika tidak ada (klik menu utama Atlet), default ke 'Semua'

      setPlayerActiveTab(tabId || 'Semua');

    }



    // 2. LOGIKA SCROLL (Smooth Scroll dengan Offset Navbar)

    const element = document.getElementById(sectionId);

    if (element) {

      const navbarHeight = 80; // Tinggi navbar h-20 = 80px

      const elementPosition = element.getBoundingClientRect().top;

      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;



      window.scrollTo({

        top: offsetPosition,

        behavior: 'smooth',

      });

    }

  };



  return (

    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-600 selection:text-white">

      {/* Navbar mengirimkan fungsi navigasi ke semua link di dalamnya */}

      <Navbar onNavigate={handleNavigation} />

      

      <main>

        {/* --- SECTION HERO / HOME --- */}

        <section id="home">

          <Hero />

        </section>



        {/* --- SECTION BERITA --- */}

        <section id="news">

          <News />

        </section>

        

        {/* --- SECTION ATLET --- 

            Penting: Prop 'externalFilter' akan dipantau oleh useEffect di Players.tsx

        */}

        <section id="atlet" className="scroll-mt-20">

          <Athletes 

            externalFilter={playerActiveTab} 

            onFilterChange={(id) => setPlayerActiveTab(id)} 

          />

        </section>



        {/* --- SECTION RANKING --- */}

        <section id="rankings">

          <Ranking />

        </section>



        {/* --- SECTION GALERI --- */}

        <section id="gallery">

          <Gallery />

        </section>

        

        {/* --- SECTION TENTANG KAMI --- */}

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