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
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">TENTANG KAMI</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-3 md:gap-4 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 md:px-8 py-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm">
          {activeTab === 'sejarah' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-2xl font-black mb-6 text-slate-800">Sejarah PB US 162</h3>
              <p className="text-slate-600 leading-relaxed text-lg max-w-4xl">
                Didirikan dengan semangat untuk memajukan olahraga bulutangkis di Parepare. 
                Kami berfokus pada pembinaan atlet usia dini hingga profesional dengan fasilitas yang mumpuni. 
                Sejak awal berdiri, klub ini telah berkomitmen untuk menciptakan ekosistem olahraga yang sehat dan kompetitif.
              </p>
            </div>
          )}

          {activeTab === 'visi-misi' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-2xl font-black mb-6 text-slate-800">Visi & Misi</h3>
              <div className="grid md:grid-cols-2 gap-8 text-lg">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <span className="text-blue-600 font-black block mb-2">VISI</span>
                  <p className="text-slate-600 italic">"Menjadi klub bulutangkis rujukan nasional yang mencetak atlet berprestasi dunia."</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <span className="text-blue-600 font-black block mb-2">MISI</span>
                  <p className="text-slate-600">Menyelenggarakan pelatihan terstruktur, menyediakan fasilitas berstandar internasional, dan mengadakan kompetisi rutin bagi talenta muda.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fasilitas' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Teks Deskripsi */}
                <div>
                  <h3 className="text-2xl font-black mb-6 text-slate-800">Fasilitas Standar Nasional</h3>
                  <ul className="space-y-4">
                    {[
                      'Lapangan karpet standar internasional (BWF Approved)',
                      'Sistem pencahayaan anti-silau (LED Tournament Class)',
                      'Area fitness & conditioning khusus atlet',
                      'Asrama atlet (Home base) yang nyaman',
                      'Ruang ganti dan shower air panas'
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-slate-600 text-lg">
                        <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bagian Foto Fasilitas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <img 
                      src="https://images.unsplash.com/photo-1626224484214-4051d4bc2b84?q=80&w=500&auto=format&fit=crop" 
                      alt="Court" 
                      className="w-full h-48 object-cover rounded-2xl shadow-md hover:scale-105 transition-transform duration-300"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=500&auto=format&fit=crop" 
                      alt="Badminton Gear" 
                      className="w-full h-32 object-cover rounded-2xl shadow-md hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center">
                    <img 
                      src="https://images.unsplash.com/photo-1622279457486-62dcc4a4bd13?q=80&w=500&auto=format&fit=crop" 
                      alt="Training" 
                      className="w-full h-72 object-cover rounded-2xl shadow-md hover:scale-105 transition-transform duration-300"
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