import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  activeSection: string;
  onTabChange: (tabId: string) => void;
}

const translations = {
  id: {
    home: 'Beranda', about: 'Tentang', history: 'Sejarah',
    facilities: 'Fasilitas', achievements: 'Prestasi',
    news: 'Berita', players: 'Atlet', rankings: 'Peringkat',
    gallery: 'Galeri', subtitle: 'Keunggulan dalam Olahraga',
  },
  en: {
    home: 'Home', about: 'About', history: 'History',
    facilities: 'Facilities', achievements: 'Achievements',
    news: 'News', players: 'Athletes', rankings: 'Rankings',
    gallery: 'Gallery', subtitle: 'Excellence in Sports',
  }
};

export default function Navbar({ activeSection, onTabChange }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);

  const t = translations[lang];

  // Helper untuk navigasi sub-menu (Tentang > Sub)
  const handleSubMenuClick = (tabId: string) => {
    onTabChange(tabId); 
    scrollToSection('about');
  };

  // Helper untuk scroll halus ke ID section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setIsOpen(false); // Tutup menu mobile
    setShowAboutDropdown(false); // Tutup dropdown
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-900 text-white z-[100] shadow-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO & BRAND */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => scrollToSection('home')}>
            <div className="relative">
              <img 
                src="/photo_2026-02-03_00-32-07.jpg" 
                alt="Logo PB US 162" 
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 group-hover:scale-105 transition-transform" 
              />
              <div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">PB US 162</h1>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.15em] mt-1">{t.subtitle}</p>
            </div>
          </div>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center space-x-1">
            <button onClick={() => scrollToSection('home')} className={`px-4 py-2 text-sm font-bold transition-colors hover:text-blue-400 ${activeSection === 'home' ? 'text-blue-400' : 'text-slate-300'}`}>{t.home}</button>
            
            {/* Dropdown Tentang */}
            <div className="relative" onMouseEnter={() => setShowAboutDropdown(true)} onMouseLeave={() => setShowAboutDropdown(false)}>
              <button 
                onClick={() => scrollToSection('about')}
                className={`flex items-center gap-1 px-4 py-2 text-sm font-bold transition-colors hover:text-blue-400 ${activeSection === 'about' ? 'text-blue-400' : 'text-slate-300'}`}
              >
                {t.about} <ChevronDown size={14} className={`transition-transform duration-300 ${showAboutDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showAboutDropdown && (
                <div className="absolute left-0 mt-0 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <button onClick={() => handleSubMenuClick('sejarah')} className="block w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-blue-600 hover:text-white transition-colors">{t.history}</button>
                  <button onClick={() => handleSubMenuClick('fasilitas')} className="block w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-blue-600 hover:text-white transition-colors">{t.facilities}</button>
                  <button onClick={() => handleSubMenuClick('prestasi')} className="block w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-blue-600 hover:text-white transition-colors">{t.achievements}</button>
                </div>
              )}
            </div>

            <button onClick={() => scrollToSection('news')} className={`px-4 py-2 text-sm font-bold transition-colors hover:text-blue-400 ${activeSection === 'news' ? 'text-blue-400' : 'text-slate-300'}`}>{t.news}</button>
            <button onClick={() => scrollToSection('players')} className={`px-4 py-2 text-sm font-bold transition-colors hover:text-blue-400 ${activeSection === 'players' ? 'text-blue-400' : 'text-slate-300'}`}>{t.players}</button>
            <button onClick={() => scrollToSection('rankings')} className={`px-4 py-2 text-sm font-bold transition-colors hover:text-blue-400 ${activeSection === 'rankings' ? 'text-blue-400 bg-blue-500/10 rounded-lg' : 'text-slate-300'}`}>{t.rankings}</button>
            <button onClick={() => scrollToSection('gallery')} className={`px-4 py-2 text-sm font-bold transition-colors hover:text-blue-400 ${activeSection === 'gallery' ? 'text-blue-400' : 'text-slate-300'}`}>{t.gallery}</button>

            {/* Language Switcher Desktop */}
            <div className="relative ml-4 pl-4 border-l border-slate-700">
              <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-1.5 text-xs font-black tracking-widest hover:text-blue-400 transition-colors bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                <Globe size={14} /> {lang.toUpperCase()}
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-[110]">
                  <button onClick={() => { setLang('id'); setShowLangMenu(false); }} className="block w-full px-4 py-2 text-[10px] font-bold hover:bg-slate-700 transition-colors">INDONESIA</button>
                  <button onClick={() => { setLang('en'); setShowLangMenu(false); }} className="block w-full px-4 py-2 text-[10px] font-bold hover:bg-slate-700 transition-colors">ENGLISH</button>
                </div>
              )}
            </div>
          </div>

          {/* MOBILE TOGGLE */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 h-screen overflow-y-auto">
          <div className="px-4 py-8 space-y-4">
            <button onClick={() => scrollToSection('home')} className="block w-full text-left text-2xl font-black">{t.home}</button>
            
            {/* Mobile Tentang Accordion */}
            <div className="space-y-3">
              <div className="text-blue-400 font-black text-xs uppercase tracking-[0.2em]">{t.about}</div>
              <div className="pl-4 space-y-4 border-l-2 border-slate-800">
                <button onClick={() => handleSubMenuClick('sejarah')} className="block w-full text-left text-lg text-slate-400 font-bold">{t.history}</button>
                <button onClick={() => handleSubMenuClick('fasilitas')} className="block w-full text-left text-lg text-slate-400 font-bold">{t.facilities}</button>
                <button onClick={() => handleSubMenuClick('prestasi')} className="block w-full text-left text-lg text-slate-400 font-bold">{t.achievements}</button>
              </div>
            </div>

            <button onClick={() => scrollToSection('news')} className="block w-full text-left text-2xl font-black text-slate-300">{t.news}</button>
            <button onClick={() => scrollToSection('players')} className="block w-full text-left text-2xl font-black text-slate-300">{t.players}</button>
            <button onClick={() => scrollToSection('rankings')} className="block w-full text-left text-2xl font-black text-blue-400">{t.rankings}</button>
            <button onClick={() => scrollToSection('gallery')} className="block w-full text-left text-2xl font-black text-slate-300">{t.gallery}</button>
            
            {/* Mobile Lang Switcher */}
            <div className="pt-8 border-t border-slate-800 flex gap-3">
              <button onClick={() => setLang('id')} className={`flex-1 py-3 rounded-xl font-bold text-sm ${lang === 'id' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>ID</button>
              <button onClick={() => setLang('en')} className={`flex-1 py-3 rounded-xl font-bold text-sm ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>EN</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}