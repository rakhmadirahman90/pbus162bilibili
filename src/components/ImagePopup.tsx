import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PROMO_IMAGES = [
  "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000", // Ganti dengan URL gambar Anda
  "https://images.unsplash.com/photo-1541339907198-e08756defeec?q=80&w=1000"
];

export default function ImagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Cek apakah pop-up sudah pernah ditutup hari ini
    const hasSeenPopup = localStorage.getItem('lastSeenPopup');
    const today = new Date().toDateString();

    if (hasSeenPopup !== today) {
      const timer = setTimeout(() => setIsOpen(true), 1500); // Muncul setelah 1.5 detik
      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    // Simpan status ke localStorage agar tidak muncul lagi hari ini
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
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        {/* Overlay Blur */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePopup}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          className="relative w-full max-w-lg bg-white rounded-[2rem] overflow-hidden shadow-2xl"
        >
          {/* Close Button */}
          <button 
            onClick={closePopup}
            className="absolute top-4 right-4 z-20 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all"
          >
            <X size={24} />
          </button>

          {/* Image Slider */}
          <div className="relative aspect-[4/5] overflow-hidden bg-slate-200">
            <motion.img 
              key={currentIndex}
              src={PROMO_IMAGES[currentIndex]}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-full h-full object-cover"
              alt="Promo"
            />

            {/* Navigation Buttons (Hanya muncul jika > 1 gambar) */}
            {PROMO_IMAGES.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-all">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-all">
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Action Button */}
          <div className="p-6 text-center">
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">
              Promo <span className="text-blue-600">Terbatas!</span>
            </h3>
            <p className="text-slate-500 text-sm font-bold mb-4">Jangan lewatkan kesempatan bergabung hari ini.</p>
            <button 
              onClick={closePopup}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-blue-100 active:scale-95 transition-all"
            >
              Cek Sekarang
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}