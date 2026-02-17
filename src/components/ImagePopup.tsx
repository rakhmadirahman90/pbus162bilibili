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
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4">
        {/* Overlay dengan intensitas gelap yang pas */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePopup}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
        />

        {/* MODAL CONTAINER: Menggunakan max-h-[calc(100vh-40px)] agar tidak pernah menabrak batas layar */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-[380px] bg-white rounded-[2rem] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)] flex flex-col max-h-[92vh] overflow-visible border border-white/20"
        >
          
          {/* TOMBOL TUTUP: Sekarang menggunakan koordinat absolut yang lebih aman (inset-x) */}
          <div className="absolute -top-3 -right-3 z-[100002]">
             <button 
              onClick={closePopup}
              className="p-2 bg-rose-600 text-white rounded-full shadow-2xl hover:bg-rose-700 active:scale-90 transition-all border-[3px] border-white flex items-center justify-center"
            >
              <X size={22} strokeWidth={3} />
            </button>
          </div>

          {/* INTERNAL WRAPPER: Scroll hanya aktif jika benar-benar diperlukan */}
          <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden p-3 sm:p-4 custom-scrollbar">
            
            {/* BOX GAMBAR: Menggunakan proporsi flex-1 untuk menciut di layar pendek */}
            <div className="relative w-full rounded-[1.5rem] overflow-hidden bg-slate-100 shadow-inner group min-h-[200px]">
              <motion.img 
                key={currentIndex}
                src={PROMO_IMAGES[currentIndex]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-auto object-contain max-h-[50vh] mx-auto" 
                alt="Promo"
              />

              {/* Slider Navigasi: Tampil minimalis agar tidak menutupi konten utama */}
              {PROMO_IMAGES.length > 1 && (
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button onClick={prevImage} className="pointer-events-auto p-1.5 bg-black/20 backdrop-blur-md text-white rounded-lg hover:bg-black/40 transition-all">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={nextImage} className="pointer-events-auto p-1.5 bg-black/20 backdrop-blur-md text-white rounded-lg hover:bg-black/40 transition-all">
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* AREA TEKS DAN TOMBOL: Dioptimalkan jaraknya */}
            <div className="mt-4 pb-2 text-center">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-2">
                  <Bell size={10} className="animate-bounce" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-blue-700">Pemberitahuan</span>
               </div>
              
              <h3 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 leading-none mb-2">
                Marhaban Ya <span className="text-blue-600">Ramadhan</span>
              </h3>
              
              <p className="text-slate-500 text-[10px] font-bold leading-relaxed mb-4 px-1 opacity-80">
                Selamat beribadah puasa 1447 H. Mari raih keberkahan bersama PB US 162.
              </p>
              
              <button 
                onClick={closePopup}
                className="w-full py-3.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-lg active:scale-95 border-b-4 border-black/20"
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