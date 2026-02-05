import React, { useState } from 'react';
import Navbar from './components/Navbar';
import About from './components/About';

function App() {
  // 1. Inisialisasi state untuk tab About
  const [aboutTab, setAboutTab] = useState('sejarah');

  return (
    <div className="min-h-screen bg-white">
      {/* 2. Kirim fungsi pengubah ke Navbar agar dropdown berfungsi */}
      <Navbar onTabChange={(id) => setAboutTab(id)} />
      
      <main>
        {/* ... komponen lainnya ... */}
        
        {/* 3. Kirim state dan fungsi ke komponen About */}
        <About 
          activeTab={aboutTab} 
          onTabChange={(id) => setAboutTab(id)} 
        />
      </main>
    </div>
  );
}

export default App;