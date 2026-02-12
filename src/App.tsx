import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase'; 

// --- 1. Import Komponen Landing Page ---
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

// --- 2. Import Komponen Admin ---
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ManajemenPendaftaran from './ManajemenPendaftaran';
import ManajemenAtlet from './ManajemenAtlet';
import AdminMatch from './components/AdminMatch'; 
import AdminGallery from './components/AdminGallery'; 
import AdminContact from './components/AdminContact';

// --- 3. Import Komponen Admin Khusus (Pastikan file ini ada) ---
// Jika nama filenya berbeda, silakan sesuaikan import di bawah ini:
// import AdminRanking from './components/AdminRanking'; 
// import AdminNews from './components/AdminNews';

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
          <span className="animate-pulse text-xs">Synchronizing System...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* ==========================================
            ROUTE UTAMA: LANDING PAGE 
            ========================================== */}
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

        {/* ==========================================
            ROUTE LOGIN 
            ========================================== */}
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/admin/dashboard" replace />} 
        />

        {/* ==========================================
            ROUTE ADMIN (PROTECTED)
            ========================================== */}
        <Route 
          path="/admin/*" 
          element={session ? <AdminLayout session={session} /> : <Navigate to="/login" replace />} 
        />

        {/* CATCH-ALL REDIRECT */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

/**
 * Layout Khusus Admin Dashboard
 * Mengelola semua sub-menu navigasi admin
 */
function AdminLayout({ session }: { session: any }) {
  return (
    <div className="flex min-h-screen bg-[#050505]">
      {/* Sidebar Navigasi Utama */}
      <Sidebar email={session.user.email} />
      
      {/* Area Konten Dinamis Admin */}
      <main className="flex-1 overflow-y-auto border-l border-white/5 bg-zinc-950/50">
        <Routes>
          {/* A. SEKSI MAIN DASHBOARD */}
          <Route path="dashboard" element={<ManajemenPendaftaran />} />
          <Route path="atlet" element={<ManajemenAtlet />} />

          {/* B. SEKSI LIVE UPDATES */}
          {/* 1. Update Skor & Poin Pertandingan */}
          <Route path="skor" element={<AdminMatch />} />

          {/* 2. Update Berita/News (Placeholder jika belum ada komponennya) */}
          <Route path="berita" element={<div className="p-10 text-white font-black italic uppercase text-3xl">Kelola Berita & Event</div>} />
          
          {/* 3. Update Ranking Atlet (Klasemen) */}
          {/* Ganti <div> di bawah dengan <AdminRanking /> jika komponen sudah siap */}
          <Route path="ranking" element={<div className="p-10 text-white font-black italic uppercase text-3xl">Kelola Ranking & Klasemen</div>} />

          {/* 4. Galeri Media (Upload Foto/Video) */}
          <Route path="galeri" element={<AdminGallery />} />

          {/* 5. Kelola Kontak (Sinkronisasi Landing Page) */}
          <Route path="kontak" element={<AdminContact />} />
          
          {/* Fallback internal admin: Kembali ke Dashboard */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}