import React from 'react';

// Mendefinisikan tipe data props agar tidak error (TypeScript)
interface AboutProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function About({ activeTab, onTabChange }: AboutProps) {
  // Data konten untuk setiap tab
  const tabs = [
    { id: 'sejarah', label: 'Sejarah' },
    { id: 'visi-misi', label: 'Visi & Misi' },
    { id: 'fasilitas', label: 'Fasilitas' }
  ];

  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-slate-900 mb-4">TENTANG KAMI</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-4 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100">
          {activeTab === 'sejarah' && (
            <div className="animate-fadeIn">
              <h3 className="text-2xl font-black mb-4">Sejarah PB US 162</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Didirikan dengan semangat untuk memajukan olahraga bulutangkis di Parepare. 
                Kami berfokus pada pembinaan atlet usia dini hingga profesional dengan fasilitas yang mumpuni.
              </p>
            </div>
          )}

          {activeTab === 'visi-misi' && (
            <div className="animate-fadeIn">
              <h3 className="text-2xl font-black mb-4">Visi & Misi</h3>
              <div className="space-y-4 text-slate-600 text-lg">
                <p><strong>Visi:</strong> Menjadi klub bulutangkis rujukan nasional yang mencetak atlet berprestasi dunia.</p>
                <p><strong>Misi:</strong> Menyelenggarakan pelatihan terstruktur dan kompetisi rutin bagi talenta muda.</p>
              </div>
            </div>
          )}

          {activeTab === 'fasilitas' && (
            <div className="animate-fadeIn">
              <h3 className="text-2xl font-black mb-4">Fasilitas Standar Nasional</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600 text-lg">
                <li>Lapangan karpet standar internasional</li>
                <li>Sistem pencahayaan anti-silau</li>
                <li>Area fitness dan conditioning</li>
                <li>Asrama atlet (Home base)</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}