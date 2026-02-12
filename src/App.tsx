import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase'; 

// Import Komponen Landing Page
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import News from './components/News';
import Athletes from './components/Players'; 
import Ranking from './components/Rankings'; 
import Gallery from './components/Gallery';
import RegistrationForm from './components/RegistrationForm'; 
import Contact from './components/Contact'; 
import Footer from './components/Footer';

// Import Komponen Admin (Pastikan file-file ini sudah Anda buat)
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ManajemenPendaftaran from './ManajemenPendaftaran';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil sesi login saat ini
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Pantau perubahan status auth secara real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white font-black italic uppercase tracking-widest">
        Loading System...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* ROUTE UTAMA: LANDING PAGE LENGKAP */}
        <Route path="/" element={
          <div className="min-h-screen bg-white">
            <Navbar />
            <Hero />
            <About />
            <News />
            <Athletes />
            <Ranking />
            <Gallery />
            <section id="daftar" className="py-20 bg-slate-900">
              <RegistrationForm />
            </section>
            <Contact />
            <Footer />
          </div>
        } />

        {/* ROUTE LOGIN: REDIRECT KE DASHBOARD JIKA SUDAH LOGIN */}
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/admin/dashboard" replace />} 
        />

        {/* ROUTE ADMIN: PROTECTED BY SESSION */}
        <Route 
          path="/admin/*" 
          element={session ? <AdminLayout session={session} /> : <Navigate to="/login" replace />} 
        />

        {/* CATCH-ALL: REDIRECT KE HOME JIKA URL TIDAK ADA */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Layout Khusus Admin Dashboard
function AdminLayout({ session }: { session: any }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar untuk navigasi internal admin */}
      <Sidebar email={session.user.email} />
      
      {/* Area Konten Dinamis */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        <Routes>
          <Route path="dashboard" element={<ManajemenPendaftaran />} />
          {/* Route tambahan bisa diletakkan di bawah ini */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}