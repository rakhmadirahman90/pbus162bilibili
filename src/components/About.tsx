import React, { useState } from 'react';
import { 
  Target, Award, Users, MapPin, CheckCircle2, 
  History, Building2, Trophy, Maximize2, X 
} from 'lucide-react';

// Interface tetap sama
interface AboutProps {
  activeTab?: string; // Dibuat opsional agar tidak crash jika undefined
  onTabChange?: (id: string) => void; // Dibuat opsional
}

export default function About({ activeTab = 'sejarah', onTabChange }: AboutProps) {
  // State internal hanya untuk Lightbox
  const [selectedImg, setSelectedImg] = useState<any>(null);

  // Fallback function jika onTabChange tidak dikirim dari App.js
  const handleTabClick = (id: string) => {
    if (onTabChange) {
      onTabChange(id);
    }
  };

  const tabs = [
    { id: 'sejarah', label: 'Sejarah', icon: History },
    { id: 'fasilitas', label: 'Fasilitas', icon: Building2 },
    { id: 'prestasi', label: 'Prestasi', icon: Trophy },
  ];

  const galleryImages = [
    { 
      url: "https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=800", 
      title: "Lantai Interlock Standard BWF",
      desc: "Karpet profesional dengan daya redam kejut tinggi untuk keamanan sendi atlet."
    },
    { 
      url: "https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=800", 
      title: "Sistem Pencahayaan LED",
      desc: "Lampu anti-silau yang dirancang khusus untuk visibilitas maksimal saat smash."
    },
    { 
      url: "https://images.pexels.com/photos/11511520/pexels-photo-11511520.jpeg?auto=compress&cs=tinysrgb&w=800", 
      title: "Area Tribun & Lounge",
      desc: "Ruang tunggu yang nyaman untuk orang tua dan penonton saat turnamen."
    },
    { 
      url: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800", 
      title: "Fasilitas Recovery",
      desc: "Area khusus peregangan dan pemulihan fisik atlet setelah sesi latihan berat."
    }
  ];

  return (
    <section id="about" className="py-24 bg-white overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
            <span className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">Profil Klub</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            PB US 162 <span className="text-blue-600">BILIBILI</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Menjadi barometer pembinaan bulutangkis di Sulawesi Selatan dengan fasilitas modern dan kurikulum berstandar nasional.
          </p>
        </div>

        {/* --- SUB-MENU (TABS) --- */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto max-w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- TAB CONTENT AREA --- */}
        <div className="bg-slate-50 rounded-[40px] p-8 md:p-16 border border-slate-100 shadow-sm min-h-[500px] relative">
          
          {activeTab === 'sejarah' && (
            <div className="grid lg:grid-cols-2 gap-16 items-center animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="order-2 lg:order-1">
                <h3 className="text-3xl font-black text-slate-900 mb-6">Akar Perjuangan di Parepare</h3>
                <div className="space-y-4 text-slate-600 text-lg leading-relaxed">
                  <p>Didirikan pada tahun 2020, <span className="font-bold text-slate-900">PB US 162</span> lahir dari visi untuk menciptakan fasilitas berkualitas internasional.</p>
                  <p>Berawal dari komunitas Bilibili, kini bertransformasi menjadi sekolah bulutangkis dengan sistem digital pertama di wilayah ini.</p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <img src={galleryImages[0].url} className="rounded-3xl shadow-2xl aspect-square object-cover" alt="History" />
              </div>
            </div>
          )}

          {activeTab === 'fasilitas' && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-1">
                  <h3 className="text-3xl font-black text-slate-900 mb-6">Gedung Olahraga Standard BWF</h3>
                  <div className="space-y-4">
                    {["Lantai Karpet 4.5mm", "LED 500 Lux", "Ruang Ganti & Shower"].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                        <CheckCircle2 className="text-blue-600" size={18} /> {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {galleryImages.map((img, i) => (
                    <div key={i} onClick={() => setSelectedImg(img)} className="group relative overflow-hidden rounded-2xl h-48 cursor-pointer shadow-lg">
                      <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={img.title} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prestasi' && (
            <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {[
                  { year: "2025", title: "Juara Umum Kejurda", rank: "1st Place" },
                  { year: "2026", title: "Internal Cup IV", rank: "Grand Finale" },
                  { year: "2024", title: "Parepare Open", rank: "Runner Up" },
                ].map((p, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <Trophy className="text-blue-600 mb-4" size={32} />
                    <div className="text-xs font-black text-blue-600 uppercase tracking-widest">{p.year}</div>
                    <h4 className="text-xl font-bold text-slate-900">{p.title}</h4>
                    <p className="text-slate-500 text-sm mt-2">{p.rank}</p>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* --- VISION & MISSION --- */}
        <div className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Target, title: "Visi", text: "Atlet bermental juara." },
            { icon: Award, title: "Misi", text: "Disiplin tinggi." },
            { icon: Users, title: "Koneksi", text: "Kerjasama strategis." },
            { icon: MapPin, title: "Akses", text: "Olahraga inklusif." },
          ].map((item, i) => (
            <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <item.icon className="text-blue-600 mb-4" size={24} />
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-2">{item.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- LIGHTBOX --- */}
      {selectedImg && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedImg(null)}>
          <div className="relative max-w-4xl w-full animate-in zoom-in-95 duration-300">
            <button className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold" onClick={() => setSelectedImg(null)}>
              CLOSE <X />
            </button>
            <img src={selectedImg.url} className="w-full rounded-xl" alt="Zoom" />
            <div className="mt-4 text-center">
              <h3 className="text-white text-2xl font-bold">{selectedImg.title}</h3>
              <p className="text-slate-400">{selectedImg.desc}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}