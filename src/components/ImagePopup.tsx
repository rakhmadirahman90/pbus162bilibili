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
    const fetchActivePopup = async () => {
      // Mengambil data terbaru yang aktif setiap kali halaman dimuat (refresh)
      const { data, error } = await supabase
        .from('konfigurasi_popup')
        .select('url_gambar, judul')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setContent(data);
        // Memberikan jeda 1 detik setelah refresh agar landing page termuat sempurna sebelum pop-up muncul
        const timer = setTimeout(() => setIsOpen(true), 1000);
        return () => clearTimeout(timer);
      }
    };

    fetchActivePopup();
  }, []); // Array kosong memastikan ini berjalan setiap kali komponen mount (setiap refresh)

  if (!content || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-8">
        
        {/* Kontainer Utama Minimalis */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", duration: 0.7, bounce: 0.4 }}
          className="relative flex flex-col items-center max-w-full max-h-full"
        >
          
          {/* Tombol Tutup Modern */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute -top-14 right-0 md:-right-12 p-2.5 text-white/70 hover:text-white transition-all bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-xl border border-white/20 hover:scale-110 active:scale-90"
            title="Tutup"
          >
            <X size={24} strokeWidth={2.5} />
          </button>

          {/* Wrapper Gambar Responsif (Anti-Terpotong) */}
          <div className="relative shadow-[0_0_80px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden bg-transparent flex items-center justify-center">
            <img 
              src={content.url_gambar} 
              alt={content.judul}
              // max-h dipastikan agar tidak melebihi layar di HP maupun Desktop
              className="object-contain w-auto h-auto max-w-[92vw] max-h-[75vh] md:max-h-[85vh] rounded-xl border border-white/10"
              style={{ display: 'block' }}
            />
            
            {/* Overlay Ring Premium */}
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/30 rounded-xl"></div>
          </div>

          {/* Panduan Tutup Minimalis */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-6 flex flex-col items-center gap-2"
          >
            <p className="text-white/30 text-[9px] uppercase tracking-[0.5em] font-bold">
              Klik dimana saja untuk menutup
            </p>
            <div className="w-12 h-[1px] bg-white/10"></div>
          </motion.div>

        </motion.div>

        {/* Klik Overlay Background untuk Menutup */}
        <div 
          className="absolute inset-0 -z-10 cursor-pointer" 
          onClick={() => setIsOpen(false)} 
        />
      </div>
    </AnimatePresence>
  );
}