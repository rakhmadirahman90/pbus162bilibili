import { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Camera, Info, ChevronDown, ChevronUp, Filter } from 'lucide-react';

const galleryData = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Smash Tajam di Final',
    category: 'Pertandingan',
    description: 'Momen krusial saat atlet utama kami melakukan jumping smash untuk mengamankan poin kemenangan.'
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Fasilitas GOR Standar BWF',
    category: 'Fasilitas',
    description: 'Kondisi lapangan PB US 162 yang menggunakan karpet standar internasional dan pencahayaan anti-silau.'
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/6253573/pexels-photo-6253573.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Sesi Latihan Fisik',
    category: 'Latihan',
    description: 'Latihan rutin setiap Selasa dan Kamis yang fokus pada penguatan otot kaki dan kelincahan.'
  },
  {
    id: 4,
    image: 'https://images.pexels.com/photos/1263426/pexels-photo-1263426.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Pembinaan Usia Dini',
    category: 'Akademi',
    description: 'Program regenerasi atlet melalui pembinaan anak-anak usia sekolah sejak dini.'
  },
  {
    id: 5,
    image: 'whatsapp_image_2025-12-30_at_15.33.37.jpeg',
    title: 'Penyerahan Piala Cup IV',
    category: 'Prestasi',
    description: 'Kegembiraan para pemenang Turnamen Internal Cup IV 2026 saat menerima trofi tetap.'
  },
  {
    id: 6,
    image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Pemanasan Tim Ganda',
    category: 'Latihan',
    description: 'Sesi pemanasan khusus untuk sinkronisasi rotasi lapangan bagi pasangan ganda.'
  },
  {
    id: 7,
    image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Analisis Footwork',
    category: 'Latihan',
    description: 'Evaluasi mendalam mengenai efisiensi pergerakan kaki atlet di lapangan.'
  },
  {
    id: 8,
    image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Selebrasi Kemenangan',
    category: 'Prestasi',
    description: 'Momen emosional setelah perjuangan panjang di babak final kejuaraan terbuka.'
  }
];

export default function Gallery() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Semua');

  // Mengambil kategori unik dari data
  const categories = ['Semua', ...Array.from(new Set(galleryData.map(item => item.category)))];

  // Memfilter data berdasarkan kategori yang dipilih
  const filteredImages = useMemo(() => {
    const filtered = activeFilter === 'Semua' 
      ? galleryData 
      : galleryData.filter(img => img.category === activeFilter);
    
    return showAll ? filtered : filtered.slice(0, 6);
  }, [activeFilter, showAll]);

  const activeImage = galleryData.find((item) => item.id === selectedId);

  const navigateGallery = (direction: 'next' | 'prev') => {
    if (!selectedId) return;
    const currentIndex = galleryData.findIndex(item => item.id === selectedId);
    if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % galleryData.length;
      setSelectedId(galleryData[nextIndex].id);
    } else {
      const prevIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
      setSelectedId(galleryData[prevIndex].id);
    }
  };

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Camera size={28} />
            </div>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">Lensa PB US 162</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Galeri aktivitas, prestasi, dan fasilitas kelas dunia kami di Parepare.</p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveFilter(cat); setShowAll(false); }}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeFilter === cat 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Galeri */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all">
          {filteredImages.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl shadow-md transition-all hover:shadow-2xl animate-in fade-in zoom-in-95 duration-500"
            >
              <div className="aspect-[4/3]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{item.category}</span>
                <h3 className="text-white text-xl font-bold leading-tight">{item.title}</h3>
                <p className="text-slate-300 text-xs mt-2 flex items-center gap-1"><Info size={14} /> Lihat Detail</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tombol Kontrol Dokumentasi */}
        {galleryData.filter(img => activeFilter === 'Semua' || img.category === activeFilter).length > 6 && (
          <div className="text-center mt-16">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95"
            >
              {showAll ? (
                <>Sembunyikan <ChevronUp size={20} /></>
              ) : (
                <>Lihat Dokumentasi Lengkap <ChevronDown size={20} /></>
              )}
            </button>
          </div>
        )}

        {/* Lightbox / Modal (Tetap sama seperti versi sebelumnya namun lebih rapi) */}
        {activeImage && (
          <div className="fixed inset-0 bg-slate-950/98 z-[100] flex flex-col items-center justify-center p-4 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedId(null)}>
            <button className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 p-2 rounded-full transition-all hover:rotate-90"><X size={32} /></button>
            
            <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <img src={activeImage.image} alt={activeImage.title} className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl border border-white/10" />
              <div className="mt-8 bg-slate-900 p-8 rounded-3xl border border-slate-800 max-w-2xl w-full text-center shadow-2xl">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">{activeImage.category}</span>
                <h3 className="text-white text-2xl font-black mb-3">{activeImage.title}</h3>
                <p className="text-slate-400 leading-relaxed italic text-lg">"{activeImage.description}"</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}