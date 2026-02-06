import { useState, useMemo, useEffect } from 'react';
import { X, Camera, Info, ChevronDown, ChevronUp, PlayCircle, Image as ImageIcon } from 'lucide-react';

const galleryData = [
  {
    id: 1,
    type: 'image',
    image: '/img-20260206-wa0015.jpg',
    title: 'Pertandingan Sengit Cup IV',
    category: 'Pertandingan',
    description: 'Aksi seru dari pertandingan internal Cup IV 2026 yang menampilkan atlet terbaik kami.'
  },
  {
    id: 2,
    type: 'video',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(1).jpeg',
    videoUrl: '/vid-20260206-wa0018.mp4',
    isLocal: true,
    title: 'Highlight Pertandingan Cup IV',
    category: 'Pertandingan',
    description: 'Rekaman momen terbaik dari turnamen internal PB US 162 Cup IV 2026.'
  },
  {
    id: 3,
    type: 'video',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(2).jpeg',
    videoUrl: '/vid-20260206-wa0019.mp4',
    isLocal: true,
    title: 'Behind The Scenes Turnamen',
    category: 'Pertandingan',
    description: 'Dokumentasi di balik layar persiapan dan jalannya turnamen internal.'
  },
  {
    id: 4,
    type: 'image',
    image: '/whatsapp_image_2026-02-05_at_10.31.02.jpeg',
    title: 'Latihan Rutin Pagi',
    category: 'Latihan',
    description: 'Sesi latihan pagi yang intensif untuk meningkatkan stamina dan teknik dasar.'
  },
  {
    id: 5,
    type: 'image',
    image: '/whatsapp_image_2026-02-05_at_10.34.12.jpeg',
    title: 'Pemanasan Tim',
    category: 'Latihan',
    description: 'Momen pemanasan bersama sebelum memulai latihan inti di lapangan.'
  },
  {
    id: 6,
    type: 'image',
    image: '/whatsapp_image_2026-02-05_at_10.36.22.jpeg',
    title: 'Drilling Session',
    category: 'Latihan',
    description: 'Latihan drill intensif untuk meningkatkan kecepatan reaksi dan footwork.'
  },
  {
    id: 7,
    type: 'image',
    image: '/whatsapp_image_2026-02-05_at_11.38.00.jpeg',
    title: 'Sesi Sparring',
    category: 'Latihan',
    description: 'Latihan tanding antar atlet untuk mengasah mental bertanding dan strategi.'
  },
  {
    id: 8,
    type: 'image',
    image: '/whatsapp_image_2026-02-02_at_08.39.03.jpeg',
    title: 'Penyerahan Piala Juara',
    category: 'Prestasi',
    description: 'Kegembiraan para pemenang Turnamen Internal saat menerima trofi kemenangan.'
  },
  {
    id: 9,
    type: 'image',
    image: '/whatsapp_image_2025-12-30_at_15.33.37.jpeg',
    title: 'Juara Kategori C',
    category: 'Prestasi',
    description: 'Hidayatullah meraih kemenangan gemilang di kategori C Cup IV 2026.'
  },
  {
    id: 10,
    type: 'image',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(1).jpeg',
    title: 'Keluarga Besar Atlet',
    category: 'Prestasi',
    description: 'Foto bersama seluruh atlet dan pelatih setelah turnamen internal.'
  },
  {
    id: 11,
    type: 'image',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(3).jpeg',
    title: 'Semangat Juara Bersama',
    category: 'Prestasi',
    description: 'Kebersamaan dan solidaritas tim yang menjadi kunci kesuksesan kami.'
  },
  {
    id: 12,
    type: 'image',
    image: '/dpnkwabotttfihp7gf3r.jpg',
    title: 'Fasilitas Lapangan Berkelas',
    category: 'Fasilitas',
    description: 'Lapangan dengan karpet standar BWF dan pencahayaan LED profesional.'
  },
  {
    id: 13,
    type: 'image',
    image: '/photo_2026-02-03_00-32-07.jpg',
    title: 'GOR PB US 162',
    category: 'Fasilitas',
    description: 'Gedung olahraga modern yang menjadi pusat pelatihan atlet kami.'
  },
  {
    id: 14,
    type: 'image',
    image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Teknik Smash Profesional',
    category: 'Latihan',
    description: 'Demonstrasi teknik smash yang benar oleh pelatih kepala kami.'
  },
  {
    id: 15,
    type: 'image',
    image: 'https://images.pexels.com/photos/6253573/pexels-photo-6253573.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Conditioning Training',
    category: 'Latihan',
    description: 'Program latihan fisik khusus untuk meningkatkan stamina dan power.'
  },
  {
    id: 16,
    type: 'image',
    image: '/gemini_generated_image_qdfwfpqdfwfpqdfw.png',
    title: 'Atlet Senior Berprestasi',
    category: 'Prestasi',
    description: 'Agustilaar, salah satu atlet terbaik kami di kategori Seed A.'
  },
  {
    id: 17,
    type: 'image',
    image: '/gemini_generated_image_ein7bkein7bkein7.png',
    title: 'Rising Star PB US 162',
    category: 'Prestasi',
    description: 'Udin, pemain andalan dengan teknik serangan cepat yang mematikan.'
  },
  {
    id: 18,
    type: 'image',
    image: '/gemini_generated_image_abml4qabml4qabml.png',
    title: 'Pemenang Seed B+',
    category: 'Prestasi',
    description: 'Bustan meraih prestasi gemilang di kategori Seed B+.'
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
                  {activeMedia.isLocal ? (
                    <video
                      className="w-full h-full"
                      controls
                      autoPlay
                    >
                      <source src={activeMedia.videoUrl} type="video/mp4" />
                      Browser Anda tidak mendukung tag video.
                    </video>
                  ) : (
                    <iframe
                      className="w-full h-full"
                      src={activeMedia.videoUrl}
                      title={activeMedia.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  )}
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