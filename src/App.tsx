import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase'; 

// Import Komponen Landing Page (Tetap sama)
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

// Import Komponen Admin (Tetap sama)
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ManajemenPendaftaran from './ManajemenPendaftaran';
import ManajemenAtlet from './ManajemenAtlet';
import AdminBerita from './components/AdminBerita';
import AdminMatch from './components/AdminMatch'; 
import AdminRanking from './components/AdminRanking'; 
import AdminGallery from './components/AdminGallery'; 
import AdminContact from './components/AdminContact'; 
import KelolaNavbar from './components/KelolaNavbar'; 
import ManajemenPoin from './components/ManajemenPoin';
import AuditLogPoin from './components/AuditLogPoin';
import AdminLaporan from './components/AdminLaporan'; 
import AdminLogs from './components/AdminLogs'; 
import AdminTampilan from './components/AdminTampilan'; 
import KelolaHero from './components/KelolaHero'; 
import AdminPopup from './components/AdminPopup'; 
import AdminFooter from './components/AdminFooter'; 

import { X, ChevronLeft, ChevronRight, Menu, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FIXED: Komponen Pop-up Gambar Otomatis Pas
 * Menghilangkan aspect-ratio agar gambar portrait panjang tampil utuh
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
          // Lebar 70% (400px) dan Max-Height agar tidak meluber keluar layar
          className="relative w-full max-w-[400px] max-h-[90vh] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Tombol Close Mengambang */}
          <button 
            onClick={closePopup} 
            className="absolute top-4 right-4 z-50 p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-full shadow-xl border-2 border-white transition-transform active:scale-90"
          >
            <X size={18} strokeWidth={3} />
          </button>

          {/* Container Gambar - Overflow scroll jika sangat panjang */}
          <div className="relative flex-1 overflow-y-auto bg-slate-100">
            <img 
              src={current.url_gambar} 
              className="w-full h-auto display-block" 
              alt={current.judul}
              // Memastikan gambar dimuat utuh tanpa terpotong (object-contain dihilangkan agar pas lebar)
            />
            
            {promoImages.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-20 pointer-events-none">
                <button 
                  onClick={() => setCurrentIndex(prev => (prev === 0 ? promoImages.length - 1 : prev - 1))} 
                  className="p-2 bg-black/30 text-white rounded-full backdrop-blur-md pointer-events-auto hover:bg-blue-600"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setCurrentIndex(prev => (prev === promoImages.length - 1 ? 0 : prev + 1))} 
                  className="p-2 bg-black/30 text-white rounded-full backdrop-blur-md pointer-events-auto hover:bg-blue-600"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Area Tombol Aksi - Fixed di bawah agar selalu terlihat */}
          <div className="p-4 bg-white border-t border-slate-100">
             <button 
              onClick={closePopup} 
              className="w-full py-3.5 bg-blue-600 hover:bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.25em] transition-all active:scale-95"
            >
              KONFIRMASI
            </button>
          </div>
        </motion.div>

        {/* Backdrop untuk menutup */}
        <div className="absolute inset-0 -z-10" onClick={closePopup} />
      </div>
    </AnimatePresence>
  );
}

// --- FUNGSI APP & ADMIN LAYOUT (Tetap Sama) ---
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
        window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      }
    }, 100);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">Loading...</div>;

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
            <section id="register" className="py-20 bg-slate-900"><RegistrationForm /></section>
            <Contact />
            <Footer />
          </div>
        } />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/*" element={session ? <AdminLayout session={session} /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

function AdminLayout({ session }: { session: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden">
      <aside className={`h-full flex-shrink-0 z-[101] transition-transform md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} absolute md:relative`}>
        <Sidebar email={session.user.email} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </aside>
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <div className="md:hidden flex items-center bg-[#0F172A] p-4 border-b border-white/5">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white"><Menu /></button>
        </div>
        <div className="flex-1 overflow-y-auto bg-[#050505]">
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
      </main>
    </div>
  );
}