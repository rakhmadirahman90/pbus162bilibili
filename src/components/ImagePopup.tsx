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
      const { data, error } = await supabase
        .from('konfigurasi_popup')
        .select('url_gambar, judul')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setContent(data);
        // Delay muncul agar transisi lebih smooth
        setTimeout(() => setIsOpen(true), 1000);
      }
    };
    fetchActivePopup();
  }, []);

  if (!content || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-8">
        
        {/* Kontainer Utama Minimalis */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative flex flex-col items-center max-w-full max-h-full"
        >
          
          {/* Tombol Tutup Modern di luar gambar */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute -top-12 right-0 md:-right-12 p-2 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/20"
            title="Tutup"
          >
            <X size={24} strokeWidth={2.5} />
          </button>

          {/* Wrapper Gambar Responsif */}
          <div className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden bg-transparent flex items-center justify-center">
            <img 
              src={content.url_gambar} 
              alt={content.judul}
              className="object-contain w-auto h-auto max-w-[90vw] max-h-[80vh] md:max-h-[85vh] rounded-lg border border-white/10"
              style={{ display: 'block' }}
            />
            
            {/* Overlay Halus pada Gambar agar terlihat lebih premium */}
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/20 rounded-lg"></div>
          </div>

          {/* Label Minimalis (Opsional, di bawah gambar) */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-white/40 text-[10px] uppercase tracking-[0.4em] font-medium"
          >
            Klik di luar atau tombol X untuk menutup
          </motion.p>

        </motion.div>

        {/* Klik Overlay untuk Menutup */}
        <div 
          className="absolute inset-0 -z-10" 
          onClick={() => setIsOpen(false)} 
        />
      </div>
    </AnimatePresence>
  );
}