import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown, Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string, tabId?: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState('ID');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Efek untuk memberikan background saat scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fungsi navigasi yang menutup menu mobile/dropdown setelah diklik
  const handleNavClick = (e: React.MouseEvent, section: string, tab?: string) => {
    e.preventDefault();
    onNavigate(section, tab);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-[100] h-20 transition-all duration-300 border-b ${
      isScrolled ? 'bg-slate-900/95 backdrop-blur-md border-white/10 shadow-2xl' : 'bg-transparent border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        
        {/* --- LOGO --- */}
        <div 
          className="flex items-center gap-4 cursor-pointer group" 
          onClick={(e) => handleNavClick(e, 'home')}
        >
          <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg border border-white/10 group-hover:scale-110 transition-transform duration-300 bg-white flex items-center justify-center">
            <img 
              src="/photo_2026-02-03_00-32-07.jpg" 
              alt="Logo PB" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl md:text-2xl tracking-tight leading-none mb-1 text-white">
              US 162 <span className="text-blue-500">BILIBILI</span>
            </span>
            <span className="text-[8px] md:text-[9px] text-slate-400 font-medium tracking-[0.3em] uppercase">
              Professional Badminton
            </span>
          </div>
        </div>

        {/* --- DESKTOP MENU --- */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={(e) => handleNavClick(e, 'home')} className="nav-link">Beranda</button>

          {/* DROPDOWN TENTANG KAMI */}
          <div 
            className="relative h-20 flex items-center"
            onMouseEnter={() => setActiveDropdown('about')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className={`nav-link flex items-center gap-1.5 ${activeDropdown === 'about' ? 'text-blue-400' : ''}`}>
              Tentang Kami <ChevronDown size={10} className={`transition-transform duration-300 ${activeDropdown === 'about' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'about' && (
              <div className="dropdown-container">
                <div className="dropdown-content">
                  <button onClick={(e) => handleNavClick(e, 'about', 'sejarah')} className="dropdown-item">Sejarah</button>
                  <button onClick={(e) => handleNavClick(e, 'about', 'visi-misi')} className="dropdown-item">Visi & Misi</button>
                  <button onClick={(e) => handleNavClick(e, 'about', 'fasilitas')} className="dropdown-item">Fasilitas</button>
                </div>
              </div>
            )}
          </div>

          <button onClick={(e) => handleNavClick(e, 'news')} className="nav-link">Berita</button>

          {/* DROPDOWN ATLET */}
          <div 
            className="relative h-20 flex items-center"
            onMouseEnter={() => setActiveDropdown('atlet')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className={`nav-link flex items-center gap-1.5 ${activeDropdown === 'atlet' ? 'text-blue-400' : ''}`}>
              Atlet <ChevronDown size={10} className={`transition-transform duration-300 ${activeDropdown === 'atlet' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'atlet' && (
              <div className="dropdown-container">
                <div className="dropdown-content">
                  <button onClick={(e) => handleNavClick(e, 'atlet', 'Senior')} className="dropdown-item">Atlet Senior</button>
                  <button onClick={(e) => handleNavClick(e, 'atlet', 'Muda')} className="dropdown-item">Atlet Muda</button>
                </div>
              </div>
            )}
          </div>

          <button onClick={(e) => handleNavClick(e, 'rankings')} className="nav-link">Peringkat</button>
          <button onClick={(e) => handleNavClick(e, 'gallery')} className="nav-link">Galeri</button>

          <div className="w-px h-6 bg-white/10 mx-2"></div>

          {/* LANGUAGE PICKER */}
          <div className="relative h-20 flex items-center" onMouseEnter={() => setActiveDropdown('lang')} onMouseLeave={() => setActiveDropdown(null)}>
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all border border-white/10">
              <Globe size={14} className="text-blue-400" />
              <span className="text-[10px] font-black text-white">{currentLang}</span>
              <ChevronDown size={10} />
            </button>
            {activeDropdown === 'lang' && (
              <div className="dropdown-container right-0">
                <div className="dropdown-content">
                  <button onClick={() => { setCurrentLang('ID'); setActiveDropdown(null); }} className="dropdown-item text-center">Indonesia (ID)</button>
                  <button onClick={() => { setCurrentLang('EN'); setActiveDropdown(null); }} className="dropdown-item text-center">English (EN)</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- MOBILE TOGGLE --- */}
        <button className="md:hidden p-2 text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* --- MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-slate-900 border-b border-white/10 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-6 gap-5">
            <button onClick={(e) => handleNavClick(e, 'home')} className="mobile-link">Beranda</button>
            <div className="h-px bg-white/5" />
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Kategori Atlet</p>
            <button onClick={(e) => handleNavClick(e, 'atlet', 'Senior')} className="mobile-link text-blue-400 pl-4">Atlet Senior</button>
            <button onClick={(e) => handleNavClick(e, 'atlet', 'Muda')} className="mobile-link text-blue-400 pl-4">Atlet Muda</button>
            <div className="h-px bg-white/5" />
            <button onClick={(e) => handleNavClick(e, 'rankings')} className="mobile-link">Peringkat</button>
            <button onClick={(e) => handleNavClick(e, 'gallery')} className="mobile-link">Galeri</button>
            <button onClick={(e) => handleNavClick(e, 'about')} className="mobile-link">Tentang Kami</button>
          </div>
        </div>
      )}

      {/* --- STYLES --- */}
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
          width: 14rem;
          padding-top: 1rem;
          animation: dropdownSlide 0.2s ease-out;
        }
        
        .dropdown-content {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        }
        
        .dropdown-item {
          width: 100%;
          text-align: left;
          padding: 1rem 1.5rem;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #e2e8f0;
          border-bottom: 1px solid rgba(51, 65, 85, 0.5);
          transition: all 0.2s;
        }
        .dropdown-item:last-child { border: none; }
        .dropdown-item:hover { background: #2563eb; color: white; }

        .mobile-link {
          text-align: left;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: white;
        }

        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
}