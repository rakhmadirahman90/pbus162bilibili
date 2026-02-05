import React, { useState } from 'react';
import { 
  Target, Award, Users, MapPin, CheckCircle2, 
  History, Building2, Trophy, Maximize2, X 
} from 'lucide-react';

interface AboutProps {
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

export default function About({ activeTab = 'sejarah', onTabChange }: AboutProps) {
  const [selectedImg, setSelectedImg] = useState<any>(null);

  // Data Konten
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
      desc: "Lampu anti-silau yang dirancang khusus untuk visibilitas maksimal."
    },
    { 
      url: "https://images.pexels.com/photos/11511520/pexels-photo-11511520.jpeg?auto=compress&cs=tinysrgb&w=800", 
      title: "Area Tribun & Lounge",
      desc: "Ruang tunggu nyaman untuk orang tua dan penonton."
    },
    { 
      url: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800", 
      title: "Fasilitas Recovery",
      desc: "Area khusus pemulihan fisik atlet."
    }
  ];

  return (
    <section id="about" className="py-20 bg-white overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Profil */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
            <span className="text-blue-700 text-[10px] font-black uppercase tracking-widest">Profil Klub</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            PB US 162 <span className="text-blue-600">BILIBILI</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Barometer pembinaan bulutangkis di Sulawesi Selatan dengan fasilitas modern.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-md border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Konten Area */}
        <div className="bg-slate-50 rounded-[32px] p-8 md:p-12 border border-slate-100 shadow-sm min-h-[450px]">
          
          {/* SEJARAH */}
          {activeTab === 'sejarah' && (
            <div className="grid lg:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-3xl font-black text-slate-900 mb-6">Akar Perjuangan di Parepare</h3>
                <div className="space-y-4 text-slate-600 leading-relaxed">
                  <p>Didirikan tahun 2020, <span className="font-bold text-blue-600">PB US 162</span> lahir dari visi besar di Kota Parepare.</p>
                  <p>Berawal dari komunitas Bilibili, kini menjadi sekolah bulutangkis dengan sistem digital pertama di wilayah ini.</p>
                </div>
              </div>
              <img src={galleryImages[0].url} className="rounded-2xl shadow-xl aspect-video object-cover" alt="History" />
            </div>
          )}

          {/* FASILITAS */}
          {activeTab === 'fasilitas' && (
            <div className="animate-in fade-in duration-500">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <h3 className="text-2xl font-black mb-6">Fasilitas Standar BWF</h3>
                  <div className="space-y-3">
                    {["Karpet Anti-Slip", "LED 500 Lux", "Shower Room"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <CheckCircle2 size={16} className="text-blue-600" /> {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-2 grid grid-cols-2 gap-3">
                  {galleryImages.map((img, i) => (
                    <div key={i} onClick={() => setSelectedImg(img)} className="group relative rounded-xl overflow-hidden h-32 md:h-40 cursor-pointer">
                      <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="Galeri" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Maximize2 className="text-white" size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PRESTASI */}
          {activeTab === 'prestasi' && (
            <div className="grid md:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {[
                { year: "2025", title: "Juara Umum Kejurda", rank: "Emas" },
                { year: "2026", title: "Internal Cup IV", rank: "Finalis" },
                { year: "2024", title: "Parepare Open", rank: "Runner Up" },
              ].map((p, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition">
                  <Trophy className="text-blue-600 mb-3" size={28} />
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{p.year}</span>
                  <h4 className="font-bold text-slate-900">{p.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{p.rank}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Lightbox */}
      {selectedImg && (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedImg(null)}>
          <div className="max-w-4xl w-full animate-in zoom-in-95">
            <button className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold"><X /> CLOSE</button>
            <img src={selectedImg.url} className="w-full rounded-xl shadow-2xl" alt="Preview" />
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-bold">{selectedImg.title}</h3>
              <p className="text-slate-400 text-sm">{selectedImg.desc}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}