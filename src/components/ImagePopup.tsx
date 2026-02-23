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
          // Mengambil data yang memiliki file_url atau yang pertama
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

  // --- FUNGSI FORMATTER LINK & PARAGRAF (VERSI FIX) ---
  const formatContent = (text: string) => {
    if (!text) return null;

    // Regex untuk mendeteksi link
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

    // Membersihkan teks dari karakter aneh dan split berdasarkan baris
    return text.split('\n').map((line, lineIdx) => {
      // Jika baris kosong (hanya enter), berikan elemen spacer yang konsisten
      if (line.trim() === "") return <div key={`spacer-${lineIdx}`} className="h-4" />;

      return (
        <p key={`line-${lineIdx}`} className="mb-2 last:mb-0 leading-relaxed text-left text-slate-300">
          {line.split(urlRegex).map((part, partIdx) => {
            if (part.match(urlRegex)) {
              const cleanUrl = part.startsWith('www.') ? `https://${part}` : part;
              return (
                <a
                  key={`link-${partIdx}`}
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold underline decoration-blue-500/30 underline-offset-4 break-all transition-colors mx-1"
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
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative w-full max-w-[440px] bg-[#0F172A] rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10 flex flex-col max-h-[90vh]"
          >
            {/* Tombol Close Modern */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 z-50 p-2.5 bg-rose-600/20 hover:bg-rose-600 text-white rounded-full backdrop-blur-xl transition-all border border-rose-500/30 shadow-lg active:scale-90"
            >
              <X size={20} strokeWidth={3} />
            </button>

            <div ref={scrollRef} className="overflow-y-auto hide-scrollbar">
              {/* Image Section */}
              <div className="relative aspect-[4/3] w-full bg-slate-800 overflow-hidden">
                <img 
                  src={content.url_gambar} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
                  alt="Popup Banner" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
              </div>

              {/* Body Content */}
              <div className="px-8 pt-2 pb-10">
                <div className="flex justify-center mb-6">
                  <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Zap size={14} fill="currentColor" className="animate-pulse" /> Pengumuman Terbaru
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white text-center italic uppercase tracking-tighter leading-[1.1] mb-6 px-2">
                  {content.judul}
                </h3>

                {/* Kontainer Teks - FIX: Hapus whitespace-pre-wrap karena sudah dihandle manual */}
                <div className="bg-slate-900/50 rounded-[1.5rem] p-6 border border-white/5 shadow-inner ring-1 ring-inset ring-white/5">
                  <div className="text-[14px] leading-relaxed">
                    {formatContent(content.deskripsi)}
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="mt-8 space-y-3">
                  {content.file_url && (
                    <motion.a 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={content.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)]"
                    >
                      <Download size={18} /> Unduh Dokumen Lampiran
                    </motion.a>
                  )}
                  
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="w-full py-4.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] transition-all border border-white/10"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* CSS In JS untuk menghilangkan scrollbar secara paksa */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </AnimatePresence>
  );
}