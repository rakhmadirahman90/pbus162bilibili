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
          // Munculkan pop-up dengan sedikit delay agar terasa smooth
          setTimeout(() => setIsOpen(true), 1000);
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
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
        
        {/* MODAL CARD CONTAINER */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[380px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col border border-white/20"
        >
          
          {/* TOP HEADER (Badge & Close) */}
          <div className="absolute top-4 inset-x-4 flex justify-between items-center z-[100]">
            <div className="bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/20 shadow-lg">
              <Bell size={12} className="text-white animate-bounce" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Info Terbaru</span>
            </div>
            
            <button 
              onClick={closePopup}
              className="p-2 bg-white/20 hover:bg-red-600 backdrop-blur-md text-white rounded-full shadow-lg border border-white/30 transition-all active:scale-90 group"
            >
              <X size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          {/* IMAGE SECTION - Menggunakan aspect ratio agar tidak terpotong */}
          <div className="relative w-full aspect-[4/5] bg-slate-200 overflow-hidden">
            <img 
              src={content.url_gambar} 
              className="w-full h-full object-contain bg-[#f8f9fa]" // object-contain memastikan gambar utuh
              alt={content.judul}
            />
            {/* Soft Gradient Overlay di bagian bawah gambar */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/40 to-transparent" />
          </div>

          {/* TEXT CONTENT SECTION */}
          <div className="p-6 pt-2 text-center bg-white relative z-10">
            <h3 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 leading-tight mb-2">
              {content.judul.split(' ').slice(0, -1).join(' ')} <span className="text-blue-600">{content.judul.split(' ').pop()}</span>
            </h3>
            
            <p className="text-slate-500 text-[11px] font-semibold leading-relaxed mb-6 opacity-90 px-2 line-clamp-3">
              {content.deskripsi}
            </p>
            
            <button 
              onClick={closePopup}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Saya Mengerti
            </button>
          </div>
          
        </motion.div>
      </div>
    </AnimatePresence>
  );
}