import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PROMO_IMAGES = [
  "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000",
  "https://images.unsplash.com/photo-1541339907198-e08756defeec?q=80&w=1000"
];

export default function ImagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('lastSeenPopup');
    const today = new Date().toDateString();

    if (hasSeenPopup !== today) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    localStorage.setItem('lastSeenPopup', new Date().toDateString());
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === PROMO_IMAGES.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? PROMO_IMAGES.length - 1 : prev - 1));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
        {/* Overlay dengan Backdrop Blur */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePopup}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal Container: Diatur agar maksimal tinggi 90% layar (90vh) */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-[400px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] overflow-visible"
        >
          
          {/* TOMBOL TUTUP (X): Menggunakan posisi Inset-0 agar tetap menempel pada container meski layar di-zoom */}
          <div className="absolute -top-3 -right-3 z-[100001]">
             <button 
              onClick={closePopup}
              className="p-2.5 bg-red-600 text-white rounded-full shadow-2xl hover:bg-red-700 hover:scale-110 active:scale-95 transition-all duration-200 border-[3px] border-white flex items-center justify-center"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          {/* Area Scrollable Content: Memastikan konten tidak "tenggelam" jika layar pendek */}
          <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden p-4 sm:p-5 custom-scrollbar">
            
            {/* Box Gambar dengan Jarak Bingkai yang Pas */}
            <div className="relative w-full aspect-[4/5] shrink-0 rounded-[1.5rem] overflow-hidden bg-slate-100 shadow-inner border border-slate-100">
              <motion.img 
                key={currentIndex}
                src={PROMO_IMAGES[currentIndex]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full object-cover"
                alt="Promo Content"
              />

              {/* Slider Navigasi */}
              {PROMO_IMAGES.length > 1 && (
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between">
                  <button onClick={prevImage} className="p-2 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/40">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextImage} className="p-2 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/40">
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Area Teks: Margin disesuaikan agar pas 100% */}
            <div className="mt-5 pb-2 text-center">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-3">
                  <Bell size={10} className="animate-bounce" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Update Terbaru</span>
               </div>
              
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 leading-none mb-2">
                Marhaban Ya <span className="text-blue-600">Ramadhan</span>
              </h3>
              
              <p className="text-slate-500 text-[11px] font-bold leading-relaxed mb-5 px-2">
                Selamat menjalankan ibadah puasa 1447 H. Mari jalin silaturahmi bersama kami.
              </p>
              
              <button 
                onClick={closePopup}
                className="w-full py-3.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all duration-300 shadow-lg active:scale-95"
              >
                Tutup & Lihat Web
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}