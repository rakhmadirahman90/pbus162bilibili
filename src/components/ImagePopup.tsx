import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
      const { data, error } = await supabase
        .from('konfigurasi_popup')
        .select('url_gambar, judul, deskripsi')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setContent(data);
        setTimeout(() => setIsOpen(true), 800);
      }
    };
    fetchActivePopup();
  }, []);

  if (!content || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        
        {/* MODAL CARD - Responsif & Tidak Memotong */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-[350px] bg-white rounded-[1.5rem] shadow-2xl flex flex-col overflow-hidden border-4 border-white"
          style={{ 
            maxHeight: '90vh' // Memastikan pop-up tidak melebihi tinggi layar HP/Desktop
          }}
        >
          
          {/* TOMBOL TUTUP - Tetap di posisi yang jelas */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 z-[110] p-1.5 bg-red-600 text-white rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform active:scale-90"
          >
            <X size={16} strokeWidth={4} />
          </button>

          {/* WRAPPER SCROLLABLE - Untuk menjaga konten jika layar sangat kecil */}
          <div className="flex flex-col overflow-y-auto custom-scrollbar">
            
            {/* AREA GAMBAR - Mengikuti tinggi asli gambar secara proporsional */}
            <div className="w-full bg-slate-50 flex items-start justify-center">
              <img 
                src={content.url_gambar} 
                className="w-full h-auto block" // h-auto agar gambar tampil utuh sesuai aspek rasio aslinya
                alt={content.judul}
                loading="eager"
              />
            </div>

            {/* AREA TEKS - Ringkas & Elegan */}
            <div className="p-5 text-center bg-white">
              <h3 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 leading-tight mb-2">
                {content.judul}
              </h3>
              
              <p className="text-slate-500 text-[10px] font-bold leading-relaxed mb-4 opacity-80 line-clamp-2">
                {content.deskripsi}
              </p>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                TUTUP INFORMASI
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}