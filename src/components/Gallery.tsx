import { useState, useMemo, useEffect } from 'react';
import { X, Camera, Info, ChevronDown, ChevronUp, PlayCircle, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const galleryData = [
  // --- DATA FOTO ---
  {
    id: 1,
    type: 'image',
    image: '/img-20260206-wa0015.jpg',
    title: 'Pertandingan Sengit Cup IV',
    category: 'Pertandingan',
    description: 'Aksi seru dari pertandingan internal Cup IV 2026 yang menampilkan atlet terbaik kami.'
  },
  {
    id: 4,
    type: 'image',
    image: 'latiharutinpagi.jpg',
    title: 'Latihan Rutin Pagi',
    category: 'Latihan',
    description: 'Sesi latihan pagi yang intensif untuk meningkatkan stamina dan teknik dasar.'
  },
  // CONTOH FOTO BARU (ID: 19)
  {
    id: 19,
    type: 'image',
    image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Teknik Netting Tipis',
    category: 'Latihan',
    description: 'Fokus pada akurasi pukulan netting untuk mematikan langkah lawan di depan net.'
  },
  {
    id: 8,
    type: 'image',
    image: '/whatsapp_image_2026-02-02_at_08.39.03.jpeg',
    title: 'Penyerahan Piala Juara',
    category: 'Prestasi',
    description: 'Kegembiraan para pemenang Turnamen Internal saat menerima trofi kemenangan.'
  },

  // --- DATA VIDEO ---
  {
    id: 2,
    type: 'video',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(1).jpeg',
    videoUrl: 'https://www.youtube.com/embed/yI-YxprE9-s', 
    isLocal: false, 
    title: 'Highlight Pertandingan Cup IV',
    category: 'Pertandingan',
    description: 'Rekaman momen terbaik dari turnamen internal PB US 162 Cup IV 2026.'
  },
  // CONTOH VIDEO BARU (ID: 20)
  {
    id: 20,
    type: 'video',
    image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=800',
    videoUrl: 'https://www.youtube.com/embed/m7LIn997W34', // Contoh video badminton lain
    isLocal: false,
    title: 'Final Ganda Putra Intern',
    category: 'Pertandingan',
    description: 'Pertarungan sengit memperebutkan gelar juara pertama di kelas utama.'
  },
  {
    id: 3,
    type: 'video',
    image: 'files_8978464-2026-02-06t03-11-06-499z-img-20260206-wa0015.jpg',
    videoUrl: 'hangatpagi.mp4',
    isLocal: true,
    title: 'Jumat Berkah, Jumat Sehat',
    category: 'Latihan Rutin',
    description: 'Menampilkan cuplikan di balik layar bagaimana kerja keras dibangun di atas lapangan.'
  },
  // ... (Data lainnya tetap ada di kode asli Anda)
];

export default function Gallery() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');

  // Logic Navigasi
  const currentTabMedia = useMemo(() => {
    return galleryData.filter(item => item.type === activeTab);
  }, [activeTab]);

  const currentIndex = currentTabMedia.findIndex(item => item.id === selectedId);

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextIndex = (currentIndex + 1) % currentTabMedia.length;
    setSelectedId(currentTabMedia[nextIndex].id);
  };

  const goToPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const prevIndex = (currentIndex - 1 + currentTabMedia.length) % currentTabMedia.length;
    setSelectedId(currentTabMedia[prevIndex].id);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedId === null) return;
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, currentIndex]);

  const filteredMedia = useMemo(() => {
    return showAll ? currentTabMedia : currentTabMedia.slice(0, 6);
  }, [currentTabMedia, showAll]);

  const activeMedia = galleryData.find((item) => item.id === selectedId);

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Tabs */}
        <div className="text-center mb-12">
           <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">Lensa PB US 162</h2>
           <div className="flex justify-center mt-8">
             <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
               <button onClick={() => {setActiveTab('image'); setShowAll(false);}} className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'image' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}>FOTO</button>
               <button onClick={() => {setActiveTab('video'); setShowAll(false);}} className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'video' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}>VIDEO</button>
             </div>
           </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMedia.map((item) => (
            <div key={item.id} onClick={() => setSelectedId(item.id)} className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] shadow-md border border-slate-100 transition-all duration-500">
              <div className="aspect-[4/3] relative">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                    <PlayCircle size={48} className="text-white drop-shadow-lg" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* MODAL LIGHTBOX DENGAN FITUR SCROLL/NAVIGASI */}
        {activeMedia && (
          <div className="fixed inset-0 bg-slate-950/98 z-[999] flex flex-col items-center justify-center p-4 backdrop-blur-lg animate-in fade-in" onClick={() => setSelectedId(null)}>
            
            {/* Tombol Navigasi Kiri */}
            <button onClick={goToPrev} className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-5 rounded-full transition-all z-[1001]">
              <ChevronLeft size={40} />
            </button>

            {/* Tombol Navigasi Kanan */}
            <button onClick={goToNext} className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-5 rounded-full transition-all z-[1001]">
              <ChevronRight size={40} />
            </button>

            {/* Tombol Close */}
            <button onClick={() => setSelectedId(null)} className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-[1002]">
              <X size={36} />
            </button>
            
            <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <div className="w-full aspect-video flex items-center justify-center bg-black/40 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                {activeMedia.type === 'video' ? (
                  <iframe key={activeMedia.videoUrl} src={activeMedia.videoUrl} className="w-full h-full" allowFullScreen allow="autoplay"></iframe>
                ) : (
                  <img key={activeMedia.image} src={activeMedia.image} alt={activeMedia.title} className="max-w-full max-h-[70vh] object-contain animate-in zoom-in-95 duration-300" />
                )}
              </div>

              <div className="mt-8 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 max-w-3xl w-full text-center">
                <div className="flex justify-center gap-2 mb-4">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase">{activeMedia.category}</span>
                  <span className="bg-slate-700 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase">{currentIndex + 1} / {currentTabMedia.length}</span>
                </div>
                <h3 className="text-white text-2xl font-black mb-2">{activeMedia.title}</h3>
                <p className="text-slate-400 italic">"{activeMedia.description}"</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}