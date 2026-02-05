import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string, tabId?: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Mengubah tampilan navbar saat scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handler navigasi yang menutup menu mobile secara otomatis
  const handleNavClick = (sectionId: string, tabId?: string) => {
    onNavigate(sectionId, tabId);
    setIsOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <nav className={`fixed w-full z-[100] transition-all duration-300 ${
      isScrolled ? 'bg-[#050505]/90 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* --- LOGO US 162 --- */}
        <div 
          className="text-2xl font-black italic cursor-pointer tracking-tighter"
          onClick={() => handleNavClick('home')}
        >
          US 162<span className="text-blue-600">.</span>
        </div>

        {/* --- DESKTOP MENU --- */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => handleNavClick('home')} className="text-[11px] font-black tracking-[0.2em] hover:text-blue-500 transition-colors uppercase">Home</button>
          <button onClick={() => handleNavClick('news')} className="text-[11px] font-black tracking-[0.2em] hover:text-blue-500 transition-colors uppercase">News</button>
          
          {/* DROPDOWN ATLET */}
          <div 
            className="relative group"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="flex items-center gap-1 text-[11px] font-black tracking-[0.2em] group-hover:text-blue-500 transition-colors uppercase">
              Athletes <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            <div className={`absolute top-full -left-4 w-48 pt-4 transition-all duration-300 ${isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <button onClick={() => handleNavClick('atlet', 'Semua')} className="w-full text-left px-6 py-4 text-[10px] font-black tracking-widest hover:bg-blue-600 transition-colors uppercase">Semua Atlet</button>
                <button onClick={() => handleNavClick('atlet', 'Senior')} className="w-full text-left px-6 py-4 text-[10px] font-black tracking-widest hover:bg-blue-600 transition-colors uppercase border-t border-white/5">Senior</button>
                <button onClick={() => handleNavClick('atlet', 'Muda')} className="w-full text-left px-6 py-4 text-[10px] font-black tracking-widest hover:bg-blue-600 transition-colors uppercase border-t border-white/5">Muda</button>
              </div>
            </div>
          </div>

          <button onClick={() => handleNavClick('rankings')} className="text-[11px] font-black tracking-[0.2em] hover:text-blue-500 transition-colors uppercase">Rankings</button>
          <button onClick={() => handleNavClick('gallery')} className="text-[11px] font-black tracking-[0.2em] hover:text-blue-500 transition-colors uppercase">Gallery</button>
          <button onClick={() => handleNavClick('about')} className="text-[11px] font-black tracking-[0.2em] hover:text-blue-500 transition-colors uppercase">About</button>
        </div>

        {/* --- MOBILE TOGGLE --- */}
        <button className="md:hidden text-white p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* --- MOBILE MENU PANEL --- */}
      <div className={`fixed inset-0 top-0 bg-black z-[90] transition-transform duration-500 md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full pt-32 px-10 gap-8">
          <button onClick={() => handleNavClick('home')} className="text-4xl font-black italic text-left uppercase">Home</button>
          <button onClick={() => handleNavClick('news')} className="text-4xl font-black italic text-left uppercase">News</button>
          
          {/* Mobile Atlet Sub-menu */}
          <div className="space-y-4">
            <p className="text-4xl font-black italic text-left uppercase text-blue-600">Athletes</p>
            <div className="flex flex-col gap-4 pl-6 border-l-2 border-zinc-800">
              <button onClick={() => handleNavClick('atlet', 'Senior')} className="text-xl font-bold text-left text-zinc-400 hover:text-white uppercase italic">Senior</button>
              <button onClick={() => handleNavClick('atlet', 'Muda')} className="text-xl font-bold text-left text-zinc-400 hover:text-white uppercase italic">Muda</button>
            </div>
          </div>

          <button onClick={() => handleNavClick('rankings')} className="text-4xl font-black italic text-left uppercase">Rankings</button>
          <button onClick={() => handleNavClick('about')} className="text-4xl font-black italic text-left uppercase">About</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;