import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Bell } from 'lucide-material'; // Sesuaikan jika menggunakan lucide-react
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
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
        {/* Kontainer Utama Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-[350px] bg-white rounded-[2rem] overflow-hidden flex flex-col shadow-2xl border border-white/20"
          style={{ maxHeight: '85vh' }} // Memaksa tinggi maksimal 85% layar
        >
          
          {/* HEADER: Tombol Tutup diletakkan di dalam container agar tidak terpotong browser */}
          <div className="absolute top-0 right-0 left-0 z-50 flex justify-end p-3 pointer-events-none">
            <button 
              onClick={closePopup}
              className="pointer-events-auto p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all border-2 border-white"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>

          {/* AREA KONTEN: Menggunakan Scroll Internal */}
          <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
            
            {/* WRAPPER GAMBAR: Dibatasi tingginya agar teks di bawah tidak terdorong keluar */}
            <div className="relative w-full shrink-0 bg-slate-100" style={{ height: 'auto', maxHeight: '40vh' }}>
              <motion.img 
                key={currentIndex}
                src={PROMO_IMAGES[currentIndex]}
                className="w-full h-full object-contain block mx-auto"
                style={{ maxHeight: '40vh' }}
                alt="Promo"
              />
              
              {/* Navigasi Image */}
              {PROMO_IMAGES.length > 1 && (
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between">
                  <button onClick={prevImage} className="p-1 bg-black/30 text-white rounded-lg backdrop-blur-sm">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextImage} className="p-1 bg-black/30 text-white rounded-lg backdrop-blur-sm">
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* AREA TEKS: Mengambil sisa ruang yang tersedia */}
            <div className="p-5 text-center flex flex-col items-center justify-center bg-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-3">
                <Bell size={10} className="animate-bounce" />
                <span className="text-[9px] font-black uppercase tracking-widest">Informasi PB US 162</span>
              </div>

              <h3 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 leading-none mb-2">
                Marhaban Ya <span className="text-blue-600">Ramadhan</span>
              </h3>

              <p className="text-slate-500 text-[10px] font-bold leading-relaxed mb-5 px-1">
                Selamat berpuasa 1447 H. Pantau terus informasi terbaru kami agar tidak ketinggalan promo menarik.
              </p>

              <button 
                onClick={closePopup}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg active:scale-95 transition-all"
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