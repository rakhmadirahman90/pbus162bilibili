import React, { useState } from 'react';

interface NavbarProps {
  onNavigate: (sectionId: string, tabId?: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-md text-white z-[100] h-20 border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        
        {/* LOGO SECTION */}
        <div 
          className="flex items-center gap-4 cursor-pointer group" 
          onClick={() => onNavigate('home')}
        >
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border border-white/10 group-hover:scale-105 transition-transform duration-300 bg-white flex items-center justify-center">
            <img 
              src="/photo_2026-02-03_00-32-07.jpg" 
              alt="Logo PB" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-tight leading-none mb-1">
              US 162 <span className="text-blue-500">BILIBILI</span>
            </span>
            <span className="text-[9px] text-slate-400 font-medium tracking-[0.3em] uppercase">
              Professional Badminton
            </span>
          </div>
        </div>

        {/* MENU NAVIGASI */}
        <div className="hidden md:flex items-center gap-10">
          <button 
            onClick={() => onNavigate('home')} 
            className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-300 hover:text-white transition-colors"
          >
            Beranda
          </button>

          {/* DROPDOWN TENTANG KAMI */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('about')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button 
              onClick={() => onNavigate('about')}
              className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors ${activeDropdown === 'about' ? 'text-blue-400' : 'text-slate-300 hover:text-white'}`}
            >
              Tentang Kami <span className={`text-[7px] transition-transform duration-300 ${activeDropdown === 'about' ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {activeDropdown === 'about' && (
              <div className="absolute top-full left-0 w-56 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  <button onClick={() => { onNavigate('about', 'sejarah'); setActiveDropdown(null); }} className="w-full text-left px-6 py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-slate-200 hover:bg-blue-600 hover:text-white transition-all border-b border-slate-700/50">Sejarah</button>
                  <button onClick={() => { onNavigate('about', 'visi-misi'); setActiveDropdown(null); }} className="w-full text-left px-6 py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-slate-200 hover:bg-blue-600 hover:text-white transition-all border-b border-slate-700/50">Visi & Misi</button>
                  <button onClick={() => { onNavigate('about', 'fasilitas'); setActiveDropdown(null); }} className="w-full text-left px-6 py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-slate-200 hover:bg-blue-600 hover:text-white transition-all">Fasilitas</button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => onNavigate('news')} className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-300 hover:text-white transition-colors">Berita</button>

          {/* DROPDOWN ATLET - BARU */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('atlet')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button 
              onClick={() => onNavigate('atlet')}
              className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors ${activeDropdown === 'atlet' ? 'text-blue-400' : 'text-slate-300 hover:text-white'}`}
            >
              Atlet <span className={`text-[7px] transition-transform duration-300 ${activeDropdown === 'atlet' ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {activeDropdown === 'atlet' && (
              <div className="absolute top-full left-0 w-56 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  <button 
                    onClick={() => { onNavigate('atlet', 'Atlet Senior'); setActiveDropdown(null); }} 
                    className="w-full text-left px-6 py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-slate-200 hover:bg-blue-600 hover:text-white transition-all border-b border-slate-700/50"
                  >
                    Atlet Senior
                  </button>
                  <button 
                    onClick={() => { onNavigate('atlet', 'Atlet Muda'); setActiveDropdown(null); }} 
                    className="w-full text-left px-6 py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-slate-200 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    Atlet Muda
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => onNavigate('rankings')} className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-300 hover:text-white transition-colors">Peringkat</button>
          <button onClick={() => onNavigate('gallery')} className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-300 hover:text-white transition-colors">Galeri</button>
        </div>
      </div>
    </nav>
  );
}