import { useState } from 'react';
// ... import lainnya

function App() {
  const [activeSection, setActiveSection] = useState('home');
  // Pastikan inisialisasi state ini ada!
  const [aboutActiveTab, setAboutActiveTab] = useState('sejarah');

  return (
    <div className="min-h-screen">
      <Navbar 
        activeSection={activeSection} 
        onTabChange={(id) => setAboutActiveTab(id)} 
      />
      <main>
        {/* ... komponen lain */}
        <About 
          activeTab={aboutActiveTab} 
          onTabChange={(id) => setAboutActiveTab(id)} 
        />
      </main>
    </div>
  );
}