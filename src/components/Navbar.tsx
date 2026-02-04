import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  activeSection: string;
}

const translations = {
  id: {
    home: 'Beranda',
    about: 'Tentang',
    history: 'Sejarah',
    facilities: 'Fasilitas',
    achievements: 'Prestasi',
    news: 'Berita',
    players: 'Atlet',
    rankings: 'Peringkat',
    gallery: 'Galeri',
    subtitle: 'Keunggulan dalam Olahraga',
  },
  en: {
    home: 'Home',
    about: 'About',
    history: 'History',
    facilities: 'Facilities',
    achievements: 'Achievements',
    news: 'News',
    players: 'Athletes',
    rankings: 'Rankings',
    gallery: 'Gallery',
    subtitle: 'Excellence in Sports',
  }
};

export default function Navbar({ activeSection }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);

  const t = translations[lang];

  // Logic Scroll dengan tambahan offset agar judul section tidak tertutup navbar
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setIsOpen(false);
    setShowAboutDropdown(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-900 text-white z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Judul */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => scrollToSection('home')}>
            <img
              src="/photo_2026-02-03_00-32-07.jpg"
              alt="Logo"
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight">PB US 162</h1>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{t.subtitle}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <button onClick={() => scrollToSection('home')} className={`px-3 py-2 text-sm font-medium hover:text-blue-400 ${activeSection === 'home' ? 'text-blue-400' : ''}`}>{t.home}</button>
            
            {/* Dropdown Tentang */}
            <div 
              className="relative group"
              onMouseEnter={() => setShowAboutDropdown(true)}
              onMouseLeave={() => setShowAboutDropdown(false)}
            >
              <button 
                onClick={() => scrollToSection('about')}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${activeSection === 'about' ? 'text-blue-400' : 'text-gray-300'}`}
              >
                {t.about} <ChevronDown size={14} className={`transition-transform ${showAboutDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showAboutDropdown && (
                <div className="absolute left-0 mt-0 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
                  <button onClick={() => scrollToSection('about')} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-700 hover:text-blue-400">{t.history}</button>
                  <button onClick={() => scrollToSection('about')} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-700 hover:text-blue-400">{t.facilities}</button>
                  <button onClick={() => scrollToSection('about')} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-700 hover:text-blue-400">{t.achievements}</button>
                </div>
              )}
            </div>

            <button onClick={() => scrollToSection('news')} className="px-3 py-2 text-sm font-medium hover:text-blue-400">{t.news}</button>
            <button onClick={() => scrollToSection('players')} className="px-3 py-2 text-sm font-medium hover:text-blue-400">{t.players}</button>
            <button onClick={() => scrollToSection('rankings')} className="px-3 py-2 text-sm font-medium hover:text-blue-400 text-blue-400 bg-blue-500/10 rounded-lg">{t.rankings}</button>
            <button onClick={() => scrollToSection('gallery')} className="px-3 py-2 text-sm font-medium hover:text-blue-400">{t.gallery}</button>

            {/* Language Switcher */}
            <div className="relative border-l border-slate-700 ml-4 pl-4">
              <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-1 text-sm font-bold hover:text-blue-400 transition-colors">
                <Globe size={16} /> {lang.toUpperCase()}
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                  <button onClick={() => { setLang('id'); setShowLangMenu(false); }} className="block w-full px-4 py-2 text-xs hover:bg-slate-700">INDONESIA</button>
                  <button onClick={() => { setLang('en'); setShowLangMenu(false); }} className="block w-full px-4 py-2 text-xs hover:bg-slate-700">ENGLISH</button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 animate-in slide-in-from-right">
          <div className="px-4 py-6 space-y-2">
            <button onClick={() => scrollToSection('home')} className="block w-full text-left py-3 text-lg font-bold">{t.home}</button>
            
            {/* Mobile About with Sub-items */}
            <div className="py-2">
              <div className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-2">{t.about}</div>
              <div className="pl-4 space-y-3 border-l-2 border-slate-700 ml-1">
                <button onClick={() => scrollToSection('about')} className="block w-full text-left text-gray-400">{t.history}</button>
                <button onClick={() => scrollToSection('about')} className="block w-full text-left text-gray-400">{t.facilities}</button>
                <button onClick={() => scrollToSection('about')} className="block w-full text-left text-gray-400">{t.achievements}</button>
              </div>
            </div>

            <button onClick={() => scrollToSection('news')} className="block w-full text-left py-3 text-lg font-bold text-gray-300">{t.news}</button>
            <button onClick={() => scrollToSection('players')} className="block w-full text-left py-3 text-lg font-bold text-gray-300">{t.players}</button>
            <button onClick={() => scrollToSection('rankings')} className="block w-full text-left py-3 text-lg font-bold text-blue-400">{t.rankings}</button>
            <button onClick={() => scrollToSection('gallery')} className="block w-full text-left py-3 text-lg font-bold text-gray-300">{t.gallery}</button>
            
            <div className="pt-6 flex gap-4">
              <button onClick={() => setLang('id')} className={`px-4 py-2 rounded-lg text-xs font-black ${lang === 'id' ? 'bg-blue-600' : 'bg-slate-800'}`}>ID</button>
              <button onClick={() => setLang('en')} className={`px-4 py-2 rounded-lg text-xs font-black ${lang === 'en' ? 'bg-blue-600' : 'bg-slate-800'}`}>EN</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}