import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  Newspaper, 
  Trophy, 
  Image, 
  LogOut, 
  LayoutDashboard,
  Zap,
  ChevronRight,
  Circle,
  ShieldCheck,
  Settings,
  Database,
  ExternalLink,
  Phone // Menambahkan ikon Phone untuk menu kontak
} from 'lucide-react';
import { supabase } from '../supabase';

export default function Sidebar({ email }: { email: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dbStatus, setDbStatus] = useState<'online' | 'offline'>('online');
  const [isScrolled, setIsScrolled] = useState(false);

  // 1. Monitor Koneksi & UI State
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Cek koneksi ke tabel rankings (atau gallery)
        const { error } = await supabase.from('rankings').select('id', { count: 'exact', head: true }).limit(1);
        setDbStatus(error ? 'offline' : 'online');
      } catch {
        setDbStatus('offline');
      }
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Cek tiap 30 detik
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
      const { error } = await supabase.auth.signOut();
      if (!error) navigate('/login');
    }
  };

  // 2. Definisi Menu (LENGKAP Sesuai App.tsx)
  const menuItems = [
    { 
      section: 'Main Dashboard', 
      items: [
        { name: 'Pendaftaran', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Manajemen Atlet', path: '/admin/atlet', icon: Users },
      ]
    },
    { 
      section: 'Live Updates', 
      items: [
        { name: 'Update Skor & Poin', path: '/admin/skor', icon: Zap }, 
        { name: 'Update Berita', path: '/admin/berita', icon: Newspaper },
        { name: 'Update Ranking', path: '/admin/ranking', icon: Trophy },
        { name: 'Galeri Media', path: '/admin/galeri', icon: Image },
        { name: 'Kelola Kontak', path: '/admin/kontak', icon: Phone }, // Menu Baru ditambahkan di sini
      ]
    }
  ];

  return (
    <div className="w-72 bg-[#0F172A] min-h-screen p-6 flex flex-col text-white shadow-2xl relative border-r border-slate-800 transition-all duration-500">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-600/10 to-transparent blur-3xl -z-10 opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-red-600/5 to-transparent blur-3xl -z-10 opacity-30" />

      {/* Brand Header */}
      <div className="mb-12 px-2 group cursor-pointer" onClick={() => navigate('/')}>
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="w-2 h-8 bg-blue-600 rounded-full group-hover:h-10 transition-all duration-300" />
            <div className="absolute -right-1 top-0 w-1 h-4 bg-blue-400/50 rounded-full" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter leading-none group-hover:text-blue-400 transition-colors">
              PB US 162
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Authority Panel</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-full w-fit mt-4">
           <Circle size={6} className={`${dbStatus === 'online' ? 'text-emerald-500 fill-emerald-500' : 'text-red-500 fill-red-500'} animate-pulse`} />
           <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">System {dbStatus}</span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-9 overflow-y-auto no-scrollbar">
        {menuItems.map((group) => (
          <div key={group.section} className="relative">
            <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-slate-800" />
              {group.section}
            </p>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={() => 
                      `group flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 border ${
                        isActive 
                          ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/40 translate-x-2' 
                          : 'text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-slate-200'
                      }`
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                        <item.icon size={18} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`} />
                      </div>
                      {item.name}
                    </div>
                    {isActive && (
                      <ChevronRight size={14} className="animate-in slide-in-from-left-2" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

        {/* Tambahan: Quick Access Section (Data Lengkap) */}
        <div className="pt-4">
           <a 
             href="/" 
             target="_blank" 
             className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-dashed border-slate-800 text-slate-500 hover:text-blue-400 hover:border-blue-900/50 transition-all"
           >
             <ExternalLink size={14} />
             <span className="text-[9px] font-black uppercase tracking-widest">Lihat Live Site</span>
           </a>
        </div>
      </nav>

      {/* Footer Account Section */}
      <div className="mt-auto pt-6 border-t border-slate-800/50">
        <div className="bg-gradient-to-br from-slate-900 to-[#0F172A] p-5 rounded-[2rem] mb-5 border border-slate-800 group transition-all duration-300 hover:border-blue-900/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-900/40 rotate-3 group-hover:rotate-0 transition-transform">
                {email ? email.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0F172A] rounded-full flex items-center justify-center">
                <ShieldCheck size={8} className="text-white" />
              </div>
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-blue-100 truncate">{email ? email.split('@')[0] : 'Admin'}</p>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Master Admin</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full group flex items-center justify-center gap-3 py-4 bg-red-950/10 text-red-500 border border-red-900/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95"
        >
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Terminate Session
        </button>
        
        <div className="flex justify-between items-center mt-8 px-2">
          <p className="text-[7px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-1">
            <Database size={8} /> CLOUD ENGINE v2.0.4
          </p>
          <Settings size={10} className="text-slate-700 animate-spin-slow" />
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}