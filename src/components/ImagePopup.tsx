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
        const { data, error } = await supabase
          .from('konfigurasi_popup')
          .select('*')
          .eq('is_active', true)
          .order('urutan', { ascending: true });

        if (error) {
          console.error("Supabase Error:", error.message);
          return;
        }

        if (data && data.length > 0) {
          const selected = data.find((item: any) => item.file_url) || data[0];
          setContent(selected);
          
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 1000);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error("System Error:", err);
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
      return () => { clearInterval(scrollInterval); clearTimeout(startTimeout); };
    }
  }, [isOpen]);

  // KODE BARU: Fungsi untuk mendeteksi URL dan mengubahnya menjadi link yang bisa diklik
  const renderDescription = (text: string) => {
    if (!text) return null;
    
    // Regex untuk mendeteksi URL (http, https, www)
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const href = part.startsWith('www.') ? `https://${part}` : part;
        return (
          <a 
            key={index} 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 hover:text-blue-300 underline underline-offset-4 break-all font-bold"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  if (!content) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
          key={content.id || 'popup-wrapper'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="relative w-full max-w-[400px] max-h-[85vh]"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 flex items-center gap-2 group"
            >
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Tutup</span>
              <div className="p-2 bg-white/10 text-white rounded-full border border-white/20 group-hover:bg-white group-hover:text-black transition-all">
                <X size={18} />
              </div>
            </button>

            <div className="bg-[#0F172A] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col h-full ring-1 ring-white/5">
              <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar scroll-smooth">
                <div className="relative w-full bg-slate-900">
                  <img src={content.url_gambar} className="w-full h-auto block" alt="Popup" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                </div>

                <div className="px-10 pb-12 pt-6 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[9px] font-black uppercase flex items-center gap-2">
                      <Zap size={12} className="fill-blue-400" /> Pengumuman Resmi
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black italic uppercase text-white mb-3 tracking-tighter leading-tight">
                    {content.judul}
                  </h3>
                  
                  {/* PERBAIKAN: Menggunakan renderDescription dan CSS whitespace untuk kerapian */}
                  <div className="text-slate-400 text-[12px] mb-10 uppercase tracking-wide leading-relaxed whitespace-pre-line">
                    {renderDescription(content.deskripsi)}
                  </div>
                  
                  {content.file_url && (
                    <motion.a 
                      key="download-button"
                      href={content.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4 mb-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg border border-blue-400/20"
                    >
                      <Download size={16} /> DOWNLOAD LAMPIRAN
                    </motion.a>
                  )}

                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="w-full py-4.5 bg-white text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em]"
                  >
                    SAYA MENGERTI
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; }` }} />
    </AnimatePresence>
  );
}