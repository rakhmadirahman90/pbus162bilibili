import React, { useState, useEffect } from 'react';
import { X, Bell, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

export default function ImagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<{
    url_gambar: string;
    judul: string;
    deskripsi: string;
  } | null>(null);

  useEffect(() => {
    const fetchActivePopup = async () => {
      try {
        // Logika langsung mengambil data tanpa pengecekan localStorage/durasi waktu
        const { data, error } = await supabase
          .from('konfigurasi_popup')
          .select('url_gambar, judul, deskripsi')
          .eq('is_active', true)
          .order('urutan', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          setContent(data);
          
          // Memastikan state dimulai dari tertutup lalu terbuka (memicu animasi refresh)
          setIsOpen(false); 
          
          // Delay kecil 800ms agar efek transisi setelah loading halaman terasa halus
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 800);
          
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error("Gagal memuat pop-up:", err);
      }
    };

    fetchActivePopup();
    
    // Dependency array kosong [] memastikan kode ini berjalan 
    // tepat satu kali setiap kali halaman web dimuat ulang (refresh)
  }, []); 

  const handleClose = () => {
    setIsOpen(false);
    // Kita hapus pencatatan waktu agar tidak ada konflik logika 'sudah pernah muncul'
    localStorage.removeItem('popup_last_shown');
  };

  if (!content) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[380px] md:max-w-[420px]"
          >
            
            {/* TOMBOL TUTUP */}
            <button 
              onClick={handleClose}
              className="absolute -top-16 right-0 md:-right-4 p-3 bg-red-600 text-white rounded-full shadow-2xl hover:bg-red-700 transition-all active:scale-90 z-[100] border-4 border-black"
            >
              <X size={24} strokeWidth={3} />
            </button>

            <div className="bg-[#0F172A] rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.25)] flex flex-col">
              
              {/* BAGIAN GAMBAR */}
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-slate-900">
                <img 
                  src={content.url_gambar} 
                  alt={content.judul}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/20 rounded-full">
                  <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">New Promo</span>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent" />
              </div>

              {/* KONTEN TEKS */}
              <div className="px-8 pb-10 pt-2 text-center -mt-6 relative z-10">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-3 leading-none">
                  {content.judul.split(' ').length > 1 ? (
                    <>
                      {content.judul.split(' ').slice(0, -1).join(' ')} <span className="text-blue-500">{content.judul.split(' ').pop()}</span>
                    </>
                  ) : (
                    <span className="text-blue-500">{content.judul}</span>
                  )}
                </h3>
                
                <div className="w-12 h-1 bg-blue-500 mx-auto mb-4 rounded-full" />
                
                <p className="text-white/60 text-xs font-medium leading-relaxed mb-8 line-clamp-3 px-2">
                  {content.deskripsi}
                </p>
                
                <button 
                  onClick={handleClose}
                  className="group relative w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] transition-all shadow-xl shadow-blue-900/40 active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10">MENGERTI</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </div>

            <p className="text-center mt-6 text-white/20 text-[9px] font-bold uppercase tracking-[0.5em] animate-pulse">
              Sistem Informasi Otomatis
            </p>

          </motion.div>

          {/* BACKDROP CLICK TO CLOSE */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={handleClose} 
          />
        </div>
      )}
    </AnimatePresence>
  );
}