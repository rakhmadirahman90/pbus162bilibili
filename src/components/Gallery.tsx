import { useState, useMemo, useEffect } from 'react';
import { X, Camera, Info, ChevronDown, ChevronUp, PlayCircle, Image as ImageIcon } from 'lucide-react';

const galleryData = [
  {
    id: 1,
    type: 'image',
    image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Smash Tajam di Final',
    category: 'Pertandingan',
    description: 'Momen krusial saat atlet utama kami melakukan jumping smash untuk mengamankan poin kemenangan.'
  },
  {
    id: 2,
    type: 'video',
    image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=800',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: 'Highlight Pertandingan Cup IV',
    category: 'Pertandingan',
    description: 'Kumpulan momen terbaik dari turnamen internal PB US 162 Cup IV 2026.'
  },
  {
    id: 3,
    type: 'image',
    image: 'https://images.pexels.com/photos/6253573/pexels-photo-6253573.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Sesi Latihan Fisik',
    category: 'Latihan',
    description: 'Latihan rutin setiap Selasa dan Kamis yang fokus pada penguatan otot kaki.'
  },
  {
    id: 4,
    type: 'video',
    image: 'https://images.pexels.com/photos/1263426/pexels-photo-1263426.jpeg?auto=compress&cs=tinysrgb&w=800',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
    title: 'Tutorial Footwork Dasar',
    category: 'Latihan',
    description: 'Video edukasi mengenai penempatan posisi kaki yang benar untuk pemula.'
  },
  {
    id: 5,
    type: 'image',
    image: 'whatsapp_image_2026-02-02_at_08.39.03.jpeg',
    title: 'Penyerahan Piala',
    category: 'Prestasi',
    description: 'Kegembiraan para pemenang Turnamen Internal saat menerima trofi.'
  },
  {
    id: 6,
    type: 'video',
    image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=800',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: 'Vlog Fasilitas GOR',
    category: 'Fasilitas',
    description: 'Tur singkat melihat standar lapangan dan asrama atlet kami.'
  }
];

export default function Gallery() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');

  // Tutup modal dengan tombol ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const filteredMedia = useMemo(() => {
    const filtered = galleryData.filter(item => item.type === activeTab);
    return showAll ? filtered : filtered.slice(0, 6);
  }, [activeTab, showAll]);

  const activeMedia = galleryData.find((item) => item.id === selectedId);

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Camera size={28} />
            </div>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">Lensa PB US 162</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Aktivitas dan prestasi kami dalam format visual berkualitas.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200">
            <button
              onClick={() => { setActiveTab('image'); setShowAll(false); }}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === 'image' 
                ? 'bg-white text-blue-600 shadow-md scale-105' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ImageIcon size={18} /> FOTO
            </button>
            <button
              onClick={() => { setActiveTab('video'); setShowAll(false); }}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === 'video' 
                ? 'bg-white text-blue-600 shadow-md scale-105' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <PlayCircle size={18} /> VIDEO
            </button>
          </div>
        </div>

        {/* Grid Media */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] shadow-md hover:shadow-2xl border border-slate-100 transition-all duration-500 animate-in fade-in"
            >
              <div className="aspect-[4/3] relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 group-hover:bg-slate-900/50 transition-all">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center text-blue-600 shadow-2xl group-hover:scale-110 transition-transform">
                      <PlayCircle size={32} fill="currentColor" fillOpacity={0.2} />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-8">
                <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{item.category}</span>
                <h3 className="text-white text-xl font-bold leading-tight">{item.title}</h3>
                <p className="text-slate-300 text-xs mt-3 flex items-center gap-2 font-medium">
                  {item.type === 'video' ? <PlayCircle size={14} /> : <Info size={14} />} 
                  Klik untuk {item.type === 'video' ? 'Putar Video' : 'Lihat Detail'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tombol Muat Lebih Banyak */}
        {galleryData.filter(item => item.type === activeTab).length > 6 && (
          <div className="text-center mt-16">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95"
            >
              {showAll ? <>Sembunyikan <ChevronUp size={20} /></> : <>Lihat Selengkapnya <ChevronDown size={20} /></>}
            </button>
          </div>
        )}

        {/* MODAL LIGHTBOX - PERBAIKAN TOMBOL X */}
        {activeMedia && (
          <div 
            className="fixed inset-0 bg-slate-950/98 z-[999] flex flex-col items-center justify-center p-4 backdrop-blur-lg animate-in fade-in duration-300"
            onClick={() => setSelectedId(null)}
          >
            {/* Tombol Close Independen */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(null);
              }}
              className="absolute top-6 right-6 md:top-10 md:right-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all hover:rotate-90 z-[1001] cursor-pointer active:scale-90"
            >
              <X size={36} strokeWidth={2.5} />
            </button>
            
            <div 
              className="relative max-w-5xl w-full flex flex-col items-center z-[1000]" 
              onClick={(e) => e.stopPropagation()}
            >
              {activeMedia.type === 'video' ? (
                <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10">
                  <iframe 
                    className="w-full h-full"
                    src={activeMedia.videoUrl}
                    title={activeMedia.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <img 
                  src={activeMedia.image} 
                  alt={activeMedia.title} 
                  className="max-w-full max-h-[60vh] object-contain rounded-3xl shadow-2xl border border-white/10" 
                />
              )}

              <div className="mt-8 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 max-w-3xl w-full text-center shadow-2xl">
                <div className="flex justify-center mb-4">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {activeMedia.category}
                  </span>
                </div>
                <h3 className="text-white text-2xl md:text-3xl font-black mb-3">{activeMedia.title}</h3>
                <p className="text-slate-400 leading-relaxed italic text-base md:text-lg">"{activeMedia.description}"</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}