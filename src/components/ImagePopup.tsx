import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Download } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

export default function ImagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchActivePopup = async () => {
      try {
        // Ambil data terbaru tanpa filter berlebih dulu untuk tes
        const { data, error } = await supabase
          .from('konfigurasi_popup')
          .select('*')
          .eq('is_active', true)
          .order('id', { ascending: false }) // Ambil yang paling baru diinput
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Kesalahan Supabase:", error.message);
          return;
        }

        if (data) {
          console.log("DATA FULL DARI DATABASE:", data);
          setContent(data);
          
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 1000);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error("Sistem Error:", err);
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

  // Logika Pengecekan Link (Gunakan salah satu kolom ini yang mungkin berisi URL)
  const finalDownloadLink = content.file_url || content.url_file || content.link_file;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-[400px] max-h-[85vh]"
          >
            {/* Tombol Tutup */}
            <button onClick={handleClose} className="absolute -top-12 right-0 flex items-center gap-2 group">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Tutup</span>
              <div className="p-2 bg-white/10 text-white rounded-full border border-white/20 group-hover:bg-white group-hover:text-black transition-all">
                <X size={18} />
              </div>
            </button>

            <div className="bg-[#0F172A] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col h-full">
              <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar scroll-smooth">
                
                {/* Image Section */}
                <div className="relative w-full">
                  <img src={content.url_gambar} className="w-full h-auto block" alt="Popup" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                </div>

                {/* Content Section */}
                <div className="px-10 pb-12 pt-6 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[9px] font-black uppercase flex items-center gap-2">
                      <Zap size={12} className="fill-blue-400" /> Pengumuman Resmi
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black italic uppercase text-white mb-3 leading-tight">
                    {content.judul}
                  </h3>
                  
                  <p className="text-slate-400 text-[11px] mb-10 leading-relaxed uppercase">
                    {content.deskripsi}
                  </p>
                  
                  {/* TOMBOL DOWNLOAD (DIPAKSA CEK SEMUA KEMUNGKINAN NAMA KOLOM) */}
                  {finalDownloadLink && finalDownloadLink !== "" && (
                    <motion.a 
                      href={finalDownloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-3 w-full py-4 mb-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl"
                    >
                      <Download size={16} /> DOWNLOAD LAMPIRAN
                    </motion.a>
                  )}

                  <button 
                    onClick={handleClose} 
                    className="w-full py-4.5 bg-white text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em]"
                  >
                    SAYA MENGERTI
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <style dangerouslySetInnerHTML={{ __html: `
            .hide-scrollbar::-webkit-scrollbar { display: none !important; }
            .hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
          `}} />
        </div>
      )}
    </AnimatePresence>
  );
}