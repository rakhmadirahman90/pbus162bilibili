import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImagePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Memberikan jeda agar transisi halaman selesai
    const timer = setTimeout(() => setIsOpen(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => setIsOpen(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
        {/* Overlay Klik Tutup */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="absolute inset-0" 
          onClick={closePopup} 
        />

        {/* MODAL CONTAINER - Ukuran diperkecil secara radikal (50%) */}
        <motion.div 
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-[280px] bg-white rounded-[1.5rem] shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: '70vh' }} // Membatasi tinggi agar tidak menyentuh batas layar browser
        >
          
          {/* TOMBOL TUTUP (X) - Dibuat mengambang di pojok kanan gambar dengan padding aman */}
          <button 
            onClick={closePopup}
            className="absolute top-2 right-2 z-[70] p-1.5 bg-red-600/90 text-white rounded-full border-2 border-white shadow-md hover:bg-red-700 transition-all active:scale-90"
          >
            <X size={14} strokeWidth={4} />
          </button>

          {/* INTERNAL CONTENT */}
          <div className="flex flex-col h-full overflow-hidden">
            
            {/* BOX GAMBAR - Dibatasi ketat agar teks di bawah tidak terdorong keluar layar */}
            <div className="w-full shrink-0 bg-slate-100" style={{ height: '240px' }}>
              <img 
                src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000"
                className="w-full h-full object-cover" 
                alt="Promo"
              />
            </div>

            {/* AREA TEKS - Dibuat ekstra mungil agar pas 100% */}
            <div className="p-4 text-center flex flex-col items-center bg-white">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full mb-2">
                <Bell size={8} className="animate-bounce" />
                <span className="text-[7px] font-black uppercase tracking-widest">Update PB US</span>
              </div>
              
              <h3 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 leading-tight mb-1">
                Marhaban Ya <span className="text-blue-600">Ramadhan</span>
              </h3>
              
              <p className="text-slate-500 text-[8px] font-bold leading-snug mb-3 px-1">
                Selamat berpuasa 1447 H. Update terbaru di PB US 162.
              </p>
              
              <button 
                onClick={closePopup}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black uppercase text-[8px] tracking-[0.2em] shadow-md active:scale-95"
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