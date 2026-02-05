import React, { useState } from 'react';

interface NavbarProps {
  onNavigate: (sectionId: string, tabId?: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm text-white z-[100] h-20 border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
        
        {/* LOGO: Kotak Biru dengan Teks Putih & Nama Klub */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => onNavigate('home')}
        >
          {/* Ikon Kotak PB */}
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl italic shadow-lg group-hover:bg-blue-500 transition-colors">
            PB
          </div>
          {/* Nama Klub */}
          <div className="flex flex-col leading-none">
            <span className="font-black text-xl tracking-tighter">
              US 162 <span className="text-blue-500">BILIBILI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">Badminton Club</span>
          </div>
        </div>

        {/* MENU NAVIGASI: Tentang Kami sekarang di urutan ke-2 */}
        <div className="hidden md:flex items-center gap-8">
          {/* 1. Beranda */}
          <button 
            onClick={() => onNavigate('home')} 
            className="text-xs font-black uppercase tracking-widest hover:text-blue-500 transition-colors"
          >
            Beranda
          </button>

          {/* 2. Tentang Kami (Dropdown) */}
          <div className="relative group">
            <button 
              onMouseEnter={() => setIsDropdownOpen(true)}
              onClick={() => onNavigate('about')}
              className="flex items-center gap-1 text-xs font-black uppercase tracking-widest hover:text-blue-500 transition-colors"
            >
              Tentang Kami <span className="text-[8px] ml-1">▼</span>
            </button>
            
            {isDropdownOpen && (
              <div 
                className="absolute top-full left-0 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-2xl py-2 mt-2"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button 
                  onClick={() => { onNavigate('about', 'sejarah'); setIsDropdownOpen(false); }}
                  className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-blue-600 transition-colors"
                >
                  SEJARAH
                </button>
                <button 
                  onClick={() => { onNavigate('about', 'visi-misi'); setIsDropdownOpen(false); }}
                  className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-blue-600 transition-colors"
                >
                  VISI & MISI
                </button>
                <button 
                  onClick={() => { onNavigate('about', 'fasilitas'); setIsDropdownOpen(false); }}
                  className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-blue-600 transition-colors"
                >
                  FASILITAS
                </button>
              </div>
            )}
          </div>

          {/* 3. Berita */}
          <button 
            onClick={() => onNavigate('news')} 
            className="text-xs font-black uppercase tracking-widest hover:text-blue-500 transition-colors"
          >
            Berita
          </button>

          {/* 4. Atlet */}
          <button 
            onClick={() => onNavigate('players')} 
            className="text-xs font-black uppercase tracking-widest hover:text-blue-500 transition-colors"
          >
            Atlet
          </button>

          {/* 5. Peringkat */}
          <button 
            onClick={() => onNavigate('rankings')} 
            className="text-xs font-black uppercase tracking-widest hover:text-blue-500 transition-colors"
          >
            Peringkat
          </button>

          {/* 6. Galeri */}
          <button 
            onClick={() => onNavigate('gallery')} 
            className="text-xs font-black uppercase tracking-widest hover:text-blue-500 transition-colors"
          >
            Galeri
          </button>
        </div>
      </div>
    </nav>
  );
}