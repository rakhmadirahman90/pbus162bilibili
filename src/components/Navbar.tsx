import React, { useState, useEffect, useCallback } from 'react';
import { Globe, ChevronDown, Menu, X, MapPin, UserPlus } from 'lucide-react';
import { supabase } from '../supabase'; 

interface NavbarProps {
  onNavigate: (sectionId: string, tabId?: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState('ID');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- STATE DATA DINAMIS ---
  const [navData, setNavData] = useState<any[]>([]);
  
  // --- STATE BRANDING ---
  const [branding, setBranding] = useState({
    logo_url: '/photo_2026-02-03_00-32-07.jpg', 
    brand_name_main: 'US 162',
    brand_name_accent: 'BILIBILI',
    default_lang: 'ID'
  });

  // Fungsi Fetching
  const fetchNavSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('navbar_settings')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (!error && data) {
        setNavData(data);
      }
    } catch (err) {
      console.error("Fetch Nav Error:", err);
    }
  }, []);

  const fetchBrandingSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'navbar_branding')
        .maybeSingle(); 
      
      if (!error && data && data.value) {
        const val = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        setBranding({
          logo_url: val.logo_url || '/photo_2026-02-03_00-32-07.jpg',
          brand_name_main: val.brand_name_main || 'US 162',
          brand_name_accent: val.brand_name_accent || 'BILIBILI',
          default_lang: val.default_lang || 'ID'
        });
        if (val.default_lang) setCurrentLang(val.default_lang);
      }
    } catch (err) {
      console.error("Error fetching branding:", err);
    }
  }, []);

  useEffect(() => {
    fetchNavSettings();
    fetchBrandingSettings();
    
    const navSubscription = supabase
      .channel('navbar_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'navbar_settings' }, () => {
        fetchNavSettings();
      })
      .subscribe();

    const brandSubscription = supabase
      .channel('brand_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
        fetchBrandingSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(navSubscription);
      supabase.removeChannel(brandSubscription);
    };
  }, [fetchNavSettings, fetchBrandingSettings]);

  const getSubMenus = (parentId: string) => {
    return navData.filter(item => item.parent_id === parentId);
  };

  // --- LOGIKA NAVIGASI TOTAL (FIXED UNTUK LOGO & BERANDA) ---
  const handleNavClick = (path: string, subPath?: string) => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);

    // Jika path adalah 'home' atau 'beranda', langsung scroll ke paling atas
    if (path === 'home' || path === 'beranda') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      onNavigate('home');
      return;
    }

    const targetId = subPath || path;
    
    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        const offset = 90;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else {
        // Fallback jika ID tidak ditemukan (kembali ke atas)
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);

    onNavigate(path, subPath);

    if (path === 'atlet' && subPath) {
      const event = new CustomEvent('filterAtlet', { detail: subPath });
      window.dispatchEvent(event);
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-md text-white z-[100] h-20 border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        
        {/* LOGO SECTION - Mengarah ke Home/Top */}
        <div 
          className="flex items-center gap-4 cursor-pointer group" 
          onClick={() => handleNavClick('home')}
        >
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 border border-white/30 rounded-xl group-hover:border-blue-500/50 transition-colors duration-300"></div>
            <div className="w-11 h-11 rounded-[10px] overflow-hidden bg-transparent flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <img 
                src={branding.logo_url} 
                alt="Logo" 
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/photo_2026-02-03_00-32-07.jpg'; }}
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 leading-none mb-1">
              <span className="font-black text-xl md:text-2xl tracking-tighter uppercase italic text-white">
                {branding.brand_name_main}
              </span>
              <span className="font-black text-xl md:text-2xl tracking-tighter uppercase italic text-blue-500">
                {branding.brand_name_accent}
              </span>
            </div>
            <div className="h-[1px] w-full bg-gradient-to-r from-blue-500/50 to-transparent mb-1"></div>
            <span className="text-[7px] md:text-[8px] text-slate-400 font-bold tracking-[0.35em] uppercase leading-none">
              Professional Badminton
            </span>
          </div>
        </div>

        {/* --- DESKTOP NAVIGATION --- */}
        <div className="hidden md:flex items-center gap-8">
          {navData.filter(item => !item.parent_id).map((menu) => (
            menu.type === 'dropdown' ? (
              <div 
                key={menu.id}
                className="relative h-20 flex items-center"
                onMouseEnter={() => setActiveDropdown(menu.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button 
                   onClick={() => handleNavClick(menu.path)}
                   className={`nav-link flex items-center gap-1.5 transition-colors ${activeDropdown === menu.id ? 'text-blue-400' : ''}`}
                >
                  {menu.label} <ChevronDown size={10} className={`transition-transform duration-300 ${activeDropdown === menu.id ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === menu.id && (
                  <div className="dropdown-container">
                    <div className="dropdown-content">
                      {getSubMenus(menu.id).map((sub) => (
                        <button 
                          key={sub.id} 
                          onClick={() => handleNavClick(menu.path, sub.path)} 
                          className="dropdown-item"
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                key={menu.id} 
                onClick={() => handleNavClick(menu.path)} 
                className="nav-link"
              >
                {menu.label}
              </button>
            )
          ))}

          <div 
            className="relative h-20 flex items-center"
            onMouseEnter={() => setActiveDropdown('contact-action')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
              <MapPin size={12} />
              Kontak
              <ChevronDown size={10} />
            </button>
            
            {activeDropdown === 'contact-action' && (
              <div className="dropdown-container right-0">
                <div className="dropdown-content">
                  <button onClick={() => handleNavClick('contact')} className="dropdown-item flex items-center gap-3">
                    <MapPin size={14} className="text-blue-400" /> Hubungi Kami
                  </button>
                  <button onClick={() => handleNavClick('register')} className="dropdown-item flex items-center gap-3 bg-blue-600/10">
                    <UserPlus size={14} className="text-blue-400" /> Pendaftaran
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative h-20 flex items-center">
             <button className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <Globe size={14} className="text-blue-400" />
                <span className="text-[10px] font-black">{currentLang}</span>
             </button>
          </div>
        </div>

        <button className="md:hidden p-2 text-slate-300 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* --- MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-slate-900 border-b border-white/10 animate-in slide-in-from-top duration-300 overflow-y-auto max-h-[calc(100vh-80px)] shadow-2xl">
          <div className="flex flex-col p-6 gap-4">
            {navData.filter(item => !item.parent_id).map((menu) => (
              <React.Fragment key={menu.id}>
                <button 
                  onClick={() => menu.type !== 'dropdown' ? handleNavClick(menu.path) : (activeDropdown === menu.id ? setActiveDropdown(null) : setActiveDropdown(menu.id))}
                  className="mobile-nav-link text-left flex justify-between items-center py-2"
                >
                  {menu.label}
                  {menu.type === 'dropdown' && <ChevronDown size={16} className={activeDropdown === menu.id ? 'rotate-180 transition-transform' : 'transition-transform'} />}
                </button>
                {(menu.type === 'dropdown' && activeDropdown === menu.id) && (
                  <div className="flex flex-col gap-3 pl-4 border-l border-blue-500/30 ml-2 animate-in fade-in slide-in-from-left-2 duration-200">
                    {getSubMenus(menu.id).map((sub) => (
                      <button 
                        key={sub.id} 
                        onClick={() => handleNavClick(menu.path, sub.path)} 
                        className="mobile-sub-link py-1"
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="h-px bg-white/5" />
              </React.Fragment>
            ))}
            
            <div className="flex flex-col gap-4 mt-2">
              <button onClick={() => handleNavClick('contact')} className="mobile-nav-link text-left text-blue-400">Hubungi Kami</button>
              <button 
                onClick={() => handleNavClick('register')} 
                className="bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-blue-900/20"
              >
                Daftar Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .nav-link { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #cbd5e1; background: none; border: none; cursor: pointer; position: relative; }
        .nav-link:hover { color: #3b82f6; }
        .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: #3b82f6; transition: width 0.3s; }
        .nav-link:hover::after { width: 100%; }
        .dropdown-container { position: absolute; top: 80%; width: 14rem; padding-top: 1rem; animation: dropdownFade 0.2s ease-out; z-index: 110; }
        .dropdown-content { background: #1e293b; border: 1px solid #334155; border-radius: 1rem; overflow: hidden; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5); }
        .dropdown-item { width: 100%; text-align: left; padding: 1rem 1.5rem; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #e2e8f0; border-bottom: 1px solid rgba(51, 65, 85, 0.2); background: none; transition: 0.2s; cursor: pointer; }
        .dropdown-item:last-child { border-bottom: none; }
        .dropdown-item:hover { background: #2563eb; color: white; padding-left: 1.75rem; }
        .mobile-nav-link { font-size: 14px; font-weight: 800; text-transform: uppercase; color: #f8fafc; letter-spacing: 0.05em; }
        .mobile-sub-link { text-align: left; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
        @keyframes dropdownFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </nav>
  );
}