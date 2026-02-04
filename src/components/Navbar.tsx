import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  activeSection: string;
}

// Hanya menerjemahkan label menu dan subtitle, judul tetap PB US 162
const translations = {
  id: {
    home: 'Beranda',
    about: 'Tentang',
    news: 'Berita',
    players: 'Atlet',
    rankings: 'Peringkat',
    gallery: 'Galeri',
    subtitle: 'Keunggulan dalam Olahraga',
  },
  en: {
    home: 'Home',
    about: 'About',
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

  const t = translations[lang];

  const navItems = [
    { id: 'home', label: t.home },
    { id: 'about', label: t.about },
    { id: 'news', label: t.news },
    { id: 'players', label: t.players },
    { id: 'rankings', label: t.rankings },
    { id: 'gallery', label: t.gallery },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-900 text-white z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Judul Tetap: PB US 162 Bilibili */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => scrollToSection('home')}>
            <img
              src="/photo_2026-02-03_00-32-07.jpg"
              alt="PB US 162 Parepare Logo"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h1 className="text-xl font-bold">PB US 162 Bilibili</h1>
              <p className="text-xs text-gray-300">{t.subtitle}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {/* Desktop Nav Items */}
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Language Switcher Button */}
            <div className="relative border-l border-slate-700 pl-4 ml-2">
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 hover:text-blue-400 transition-colors text-sm font-semibold"
              >
                <Globe size={16} />
                <span>{lang === 'id' ? 'ID' : 'EN'}</span>
                <ChevronDown size={14} className={showLangMenu ? 'rotate-180' : ''} />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-3 w-32 bg-slate-800 border border-slate-700 rounded-md shadow-xl z-[60]">
                  <button 
                    onClick={() => { setLang('id'); setShowLangMenu(false); }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-700"
                  >
                    Indonesia
                  </button>
                  <button 
                    onClick={() => { setLang('en'); setShowLangMenu(false); }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-700"
                  >
                    English
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-slate-800"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 pb-4">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  activeSection === item.id
                    ? 'text-blue-400 bg-slate-700'
                    : 'text-gray-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
            {/* Mobile Lang Switcher */}
            <div className="pt-4 border-t border-slate-700 flex justify-around">
              <button 
                onClick={() => { setLang('id'); setIsOpen(false); }}
                className={`text-sm ${lang === 'id' ? 'text-blue-400 font-bold' : 'text-gray-400'}`}
              >
                INDONESIA
              </button>
              <button 
                onClick={() => { setLang('en'); setIsOpen(false); }}
                className={`text-sm ${lang === 'en' ? 'text-blue-400 font-bold' : 'text-gray-400'}`}
              >
                ENGLISH
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}