import React, { useState } from 'react';

interface NavbarProps {
  onNavigate: (sectionId: string, tabId?: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-slate-900 text-white z-[100] h-20 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-full">
        <div className="font-black text-xl cursor-pointer" onClick={() => onNavigate('home')}>
          PB US 162
        </div>

        <div className="flex gap-6 items-center font-bold text-xs uppercase tracking-widest">
          <button onClick={() => onNavigate('home')} className="hover:text-blue-400">Beranda</button>
          
          {/* Menu Dropdown Tentang */}
          <div className="relative group">
            <button 
              className="hover:text-blue-400 flex items-center gap-1"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onClick={() => onNavigate('about')}
            >
              Tentang ▼
            </button>
            
            {isDropdownOpen && (
              <div 
                className="absolute top-full left-0 w-40 bg-white text-slate-900 shadow-xl rounded-lg py-2 mt-0"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button onClick={() => onNavigate('about', 'sejarah')} className="block w-full text-left px-4 py-2 hover:bg-slate-100">Sejarah</button>
                <button onClick={() => onNavigate('about', 'visi-misi')} className="block w-full text-left px-4 py-2 hover:bg-slate-100">Visi Misi</button>
                <button onClick={() => onNavigate('about', 'fasilitas')} className="block w-full text-left px-4 py-2 hover:bg-slate-100">Fasilitas</button>
              </div>
            )}
          </div>

          <button onClick={() => onNavigate('berita')} className="hover:text-blue-400">Berita</button>
          <button onClick={() => onNavigate('atlet')} className="hover:text-blue-400">Atlet</button>
          <button onClick={() => onNavigate('peringkat')} className="hover:text-blue-400">Peringkat</button>
          <button onClick={() => onNavigate('galeri')} className="hover:text-blue-400">Galeri</button>
        </div>
      </div>
    </nav>
  );
}