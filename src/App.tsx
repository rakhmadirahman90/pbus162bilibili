import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import News from './components/News';
import Athletes from './components/Players'; // Disesuaikan ke Players.tsx
import Ranking from './components/Rankings'; // Disesuaikan ke Rankings.tsx
import Gallery from './components/Gallery';
import Footer from './components/Footer';

function App() {
  const [aboutActiveTab, setAboutActiveTab] = useState('sejarah');
  const [activeSection, setActiveSection] = useState('home');

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        activeSection={activeSection} 
        onTabChange={(id) => setAboutActiveTab(id)} 
      />
      
      <main>
        <Hero />
        <News />
        <Athletes />
        <Ranking />
        <Gallery />
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