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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        {/* Overlay dengan Blur Mendalam */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePopup}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        />

        {/* Modal Container dengan Shadow Luar Biasa */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-visible"
        >
          {/* TOMBOL TUTUP (X) - Diperbaiki agar melayang di luar/atas gambar */}
          <button 
            onClick={closePopup}
            className="absolute -top-4 -right-4 z-[10000] p-3 bg-rose-600 text-white rounded-full shadow-2xl hover:bg-rose-700 hover:scale-110 active:scale-90 transition-all duration-300 border-4 border-white"
            aria-label="Close"
          >
            <X size={24} strokeWidth={3} />
          </button>

          {/* Frame Dalam untuk Memberikan Jarak (Rapi) */}
          <div className="p-4 sm:p-5">
            {/* Image Slider Container */}
            <div className="relative aspect-[4/5] rounded-[1.8rem] overflow-hidden bg-slate-100 group shadow-inner border border-slate-100">
              <motion.img 
                key={currentIndex}
                src={PROMO_IMAGES[currentIndex]}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
                alt="Promo"
              />

              {/* Tombol Navigasi (Hanya muncul jika lebih dari 1 gambar) */}
              {PROMO_IMAGES.length > 1 && (
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between z-10">
                  <button onClick={prevImage} className="p-2 bg-white/30 backdrop-blur-md text-white rounded-xl hover:bg-white/50 transition-all">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={nextImage} className="p-2 bg-white/30 backdrop-blur-md text-white rounded-xl hover:bg-white/50 transition-all">
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
              
              {/* Indikator Slide */}
              <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 z-10">
                {PROMO_IMAGES.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
                ))}
              </div>
            </div>

            {/* Info Section */}
            <div className="mt-6 px-2 text-center">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-3">
                  <Bell size={12} className="animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Informasi Terbaru</span>
               </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 leading-none mb-2">
                Marhaban Ya <span className="text-blue-600">Ramadhan</span>
              </h3>
              <p className="text-slate-500 text-xs font-bold leading-relaxed mb-6">
                Selamat menunaikan ibadah puasa 1447 H. Mari tingkatkan amal ibadah kita bersama PB Bilibili 162.
              </p>
              
              <button 
                onClick={closePopup}
                className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-300 shadow-xl active:scale-95"
              >
                Tutup Pengumuman
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}