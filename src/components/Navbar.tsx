import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string, tabId?: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fungsi untuk mendeteksi scroll
  useEffect(() => {
    const handleScroll = () => {
      // Navbar berubah warna setelah scroll lebih dari 50px
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string, tabId?: string) => {
    onNavigate(sectionId, tabId);
    setIsOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <nav 
      className={`fixed w-full z-[100] transition-all duration-500 ${
        isScrolled 
          ? 'bg-blue-700 shadow-lg py-3' // Warna Biru saat di-scroll
          : 'bg-transparent py-5'        // Transparan saat di posisi atas
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* --- LOGO & BRAND --- */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => handleNavClick('home')}
        >
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
             {/* Logo Icon Sederhana */}
             <div className="w-6 h-6 bg-blue-600 rounded-sm"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-white leading-none">
              US 162 <span className={isScrolled ? 'text-blue-200' : 'text-blue-500'}>BILIBILI</span>
            </span>
            <span className="text-[8px] font-bold tracking-[0.2em] text-white/80 uppercase">
              Professional Badminton
            </span>
          </div>
        </div>

        {/* --- DESKTOP MENU --- */}
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => handleNavClick('home')} className="text-[11px] font-bold tracking-widest hover:text-blue-200 transition-colors uppercase text-white">Beranda</button>
          
          {/* TENTANG KAMI (Contoh dropdown) */}
          <button onClick={() => handleNavClick('about')} className="text-[11px] font-bold tracking-widest hover:text-blue-200 transition-colors uppercase text-white">Tentang Kami</button>
          
          <button onClick={() => handleNavClick('news')} className="text-[11px] font-bold tracking-widest hover:text-blue-200 transition-colors uppercase text-white">Berita</button>
          
          {/* DROPDOWN ATLET */}
          <div 
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="flex items-center gap-1 text-[11px] font-bold tracking-widest hover:text-blue-200 transition-colors uppercase text-white">
              Atlet <ChevronDown size={14} />
            </button>
            
            <div className={`absolute top-full -left-4 w-48 pt-4 transition-all duration-300 ${isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
              <div className="bg-white rounded-xl overflow-hidden shadow-xl py-2">
                <button onClick={() => handleNavClick('atlet', 'Semua')} className="w-full text-left px-5 py-2 text-[10px] font-bold text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors">SEMUA ATLET</button>
                <button onClick={() => handleNavClick('atlet', 'Senior')} className="w-full text-left px-5 py-2 text-[10px] font-bold text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors">SENIOR</button>
                <button onClick={() => handleNavClick('atlet', 'Muda')} className="w-full text-left px-5 py-2 text-[10px] font-bold text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors">MUDA</button>
              </div>
            </div>
          </div>

          <button onClick={() => handleNavClick('rankings')} className="text-[11px] font-bold tracking-widest hover:text-blue-200 transition-colors uppercase text-white">Peringkat</button>
          <button onClick={() => handleNavClick('gallery')} className="text-[11px] font-bold tracking-widest hover:text-blue-200 transition-colors uppercase text-white">Galeri</button>
        </div>

        {/* --- MOBILE TOGGLE --- */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- MOBILE MENU PANEL --- */}
      <div className={`fixed inset-0 top-0 bg-blue-800 z-[90] transition-transform duration-500 md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full pt-24 px-8 gap-6">
          <button onClick={() => handleNavClick('home')} className="text-2xl font-black text-white text-left uppercase">Beranda</button>
          <button onClick={() => handleNavClick('about')} className="text-2xl font-black text-white text-left uppercase">Tentang Kami</button>
          <button onClick={() => handleNavClick('atlet')} className="text-2xl font-black text-white text-left uppercase border-b border-white/10 pb-2">Atlet</button>
          <div className="flex flex-col gap-3 pl-4">
             <button onClick={() => handleNavClick('atlet', 'Senior')} className="text-lg font-bold text-blue-200 text-left">Senior</button>
             <button onClick={() => handleNavClick('atlet', 'Muda')} className="text-lg font-bold text-blue-200 text-left">Muda</button>
          </div>
          <button onClick={() => handleNavClick('rankings')} className="text-2xl font-black text-white text-left uppercase">Peringkat</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;