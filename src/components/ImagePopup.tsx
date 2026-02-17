import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImagePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => setIsOpen(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Overlay tetap penuh */}
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        
        {/* MODAL CONTAINER - Dibuat sangat kecil dan dikunci ukurannya */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 0.85 }} // Mengunci skala di 0.85 agar terlihat mungil (sekitar 75%-50% dari aslinya)
          className="relative bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col shadow-blue-500/20"
          style={{ 
            width: '300px', // Mengunci lebar sangat kecil
            maxHeight: '80vh', // Mengunci tinggi agar tidak menabrak browser
            border: '4px solid white'
          }}
        >
          
          {/* TOMBOL TUTUP - Sekarang diletakkan di dalam bingkai putih agar PASTI terlihat */}
          <button 
            onClick={closePopup}
            className="absolute top-3 right-3 z-[100] p-1.5 bg-red-600 text-white rounded-full shadow-lg border-2 border-white hover:bg-red-700 transition-all active:scale-90"
          >
            <X size={16} strokeWidth={4} />
          </button>

          {/* INTERNAL WRAPPER */}
          <div className="flex flex-col h-full overflow-y-auto">
            
            {/* GAMBAR - Dipaksa mengecil mengikuti kotak (Fixed Height) */}
            <div className="w-full shrink-0 bg-slate-100" style={{ height: '250px' }}>
              <img 
                src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000"
                className="w-full h-full object-cover" 
                alt="Promo"
              />
            </div>

            {/* AREA TEKS - Sangat ringkas */}
            <div className="p-4 text-center bg-white">
              <h3 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 leading-tight mb-1">
                Marhaban Ya <span className="text-blue-600">Ramadhan</span>
              </h3>
              
              <p className="text-slate-500 text-[9px] font-bold leading-relaxed mb-4 opacity-80 px-2">
                Selamat berpuasa 1447 H. Update terbaru PB US 162.
              </p>
              
              <button 
                onClick={closePopup}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg"
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