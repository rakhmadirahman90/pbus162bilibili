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
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* Overlay Background */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePopup}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container: KUNCI PERBAIKAN ADA DI max-h-[90vh] */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-visible"
        >
          
          {/* TOMBOL TUTUP (X): Diperbaiki agar selalu berada di dalam area pandang (z-index tertinggi) */}
          <button 
            onClick={closePopup}
            className="absolute -top-2 -right-2 z-[100001] p-2 bg-red-600 text-white rounded-full shadow-xl hover:bg-red-700 hover:scale-110 active:scale-95 transition-all duration-200 border-4 border-white flex items-center justify-center"
          >
            <X size={20} strokeWidth={3} />
          </button>

          {/* Wrapper Scroll: Memastikan jika layar 100% pendek, isi modal bisa di-scroll dan tetap rapi */}
          <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-4 sm:p-5">
            
            {/* Box Gambar: Jarak bingkai diatur pas (Padding internal) */}
            <div className="relative w-full aspect-[4/5] shrink-0 rounded-[1.8rem] overflow-hidden bg-slate-100 shadow-inner border border-slate-50">
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

            {/* Area Informasi */}
            <div className="mt-5 pb-2 text-center flex-grow">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-3">
                  <Bell size={10} className="animate-bounce" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Informasi Penting</span>
               </div>
              
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 leading-none mb-2">
                Marhaban Ya <span className="text-blue-600">Ramadhan</span>
              </h3>
              
              <p className="text-slate-500 text-[11px] font-bold leading-relaxed mb-6 px-2">
                Selamat menunaikan ibadah puasa 1447 H. Pantau terus update terbaru di dashboard kami.
              </p>
              
              <button 
                onClick={closePopup}
                className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.25em] transition-all duration-300 shadow-lg active:scale-95"
              >
                MENGERTI
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}