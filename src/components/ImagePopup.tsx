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
   * FUNGSI FORMATTER (FORCE WRAP VERSION)
   */
  const formatContent = (text: string) => {
    if (!text) return null;

    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

    return text.split('\n').map((line, lineIdx) => {
      if (line.trim() === "") return <div key={`spacer-${lineIdx}`} className="h-4" />;

      return (
        <p 
          key={`line-${lineIdx}`} 
          className="mb-3 last:mb-0 leading-relaxed text-left"
          style={{ 
            wordBreak: 'break-all', 
            overflowWrap: 'anywhere',
            display: 'block',
            width: '100%',
            whiteSpace: 'pre-wrap' // Menjaga spasi tetap rapi tapi bisa patah
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
                  className="text-blue-500 hover:text-blue-700 font-bold underline transition-all"
                  style={{ 
                    wordBreak: 'break-all', 
                    overflowWrap: 'anywhere',
                    display: 'inline',
                    maxWidth: '100%'
                  }}
                  onClick={(e) => e.stopPropagation()} 
                >
                  {part} <ExternalLink size={12} className="inline-block" />
                </a>
              );
            }
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
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} 
            /* KUNCI PERBAIKAN: 
               1. max-w-[440px] dikunci.
               2. flex-col dengan overflow-hidden.
               3. Table-fixed behavior via w-full + min-w-0.
            */
            className="relative w-full max-w-[440px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-[110] p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors border border-gray-200"
            >
              <X size={18} />
            </button>

            <div ref={scrollRef} className="overflow-y-auto hide-scrollbar">
              {/* Gambar Atas */}
              <div className="w-full shrink-0">
                <img 
                  src={content.url_gambar} 
                  className="w-full h-auto object-contain" 
                  alt="Banner" 
                />
              </div>

              {/* Konten Teks */}
              <div className="px-6 py-8 w-full">
                <div className="flex justify-center mb-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-blue-100">
                    <Zap size={12} fill="currentColor" /> Pengumuman Resmi
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-gray-900 text-center uppercase tracking-tight mb-6 leading-tight">
                  {content.judul}
                </h3>

                {/* AREA YANG BERMASALAH: Sekarang dibungkus dengan min-w-0 */}
                <div className="w-full min-w-0 bg-gray-50 rounded-2xl p-5 border border-gray-100 text-gray-700 text-sm overflow-hidden">
                  <div className="w-full min-w-0 overflow-hidden">
                    {formatContent(content.deskripsi)}
                  </div>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase text-xs tracking-widest transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
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