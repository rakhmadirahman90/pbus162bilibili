import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

export default function ImagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<{
    url_gambar: string;
    judul: string;
  } | null>(null);

  useEffect(() => {
    const fetchActivePopup = async () => {
      try {
        // PERIKSA: Pastikan nama tabel di Supabase adalah 'konfigurasi_popup'
        const { data, error } = await supabase
          .from('konfigurasi_popup') 
          .select('url_gambar, judul')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Supabase Error:", error.message);
          return;
        }

        if (data) {
          setContent(data);
          // Paksa muncul setelah 1 detik
          setTimeout(() => setIsOpen(true), 1000);
        } else {
          console.warn("Tidak ada pop-up yang statusnya 'LIVE' atau 'is_active: true'");
        }
      } catch (err) {
        console.error("Koneksi gagal:", err);
      }
    };

    fetchActivePopup();
  }, []); // Berjalan setiap kali halaman di-load/refresh

  if (!content || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative flex flex-col items-center justify-center max-w-full max-h-full"
        >
          {/* Tombol Close di pojok kanan atas gambar */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute -top-12 right-0 p-2 bg-red-600 text-white rounded-full shadow-xl z-50 hover:bg-red-700 transition-colors"
          >
            <X size={24} strokeWidth={3} />
          </button>

          {/* Container Gambar: Menyesuaikan Tinggi Layar agar TIDAK TERPOTONG */}
          <div className="relative bg-white p-1 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <img 
              src={content.url_gambar} 
              alt={content.judul}
              className="w-auto h-auto max-w-[90vw] max-h-[75vh] md:max-h-[85vh] object-contain rounded-xl"
            />
          </div>

          <p className="mt-4 text-white/50 text-[10px] tracking-[0.3em] uppercase font-bold">
            Klik di luar gambar untuk menutup
          </p>
        </motion.div>

        {/* Overlay Background agar bisa di-klik untuk tutup */}
        <div 
          className="absolute inset-0 -z-10 cursor-default" 
          onClick={() => setIsOpen(false)} 
        />
      </div>
    </AnimatePresence>
  );
}