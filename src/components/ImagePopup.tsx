import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
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
      {/* Overlay dengan z-index tertinggi agar menutupi sidebar admin */}
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        
        {/* MODAL CONTAINER - Ukuran dikunci 50% lebih kecil dari standar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-[300px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '70vh' }} // Mengunci tinggi maksimal agar tombol X tidak hilang ke atas
        >
          
          {/* TOMBOL TUTUP - Sekarang diletakkan di dalam bingkai putih agar pasti terlihat di 100% */}
          <div className="absolute top-0 right-0 p-3 z-[100]">
            <button 
              onClick={closePopup}
              className="p-1.5 bg-red-600 text-white rounded-full shadow-lg border-2 border-white hover:bg-red-700 transition-all"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>

          {/* INTERNAL SCROLLABLE AREA */}
          <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
            
            {/* GAMBAR - Menggunakan height tetap (fix) agar tidak mendorong konten ke bawah layar */}
            <div className="w-full shrink-0 bg-slate-100" style={{ height: '220px' }}>
              <img 
                src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000"
                className="w-full h-full object-cover" 
                alt="Promo"
              />
            </div>

            {/* AREA TEKS - Dibuat sangat ringkas agar muat di layar laptop 100% */}
            <div className="p-4 text-center flex flex-col items-center bg-white">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full mb-2">
                <Bell size={10} className="animate-bounce" />
                <span className="text-[8px] font-black uppercase tracking-widest">Update PB US</span>
              </div>
              
              <h3 className="text-base font-black uppercase italic tracking-tighter text-slate-900 leading-tight mb-1">
                Marhaban Ya <span className="text-blue-600">Ramadhan</span>
              </h3>
              
              <p className="text-slate-500 text-[9px] font-bold leading-relaxed mb-4 opacity-80 px-2">
                Selamat berpuasa 1447 H. Pantau terus informasi di PB Bilibili 162.
              </p>
              
              <button 
                onClick={closePopup}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-md"
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