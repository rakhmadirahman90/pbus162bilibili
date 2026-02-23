import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Download, ExternalLink } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

export default function ImagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchActivePopup = async () => {
      try {
        const { data, error } = await supabase
          .from('konfigurasi_popup')
          .select('*')
          .eq('is_active', true)
          .order('urutan', { ascending: true });

        if (error) return;

        if (data && data.length > 0) {
          // Pilih data yang memiliki file_url atau ambil data pertama
          const selected = data.find((item: any) => item.file_url) || data[0];
          setContent(selected);
          
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 1000);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchActivePopup();
  }, []);

  /**
   * FUNGSI FORMATTER LINK & PARAGRAF (VERSI FINAL)
   * Mengubah teks mentah menjadi elemen React yang bisa diklik
   */
  const formatContent = (text: string) => {
    if (!text) return null;

    // Regex yang lebih kuat untuk mendeteksi link
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

    // Split berdasarkan baris baru (\n)
    return text.split('\n').map((line, lineIdx) => {
      // Jika baris kosong, berikan spacer vertikal
      if (line.trim() === "") return <div key={`spacer-${lineIdx}`} className="h-4" />;

      return (
        <p key={`line-${lineIdx}`} className="mb-3 last:mb-0 leading-relaxed text-left">
          {line.split(urlRegex).map((part, partIdx) => {
            // Jika bagian ini adalah URL
            if (part.match(urlRegex)) {
              const cleanUrl = part.startsWith('www.') ? `https://${part}` : part;
              return (
                <a
                  key={`link-${partIdx}`}
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold underline decoration-blue-500/50 underline-offset-4 transition-all hover:scale-[1.02] active:scale-95 z-[9999999]"
                  onClick={(e) => e.stopPropagation()} // Mencegah popup tertutup saat klik link
                >
                  {part} <ExternalLink size={12} className="inline" />
                </a>
              );
            }
            // Jika teks biasa
            return <span key={`text-${partIdx}`}>{part}</span>;
          })}
        </p>
      );
    });
  };

  if (!content) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6"
        >
          {/* Overlay Click to Close */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            onClick={(e) => e.stopPropagation()} // Agar modal tidak tutup saat diklik isinya
            className="relative w-full max-w-[440px] bg-[#0F172A] rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10 flex flex-col max-h-[90vh]"
          >
            {/* Tombol Close Floating */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 z-[100] p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-lg transition-all active:scale-90 border border-white/20"
            >
              <X size={20} strokeWidth={3} />
            </button>

            <div ref={scrollRef} className="overflow-y-auto hide-scrollbar custom-scroll-area">
              {/* Image Section */}
              <div className="relative aspect-[4/3] w-full bg-slate-800">
                <img 
                  src={content.url_gambar} 
                  className="w-full h-full object-cover" 
                  alt="Popup Visual" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
              </div>

              {/* Body Content */}
              <div className="px-8 pt-6 pb-12">
                <div className="flex justify-center mb-5">
                  <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Zap size={14} fill="currentColor" /> Pengumuman Terbaru
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white text-center italic uppercase tracking-tighter leading-tight mb-8">
                  {content.judul}
                </h3>

                {/* Kontainer Teks - Diperbaiki agar Link bisa diklik dengan nyaman */}
                <div className="bg-slate-900/50 rounded-[1.5rem] p-6 border border-white/5 text-slate-300 text-[14px] font-medium leading-relaxed shadow-inner">
                  <div className="relative z-10">
                    {formatContent(content.deskripsi)}
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="mt-8 space-y-3">
                  {content.file_url && (
                    <a 
                      href={content.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-xl shadow-blue-900/40 active:scale-95"
                    >
                      <Download size={18} /> Unduh File Lampiran
                    </a>
                  )}
                  
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all border border-white/10 active:scale-95"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* CSS Khusus agar Scrollbar hilang namun fungsi scroll tetap ada */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { 
          display: none; 
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scroll-area {
          scroll-behavior: smooth;
        }
      `}</style>
    </AnimatePresence>
  );
}