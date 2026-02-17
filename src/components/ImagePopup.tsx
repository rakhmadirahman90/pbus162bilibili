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
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
        {/* Overlay Background */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePopup}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        />

        {/* MODAL CONTAINER: Dibatasi pada 85vh agar tidak menabrak batas atas/bawah browser */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-[340px] bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh] overflow-hidden"
        >
          
          {/* HEADER DENGAN TOMBOL TUTUP: Sekarang di dalam bingkai agar pasti terlihat */}
          <div className="absolute top-0 right-0 left-0 z-50 flex justify-end p-4 pointer-events-none">
            <button 
              onClick={closePopup}
              className="pointer-events-auto p-2 bg-red-600 text-white rounded-full shadow-xl hover:bg-red-700 transition-all border-2 border-white flex items-center justify-center"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>

          {/* INTERNAL CONTENT WRAPPER */}
          <div className="flex flex-col h-full overflow-hidden">
            
            {/* BOX GAMBAR: Menggunakan max-h-[40vh] agar teks di bawah memiliki ruang di layar 100% */}
            <div className="relative w-full bg-slate-50 shrink-0 overflow-hidden" style={{ maxHeight: '40vh' }}>
              <motion.img 
                key={currentIndex}
                src={PROMO_IMAGES[currentIndex]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full object-contain mx-auto"
                style={{ maxHeight: '40vh' }}
                alt="Promo Content"
              />

              {/* Slider Navigasi Minimalis */}
              {PROMO_IMAGES.length > 1 && (
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button onClick={prevImage} className="pointer-events-auto p-1.5 bg-black/20 backdrop-blur-md text-white rounded-lg">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={nextImage} className="pointer-events-auto p-1.5 bg-black/20 backdrop-blur-md text-white rounded-lg">
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* AREA INFORMASI: Dilengkapi scroll internal jika layar sangat pendek */}
            <div className="p-5 text-center flex flex-col flex-grow overflow-y-auto">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-3 mx-auto">
                  <Bell size={10} className="animate-bounce" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Update PB US 162</span>
               </div>
              
              <h3 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 leading-none mb-2">
                Marhaban Ya <span className="text-blue-600">Ramadhan</span>
              </h3>
              
              <p className="text-slate-500 text-[10px] font-bold leading-relaxed mb-5 opacity-80 px-2">
                Selamat berpuasa 1447 H. Mari jalin silaturahmi bersama kami di PB Bilibili 162.
              </p>
              
              {/* Tombol Aksi di bagian paling bawah modal */}
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