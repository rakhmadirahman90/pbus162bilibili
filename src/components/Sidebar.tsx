import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, UserCircle, Newspaper, Trophy, Image, LogOut, LayoutDashboard } from 'lucide-react';
import { supabase } from '../supabase';

export default function Sidebar({ email }: { email: string }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Pendaftaran', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manajemen Atlet', path: '/admin/atlet', icon: Users },
    { name: 'Update Berita', path: '/admin/berita', icon: Newspaper },
    { name: 'Update Ranking', path: '/admin/ranking', icon: Trophy },
    { name: 'Galeri Media', path: '/admin/galeri', icon: Image },
  ];

  return (
    <div className="w-64 bg-[#0F172A] min-h-screen p-6 flex flex-col text-white shadow-2xl">
      <div className="mb-10">
        <h1 className="text-2xl font-black italic tracking-tighter leading-none">PB US 162</h1>
        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Bilibili Admin</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800'
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="bg-slate-800/50 p-4 rounded-2xl mb-4 border border-slate-700">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Akun Petugas</p>
          <p className="text-[10px] font-bold truncate text-blue-300">{email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 bg-red-950/30 text-red-500 border border-red-900/50 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}