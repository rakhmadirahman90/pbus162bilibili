import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

export default function ImagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<{
    url_gambar: string;
    judul: string;
  } | null>(null);

  // FUNGSI PENGAMBILAN DATA (FORCE REFRESH SETIAP MOUNT)
  useEffect(() => {
    const fetchActivePopup = async () => {
      try {
        const { data, error } = await supabase
          .from('konfigurasi_popup')
          .select('url_gambar, judul')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          setContent(data);
          // Memicu pop-up muncul 1 detik setelah landing page dimuat
          setTimeout(() => setIsOpen(true), 1000);
        }
      } catch (err) {
        console.error("Popup Error:", err);
      }
    };

    fetchActivePopup();
  }, []); // Array kosong memastikan eksekusi setiap kali halaman di-refresh

  const closePopup = () => setIsOpen(false);

  if (!content || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        
        {/* CONTAINER UTAMA - Skala proporsional agar tidak memenuhi layar berlebihan */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative flex flex-col items-center max-w-full max-h-full pointer-events-none"
        >
          
          {/* WRAPPER KARTU MINIMALIS */}
          <div className="relative pointer-events-auto flex flex-col items-center">
            
            {/* TOMBOL TUTUP - Posisi menggantung di pojok kanan atas gambar */}
            <button 
              onClick={closePopup}
              className="absolute -top-12 right-0 p-2.5 bg-red-600 text-white rounded-full shadow-2xl border-2 border-white transition-all hover:bg-red-700 active:scale-90 z-[110]"
            >
              <X size={20} strokeWidth={3} />
            </button>

            {/* BINGKAI GAMBAR - Menyesuaikan tinggi layar (Anti-Terpotong) */}
            <div className="relative bg-white p-1.5 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden">
              <img 
                src={content.url_gambar} 
                alt={content.judul}
                // max-h dikunci agar poster panjang tidak terpotong navigasi browser
                className="w-auto h-auto max-w-[85vw] max-h-[70vh] md:max-h-[80vh] rounded-xl object-contain block"
              />
            </div>

            {/* AREA TEKS & ACTION (MINIMALIS) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-4 flex flex-col items-center gap-3"
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full">
                <p className="text-white text-[10px] font-black uppercase tracking-[0.3em]">
                  {content.judul || 'Informasi Terbaru'}
                </p>
              </div>
              
              <button 
                onClick={closePopup}
                className="text-white/40 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-colors flex flex-col items-center gap-1"
              >
                <span>Klik dimana saja untuk tutup</span>
                <div className="w-8 h-[1px] bg-white/20"></div>
              </button>
            </motion.div>
          </div>

        </motion.div>

        {/* OVERLAY KLIK UNTUK TUTUP (AREA GELAP) */}
        <div 
          className="absolute inset-0 -z-10 cursor-pointer" 
          onClick={closePopup} 
        />
      </div>
    </AnimatePresence>
  );
}