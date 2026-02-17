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
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
        {/* Overlay Blur dengan Animasi Fade */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePopup}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        />

        {/* Modal Container Utama */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0, rotateX: 15 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotateX: -15 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header Pop-up (Menghindari Tombol Tutup Tertutup Gambar) */}
          <div className="absolute top-0 inset-x-0 z-30 p-5 flex justify-between items-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2 border border-slate-100">
               <Bell className="text-blue-600 animate-bounce" size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Hot News</span>
            </div>
            <button 
              onClick={closePopup}
              className="pointer-events-auto p-2.5 bg-slate-900 text-white rounded-full hover:bg-blue-600 hover:rotate-90 transition-all duration-300 shadow-xl"
            >
              <X size={20} />
            </button>
          </div>

          {/* Area Konten dengan Jarak Bingkai (Rapi & Professional) */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto custom-scrollbar">
            <div className="relative aspect-[4/5] rounded-[1.8rem] overflow-hidden bg-slate-100 group shadow-inner">
              <motion.img 
                key={currentIndex}
                src={PROMO_IMAGES[currentIndex]}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full object-cover"
                alt="Promo Content"
              />

              {/* Navigation Controls */}
              {PROMO_IMAGES.length > 1 && (
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button onClick={prevImage} className="p-3 bg-white/20 backdrop-blur-lg text-white rounded-2xl hover:bg-white/40 transition-all">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={nextImage} className="p-3 bg-white/20 backdrop-blur-lg text-white rounded-2xl hover:bg-white/40 transition-all">
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}

              {/* Progress Indicator Dots */}
              <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5">
                {PROMO_IMAGES.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} 
                  />
                ))}
              </div>
            </div>

            {/* Area Informasi Bawah */}
            <div className="pt-6 pb-2 text-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 leading-tight">
                  Edisi <span className="text-blue-600">Terbatas!</span>
                </h3>
                <div className="w-12 h-1 bg-blue-600 mx-auto my-3 rounded-full" />
                <p className="text-slate-500 text-sm font-semibold px-4 mb-6">
                  Nikmati penawaran spesial ini sebelum waktu berakhir. Kami tunggu kehadiran Anda!
                </p>
                
                <button 
                  onClick={closePopup}
                  className="group relative w-full py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.25em] transition-all duration-300 shadow-[0_15px_30px_-10px_rgba(37,99,235,0.3)] overflow-hidden"
                >
                  <span className="relative z-10">Dapatkan Sekarang</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}