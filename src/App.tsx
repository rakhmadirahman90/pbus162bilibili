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
import AdminTampilan from './components/AdminTampilan'; 
import KelolaHero from './components/KelolaHero'; 
import AdminPopup from './components/AdminPopup'; 
import AdminFooter from './components/AdminFooter'; 

// --- IMPORT UNTUK POPUP & UI ---
import { X, ChevronLeft, ChevronRight, Menu, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FIXED: Komponen Pop-up Gambar Dinamis
 * Solusi agar TIDAK TERPOTONG: Menggunakan overflow-y-auto dan menghapus aspect-ratio.
 */
function ImagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [promoImages, setPromoImages] = useState<any[]>([]);

  useEffect(() => {
    const fetchActivePopups = async () => {
      try {
        const { data, error } = await supabase
          .from('konfigurasi_popup')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (!error && data && data.length > 0) {
          setPromoImages(data);
          const timer = setTimeout(() => setIsOpen(true), 1200);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error("Gagal memuat pop-up:", err);
      }
    };
    
    fetchActivePopups();
    localStorage.removeItem('lastSeenPopup');
  }, []);

  const closePopup = () => setIsOpen(false);

  if (promoImages.length === 0 || !isOpen) return null;

  const current = promoImages[currentIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          // UKURAN 70%: max-w-[400px]. max-h-[85vh] memastikan popup tidak meluber keluar layar HP/Monitor
          className="relative w-full max-w-[400px] max-h-[85vh] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Tombol Close - Tetap di posisi atas (Sticky-like) */}
          <button 
            onClick={closePopup} 
            className="absolute top-4 right-4 z-50 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl transition-all active:scale-90 border-2 border-white"
          >
            <X size={18} strokeWidth={3} />
          </button>

          {/* Container Scrollable - Tempat Gambar dan Teks */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {/* Gambar Tanpa Aspect Ratio (Menyesuaikan File Asli) */}
            <div className="relative bg-slate-900">
              <img 
                src={current.url_gambar} 
                className="w-full h-auto block" 
                alt={current.judul} 
              />
              
              {/* Badge Headline */}
              <div className="absolute top-5 left-5 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/90 backdrop-blur-md rounded-full border border-white/20">
                <Zap size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Update</span>
              </div>

              {/* Navigasi Slide */}
              {promoImages.length > 1 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 z-20 pointer-events-none">
                  <button 
                    onClick={() => setCurrentIndex(prev => (prev === 0 ? promoImages.length - 1 : prev - 1))} 
                    className="p-2 bg-black/40 text-white rounded-full backdrop-blur-md pointer-events-auto hover:bg-blue-600 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => setCurrentIndex(prev => (prev === promoImages.length - 1 ? 0 : prev + 1))} 
                    className="p-2 bg-black/40 text-white rounded-full backdrop-blur-md pointer-events-auto hover:bg-blue-600 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Bagian Teks di bawah gambar */}
            <div className="px-8 pb-8 pt-6 text-center bg-white">
              <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2 text-slate-900 leading-tight">
                {current.judul || "PENGUMUMAN"}
              </h3>
              <div className="w-10 h-1 bg-blue-600 mx-auto mb-4 rounded-full" />
              
              <p className="text-slate-500 font-bold text-[11px] mb-6 leading-relaxed uppercase">
                {current.deskripsi || "Informasi penting dari manajemen."}
              </p>
              
              <button 
                onClick={closePopup} 
                className="w-full py-4 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.25em] transition-all active:scale-95 shadow-lg shadow-blue-100"
              >
                MENGERTI
              </button>
            </div>
          </div>
        </motion.div>

        {/* Backdrop untuk menutup saat klik area luar */}
        <div className="absolute inset-0 -z-10" onClick={closePopup} />
      </div>
    </AnimatePresence>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        <Route path="/" element={
          <div className="min-h-screen bg-white">
            <ImagePopup />
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

        <Route 
          path="/admin/*" 
          element={session ? <AdminLayout session={session} /> : <Navigate to="/login" replace />} 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function AdminLayout({ session }: { session: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden">
      <aside className={`h-full flex-shrink-0 z-[101] shadow-2xl border-r border-white/5 transition-transform md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} absolute md:relative`}>
        <Sidebar 
          email={session.user.email} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      </aside>
      
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <div className="md:hidden flex items-center bg-[#0F172A] p-4 border-b border-white/5">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2">
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-black italic text-white uppercase text-sm">Authority Panel</span>
        </div>
        
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
            <Route path="laporan" element={<AdminLaporan />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="tampilan" element={<AdminTampilan />} />
            <Route path="hero" element={<KelolaHero />} />
            <Route path="popup" element={<AdminPopup />} /> 
            <Route path="footer" element={<AdminFooter />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>

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

      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #2563eb; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}