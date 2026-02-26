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

/** * FIXED IMPORT: 
 * Berdasarkan panel file Anda, KelolaSurat.tsx berada di folder 'src', 
 * bukan di 'src/components'.
 */
import { KelolaSurat } from './KelolaSurat'; 

import { X, ChevronLeft, ChevronRight, Menu, Zap, Download, ArrowUp, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- POPUP COMPONENT (Asal kode tetap dipertahankan) ---
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
    return text.split('\n').map((line, i) => {
      if (line.trim() === "") return <div key={i} className="h-4" />;
      return (
        <p key={i} className="mb-3 leading-[1.8] text-slate-600 text-left" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
          {line.split(urlRegex).map((part, index) => {
            if (part.match(urlRegex)) {
              const cleanUrl = part.startsWith('www.') ? `https://${part}` : part;
              return (
                <a key={index} href={cleanUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">
                  {part} <ExternalLink size={10} className="inline-block" />
                </a>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  if (promoImages.length === 0 || !isOpen) return null;
  const current = promoImages[currentIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-[420px] bg-white rounded-[2rem] overflow-hidden shadow-2xl">
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full shadow-md hover:bg-rose-500 hover:text-white transition-all">
            <X size={18} />
          </button>
          <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
            <img src={current.url_gambar} className="w-full aspect-[4/5] object-cover" alt="Popup" />
            <div className="p-8 text-center">
              <h3 className="text-2xl font-black uppercase mb-4 text-slate-900">{current.judul}</h3>
              <div className="bg-slate-50 rounded-2xl p-6 mb-6 text-[13px]">
                {renderCleanDescription(current.deskripsi)}
              </div>
              <button onClick={() => setIsOpen(false)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Saya Mengerti</button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-white w-full overflow-x-hidden">
            <ImagePopup />
            <Navbar onNavigate={() => {}} />
            <Hero />
            <About activeTab="sejarah" onTabChange={() => {}} />
            <Footer />
          </div>
        } />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/*" element={session ? <AdminLayout session={session} /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

// --- ADMIN LAYOUT COMPONENT ---
function AdminLayout({ session }: { session: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden">
      <aside className={`h-full z-[101] transition-transform md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} absolute md:relative`}>
        <Sidebar email={session.user.email} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </aside>
      <main className="flex-1 flex flex-col min-w-0 h-full">
        <div className="md:hidden flex items-center justify-between bg-[#0F172A] p-4 border-b border-white/5">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2 hover:bg-white/10 rounded-lg"><Menu /></button>
          <div className="text-white font-black italic text-sm uppercase">Admin Console</div>
          <div className="w-8"></div>
        </div>
        <div className="flex-1 overflow-y-auto bg-[#050505] custom-scrollbar">
          <Routes>
            <Route path="dashboard" element={<ManajemenPendaftaran />} />
            <Route path="atlet" element={<ManajemenAtlet />} />
            
            {/* REGISTER KELOLA SURAT ROUTE HERE */}
            <Route path="surat" element={<KelolaSurat />} />
            
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