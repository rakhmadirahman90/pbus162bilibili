import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImagePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => setIsOpen(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
        {/* Overlay */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="absolute inset-0" 
          onClick={closePopup} 
        />

        {/* MODAL CONTAINER - Dibuat sengaja lebih kecil (max-w-[320px]) agar tampak seperti zoom 75% */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-[320px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '80vh' }} // Mengunci tinggi agar tidak pernah menyentuh batas browser
        >
          
          {/* TOMBOL TUTUP - Di dalam bingkai putih agar pasti terlihat */}
          <button 
            onClick={closePopup}
            className="absolute top-3 right-3 z-[60] p-1.5 bg-red-600 text-white rounded-full border-2 border-white shadow-lg hover:bg-red-700 transition-all"
          >
            <X size={14} strokeWidth={4} />
          </button>

          {/* INTERNAL WRAPPER DENGAN SCROLL */}
          <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
            
            {/* GAMBAR - Dibatasi ketat agar tidak mendorong konten ke bawah */}
            <div className="w-full shrink-0 bg-slate-100" style={{ height: '280px' }}>
              <img 
                src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000"
                className="w-full h-full object-cover" 
                alt="Promo"
              />
            </div>

            {/* AREA TEKS - Dibuat lebih ringkas */}
            <div className="p-5 text-center flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full mb-2">
                <Bell size={10} className="animate-bounce" />
                <span className="text-[8px] font-black uppercase tracking-widest">Update</span>
              </div>
              
              <h3 className="text-base font-black uppercase italic tracking-tighter text-slate-900 leading-tight mb-1">
                Marhaban Ya <span className="text-blue-600">Ramadhan</span>
              </h3>
              
              <p className="text-slate-500 text-[9px] font-bold leading-snug mb-4 px-2">
                Selamat berpuasa 1447 H. Mari jalin silaturahmi bersama PB US 162.
              </p>
              
              <button 
                onClick={closePopup}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black uppercase text-[9px] tracking-widest shadow-md transition-all active:scale-95"
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