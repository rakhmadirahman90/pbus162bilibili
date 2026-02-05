import React, { useState } from 'react';
import { Globe, ChevronDown, Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string, tabId?: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState('ID');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fungsi helper untuk navigasi dan menutup semua menu yang terbuka
  const handleNavClick = (section: string, tab?: string) => {
    onNavigate(section, tab);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-md text-white z-[100] h-20 border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        
        {/* --- LOGO SECTION --- */}
        <div 
          className="flex items-center gap-4 cursor-pointer group" 
          onClick={() => handleNavClick('home')}
        >
          <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg border border-white/10 group-hover:scale-105 transition-transform duration-300 bg-white flex items-center justify-center">
            <img 
              src="/photo_2026-02-03_00-32-07.jpg" 
              alt="Logo PB" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl md:text-2xl tracking-tight leading-none mb-1">
              US 162 <span className="text-blue-500">BILIBILI</span>
            </span>
            <span className="text-[8px] md:text-[9px] text-slate-400 font-medium tracking-[0.3em] uppercase">
              Professional Badminton
            </span>
          </div>
        </div>

        {/* --- DESKTOP NAVIGATION --- */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => handleNavClick('home')} className="nav-link">Beranda</button>

          {/* DROPDOWN TENTANG KAMI */}
          <div 
            className="relative h-20 flex items-center"
            onMouseEnter={() => setActiveDropdown('about')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className={`nav-link flex items-center gap-1.5 transition-colors ${activeDropdown === 'about' ? 'text-blue-400' : ''}`}>
              Tentang Kami <ChevronDown size={10} className={`transition-transform duration-300 ${activeDropdown === 'about' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'about' && (
              <div className="dropdown-container">
                <div className="dropdown-content">
                  <button onClick={() => handleNavClick('about', 'sejarah')} className="dropdown-item">Sejarah</button>
                  <button onClick={() => handleNavClick('about', 'visi-misi')} className="dropdown-item">Visi & Misi</button>
                  <button onClick={() => handleNavClick('about', 'fasilitas')} className="dropdown-item">Fasilitas</button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => handleNavClick('news')} className="nav-link">Berita</button>

          {/* DROPDOWN ATLET (FIXED LINKS) */}
          <div 
            className="relative h-20 flex items-center"
            onMouseEnter={() => setActiveDropdown('atlet')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className={`nav-link flex items-center gap-1.5 transition-colors ${activeDropdown === 'atlet' ? 'text-blue-400' : ''}`}>
              Atlet <ChevronDown size={10} className={`transition-transform duration-300 ${activeDropdown === 'atlet' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'atlet' && (
              <div className="dropdown-container">
                <div className="dropdown-content">
                  {/* Data sinkron dengan state 'Senior' & 'Muda' di Players.tsx */}
                  <button onClick={() => handleNavClick('atlet', 'Senior')} className="dropdown-item">Atlet Senior</button>
                  <button onClick={() => handleNavClick('atlet', 'Muda')} className="dropdown-item">Atlet Muda</button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => handleNavClick('rankings')} className="nav-link">Peringkat</button>
          <button onClick={() => handleNavClick('gallery')} className="nav-link">Galeri</button>

          <div className="w-px h-6 bg-white/10 mx-2"></div>

          {/* LANGUAGE PICKER */}
          <div 
            className="relative h-20 flex items-center"
            onMouseEnter={() => setActiveDropdown('lang')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all border border-white/10">
              <Globe size={14} className="text-blue-400" />
              <span className="text-[10px] font-black tracking-widest">{currentLang}</span>
              <ChevronDown size={10} className={`transition-transform duration-300 ${activeDropdown === 'lang' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'lang' && (
              <div className="dropdown-container right-0">
                <div className="dropdown-content">
                  <button onClick={() => { setCurrentLang('ID'); setActiveDropdown(null); }} className={`dropdown-item text-center ${currentLang === 'ID' ? 'bg-blue-600 text-white' : ''}`}>Bahasa (ID)</button>
                  <button onClick={() => { setCurrentLang('EN'); setActiveDropdown(null); }} className={`dropdown-item text-center ${currentLang === 'EN' ? 'bg-blue-600 text-white' : ''}`}>English (EN)</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- MOBILE TOGGLE --- */}
        <button className="md:hidden p-2 text-slate-300" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* --- MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-slate-900 border-b border-white/10 animate-in slide-in-from-top duration-300 overflow-hidden shadow-2xl">
          <div className="flex flex-col p-6 gap-4">
            <button onClick={() => handleNavClick('home')} className="mobile-nav-link text-left">Beranda</button>
            <div className="h-px bg-white/5" />
            
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Kategori Atlet</p>
            <button onClick={() => handleNavClick('atlet', 'Senior')} className="mobile-nav-link text-left text-blue-400 pl-4">Atlet Senior</button>
            <button onClick={() => handleNavClick('atlet', 'Muda')} className="mobile-nav-link text-left text-blue-400 pl-4">Atlet Muda</button>
            
            <div className="h-px bg-white/5" />
            <button onClick={() => handleNavClick('rankings')} className="mobile-nav-link text-left">Peringkat</button>
            <button onClick={() => handleNavClick('gallery')} className="mobile-nav-link text-left">Galeri</button>
            <button onClick={() => handleNavClick('about')} className="mobile-nav-link text-left">Tentang Kami</button>
          </div>
        </div>
      )}

      {/* --- STYLING UTAMA --- */}
      <style>{`
        .nav-link {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #cbd5e1;
          transition: all 0.3s ease;
        }
        .nav-link:hover { color: #3b82f6; }
        
        .dropdown-container {
          position: absolute;
          top: 80%;
          width: 13rem;
          padding-top: 1rem;
          animation: dropdownFade 0.2s ease-out;
          z-index: 110;
        }
        
        .dropdown-content {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }
        
        .dropdown-item {
          width: 100%;
          text-align: left;
          padding: 1rem 1.5rem;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #e2e8f0;
          border-bottom: 1px solid rgba(51, 65, 85, 0.5);
          transition: all 0.2s;
        }
        .dropdown-item:last-child { border: none; }
        .dropdown-item:hover { background: #2563eb; color: white; }

        .mobile-nav-link {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #f8fafc;
        }

        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
}