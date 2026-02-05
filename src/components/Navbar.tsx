import React, { useState } from 'react';

interface NavbarProps {
  onNavigate: (sectionId: string, tabId?: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-md text-white z-[100] h-20 border-b border-white/5 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        
        {/* LOGO: Menggunakan Image dari folder public */}
        <div 
          className="flex items-center gap-4 cursor-pointer group" 
          onClick={() => onNavigate('home')}
        >
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform duration-300 bg-white flex items-center justify-center">
            <img 
              src="/photo_2026-02-03_00-32-07.jpg" 
              alt="Logo PB US 162" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback jika gambar gagal dimuat
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="font-bold text-blue-600">PB</div>';
              }}
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
            className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-300 hover:text-blue-400 transition-all duration-300"
          >
            Beranda
          </button>

          {/* 2. Tentang Kami (Dropdown) */}
          <div className="relative group">
            <button 
              onMouseEnter={() => setIsDropdownOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-300 hover:text-blue-400 transition-all duration-300"
            >
              Tentang Kami <span className="text-[7px] opacity-50 group-hover:rotate-180 transition-transform duration-300">▼</span>
            </button>
            
            {isDropdownOpen && (
              <div 
                className="absolute top-full left-0 w-52 bg-slate-900/98 border border-white/10 rounded-xl shadow-2xl py-3 mt-2 backdrop-blur-xl"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button 
                  onClick={() => { onNavigate('about', 'sejarah'); setIsDropdownOpen(false); }}
                  className="w-full text-left px-6 py-2.5 text-[10px] font-bold tracking-[0.1em] uppercase hover:bg-blue-600 transition-colors"
                >
                  SEJARAH
                </button>
                <button 
                  onClick={() => { onNavigate('about', 'visi-misi'); setIsDropdownOpen(false); }}
                  className="w-full text-left px-6 py-2.5 text-[10px] font-bold tracking-[0.1em] uppercase hover:bg-blue-600 transition-colors"
                >
                  VISI & MISI
                </button>
                <button 
                  onClick={() => { onNavigate('about', 'fasilitas'); setIsDropdownOpen(false); }}
                  className="w-full text-left px-6 py-2.5 text-[10px] font-bold tracking-[0.1em] uppercase hover:bg-blue-600 transition-colors"
                >
                  FASILITAS
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => onNavigate('news')} 
            className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-300 hover:text-blue-400 transition-all duration-300"
          >
            Berita
          </button>

          <button 
            onClick={() => onNavigate('players')} 
            className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-300 hover:text-blue-400 transition-all duration-300"
          >
            Atlet
          </button>

          <button 
            onClick={() => onNavigate('rankings')} 
            className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-300 hover:text-blue-400 transition-all duration-300"
          >
            Peringkat
          </button>

          <button 
            onClick={() => onNavigate('gallery')} 
            className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-300 hover:text-blue-400 transition-all duration-300"
          >
            Galeri
          </button>
        </div>
      </div>
    </nav>
  );
}