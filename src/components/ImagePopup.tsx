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
   * FUNGSI FORMATTER (VERSI PERBAIKAN TOTAL)
   * Memaksa link menjadi block atau inline-block agar word-break bekerja maksimal
   */
  const formatContent = (text: string) => {
    if (!text) return null;

    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

    return text.split('\n').map((line, lineIdx) => {
      if (line.trim() === "") return <div key={`spacer-${lineIdx}`} className="h-4" />;

      return (
        <p 
          key={`line-${lineIdx}`} 
          className="mb-3 last:mb-0 leading-relaxed text-left whitespace-normal"
          style={{ 
            wordBreak: 'break-word', 
            overflowWrap: 'anywhere',
            display: 'block',
            width: '100%' 
          }}
        >
          {line.split(urlRegex).map((part, partIdx) => {
            if (part.match(urlRegex)) {
              const cleanUrl = part.startsWith('www.') ? `https://${part}` : part;
              return (
                <a
                  key={`link-${partIdx}`}
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  /* Link dipaksa break-all dan overflow-wrap anywhere */
                  className="text-blue-400 hover:text-blue-300 font-bold underline decoration-blue-500/30 underline-offset-4 transition-all"
                  style={{ 
                    wordBreak: 'break-all', 
                    overflowWrap: 'anywhere',
                    display: 'inline-block', // Mengubah ke inline-block agar kontainer lebih patuh
                    maxWidth: '100%',
                    verticalAlign: 'bottom'
                  }}
                  onClick={(e) => e.stopPropagation()} 
                >
                  <span className="break-all">{part}</span>
                  <ExternalLink size={12} className="inline-block ml-1 mb-0.5 shrink-0" />
                </a>
              );
            }
            return <span key={`text-${partIdx}`} style={{ overflowWrap: 'anywhere' }}>{part}</span>;
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
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        >
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            onClick={(e) => e.stopPropagation()} 
            /* Perbaikan Struktur: Menggunakan table-fixed secara simulasi dengan w-full + overflow-hidden */
            className="relative w-full max-w-[440px] bg-[#0F172A] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 z-[100] p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-all active:scale-90 border border-white/20"
            >
              <X size={20} strokeWidth={3} />
            </button>

            <div ref={scrollRef} className="overflow-y-auto hide-scrollbar custom-scroll-area">
              {/* Gambar */}
              <div className="relative aspect-[4/3] w-full bg-slate-800 shrink-0">
                <img 
                  src={content.url_gambar} 
                  className="w-full h-full object-cover" 
                  alt="Popup" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent" />
              </div>

              {/* Konten */}
              <div className="px-6 sm:px-8 pt-6 pb-10 w-full">
                <div className="flex justify-center mb-5">
                  <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} fill="currentColor" /> Pengumuman
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white text-center uppercase tracking-tighter mb-6">
                  {content.judul}
                </h3>

                {/* AREA KRUSIAL: Penggunaan min-w-0 untuk mematahkan paksaan lebar konten */}
                <div className="w-full min-w-0 bg-slate-900/50 rounded-3xl p-5 border border-white/5 text-slate-300 text-sm shadow-inner overflow-hidden">
                  <div className="w-full min-w-0">
                    {formatContent(content.deskripsi)}
                  </div>
                </div>

                {/* Tombol */}
                <div className="mt-8 space-y-3">
                  {content.file_url && (
                    <a 
                      href={content.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all"
                    >
                      <Download size={18} /> Unduh Lampiran
                    </a>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all border border-white/10"
                  >
                    Saya Mengerti
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </AnimatePresence>
  );
}