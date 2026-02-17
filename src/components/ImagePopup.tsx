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

        {/* MODAL CONTAINER: Menggunakan h-auto dan max-h-[90vh] untuk mencegah terpotong */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-[350px] bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20"
        >
          
          {/* TOMBOL TUTUP: Sekarang menggunakan padding absolut di dalam header transparan */}
          <div className="absolute top-0 right-0 left-0 z-[100010] flex justify-end p-4 pointer-events-none">
            <button 
              onClick={closePopup}
              className="pointer-events-auto p-2 bg-black/40 hover:bg-red-600 text-white rounded-full backdrop-blur-xl transition-all border border-white/20 shadow-lg"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>

          {/* INTERNAL CONTENT WRAPPER */}
          <div className="flex flex-col h-full overflow-hidden">
            
            {/* BOX GAMBAR: Menggunakan flex-shrink agar gambar mau mengalah pada tinggi layar */}
            <div className="relative w-full bg-slate-100 flex-shrink min-h-0 overflow-hidden">
              <motion.img 
                key={currentIndex}
                src={PROMO_IMAGES[currentIndex]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full object-contain max-h-[55vh]" 
                alt="Promo"
              />

              {/* Slider Navigasi */}
              {PROMO_IMAGES.length > 1 && (
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button onClick={prevImage} className="pointer-events-auto p-1.5 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/40">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={nextImage} className="pointer-events-auto p-1.5 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/40">
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* AREA INFORMASI: Memastikan teks tetap terlihat dan memiliki scroll jika layar sangat pendek */}
            <div className="p-6 text-center bg-white flex-grow overflow-y-auto">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-3">
                  <Bell size={10} className="animate-bounce" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Informasi</span>
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
                MENGERTI
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}