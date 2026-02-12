import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import ManajemenPendaftaran from './ManajemenPendaftaran'; // Import file terpisah
import RegistrationForm from './components/RegistrationForm';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Cek status login saat aplikasi dibuka
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // 1. JIKA SUDAH LOGIN: Tampilkan Dashboard Manajemen
  if (session) {
    return (
      <div className="relative">
        {/* Tombol Logout Melayang */}
        <button 
          onClick={handleLogout}
          className="fixed top-4 right-4 z-[9999] bg-red-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-red-700 transition-all"
        >
          Keluar Sistem
        </button>
        
        {/* Memanggil file ManajemenPendaftaran.tsx */}
        <ManajemenPendaftaran />
      </div>
    );
  }

  // 2. JIKA BELUM LOGIN: Tampilkan Form Login Admin
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Admin Login</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Internal Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-900 transition-all"
              placeholder="admin@pbus162.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-900 transition-all"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all disabled:bg-slate-300"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}