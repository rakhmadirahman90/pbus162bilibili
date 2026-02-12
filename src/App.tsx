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

export default function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Cek sesi login aktif
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Pantau perubahan login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        {/* ROUTE 1: LANDING PAGE LENGKAP */}
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

        {/* ROUTE 2: LOGIN ADMIN */}
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/admin/dashboard" />} 
        />

        {/* ROUTE 3: AREA ADMIN (PROTECTED) */}
        <Route 
          path="/admin/*" 
          element={session ? <AdminLayout session={session} /> : <Navigate to="/login" />} 
        />

        {/* Redirect jika salah ketik URL */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

// Komponen Layout untuk Admin Dashboard
function AdminLayout({ session }: { session: any }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar email={session.user.email} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Routes>
          <Route path="dashboard" element={<ManajemenPendaftaran />} />
          {/* Anda bisa menambah route seperti /admin/atlet di sini nanti */}
          <Route path="*" element={<Navigate to="dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}