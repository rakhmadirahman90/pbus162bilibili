import React, { useState, useEffect, useRef } from 'react';
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

// Pastikan file StrukturOrganisasi.tsx sudah dibuat di folder components
import StrukturOrganisasi from './components/StrukturOrganisasi'; 

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
import KelolaNavbar from './components/KelolaNavbar'; 
import ManajemenPoin from './components/ManajemenPoin';
import AuditLogPoin from './components/AuditLogPoin';
import AdminLaporan from './components/AdminLaporan'; 
import AdminLogs from './components/AdminLogs'; 
import AdminTampilan from './components/AdminTampilan'; 
import KelolaHero from './components/KelolaHero'; 
import AdminPopup from './components/AdminPopup'; 
import AdminFooter from './components/AdminFooter'; 
import AdminAbout from './components/AdminAbout';
import AdminStructure from './components/AdminStructure'; 

import { X, ChevronLeft, ChevronRight, Menu, Zap, Download, ArrowUp, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FIXED POPUP COMPONENT
 * Mendukung Paragraf Rapi & Link Otomatis Bisa Diklik
 */
function ImagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [promoImages, setPromoImages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

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
          setTimeout(() => setIsOpen(true), 1200);
        }
      } catch (err) {
        console.error("Gagal memuat pop-up:", err);
      }
    };
    fetchActivePopups();
  }, []);

  useEffect(() => {
    let scrollInterval: any;
    if (isOpen && scrollRef.current) {
      const startTimeout = setTimeout(() => {
        scrollInterval = setInterval(() => {
          if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 2) {
              clearInterval(scrollInterval);
            } else {
              scrollRef.current.scrollBy({ top: 1, behavior: 'auto' });
            }
          }
        }, 35);
      }, 3000); // Tunggu 3 detik sebelum auto-scroll

      return () => {
        clearInterval(scrollInterval);
        clearTimeout(startTimeout);
      };
    }
  }, [isOpen, currentIndex]);

  // FUNGSI BARU: Mendeteksi Link & Mengatur Paragraf agar rapi
  const formatRichText = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

    return text.split('\n').map((line, i) => {
      if (line.trim() === "") return <div key={i} className="h-3" />;
      return (
        <p key={i} className="mb-2 last:mb-0 leading-relaxed text-left">
          {line.split(urlRegex).map((part, index) => {
            if (part.match(urlRegex)) {
              const cleanUrl = part.startsWith('www.') ? `https://${part}` : part;
              return (
                <a
                  key={index}
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all font-bold inline-flex items-center gap-1"
                >
                  {part} <ExternalLink size={10} />
                </a>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  const closePopup = () => setIsOpen(false);

  if (promoImages.length === 0 || !isOpen) return null;
  const current = promoImages[currentIndex];
  if (!current) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
        <motion.div 
          key={current.id || `popup-${currentIndex}`}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-[420px] max-h-[85vh] bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20"
        >
          {/* Tombol Close */}
          <button 
            onClick={closePopup} 
            className="absolute top-4 right-4 z-50 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl border-2 border-white transition-transform active:scale-90"
          >
            <X size={18} strokeWidth={3} />
          </button>

          <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar scroll-smooth">
            {/* Image Section */}
            <div className="relative bg-slate-900 aspect-video overflow-hidden">
              <img src={current.url_gambar} className="w-full h-full object-cover" alt={current.judul} />
              
              {promoImages.length > 1 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 z-20 pointer-events-none">
                  <button 
                    onClick={() => { setCurrentIndex(prev => (prev === 0 ? promoImages.length - 1 : prev - 1)); scrollRef.current?.scrollTo(0,0); }} 
                    className="p-2 bg-black/30 text-white rounded-full backdrop-blur-md pointer-events-auto hover:bg-blue-600 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => { setCurrentIndex(prev => (prev === promoImages.length - 1 ? 0 : prev + 1)); scrollRef.current?.scrollTo(0,0); }} 
                    className="p-2 bg-black/30 text-white rounded-full backdrop-blur-md pointer-events-auto hover:bg-blue-600 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="px-8 pb-10 pt-8 bg-white">
              <div className="flex justify-center mb-4">
                <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Zap size={12} className="fill-blue-600" /> Informasi Resmi
                </div>
              </div>
              
              <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4 text-slate-900 leading-tight text-center">
                {current.judul}
              </h3>

              {/* Box Deskripsi dengan Format Rapi */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-slate-600 text-[12px] font-medium mb-8 shadow-inner">
                <div className="whitespace-pre-wrap">
                  {formatRichText(current.deskripsi)}
                </div>
              </div>
              
              {/* Tombol Lampiran */}
              <div className="space-y-3">
                {current.file_url && current.file_url.length > 5 && (
                  <motion.a 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={current.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg border border-white/10"
                  >
                    <Download size={16} /> DOWNLOAD LAMPIRAN
                  </motion.a>
                )}

                <button 
                  onClick={closePopup} 
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all active:scale-95 shadow-xl shadow-blue-100"
                >
                  SAYA MENGERTI
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        <div className="absolute inset-0 -z-10" onClick={closePopup} />
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none !important; }
        .hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
    </AnimatePresence>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeAboutTab, setActiveAboutTab] = useState('sejarah');
  const [activeAthleteFilter, setActiveAthleteFilter] = useState('all');
  const [showStruktur, setShowStruktur] = useState(false); 

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
    if (sectionId === 'struktur' || subPath === 'organisasi' || sectionId === 'organization') {
        setShowStruktur(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    setShowStruktur(false);
    if (sectionId === 'tentang-kami' || ['sejarah', 'visi-misi', 'fasilitas'].includes(subPath || '')) {
      if (subPath) setActiveAboutTab(subPath);
    }
    if (sectionId === 'atlet' && subPath) {
      setActiveAthleteFilter(subPath);
      window.dispatchEvent(new CustomEvent('filterAtlet', { detail: subPath }));
    }
    
    setTimeout(() => {
      const element = document.getElementById(subPath || sectionId) || document.getElementById(sectionId);
      if (element) {
        window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      }
    }, 100);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white font-black italic tracking-tighter uppercase">Initializing...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-white selection:bg-blue-600 selection:text-white">
            <ImagePopup />
            <Navbar onNavigate={handleNavigate} />
            <AnimatePresence mode="wait">
              {!showStruktur ? (
                <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Hero />
                  <About activeTab={activeAboutTab} onTabChange={(id) => setActiveAboutTab(id)} />
                  <News />
                  <Athletes initialFilter={activeAthleteFilter} />
                  <Ranking />
                  <Gallery />
                  <section id="register" className="py-20 bg-slate-900 border-y border-white/5">
                    <RegistrationForm />
                  </section>
                  <Contact />
                </motion.div>
              ) : (
                <motion.div key="struktur" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pt-20 bg-slate-50 min-h-screen relative">
                  <StrukturOrganisasi />
                  <motion.button 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { setShowStruktur(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-slate-900 text-white rounded-full font-black text-[11px] tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all z-50 uppercase flex items-center gap-3 border border-white/10"
                  >
                    <ArrowUp size={16} /> Kembali ke Beranda
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
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
      <aside className={`h-full flex-shrink-0 z-[101] transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} absolute md:relative`}>
        <Sidebar email={session.user.email} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </aside>
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <div className="md:hidden flex items-center justify-between bg-[#0F172A] p-4 border-b border-white/5">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2 hover:bg-white/10 rounded-lg"><Menu /></button>
          <div className="text-white font-black italic tracking-tighter text-sm uppercase">Admin Console</div>
          <div className="w-8"></div>
        </div>
        <div className="flex-1 overflow-y-auto bg-[#050505] custom-scrollbar">
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
            <Route path="about" element={<AdminAbout />} />
            <Route path="struktur" element={<AdminStructure />} /> 
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </main>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #050505; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}