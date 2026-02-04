import React, { useState } from 'react';
import { Target, Award, Users, MapPin, CheckCircle2, History, Building2, Trophy, ArrowRight } from 'lucide-react';

export default function About() {
  const [activeTab, setActiveTab] = useState('sejarah');

  const tabs = [
    { id: 'sejarah', label: 'Sejarah', icon: History },
    { id: 'fasilitas', label: 'Fasilitas', icon: Building2 },
    { id: 'prestasi', label: 'Prestasi', icon: Trophy },
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
            Lebih dari sekadar klub, kami adalah rumah bagi para calon juara bulutangkis Indonesia.
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
        <div className="bg-slate-50 rounded-[40px] p-8 md:p-16 border border-slate-100 shadow-sm transition-all duration-500">
          {activeTab === 'sejarah' && (
            <div className="grid lg:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-bottom-4">
              <div>
                <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                  Established 2020
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-6">Akar Perjuangan di Parepare</h3>
                <p className="text-slate-600 text-lg leading-relaxed mb-6">
                  PB US 162 Bilibili didirikan dengan satu misi utama: **Mengembalikan kejayaan bulutangkis di Sulawesi Selatan.** Dimulai dari komunitas kecil di Jalan Andi Makkasau, klub ini bertransformasi menjadi pusat pelatihan profesional.
                </p>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Nama "US 162" diambil sebagai simbol dedikasi dan kebersamaan para pendiri dalam membangun fondasi olahraga yang inklusif bagi generasi muda Parepare.
                </p>
              </div>
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  className="rounded-3xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                  alt="Sejarah Club"
                />
              </div>
            </div>
          )}

          {activeTab === 'fasilitas' && (
            <div className="grid lg:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-bottom-4">
              <div className="order-2 lg:order-1 relative">
                <img 
                  src="https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  className="rounded-3xl shadow-2xl"
                  alt="Fasilitas GOR"
                />
                <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 rounded-2xl shadow-xl">
                  <CheckCircle2 size={32} className="mb-2" />
                  <p className="font-bold">Standard BWF</p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-bold text-slate-900 mb-8">Ekosistem Latihan Modern</h3>
                <div className="space-y-6">
                  {[
                    { title: "4 Lapangan Karpet Standard", desc: "Permukaan khusus untuk mengurangi risiko cedera lutut atlet." },
                    { title: "Penerangan LED Anti-Silau", desc: "Sistem tata cahaya yang diatur khusus untuk kenyamanan visual." },
                    { title: "Ruang Fisio & Recovery", desc: "Area pemulihan atlet setelah latihan intensif." }
                  ].map((f, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-200">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{f.title}</h4>
                        <p className="text-slate-500 text-sm">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prestasi' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Papan Penghargaan</h3>
                <p className="text-slate-600">Dedikasi yang membuahkan hasil di kancah regional dan nasional.</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { year: "2025", title: "Juara Umum Kejurda", category: "Sulsel Regional" },
                  { year: "2026", title: "Internal Cup IV", category: "Klub Internal" },
                  { year: "2024", title: "Soreang Open", category: "Invitasi Regional" },
                ].map((p, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-600 transition-all group">
                    <Trophy className="text-blue-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
                    <div className="text-2xl font-black text-slate-900 mb-1">{p.year}</div>
                    <div className="font-bold text-blue-600 mb-2">{p.title}</div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">{p.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vision Mission - Ringkasan Bawah */}
        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Target, title: "Visi", desc: "Menjadi kawah candradimuka atlet bulutangkis religius dan berprestasi." },
            { icon: Award, title: "Misi", desc: "Penyelenggaraan pembinaan terukur dan kompetisi rutin berstandar." },
            { icon: Users, title: "Koneksi", desc: "Jejaring klub nasional untuk penyaluran bakat ke jenjang profesional." },
            { icon: MapPin, title: "Akses", desc: "Wadah olahraga inklusif bagi seluruh masyarakat Parepare." },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 border border-slate-100 shadow-sm">
                <item.icon size={28} />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}