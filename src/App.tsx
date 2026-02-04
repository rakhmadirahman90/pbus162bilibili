import { useState, useEffect } from 'react';
// ... import lainnya tetap sama

function App() {
  const [activeSection, setActiveSection] = useState('home');
  // State utama untuk mengontrol tab di section About
  const [aboutActiveTab, setAboutActiveTab] = useState('sejarah');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'news', 'players', 'rankings', 'gallery', 'about'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Kirim fungsi pengubah tab ke Navbar */}
      <Navbar 
        activeSection={activeSection} 
        onTabChange={(id) => setAboutActiveTab(id)} 
      />
      
      <main>
        <Hero />
        <News />
        <Players />
        <Rankings />
        <Gallery />
        {/* Kirim state dan fungsi pengubah ke About */}
        <About 
          activeTab={aboutActiveTab} 
          onTabChange={(id) => setAboutActiveTab(id)} 
        />
      </main>
      <Footer />
    </div>
  );
}

export default App;