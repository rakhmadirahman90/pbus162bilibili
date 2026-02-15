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
import AdminContact from './components/AdminContact'; 

// Import Kelola Baru
import KelolaNavbar from './components/KelolaNavbar'; 
import ManajemenPoin from './components/ManajemenPoin';
import AuditLogPoin from './components/AuditLogPoin';

// --- IMPORT MENU BARU ---
import AdminLaporan from './components/AdminLaporan'; 
import AdminLogs from './components/AdminLogs'; 
import AdminTampilan from './components/AdminTampilan'; // Menu Konfigurasi Umum
import KelolaHero from './components/KelolaHero'; // KODE BARU: Import Kelola Hero

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State navigasi dinamis
  const [activeAboutTab, setActiveAboutTab] = useState('sejarah');
  const [activeAthleteFilter, setActiveAthleteFilter] = useState('all');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigate = (sectionId: string, subPath?: string) => {
    if (sectionId === 'tentang-kami' || ['sejarah', 'visi-misi', 'fasilitas'].includes(subPath || '')) {
      if (subPath) setActiveAboutTab(subPath);
    }

    if (sectionId === 'atlet' && subPath) {
      setActiveAthleteFilter(subPath);
      const event = new CustomEvent('filterAtlet', { detail: subPath });
      window.dispatchEvent(event);
    }

    const targetId = subPath || sectionId;
    setTimeout(() => {
      const element = document.getElementById(targetId) || document.getElementById(sectionId);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

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
        {/* LANDING PAGE ROUTE */}
        <Route path="/" element={
          <div className="min-h-screen bg-white">
            <Navbar onNavigate={handleNavigate} />
            <Hero />
            <About activeTab={activeAboutTab} onTabChange={(id) => setActiveAboutTab(id)} />
            <News />
            <Athletes initialFilter={activeAthleteFilter} />
            <Ranking />
            <Gallery />
            <section id="register" className="py-20 bg-slate-900">
              <RegistrationForm />
            </section>
            <Contact />
            <Footer />
          </div>
        } />

        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/admin/dashboard" replace />} 
        />

        {/* ADMIN PROTECTED ROUTES */}
        <Route 
          path="/admin/*" 
          element={session ? <AdminLayout session={session} /> : <Navigate to="/login" replace />} 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

/**
 * FIXED ADMIN LAYOUT (Anti-Scroll Panjang)
 */
function AdminLayout({ session }: { session: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`h-full flex-shrink-0 z-[101] shadow-2xl border-r border-white/5 transition-transform md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} absolute md:relative`}>
        <Sidebar 
          email={session.user.email} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      </aside>
      
      {/* AREA KONTEN UTAMA */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        
        {/* Header Mobile Only */}
        <div className="md:hidden flex items-center bg-[#0F172A] p-4 border-b border-white/5">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2">
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-black italic text-white uppercase text-sm">Authority Panel</span>
        </div>
        
        {/* SCROLL AREA */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth bg-[#050505]">
          <Routes>
            <Route path="dashboard" element={<ManajemenPendaftaran />} />
            <Route path="atlet" element={<ManajemenAtlet />} />
            <Route path="poin" element={<ManajemenPoin />} />
            <Route path="audit-poin" element={<AuditLogPoin />} />
            <Route path="skor" element={<AdminMatch />} />
            <Route path="berita" element={<AdminBerita />} />
            <Route path="ranking" element={<AdminRanking />} />
            <Route path="galeri" element={<AdminGallery />} />
            <Route path="kontak" element={<AdminContact />} />
            <Route path="navbar" element={<KelolaNavbar />} />
            
            {/* RUTE BARU: LAPORAN, LOGS, TAMPILAN, & HERO */}
            <Route path="laporan" element={<AdminLaporan />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="tampilan" element={<AdminTampilan />} />
            <Route path="hero" element={<KelolaHero />} /> {/* KODE BARU: Menghubungkan Menu ke Komponen */}
            
            {/* Fallback internal admin */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>

        {/* Global Footer Admin */}
        <div className="h-8 bg-black/80 border-t border-white/5 flex items-center px-8 flex-shrink-0 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">
                  System Status: <span className="text-emerald-500">Online</span>
                </p>
             </div>
             <span className="text-white/10">|</span>
             <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
               Authority Multi-Step Sync v2.0
             </p>
          </div>
        </div>
      </main>

      {/* CSS Khusus Scrollbar */}
      <style>{`
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #050505;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}

import { Menu } from 'lucide-react';