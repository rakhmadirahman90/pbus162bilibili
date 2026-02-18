import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase'; // Pastikan path import sesuai

export default function ImagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<{
    url_gambar: string;
    judul: string;
    deskripsi: string;
  } | null>(null);

  useEffect(() => {
    // FUNGSI BARU: Mengambil data pop-up aktif secara dinamis
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
          // Munculkan pop-up setelah 500ms jika data ditemukan
          setTimeout(() => setIsOpen(true), 500);
        }
      } catch (err) {
        console.error("Popup Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivePopup();
  }, []); // Tanpa localStorage agar muncul setiap refresh

  const closePopup = () => setIsOpen(false);

  // Jika sedang loading atau tidak ada pop-up aktif di database, jangan tampilkan apa-apa
  if (loading || !content || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        
        {/* MODAL CONTAINER - Mungil & Terkunci */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 0.85, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          className="relative bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col shadow-blue-500/20"
          style={{ 
            width: '300px', 
            maxHeight: '90vh', 
            border: '4px solid white'
          }}
        >
          
          {/* TOMBOL TUTUP */}
          <button 
            onClick={closePopup}
            className="absolute top-3 right-3 z-[100] p-1.5 bg-red-600 text-white rounded-full shadow-lg border-2 border-white hover:bg-red-700 transition-all active:scale-90"
          >
            <X size={16} strokeWidth={4} />
          </button>

          {/* INTERNAL WRAPPER */}
          <div className="flex flex-col h-full">
            
            {/* GAMBAR DINAMIS - Diambil dari Database */}
            <div className="w-full shrink-0 bg-slate-100 relative" style={{ height: '280px' }}>
              <img 
                src={content.url_gambar} 
                className="w-full h-full object-cover" 
                alt={content.judul}
              />
              {/* Overlay gradasi agar teks lebih menyatu */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
            </div>

            {/* AREA TEKS DINAMIS */}
            <div className="p-5 text-center bg-white -mt-2 relative z-10">
              <h3 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 leading-tight mb-2">
                {/* Mendukung highlighting kata terakhir secara otomatis */}
                {content.judul.split(' ').slice(0, -1).join(' ')} <span className="text-blue-600">{content.judul.split(' ').pop()}</span>
              </h3>
              
              <p className="text-slate-500 text-[10px] font-bold leading-relaxed mb-5 opacity-80 px-2 line-clamp-3">
                {content.deskripsi}
              </p>
              
              <button 
                onClick={closePopup}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-200 transition-all active:scale-95"
              >
                MENGERTI
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}