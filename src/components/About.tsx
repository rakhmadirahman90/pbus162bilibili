import React from 'react';

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
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">TENTANG KAMI</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Tab Switcher - Perbaikan Tata Letak */}
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
        <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm min-h-[400px]">
          {activeTab === 'sejarah' && (
            <div className="animate-in fade-in duration-500">
              <h3 className="text-2xl font-black mb-6 text-slate-800 uppercase tracking-tight">Sejarah PB US 162</h3>
              <p className="text-slate-600 leading-relaxed text-lg max-w-4xl">
                Didirikan dengan semangat untuk memajukan olahraga bulutangkis di Parepare. 
                Kami berfokus pada pembinaan atlet usia dini hingga profesional dengan fasilitas yang mumpuni.
              </p>
            </div>
          )}

          {activeTab === 'visi-misi' && (
            <div className="animate-in fade-in duration-500 grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <span className="text-blue-600 font-black block mb-4 tracking-widest text-sm">VISI</span>
                <p className="text-slate-700 text-xl font-medium leading-relaxed italic">
                  "Menjadi klub bulutangkis rujukan nasional yang mencetak atlet berprestasi dunia."
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <span className="text-blue-600 font-black block mb-4 tracking-widest text-sm">MISI</span>
                <p className="text-slate-700 text-lg leading-relaxed">
                  Menyelenggarakan pelatihan terstruktur, menyediakan fasilitas internasional, dan mengadakan kompetisi rutin.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'fasilitas' && (
            <div className="animate-in fade-in duration-500">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* List Fasilitas */}
                <div>
                  <h3 className="text-2xl font-black mb-8 text-slate-800">Fasilitas Standar Nasional</h3>
                  <ul className="space-y-5">
                    {[
                      'Lapangan karpet standar internasional',
                      'Sistem pencahayaan LED anti-silau',
                      'Area fitness & conditioning khusus',
                      'Asrama atlet (Home base) nyaman',
                      'Ruang ganti & Shower modern'
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-4 text-slate-600 text-lg font-medium">
                        <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Kolase Foto - Perbaikan Gambar */}
                <div className="grid grid-cols-2 gap-4 h-[350px]">
                  <img 
                    src="https://images.unsplash.com/photo-1626224484214-4051d4bc2b84?auto=format&fit=crop&q=80&w=600" 
                    alt="Badminton Court" 
                    className="w-full h-full object-cover rounded-2xl shadow-md"
                  />
                  <div className="grid grid-rows-2 gap-4">
                    <img 
                      src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&q=80&w=600" 
                      alt="Racket" 
                      className="w-full h-full object-cover rounded-2xl shadow-md"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1622279457486-62dcc4a4bd13?auto=format&fit=crop&q=80&w=600" 
                      alt="Training" 
                      className="w-full h-full object-cover rounded-2xl shadow-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}