import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase'; // Sesuaikan path ini dengan config Anda

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
        // Mengambil data terbaru yang statusnya is_active = true
        const { data, error } = await supabase
          .from('konfigurasi_popup')
          .select('url_gambar, judul, deskripsi')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          setContent(data);
          // Munculkan otomatis 1.5 detik setelah halaman landing page termuat
          const timer = setTimeout(() => setIsOpen(true), 1500);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error("Gagal memuat pop-up:", err);
      }
    };

    fetchActivePopup();
  }, []); // [] Menjamin fungsi berjalan setiap kali refresh halaman

  if (!content || !isOpen) return null;

  return (
    <AnimatePresence>
      {/* Overlay Background Gelap */}
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-6">
        
        {/* KONTINER POP-UP */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-[400px] flex flex-col items-center"
        >
          
          {/* TOMBOL TUTUP (FLOATING) */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute -top-14 right-0 p-3 bg-white/10 hover:bg-rose-600 text-white rounded-full backdrop-blur-xl border border-white/20 transition-all active:scale-90 group z-50 shadow-2xl"
          >
            <X size={24} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
          </button>

          {/* KARTU VISUAL UTAMA */}
          <div className="relative w-full bg-[#0F172A] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.2)]">
            
            {/* BADGE INFO (SINKRON DENGAN ADMIN) */}
            <div className="absolute top-5 left-5 z-20">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/90 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
                <Bell size={12} className="text-white animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Informasi Penting</span>
              </div>
            </div>

            {/* AREA GAMBAR (SINKRON DENGAN ADMIN) */}
            <div className="relative w-full aspect-[4/5] bg-black flex items-center justify-center">
              <img 
                src={content.url_gambar} 
                alt={content.judul}
                className="w-full h-full object-cover" // Mengikuti gaya cover pada Admin Archive
              />
              {/* Gradasi Lembut di Bagian Bawah Gambar */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0F172A] to-transparent" />
            </div>

            {/* KONTEN TEKS (SINKRON DENGAN ADMIN) */}
            <div className="p-8 pt-2 text-center relative z-10">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-3 leading-tight">
                {/* Otomatis memberikan warna biru pada kata terakhir */}
                {content.judul.split(' ').slice(0, -1).join(' ')} <span className="text-blue-500">{content.judul.split(' ').pop()}</span>
              </h3>
              
              <p className="text-white/50 text-xs font-medium leading-relaxed mb-8 line-clamp-3">
                {content.deskripsi}
              </p>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-blue-900/40 transition-all active:scale-95 border border-white/10"
              >
                Saya Mengerti
              </button>
            </div>
          </div>

          {/* PETUNJUK TUTUP CEPAT */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="mt-6 text-white/20 text-[9px] font-black uppercase tracking-[0.4em]"
          >
            Klik di luar atau tombol X untuk menutup
          </motion.p>

        </motion.div>

        {/* OVERLAY KLIK UNTUK TUTUP */}
        <div 
          className="absolute inset-0 -z-10 cursor-pointer" 
          onClick={() => setIsOpen(false)} 
        />
      </div>
    </AnimatePresence>
  );
}