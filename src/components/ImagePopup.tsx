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

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const fetchActivePopup = async () => {
      try {
        const { data, error } = await supabase
          .from('konfigurasi_popup')
          .select('url_gambar, judul')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(); // Menggunakan maybeSingle agar tidak error jika data kosong

        if (data && !error) {
          setContent(data);
          // Trigger muncul setelah data berhasil diambil
          timer = setTimeout(() => {
            setIsOpen(true);
          }, 1000);
        }
      } catch (err) {
        console.error("Popup fetch error:", err);
      }
    };

    fetchActivePopup();

    // Cleanup timer saat komponen unmount
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []); // Dependensi kosong menjamin eksekusi ulang setiap hard refresh

  if (!content || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-8">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative flex flex-col items-center w-full h-full justify-center pointer-events-none"
        >
          
          {/* Container Gambar dengan batasan yang ketat agar tidak terpotong */}
          <div className="relative flex flex-col items-center pointer-events-auto max-w-full max-h-full">
            
            {/* Tombol Tutup - Posisi Responsif */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 md:-right-12 p-2 text-white/70 hover:text-white transition-all bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-xl border border-white/20"
            >
              <X size={24} strokeWidth={2.5} />
            </button>

            {/* Wrapper Gambar */}
            <div className="relative shadow-2xl rounded-2xl overflow-hidden flex items-center justify-center border border-white/10">
              <img 
                src={content.url_gambar} 
                alt={content.judul}
                // Menyesuaikan ukuran secara otomatis berdasarkan layar
                className="w-auto h-auto max-w-[90vw] max-h-[70vh] md:max-h-[80vh] object-contain"
                style={{ display: 'block' }}
              />
            </div>

            {/* Label Petunjuk */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-6 text-white/30 text-[9px] uppercase tracking-[0.4em] font-bold text-center"
            >
              Klik di luar gambar untuk menutup
            </motion.p>
          </div>

        </motion.div>

        {/* Overlay Klik untuk Menutup */}
        <div 
          className="absolute inset-0 -z-10 cursor-pointer" 
          onClick={() => setIsOpen(false)} 
        />
      </div>
    </AnimatePresence>
  );
}