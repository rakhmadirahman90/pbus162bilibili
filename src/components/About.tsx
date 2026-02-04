import React, { useState } from 'react';
import { 
  Target, Award, Users, MapPin, CheckCircle2, 
  History, Building2, Trophy, Maximize2, X, ChevronRight 
} from 'lucide-react';

export default function About() {
  const [activeTab, setActiveTab] = useState('sejarah');
  const [selectedImg, setSelectedImg] = useState(null);

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
                onClick={() => setActiveTab(tab.id)}
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
          
          {/* TAB: SEJARAH */}
          {activeTab === 'sejarah' && (
            <div className="grid lg:grid-cols-2 gap-16 items-center animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="order-2 lg:order-1">
                <h3 className="text-3xl font-black text-slate-900 mb-6">Akar Perjuangan di Parepare</h3>
                <div className="space-y-4 text-slate-600 text-lg leading-relaxed">
                  <p>
                    Didirikan pada tahun 2020, **PB US 162** lahir dari visi untuk menciptakan fasilitas olahraga berkualitas internasional bagi pemuda di Kota Parepare dan sekitarnya.
                  </p>
                  <p>
                    Dimulai dari komunitas lokal di Bilibili, klub ini secara konsisten bertransformasi dari sekadar tempat hobi menjadi sekolah bulutangkis yang memiliki sistem pemeringkatan digital pertama di wilayah ini.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <div className="text-2xl font-black text-blue-600">2020</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tahun Berdiri</div>
                    </div>
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <div className="text-2xl font-black text-blue-600">6+</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gelar Juara</div>
                    </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <img 
                  src="https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  className="rounded-3xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 aspect-square object-cover"
                  alt="Historis PB US 162"
                />
              </div>
            </div>
          )}

          {/* TAB: FASILITAS + GALERI */}
          {activeTab === 'fasilitas' && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex flex-col lg:flex-row gap-12 mb-12">
                <div className="lg:w-1/3">
                  <h3 className="text-3xl font-black text-slate-900 mb-6 leading-tight">Gedung Olahraga Standard BWF</h3>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    Setiap sudut fasilitas kami dirancang untuk mendukung performa atlet dari tingkat pemula hingga profesional.
                  </p>
                  <div className="space-y-4">
                    {["Lantai Karpet 4.5mm Anti-Slip", "Pencahayaan LED 500 Lux", "Ruang Ganti & Shower", "Area Parkir Luas"].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="text-blue-600" size={14} />
                        </div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* GRID GALERI */}
                <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {galleryImages.map((img, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedImg(img)}
                      className="group relative overflow-hidden rounded-2xl h-52 shadow-md cursor-pointer border border-slate-200"
                    >
                      <img 
                        src={img.url} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={img.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                        <p className="text-white font-bold text-sm mb-1">{img.title}</p>
                        <div className="flex items-center text-blue-400 gap-1">
                          <Maximize2 size={12} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Klik untuk Zoom</span>
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
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { year: "2025", title: "Juara Umum Kejurda", rank: "1st Place", desc: "Berhasil menyabet 4 medali emas di kategori tunggal putra/putri." },
                  { year: "2026", title: "Internal Cup IV", rank: "Grand Finale", desc: "Turnamen bergengsi klub dengan partisipasi 150+ atlet." },
                  { year: "2024", title: "Invitasi Parepare Open", rank: "Runner Up", desc: "Prestasi gemilang di tingkat undangan antar klub Sulawesi." },
                ].map((p, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-600 hover:-translate-y-2 transition-all group relative">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Trophy size={24} />
                    </div>
                    <div className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-2">{p.year}</div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">{p.title}</h4>
                    <p className="text-sm font-bold text-slate-400 mb-4">{p.rank}</p>
                    <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- LIGHTBOX MODAL --- */}
        {selectedImg && (
          <div 
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300"
            onClick={() => setSelectedImg(null)}
          >
            <div className="relative max-w-5xl w-full flex flex-col items-center">
              <button 
                className="absolute -top-14 right-0 text-white hover:text-blue-400 transition-all flex items-center gap-2 font-black text-xs tracking-widest"
                onClick={() => setSelectedImg(null)}
              >
                CLOSE <X size={24} />
              </button>
              <img 
                src={selectedImg.url} 
                className="w-full h-auto max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                alt="Fullscreen Facility"
              />
              <div className="mt-8 text-center max-w-2xl">
                <h4 className="text-white text-3xl font-black mb-3">{selectedImg.title}</h4>
                <p className="text-slate-400 text-lg">{selectedImg.desc}</p>
              </div>
            </div>
          </div>
        )}

        {/* --- VISION & MISSION GRID --- */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Target, title: "Visi", desc: "Menciptakan atlet bermental juara, religius, dan menjunjung sportivitas." },
            { icon: Award, title: "Misi", desc: "Menerapkan latihan disiplin tinggi berbasis sport-science nasional." },
            { icon: Users, title: "Koneksi", desc: "Menjalin kerjasama strategis dengan klub-klub besar di Jawa & Makassar." },
            { icon: MapPin, title: "Akses", desc: "Membuka peluang olahraga inklusif bagi talenta muda di Kota Parepare." },
          ].map((item, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:shadow-md transition-all mb-6">
                <item.icon size={24} />
              </div>
              <h4 className="font-black text-slate-900 mb-3 uppercase text-xs tracking-[0.2em]">{item.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}