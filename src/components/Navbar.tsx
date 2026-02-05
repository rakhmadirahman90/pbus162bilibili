import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string, tabId?: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const menuItems = [
    { name: 'Beranda', id: 'home' },
    { name: 'Berita', id: 'news' },
    { name: 'Atlet', id: 'players' },
    { name: 'Peringkat', id: 'rankings' },
    { name: 'Galeri', id: 'gallery' },
  ];

  const aboutTabs = [
    { name: 'Sejarah', id: 'sejarah' },
    { name: 'Visi & Misi', id: 'visi-misi' },
    { name: 'Fasilitas', id: 'fasilitas' },
  ];

  return (
    <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm text-white z-[100] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => onNavigate('home')}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl italic">
            PB
          </div>
          <span className="font-black text-xl tracking-tighter">US 162 <span className="text-blue-500">BILIBILI</span></span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="text-sm font-bold uppercase tracking-widest hover:text-blue-400 transition-colors"
            >
              {item.name}
            </button>
          ))}

          {/* Dropdown Tentang */}
          <div className="relative">
            <button 
              onMouseEnter={() => setIsDropdownOpen(true)}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 text-sm font-bold uppercase tracking-widest hover:text-blue-400 transition-colors"
            >
              Tentang <ChevronDown size={16} />
            </button>

            {isDropdownOpen && (
              <div 
                className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                {aboutTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onNavigate('about', tab.id);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-blue-600 transition-colors"
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t border-white/10 p-4 space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsOpen(false);
              }}
              className="block w-full text-left font-bold uppercase tracking-widest text-sm"
            >
              {item.name}
            </button>
          ))}
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-slate-500 mb-2 uppercase font-black">Tentang Kami</p>
            {aboutTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onNavigate('about', tab.id);
                  setIsOpen(false);
                }}
                className="block w-full text-left py-2 text-blue-400"
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}