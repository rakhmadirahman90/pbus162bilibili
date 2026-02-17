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
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6">
        {/* Overlay Background */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePopup}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Wrapper - Menggunakan overflow-visible agar tombol X tidak terpotong */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] overflow-visible"
        >
          
          {/* TOMBOL TUTUP (X) - Ditempatkan di luar container utama dengan Z-index absolut */}
          <div className="absolute -top-3 -right-3 z-[100000]">
             <button 
              onClick={closePopup}
              className="p-3 bg-red-600 text-white rounded-full shadow-2xl hover:bg-red-700 hover:scale-110 active:scale-95 transition-all duration-200 border-4 border-white flex items-center justify-center"
              style={{ pointerEvents: 'auto' }} // Memastikan area bisa diklik
            >
              <X size={24} strokeWidth={3} />
            </button>
          </div>

          {/* Area Konten */}
          <div className="p-4 sm:p-5">
            {/* Image Box */}
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-200 shadow-inner">
              <motion.img 
                key={currentIndex}
                src={PROMO_IMAGES[currentIndex]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full object-cover"
                alt="Promo"
              />

              {/* Slider Nav */}
              {PROMO_IMAGES.length > 1 && (
                <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between">
                  <button onClick={prevImage} className="p-2 bg-white/20 backdrop-blur-lg text-white rounded-2xl hover:bg-white/40">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={nextImage} className="p-2 bg-white/20 backdrop-blur-lg text-white rounded-2xl hover:bg-white/40">
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>

            {/* Teks Deskripsi */}
            <div className="py-6 px-2 text-center">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-3">
                  <Bell size={12} className="animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Informasi Penting</span>
               </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 leading-none mb-3">
                Marhaban Ya <span className="text-blue-600">Ramadhan</span>
              </h3>
              <p className="text-slate-500 text-xs font-bold leading-relaxed mb-6">
                Selamat menjalankan ibadah puasa 1447 H / 2026 M. Semoga keberkahan menyertai kita semua.
              </p>
              
              <button 
                onClick={closePopup}
                className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.25em] transition-all duration-300"
              >
                Cek Selengkapnya
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}