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

  // --- FUNGSI FORMATTER LINK & PARAGRAF SUPER PRESISI ---
  const formatContent = (text: string) => {
    if (!text) return null;

    // 1. Regex untuk mendeteksi link (mendukung http, https, dan www)
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

    // 2. Split berdasarkan baris baru agar paragraf tetap terjaga
    return text.split('\n').map((line, lineIdx) => {
      // Jika baris kosong, berikan jarak (spacer)
      if (line.trim() === "") return <div key={lineIdx} className="h-3" />;

      return (
        <p key={lineIdx} className="mb-2 last:mb-0 leading-relaxed text-justify">
          {line.split(urlRegex).map((part, partIdx) => {
            if (part.match(urlRegex)) {
              const cleanUrl = part.startsWith('www.') ? `https://${part}` : part;
              return (
                <a
                  key={partIdx}
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold underline decoration-blue-500/30 underline-offset-4 break-all transition-colors"
                >
                  {part} <ExternalLink size={10} />
                </a>
              );
            }
            return part;
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
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-6"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative w-full max-w-[440px] bg-[#0F172A] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col max-h-[85vh]"
          >
            {/* Tombol Close Modern */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-rose-500 text-white rounded-full backdrop-blur-md transition-all border border-white/10"
            >
              <X size={20} />
            </button>

            <div ref={scrollRef} className="overflow-y-auto hide-scrollbar">
              {/* Image Section dengan Overlay */}
              <div className="relative aspect-video w-full bg-slate-800">
                <img src={content.url_gambar} className="w-full h-full object-cover" alt="Banner" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
              </div>

              {/* Body Content */}
              <div className="px-8 pt-4 pb-10">
                <div className="flex justify-center mb-4">
                  <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Zap size={12} fill="currentColor" /> Breaking News
                  </span>
                </div>

                <h3 className="text-xl font-black text-white text-center italic uppercase tracking-tight leading-tight mb-6">
                  {content.judul}
                </h3>

                {/* Kontainer Teks yang Rapih */}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5 text-slate-300 text-[13px] font-medium leading-loose shadow-inner">
                  <div className="whitespace-pre-wrap">
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
                      className="flex items-center justify-center gap-3 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-lg shadow-blue-900/20"
                    >
                      <Download size={16} /> Unduh Lampiran
                    </a>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all border border-white/10"
                  >
                    Tutup Pengumuman
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </AnimatePresence>
  );
}