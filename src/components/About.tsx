import React, { useState } from 'react';
import { 
  Target, Award, Users, MapPin, CheckCircle2, 
  History, Building2, Trophy, Maximize2, X 
} from 'lucide-react';

interface AboutProps {
  activeTab?: string; // Tanda ? agar tidak error jika kosong
  onTabChange?: (id: string) => void;
}

// Gunakan default value 'sejarah' pada destructuring props
export default function About({ activeTab = 'sejarah', onTabChange }: AboutProps) {
  const [selectedImg, setSelectedImg] = useState<any>(null);

  const tabs = [
    { id: 'sejarah', label: 'Sejarah', icon: History },
    { id: 'fasilitas', label: 'Fasilitas', icon: Building2 },
    { id: 'prestasi', label: 'Prestasi', icon: Trophy },
  ];

  const galleryImages = [
    { 
      url: "https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=800", 
      title: "Lantai Interlock Standard BWF",
      desc: "Karpet profesional standar BWF."
    },
    { 
      url: "https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=800", 
      title: "Sistem Pencahayaan LED",
      desc: "Lampu anti-silau."
    }
  ];

  return (
    <section id="about" className="py-24 bg-white overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Judul */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">
            PB US 162 <span className="text-blue-600">BILIBILI</span>
          </h2>
        </div>

        {/* Menu Tab */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)} // Gunakan optional chaining ?.
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Konten Tab */}
        <div className="bg-slate-50 rounded-[40px] p-8 md:p-16 border border-slate-100 min-h-[400px]">
          {activeTab === 'sejarah' && (
            <div className="animate-in fade-in duration-500">
              <h3 className="text-3xl font-black mb-6">Akar Perjuangan</h3>
              <p className="text-slate-600 text-lg">Didirikan tahun 2020 di Parepare...</p>
            </div>
          )}

          {activeTab === 'fasilitas' && (
            <div className="animate-in fade-in duration-500">
               <h3 className="text-3xl font-black mb-6">Fasilitas Modern</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {galleryImages.map((img, i) => (
                    <img 
                      key={i} 
                      src={img.url} 
                      className="rounded-xl cursor-pointer hover:opacity-80 transition"
                      onClick={() => setSelectedImg(img)}
                    />
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'prestasi' && (
            <div className="animate-in fade-in duration-500 text-center">
              <Trophy size={48} className="text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-black">Prestasi Klub</h3>
              <p className="text-slate-600 mt-2">Juara Umum Kejurda 2025.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImg && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedImg(null)}>
          <div className="relative max-w-4xl w-full">
            <button className="absolute -top-10 right-0 text-white"><X size={32}/></button>
            <img src={selectedImg.url} className="w-full rounded-lg" />
            <p className="text-white text-center mt-4 text-xl font-bold">{selectedImg.title}</p>
          </div>
        </div>
      )}
    </section>
  );
}