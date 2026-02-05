import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string, tabId?: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Helper untuk navigasi dan tutup menu mobile otomatis
  const handleNavClick = (sectionId: string, tabId?: string) => {
    onNavigate(sectionId, tabId);
    setIsOpen(false); // Tutup menu mobile setelah klik
    setIsDropdownOpen(false); // Tutup dropdown setelah klik
  };

  return (
    <nav className="fixed w-full z-[100] bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO */}
        <div 
          className="text-2xl font-black italic cursor-pointer tracking-tighter"
          onClick={() => handleNavClick('home')}
        >
          US 162<span className="text-blue-600">.</span>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => handleNavClick('home')} className="text-sm font-bold hover:text-blue-500 transition-colors">HOME</button>
          <button onClick={() => handleNavClick('news')} className="text-sm font-bold hover:text-blue-500 transition-colors">BERITA</button>
          
          {/* DROPDOWN ATLET */}
          <div className="relative group">
            <button 
              className="flex items-center gap-1 text-sm font-bold hover:text-blue-500 transition-colors"
              onMouseEnter={() => setIsDropdownOpen(true)}
            >
              ATLET <ChevronDown size={14} />
            </button>
            
            <div 
              className={`absolute top-full -left-4 w-48 pt-4 transition-all duration-300 ${isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <button onClick={() => handleNavClick('atlet', 'Semua')} className="w-full text-left px-6 py-3 text-[11px] font-black hover:bg-blue-600 transition-colors">SEMUA ATLET</button>
                <button onClick={() => handleNavClick('atlet', 'Senior')} className="w-full text-left px-6 py-3 text-[11px] font-black hover:bg-blue-600 transition-colors">ATLET SENIOR</button>
                <button onClick={() => handleNavClick('atlet', 'Muda')} className="w-full text-left px-6 py-3 text-[11px] font-black hover:bg-blue-600 transition-colors">ATLET MUDA</button>
              </div>
            </div>
          </div>

          <button onClick={() => handleNavClick('rankings')} className="text-sm font-bold hover:text-blue-500 transition-colors">RANKING</button>
          <button onClick={() => handleNavClick('about')} className="text-sm font-bold hover:text-blue-500 transition-colors">TENTANG</button>
        </div>

        {/* MOBILE TOGGLE */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU PANEL */}
      <div className={`fixed inset-0 top-20 bg-black z-50 transition-transform duration-500 md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col p-8 gap-6">
          <button onClick={() => handleNavClick('home')} className="text-3xl font-black text-left">HOME</button>
          <button onClick={() => handleNavClick('news')} className="text-3xl font-black text-left">BERITA</button>
          
          <div className="flex flex-col gap-4 border-l-2 border-blue-600 pl-4 py-2">
            <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Kategori Atlet</p>
            <button onClick={() => handleNavClick('atlet', 'Senior')} className="text-2xl font-black text-left text-blue-500">SENIOR</button>
            <button onClick={() => handleNavClick('atlet', 'Muda')} className="text-2xl font-black text-left text-blue-500">MUDA</button>
          </div>

          <button onClick={() => handleNavClick('rankings')} className="text-3xl font-black text-left">RANKING</button>
          <button onClick={() => handleNavClick('about')} className="text-3xl font-black text-left">TENTANG</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;