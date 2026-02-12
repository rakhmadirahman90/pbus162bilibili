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

// Import Komponen Admin
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ManajemenPendaftaran from './ManajemenPendaftaran';
import ManajemenAtlet from './ManajemenAtlet';
import AdminBerita from './components/AdminBerita';
import AdminMatch from './components/AdminMatch'; 
import AdminRanking from './components/AdminRanking'; 
import AdminGallery from './components/AdminGallery'; 
// --- TAMBAHAN IMPORT BARU UNTUK KONTAK ---
import AdminContact from './components/AdminContact'; 

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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Loading System...
        </div>
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

        {/* ROUTE LOGIN */}
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/admin/dashboard" replace />} 
        />

        {/* ROUTE ADMIN: PROTECTED BY SESSION */}
        <Route 
          path="/admin/*" 
          element={session ? <AdminLayout session={session} /> : <Navigate to="/login" replace />} 
        />

        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

/**
 * PERBAIKAN PADA ADMIN LAYOUT
 * Menghubungkan semua komponen admin termasuk Kelola Kontak
 */
function AdminLayout({ session }: { session: any }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar tetap di kiri */}
      <Sidebar email={session.user.email} />
      
      {/* Area Konten Utama */}
      <main className="flex-1 overflow-y-auto bg-[#050505] min-h-screen">
        <Routes>
          {/* 1. Dashboard / Pendaftaran */}
          <Route path="dashboard" element={<ManajemenPendaftaran />} />
          
          {/* 2. Manajemen Atlet */}
          <Route path="atlet" element={<ManajemenAtlet />} />

          {/* 3. Update Skor (AdminMatch) */}
          <Route path="skor" element={<AdminMatch />} />

          {/* 4. Update Berita */}
          <Route path="berita" element={<AdminBerita />} />
          
          {/* 5. Update Ranking */}
          <Route path="ranking" element={<AdminRanking />} />

          {/* 6. Update Galeri Media */}
          <Route path="galeri" element={<AdminGallery />} />

          {/* 7. Kelola Kontak (TAMBAHAN BARU UNTUK SINKRONISASI LANDING PAGE) */}
          <Route path="kontak" element={<AdminContact />} />
          
          {/* Fallback internal admin */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}