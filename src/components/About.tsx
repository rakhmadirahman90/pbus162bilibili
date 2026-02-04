import React, { useState } from 'react';
import { Target, Award, Users, MapPin, CheckCircle2, History, Building2, Trophy, Camera, Maximize2 } from 'lucide-react';

export default function About() {
  const [activeTab, setActiveTab] = useState('sejarah');

  const tabs = [
    { id: 'sejarah', label: 'Sejarah', icon: History },
    { id: 'fasilitas', label: 'Fasilitas', icon: Building2 },
    { id: 'prestasi', label: 'Prestasi', icon: Trophy },
  ];

  // Data Foto Fasilitas
  const galleryImages = [
    { url: "https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Lantai Interlock Standard BWF" },
    { url: "https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Sistem Pencahayaan LED" },
    { url: "https://images.pexels.com/photos/11511520/pexels-photo-11511520.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Area Tribun Penonton" },
    { url: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Fasilitas Gym & Recovery" }
  ];

  return (
    <section id="about" className="py-24 bg-white overflow-hidden scroll-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">
            Mengenal <span className="text-blue-600">PB US 162</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Membangun ekosistem olahraga profesional yang inklusif dan modern di Kota Parepare.
          </p>
        </div>

        {/* Sub-Menu Navigasi (Tabs) */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="bg-slate-50 rounded-[40px] p-8 md:p-16 border border-slate-100 shadow-sm transition-all duration-500 min-h-[550px]">
          
          {/* TAB: SEJARAH */}
          {activeTab === 'sejarah' && (
            <div className="grid lg:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-bottom-4 transition-all duration-700">
              <div>
                <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                  Established 2020
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">Akar Perjuangan di Parepare</h3>
                <p className="text-slate-600 text-lg leading-relaxed mb-6">
                  PB US 162 Bilibili didirikan untuk menjawab kerinduan akan pusat pelatihan bulutangkis yang terintegrasi di Sulawesi Selatan. Dimulai dari mimpi sederhana di Bilibili, kini kami berkembang menjadi barometer pembinaan regional.
                </p>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Kami percaya bahwa setiap anak daerah berhak mendapatkan standar kepelatihan yang sama dengan di pusat untuk meraih prestasi nasional.
                </p>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-blue-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img 
                  src="https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  className="relative rounded-3xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 h-[400px] w-full object-cover"
                  alt="Sejarah Club"
                />
              </div>
            </div>
          )}

          {/* TAB: FASILITAS + GALERI */}
          {activeTab === 'fasilitas' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 transition-all duration-700">
              <div className="flex flex-col lg:flex-row gap-12 items-start mb-16">
                <div className="lg:w-1/3">
                  <h3 className="text-3xl font-bold text-slate-900 mb-6">Standard BWF Grade</h3>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    Kami tidak berkompromi soal kualitas. Seluruh fasilitas dirancang untuk kenyamanan atlet dan performa maksimal saat pertandingan.
                  </p>
                  <ul className="space-y-4">
                    {["Lantai Anti-Slip Pro", "Penerangan Standar BWF", "Recovery Room"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-700 font-bold">
                        <CheckCircle2 className="text-blue-600" size={20} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Galeri Grid Foto */}
                <div className="lg:w-2/3 grid grid-cols-2 gap-4">
                  {galleryImages.map((img, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-2xl h-48 shadow-lg">
                      <img 
                        src={img.url} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={img.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <p className="text-white text-[10px] font-bold uppercase tracking-wider">{img.title}</p>
                        <div className="flex items-center text-blue-400 gap-1 mt-1">
                          <Maximize2 size={12} />
                          <span className="text-[10px] font-black italic">View Facility</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRESTASI */}
          {activeTab === 'prestasi' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 transition-all duration-700">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Papan Penghargaan</h3>
                <p className="text-slate-600">Bukti nyata dari kurikulum latihan yang disiplin.</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { year: "2025", title: "Juara Umum Kejurda", category: "Regional Sulsel", color: "amber" },
                  { year: "2026", title: "Internal Cup IV", category: "Klub Internal", color: "blue" },
                  { year: "2024", title: "Invitasi Soreang", category: "Regional Open", color: "indigo" },
                ].map((p, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-600 hover:-translate-y-2 transition-all group relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-${p.color}-500/5 rounded-full -mr-12 -mt-12`}></div>
                    <Trophy className="text-blue-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
                    <div className="text-2xl font-black text-slate-900 mb-1">{p.year}</div>
                    <div className="font-bold text-blue-600 mb-2">{p.title}</div>
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{p.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vision Mission Grid - Penutup */}
        <div className="mt-20 grid md:grid-cols-4 gap-8">
          {[
            { icon: Target, title: "Visi", desc: "Menciptakan atlet bermental juara dan religius." },
            { icon: Award, title: "Misi", desc: "Pembinaan terpadu dengan standar kompetisi nasional." },
            { icon: Users, title: "Koneksi", desc: "Jejaring luas dengan klub elite di Indonesia." },
            { icon: MapPin, title: "Akses", desc: "Lokasi strategis di pusat kota Parepare." },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-300 mb-4 border border-slate-100">
                <item.icon size={30} />
              </div>
              <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest">{item.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}