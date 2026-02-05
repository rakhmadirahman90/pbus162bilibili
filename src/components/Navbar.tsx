import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string, tabId?: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState('ID');

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

        {/* MENU NAVIGASI UTAMA */}
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => onNavigate('home')} 
            className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-300 hover:text-white transition-colors"
          >
            Beranda
          </button>

          {/* DROPDOWN TENTANG KAMI */}
          <div 
            className="relative h-20 flex items-center"
            onMouseEnter={() => setActiveDropdown('about')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors ${activeDropdown === 'about' ? 'text-blue-400' : 'text-slate-300 hover:text-white'}`}>
              Tentang Kami <ChevronDown size={10} className={`transition-transform duration-300 ${activeDropdown === 'about' ? 'rotate-180' : ''}`} />
            </button>
            
            {activeDropdown === 'about' && (
              <div className="absolute top-[80%] left-0 w-52 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  <button onClick={() => { onNavigate('about', 'sejarah'); setActiveDropdown(null); }} className="w-full text-left px-6 py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-slate-200 hover:bg-blue-600 hover:text-white transition-all border-b border-slate-700/50">Sejarah</button>
                  <button onClick={() => { onNavigate('about', 'visi-misi'); setActiveDropdown(null); }} className="w-full text-left px-6 py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-slate-200 hover:bg-blue-600 hover:text-white transition-all border-b border-slate-700/50">Visi & Misi</button>
                  <button onClick={() => { onNavigate('about', 'fasilitas'); setActiveDropdown(null); }} className="w-full text-left px-6 py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-slate-200 hover:bg-blue-600 hover:text-white transition-all">Fasilitas</button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => onNavigate('news')} className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-300 hover:text-white transition-colors">Berita</button>

          {/* DROPDOWN ATLET */}
          <div 
            className="relative h-20 flex items-center"
            onMouseEnter={() => setActiveDropdown('atlet')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors ${activeDropdown === 'atlet' ? 'text-blue-400' : 'text-slate-300 hover:text-white'}`}>
              Atlet <ChevronDown size={10} className={`transition-transform duration-300 ${activeDropdown === 'atlet' ? 'rotate-180' : ''}`} />
            </button>
            
            {activeDropdown === 'atlet' && (
              <div className="absolute top-[80%] left-0 w-52 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  <button onClick={() => { onNavigate('atlet', 'Atlet Senior'); setActiveDropdown(null); }} className="w-full text-left px-6 py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-slate-200 hover:bg-blue-600 hover:text-white transition-all border-b border-slate-700/50">Atlet Senior</button>
                  <button onClick={() => { onNavigate('atlet', 'Atlet Muda'); setActiveDropdown(null); }} className="w-full text-left px-6 py-4 text-[10px] font-bold tracking-[0.1em] uppercase text-slate-200 hover:bg-blue-600 hover:text-white transition-all">Atlet Muda</button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => onNavigate('rankings')} className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-300 hover:text-white transition-colors">Peringkat</button>
          <button onClick={() => onNavigate('gallery')} className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-300 hover:text-white transition-colors">Galeri</button>

          {/* SEPARATOR */}
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
              <div className="absolute top-[80%] right-0 w-32 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  <button onClick={() => { setCurrentLang('ID'); setActiveDropdown(null); }} className={`w-full text-center px-4 py-3 text-[10px] font-bold uppercase transition-all border-b border-slate-700/50 ${currentLang === 'ID' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}>Bahasa (ID)</button>
                  <button onClick={() => { setCurrentLang('EN'); setActiveDropdown(null); }} className={`w-full text-center px-4 py-3 text-[10px] font-bold uppercase transition-all ${currentLang === 'EN' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}>English (EN)</button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}