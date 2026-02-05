import React, { useState } from 'react';
import { Globe, ChevronDown, Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string, tabId?: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (section: string, tab?: string) => {
    onNavigate(section, tab);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-md text-white z-[100] h-20 border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        {/* LOGO */}
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => handleNavClick('home')}>
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-white flex items-center justify-center">
            <img src="/photo_2026-02-03_00-32-07.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight">US 162 <span className="text-blue-500">BILIBILI</span></span>
            <span className="text-[8px] text-slate-400 tracking-[0.3em] uppercase">Professional Badminton</span>
          </div>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => handleNavClick('home')} className="text-[11px] font-bold uppercase tracking-widest hover:text-blue-400 transition-colors">Beranda</button>
          
          {/* DROPDOWN ATLET */}
          <div className="relative h-20 flex items-center" onMouseEnter={() => setActiveDropdown('atlet')} onMouseLeave={() => setActiveDropdown(null)}>
            <button className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1">
              Atlet <ChevronDown size={10} />
            </button>
            {activeDropdown === 'atlet' && (
              <div className="absolute top-[80%] left-0 w-48 pt-4 animate-in fade-in slide-in-from-top-2">
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                  <button onClick={() => handleNavClick('atlet', 'Senior')} className="w-full text-left px-5 py-3 text-[10px] font-bold uppercase hover:bg-blue-600 transition-colors">Atlet Senior</button>
                  <button onClick={() => handleNavClick('atlet', 'Muda')} className="w-full text-left px-5 py-3 text-[10px] font-bold uppercase hover:bg-blue-600 transition-colors">Atlet Muda</button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => handleNavClick('rankings')} className="text-[11px] font-bold uppercase tracking-widest hover:text-blue-400">Peringkat</button>
          <button onClick={() => handleNavClick('gallery')} className="text-[11px] font-bold uppercase tracking-widest hover:text-blue-400">Galeri</button>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/10 p-6 flex flex-col gap-4 uppercase font-bold text-xs">
          <button onClick={() => handleNavClick('atlet', 'Senior')} className="text-blue-400">Atlet Senior</button>
          <button onClick={() => handleNavClick('atlet', 'Muda')} className="text-blue-400">Atlet Muda</button>
          <button onClick={() => handleNavClick('rankings')}>Peringkat</button>
        </div>
      )}
    </nav>
  );
}