import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Download } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

export default function ImagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<{
    url_gambar: string;
    judul: string;
    deskripsi: string;
    file_url?: string | null; // Menambahkan null untuk kompatibilitas database
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchActivePopup = async () => {
      try {
        const { data, error } = await supabase
          .from('konfigurasi_popup')
          .select('url_gambar, judul, deskripsi, file_url') 
          .eq('is_active', true)
          .order('urutan', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Supabase Error:", error.message);
          return;
        }

        if (data) {
          // DEBUG: Cek di console browser (F12)
          console.log("Data Popup Diterima:", data); 
          setContent(data);
          
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 800);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error("Error sistem:", err);
      }
    };

    fetchActivePopup();
  }, []);

  useEffect(() => {
    let scrollInterval: any;
    if (isOpen && scrollRef.current) {
      const startTimeout = setTimeout(() => {
        scrollInterval = setInterval(() => {
          if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 2) {
              clearInterval(scrollInterval);
            } else {
              scrollRef.current.scrollBy({ top: 1, behavior: 'auto' });
            }
          }
        }, 40); 
      }, 2500);

      return () => {
        clearInterval(scrollInterval);
        clearTimeout(startTimeout);
      };
    }
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  if (!content) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[400px] max-h-[85vh]"
          >
            {/* Tombol Close Atas */}
            <button 
              onClick={handleClose}
              className="absolute -top-12 right-0 flex items-center gap-2 group transition-all"
            >
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Tutup</span>
              <div className="p-2 bg-white/10 backdrop-blur-2xl text-white rounded-full border border-white/20 group-hover:bg-white group-hover:text-black transition-all">
                <X size={18} />
              </div>
            </button>

            <div className="bg-[#0F172A] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col h-full ring-1 ring-white/5">
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto hide-scrollbar scroll-smooth"
              >
                {/* Gambar/Poster */}
                <div className="relative w-full bg-slate-900">
                  <img 
                    src={content.url_gambar} 
                    className="w-full h-auto block" 
                    alt={content.judul} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
                </div>

                {/* Konten Teks */}
                <div className="px-10 pb-12 pt-6 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                      <Zap size={12} className="fill-blue-400" /> Pengumuman Resmi
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black italic uppercase text-white mb-3">
                    {content.judul}
                  </h3>
                  
                  <p className="text-slate-400 text-xs mb-10 leading-relaxed uppercase tracking-wide">
                    {content.deskripsi}
                  </p>
                  
                  {/* TOMBOL DOWNLOAD PERBAIKAN: Menggunakan pengecekan string yang lebih kuat */}
                  {content.file_url && content.file_url !== "NULL" && content.file_url.trim().length > 0 && (
                    <motion.a 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      href={content.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4 mb-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-lg active:scale-95"
                    >
                      <Download size={16} /> DOWNLOAD LAMPIRAN
                    </motion.a>
                  )}

                  <button 
                    onClick={handleClose} 
                    className="w-full py-4.5 bg-white hover:bg-slate-200 text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all"
                  >
                    SAYA MENGERTI
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="absolute inset-0 -z-10" onClick={handleClose} />

          <style dangerouslySetInnerHTML={{ __html: `
            .hide-scrollbar::-webkit-scrollbar { display: none !important; }
            .hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
          `}} />
        </div>
      )}
    </AnimatePresence>
  );
}