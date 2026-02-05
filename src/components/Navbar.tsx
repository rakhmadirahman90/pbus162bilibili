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

  // State untuk kontrol tab di About

  const [aboutActiveTab, setAboutActiveTab] = useState('sejarah');

  

  // State filter atlet yang disinkronkan dengan Navbar dan Players.tsx

  const [playerActiveTab, setPlayerActiveTab] = useState('Semua');



  /**

   * handleNavigation

   * Fungsi untuk menangani scroll dan perubahan filter/tab secara sinkron

   */

  const handleNavigation = (sectionId: string, tabId?: string) => {

    

    // 1. UPDATE FILTER/TAB (Dilakukan sebelum scroll)

    if (sectionId === 'about' && tabId) {

      setAboutActiveTab(tabId);

    }



    if (sectionId === 'atlet') {

      // Jika tabId kosong (klik menu utama), reset ke 'Semua'

      // Jika ada (Senior/Muda), gunakan tabId tersebut

      const targetFilter = tabId || 'Semua';

      setPlayerActiveTab(targetFilter);

    }



    // 2. LOGIKA SCROLL

    // Kita gunakan setTimeout 0 agar React selesai memperbarui state 

    // sebelum browser menghitung posisi elemen

    setTimeout(() => {

      const element = document.getElementById(sectionId);

      if (element) {

        const navbarHeight = 80; // Sesuaikan h-20 di Navbar

        

        // Perhitungan posisi yang lebih akurat

        const bodyRect = document.body.getBoundingClientRect().top;

        const elementRect = element.getBoundingClientRect().top;

        const elementPosition = elementRect - bodyRect;

        const offsetPosition = elementPosition - navbarHeight;



        window.scrollTo({

          top: offsetPosition,

          behavior: 'smooth',

        });

      }

    }, 10);

  };



  return (

    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-600 selection:text-white">

      {/* Navbar menerima fungsi navigasi */}

      <Navbar onNavigate={handleNavigation} />

      

      <main>

        <section id="home">

          <Hero />

        </section>



        <section id="news" className="scroll-mt-20">

          <News />

        </section>

        

        {/* --- ATLET SECTION --- */}

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

        

        {/* --- ABOUT SECTION --- */}

        <section id="about" className="scroll-mt-20">

          <About 

            activeTab={aboutActiveTab} 

            onTabChange={(newTab) => setAboutActiveTab(newTab)} 

          />

        </section>

      </main>

      

      <Footer />

    </div>

  );

}



export default App;