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
      const timer = setTimeout(() => setIsOpen(true), 1000);
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
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4">
        {/* Overlay lebih gelap agar fokus */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePopup}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        />

        {/* MODAL CONTAINER: Dibatasi pada 85vh agar tombol X tidak keluar dari layar browser */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          className="relative w-full max-w-[340px] bg-white rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh] overflow-hidden"
        >
          
          {/* HEADER: Tempat Tombol Tutup yang menyatu dengan UI (Anti Terpotong) */}
          <div className="absolute top-3 right-3 z-[50]">
            <button 
              onClick={closePopup}
              className="p-2 bg-black/60 hover:bg-red-600 text-white rounded-full backdrop-blur-md transition-all border border-white/30"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>

          {/* WRAPPER KONTEN UTAMA */}
          <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
            
            {/* BOX GAMBAR: Dibatasi hanya 45% dari tinggi layar */}
            <div className="relative w-full bg-slate-200 shrink-0 overflow-hidden" style={{ maxHeight: '45vh' }}>
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
                  <button onClick={prevImage} className="p-1.5 bg-black/20 text-white rounded-lg hover:bg-black/50 backdrop-blur-sm">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={nextImage} className="p-1.5 bg-black/20 text-white rounded-lg hover:bg-black/50 backdrop-blur-sm">
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* INFO SECTION: Padding diperkecil agar pas 100% */}
            <div className="p-5 text-center flex flex-col flex-grow bg-white">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-3 mx-auto">
                  <Bell size={10} className="animate-bounce" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Update PB US 162</span>
               </div>
              
              <h3 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 leading-none mb-2">
                Marhaban Ya <span className="text-blue-600">Ramadhan</span>
              </h3>
              
              <p className="text-slate-500 text-[10px] font-bold leading-relaxed mb-4 opacity-80 line-clamp-2">
                Selamat berpuasa. Semoga keberkahan menyertai kita semua di PB Bilibili 162.
              </p>
              
              <div className="mt-auto">
                <button 
                  onClick={closePopup}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-lg active:scale-95"
                >
                  MENGERTI
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}