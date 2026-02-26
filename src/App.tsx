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

// IMPORT BARU: Pastikan file ini ada di src/components/KelolaSurat.tsx
import { KelolaSurat } from './components/KelolaSurat'; 

import { X, ChevronLeft, ChevronRight, Menu, Zap, Download, ArrowUp, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
          setTimeout(() => setIsOpen(true), 1000);
        }
      } catch (err) {
        console.error("Gagal memuat pop-up:", err);
      }
    };
    fetchActivePopups();
  }, []);

  const renderCleanDescription = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    return text.split('\n').map((line, i) => (
      <p key={i} className="mb-3 last:mb-0 leading-[1.8] text-slate-600 text-left" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
        {line.split(urlRegex).map((part, index) => {
          if (part.match(urlRegex)) {
            const cleanUrl = part.startsWith('www.') ? `https://${part}` : part;
            return <a key={index} href={cleanUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline font-bold inline">{part}</a>;
          }
          return part;
        })}
      </p>
    ));
  };

  const closePopup = () => setIsOpen(false);
  if (promoImages.length === 0 || !isOpen) return null;
  const current = promoImages[currentIndex];

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <div className="absolute inset-0" onClick={closePopup} />
        <motion.div key={current?.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-[420px] max-h-[85vh] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
          <button onClick={closePopup} className="absolute top-4 right-4 z-50 p-2 bg-white/90 rounded-full"><X size={18} /></button>
          <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar scroll-smooth">
            <img src={current?.url_gambar} className="w-full aspect-[4/5] object-cover" alt="" />
            <div className="px-8 pb-10 pt-4 bg-white">
              <h3 className="text-2xl font-black italic uppercase text-center mb-6">{current?.judul}</h3>
              <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-6 mb-8">
                <div className="text-[13px] font-medium leading-relaxed">{renderCleanDescription(current?.deskripsi)}</div>
              </div>
              <button onClick={closePopup} className="w-full py-4.5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em]">Saya Mengerti</button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

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
    if (sectionId === 'struktur' || subPath === 'organisasi') {
        setShowStruktur(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    setShowStruktur(false);
    setTimeout(() => {
      const element = document.getElementById(subPath || sectionId);
      if (element) window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    }, 100);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0F172A]"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-white w-full overflow-x-hidden">
            <ImagePopup />
            <Navbar onNavigate={handleNavigate} />
            <AnimatePresence mode="wait">
              {!showStruktur ? (
                <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                  <Hero /><About activeTab={activeAboutTab} onTabChange={setActiveAboutTab} /><News /><Athletes initialFilter={activeAthleteFilter} /><Ranking /><Gallery />
                  <section id="register" className="py-20 bg-slate-900"><RegistrationForm /></section><Contact />
                </motion.div>
              ) : (
                <motion.div key="struktur" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="pt-20 bg-slate-50 min-h-screen w-full">
                  <StrukturOrganisasi />
                  <button onClick={() => setShowStruktur(false)} className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-slate-900 text-white rounded-full">Kembali ke Beranda</button>
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
        <div className="md:hidden flex items-center justify-between bg-[#0F172A] p-4">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white"><Menu /></button>
          <div className="text-white font-black italic uppercase">Admin Console</div>
          <div className="w-8"></div>
        </div>
        <div className="flex-1 overflow-y-auto bg-[#050505]">
          <Routes>
            <Route path="dashboard" element={<ManajemenPendaftaran />} />
            <Route path="atlet" element={<ManajemenAtlet />} />
            <Route path="surat" element={<KelolaSurat />} /> {/* RUTE SURAT */}
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
    </div>
  );
}