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
        {/* Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePopup}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
        />

        {/* MODAL CONTAINER - Dibuat lebih ramping (max-w-[360px]) agar proporsional di 100% */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-[360px] bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        >
          
          {/* TOMBOL TUTUP - Sekarang berada DI DALAM container agar tidak pernah hilang/terpotong */}
          <button 
            onClick={closePopup}
            className="absolute top-4 right-4 z-[100005] p-2 bg-black/50 hover:bg-red-600 text-white rounded-full backdrop-blur-md transition-all border border-white/20"
          >
            <X size={18} strokeWidth={3} />
          </button>

          {/* INTERNAL CONTENT */}
          <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
            
            {/* BOX GAMBAR - Dibatasi tingginya agar teks di bawah tidak terdorong keluar layar */}
            <div className="relative w-full aspect-[4/5] max-h-[40vh] min-h-[250px] overflow-hidden bg-slate-100">
              <motion.img 
                key={currentIndex}
                src={PROMO_IMAGES[currentIndex]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full object-cover" 
                alt="Promo"
              />

              {/* Slider Nav */}
              {PROMO_IMAGES.length > 1 && (
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between">
                  <button onClick={prevImage} className="p-1.5 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/40">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={nextImage} className="p-1.5 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/40">
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* AREA INFORMASI - Ukuran teks dikecilkan sedikit agar muat 100% layar laptop */}
            <div className="p-5 text-center flex flex-col items-center justify-center">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-3">
                  <Bell size={10} className="animate-bounce" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Pemberitahuan</span>
               </div>
              
              <h3 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 leading-none mb-2">
                Marhaban Ya <span className="text-blue-600">Ramadhan</span>
              </h3>
              
              <p className="text-slate-500 text-[10px] font-bold leading-relaxed mb-5 opacity-80">
                Selamat beribadah puasa 1447 H. Mari jalin silaturahmi bersama kami di PB US 162.
              </p>
              
              <button 
                onClick={closePopup}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-lg active:scale-95"
              >
                TUTUP & LANJUTKAN
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}