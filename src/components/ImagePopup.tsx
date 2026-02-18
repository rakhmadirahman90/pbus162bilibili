import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

export default function ImagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<{
    url_gambar: string;
    judul: string;
    deskripsi: string;
  } | null>(null);

  useEffect(() => {
    const fetchActivePopup = async () => {
      try {
        const { data, error } = await supabase
          .from('konfigurasi_popup')
          .select('url_gambar, judul, deskripsi')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          setContent(data);
          // Munculkan pop-up dengan delay halus
          setTimeout(() => setIsOpen(true), 1200);
        }
      } catch (err) {
        console.error("Popup Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivePopup();
  }, []);

  const closePopup = () => setIsOpen(false);

  if (loading || !content || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 md:p-6">
        
        {/* MODAL CARD - Ukuran Maksimal diperkecil agar pas di semua layar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 40 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-[340px] md:max-w-[360px] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border border-white/20"
        >
          
          {/* TOMBOL TUTUP - Desain Mengambang Modern */}
          <button 
            onClick={closePopup}
            className="absolute top-4 right-4 z-[110] p-2 bg-black/20 hover:bg-red-600 backdrop-blur-md text-white rounded-full transition-all active:scale-90 group border border-white/30"
          >
            <X size={18} strokeWidth={3} />
          </button>

          {/* SECTION GAMBAR - Solusi agar tidak terpotong */}
          <div className="relative w-full aspect-[3/4] bg-[#f8f9fa] flex items-center justify-center overflow-hidden border-b border-slate-100">
            <img 
              src={content.url_gambar} 
              className="w-full h-full object-contain p-2" // object-contain & padding memastikan gambar utuh 100%
              alt={content.judul}
            />
            
            {/* Badge Info Kecil */}
            <div className="absolute bottom-4 left-4">
              <div className="bg-blue-600/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-xl">
                <p className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Penting</p>
              </div>
            </div>
          </div>

          {/* SECTION CONTENT - Tipografi yang lebih bersih */}
          <div className="p-6 text-center bg-white">
            <h3 className="text-base md:text-lg font-black uppercase italic tracking-tighter text-slate-900 leading-tight mb-2 px-2">
              {content.judul.split(' ').slice(0, -1).join(' ')} <span className="text-blue-600">{content.judul.split(' ').pop()}</span>
            </h3>
            
            <p className="text-slate-500 text-[10px] md:text-[11px] font-bold leading-relaxed mb-6 opacity-80 line-clamp-3">
              {content.deskripsi}
            </p>
            
            <button 
              onClick={closePopup}
              className="group relative w-full py-4 bg-slate-900 overflow-hidden rounded-2xl transition-all hover:bg-blue-600 active:scale-95 shadow-xl shadow-slate-200"
            >
              <span className="relative z-10 text-white font-black uppercase text-[10px] tracking-[0.3em]">
                Mengerti
              </span>
              <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-blue-600 transition-transform duration-300" />
            </button>
          </div>
          
        </motion.div>
      </div>
    </AnimatePresence>
  );
}