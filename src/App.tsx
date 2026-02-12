import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';

// Halaman-halaman
import LandingPage from './components/LandingPage'; // Buat file ini jika belum ada
import Login from './components/Login';
import ManajemenPendaftaran from './ManajemenPendaftaran';
import Sidebar from './components/Sidebar';

export default function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <Router>
      <Routes>
        {/* HALAMAN UTAMA (LANDING PAGE) - Terbuka untuk umum */}
        <Route path="/" element={<LandingPage />} />

        {/* HALAMAN LOGIN - Mengalihkan ke admin jika sudah login */}
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/admin/dashboard" />} 
        />

        {/* HALAMAN ADMIN - Hanya bisa diakses jika sudah login */}
        <Route 
          path="/admin/*" 
          element={session ? <AdminLayout session={session} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

// Layout khusus untuk dashboard admin
function AdminLayout({ session }: { session: any }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar email={session.user.email} />
      <main className="flex-1 p-8">
        <Routes>
          <Route path="dashboard" element={<ManajemenPendaftaran />} />
          {/* Tambahkan route admin lainnya di sini */}
        </Routes>
      </main>
    </div>
  );
}