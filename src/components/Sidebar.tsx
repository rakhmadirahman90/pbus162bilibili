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
  Circle
} from 'lucide-react';
import { supabase } from '../supabase';

export default function Sidebar({ email }: { email: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dbStatus, setDbStatus] = useState<'online' | 'offline'>('online');

  // Cek koneksi ke Supabase secara berkala (Opsional untuk UX)
  useEffect(() => {
    const checkConnection = async () => {
      const { error } = await supabase.from('berita').select('id').limit(1);
      setDbStatus(error ? 'offline' : 'online');
    };
    checkConnection();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate('/login');
  };

  const menuItems = [
    { section: 'Main Dashboard', items: [
      { name: 'Pendaftaran', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Manajemen Atlet', path: '/admin/atlet', icon: Users },
    ]},
    { section: 'Live Updates', items: [
      { name: 'Update Skor & Poin', path: '/admin/skor', icon: Zap }, 
      { name: 'Update Berita', path: '/admin/berita', icon: Newspaper },
      { name: 'Update Ranking', path: '/admin/ranking', icon: Trophy },
      { name: 'Galeri Media', path: '/admin/galeri', icon: Image },
    ]}
  ];

  return (
    <div className="w-64 bg-[#0F172A] min-h-screen p-6 flex flex-col text-white shadow-2xl relative border-r border-slate-800">
      {/* Glow Effect Sidebar */}
      <div className="absolute top-0 left-0 w-full h-32 bg-blue-600/5 blur-3xl -z-10" />

      {/* Brand Header */}
      <div className="mb-10 px-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-6 bg-blue-600 rounded-full" />
          <h1 className="text-2xl font-black italic tracking-tighter leading-none">PB US 162</h1>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Bilibili Admin</p>
          <div className="flex items-center gap-1">
             <Circle size={6} className={`${dbStatus === 'online' ? 'text-emerald-500 fill-emerald-500' : 'text-red-500 fill-red-500'} animate-pulse`} />
             <span className="text-[8px] text-slate-500 font-bold uppercase">{dbStatus}</span>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-8">
        {menuItems.map((group) => (
          <div key={group.section}>
            <p className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
              {group.section}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `group flex items-center justify-between px-4 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 translate-x-1' 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={`${location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`} />
                    {item.name}
                  </div>
                  {location.pathname === item.path && (
                    <ChevronRight size={14} className="animate-in slide-in-from-left-2" />
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Account Section */}
      <div className="mt-auto pt-6 border-t border-slate-800/50">
        <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-[1.5rem] mb-4 border border-slate-800 group hover:border-blue-900/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 font-black text-xs border border-blue-500/20">
              {email.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Admin Terverifikasi</p>
              <p className="text-[10px] font-bold truncate text-blue-100">{email}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full group flex items-center justify-center gap-3 py-4 bg-red-950/20 text-red-500 border border-red-900/30 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95 shadow-lg hover:shadow-red-900/20"
        >
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Sign Out System
        </button>
        
        <p className="text-center text-[7px] text-slate-600 font-bold uppercase tracking-widest mt-6 opacity-50">
          PB US 162 Engine v2.0.1
        </p>
      </div>
    </div>
  );
}