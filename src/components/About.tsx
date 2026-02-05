import React from 'react';
import { BookOpen, Target, Rocket, Shield, Award, MapPin, CheckCircle2 } from 'lucide-react';

interface AboutProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function About({ activeTab, onTabChange }: AboutProps) {
  const tabs = [
    { id: 'sejarah', label: 'Sejarah' },
    { id: 'visi-misi', label: 'Visi & Misi' },
    { id: 'fasilitas', label: 'Fasilitas' }
  ];

  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Judul Utama */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">Tentang Kami</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-3 mb-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Box */}
        <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm min-h-[450px]">
          
          {/* SEJARAH */}
          {activeTab === 'sejarah' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <BookOpen size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-6 text-slate-800 uppercase tracking-tight">Perjalanan PB US 162</h3>
                  <div className="space-y-4 text-slate-600 leading-relaxed text-lg max-w-4xl">
                    <p className="flex gap-3">
                      <MapPin className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                      Didirikan dengan semangat untuk memajukan olahraga bulutangkis di Parepare, Sulawesi Selatan.
                    </p>
                    <p className="flex gap-3">
                      <Award className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                      Kami berfokus pada pembinaan atlet usia dini hingga profesional dengan metode pelatihan yang modern dan disiplin tinggi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VISI MISI */}
          {activeTab === 'visi-misi' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 text-blue-600 group-hover:scale-110 transition-transform">
                  <Target size={120} />
                </div>
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                  <Target size={24} />
                </div>
                <span className="text-blue-600 font-black block mb-4 tracking-[0.2em] text-xs uppercase font-sans">Visi Utama</span>
                <p className="text-slate-700 text-2xl font-bold leading-tight italic">
                  "Menjadi klub bulutangkis rujukan nasional yang mencetak atlet berprestasi dunia."
                </p>
              </div>

              <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 text-blue-600 group-hover:scale-110 transition-transform">
                  <Rocket size={120} />
                </div>
                <div className="w-12 h-12 bg-slate-800 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-slate-200">
                  <Rocket size={24} />
                </div>
                <span className="text-blue-600 font-black block mb-4 tracking-[0.2em] text-xs uppercase font-sans">Misi Kami</span>
                <ul className="space-y-3 text-slate-700 font-medium">
                  <li className="flex items-center gap-2 italic"><CheckCircle2 size={16} className="text-blue-500" /> Pelatihan terstruktur & disiplin</li>
                  <li className="flex items-center gap-2 italic"><CheckCircle2 size={16} className="text-blue-500" /> Fasilitas berstandar internasional</li>
                  <li className="flex items-center gap-2 italic"><CheckCircle2 size={16} className="text-blue-500" /> Kompetisi rutin berkala</li>
                </ul>
              </div>
            </div>
          )}

          {/* FASILITAS - PERBAIKAN GAMBAR */}
          {activeTab === 'fasilitas' && (
            <div className="animate-in fade-in duration-500 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-black mb-8 text-slate-800 uppercase">Fasilitas Standar Nasional</h3>
                <ul className="space-y-5">
                  {['Lapangan karpet standar BWF', 'Pencahayaan LED anti-silau', 'Fitness & Conditioning center', 'Asrama atlet (Home base)', 'Shower & Locker room'].map((item, index) => (
                    <li key={index} className="flex items-center gap-4 text-slate-600 text-lg font-medium group">
                      <span className="w-8 h-8 bg-white text-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Shield size={16} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 h-[350px]">
                {/* Gambar 1: Court (Utama) */}
                <img 
                  src="https://images.unsplash.com/photo-1626224484214-4051d4bc2b84?w=800&q=80" 
                  alt="Badminton Court" 
                  className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-white"
                />
                <div className="grid grid-rows-2 gap-4">
                  {/* Gambar 2: Gear */}
                  <img 
                    src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400&q=80" 
                    alt="Racket" 
                    className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-white"
                  />
                  {/* Gambar 3: Training/Shuttlecock */}
                  <img 
                    src="https://images.unsplash.com/photo-1613918431703-09432328198f?w=400&q=80" 
                    alt="Training Gear" 
                    className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}