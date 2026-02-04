import { Calendar, ArrowRight, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const newsData = [
  {
    id: 1,
    title: 'Tim Putri Raih Medali Emas di Kejuaraan Asia',
    excerpt: 'Prestasi gemilang diraih tim putri dengan memenangkan final yang berlangsung sengit...',
    content: 'Tim putri PB US 162 berhasil menorehkan sejarah baru di kancah internasional. Dalam pertandingan final yang berlangsung di Tokyo, tim berhasil menumbangkan unggulan pertama dengan skor tipis. Kemenangan ini didedikasikan untuk seluruh pendukung di Parepare dan Indonesia.',
    date: '1 Februari 2026',
    category: 'Prestasi',
    image: 'https://images.pexels.com/photos/6253573/pexels-photo-6253573.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 2,
    title: 'Pembukaan Fasilitas Training Baru',
    excerpt: 'Klub membuka fasilitas training berstandar internasional untuk meningkatkan kualitas atlet...',
    content: 'Fasilitas baru ini mencakup 8 lapangan badminton dengan standar BWF, gimnasium modern, dan ruang fisioterapi khusus. Terletak di pusat kota Parepare.',
    date: '1 Februari 2026',
    category: 'Fasilitas',
    image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 3,
    title: 'Program Beasiswa untuk Atlet Muda',
    excerpt: 'Dibuka pendaftaran program beasiswa untuk atlet muda berbakat di seluruh Indonesia...',
    content: 'PB US 162 berkomitmen memberikan dukungan penuh bagi atlet muda yang kurang mampu namun memiliki prestasi akademik dan olahraga yang baik.',
    date: '2 Februari 2026',
    category: 'Program',
    image: 'https://images.pexels.com/photos/1263426/pexels-photo-1263426.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 4,
    title: 'Turnamen Internal PB Bosowa US 162 Cup IV Tahun 2026',
    excerpt: 'Puncak perayaan olahraga internal yang mempertemukan atlet dari berbagai kategori...',
    content: 'Turnamen Internal Cup IV 2026 tahun ini diikuti oleh lebih dari 50 atlet internal yang terbagi dalam kategori Seed A hingga Seed C.',
    date: '1 Februari 2026',
    category: 'Turnamen',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(1).jpeg',
  },
  // Contoh data tambahan untuk mengetes fitur "Lihat Semua"
  {
    id: 5,
    title: 'Workshop Teknik Smash bagi Pemula',
    excerpt: 'Pelatihan khusus bagi anggota baru untuk memperbaiki teknik dasar smash...',
    content: 'Dalam workshop ini, pelatih kepala mendemonstrasikan koordinasi mata dan tangan yang tepat untuk menghasilkan smash yang tajam dan akurat.',
    date: '3 Februari 2026',
    category: 'Latihan',
    image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

export default function News() {
  const [selectedNews, setSelectedNews] = useState<typeof newsData[0] | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Menentukan berita mana yang ditampilkan
  const visibleNews = showAll ? newsData : newsData.slice(0, 4);

  return (
    <section id="news" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Berita Terkini</h2>
          <p className="text-xl text-gray-600">Update terbaru tentang prestasi dan kegiatan klub</p>
        </div>

        {/* Grid Berita */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500">
          {visibleNews.map((news) => (
            <div
              key={news.id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {news.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <Calendar size={16} className="mr-2" />
                  {news.date}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{news.excerpt}</p>
                <button 
                  onClick={() => setSelectedNews(news)}
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center group mt-auto"
                >
                  Baca Selengkapnya
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tombol Lihat Semua / Sembunyikan */}
        {newsData.length > 4 && (
          <div className="text-center mt-12">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg active:scale-95"
            >
              {showAll ? (
                <>Sembunyikan Berita <ChevronUp size={20} /></>
              ) : (
                <>Lihat Semua Berita <ChevronDown size={20} /></>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Modal Berita (Tetap Sama) */}
      {selectedNews && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600">
              <X size={20} />
            </button>
            <div className="h-64 w-full">
              <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{selectedNews.category}</span>
                <div className="flex items-center text-gray-400 text-sm"><Calendar size={14} className="mr-1" />{selectedNews.date}</div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{selectedNews.title}</h2>
              <div className="text-gray-600 leading-relaxed space-y-4">
                <p className="text-lg italic text-gray-500 border-l-4 border-blue-500 pl-4">{selectedNews.excerpt}</p>
                <p>{selectedNews.content}</p>
              </div>
              <button onClick={() => setSelectedNews(null)} className="mt-8 w-full bg-gray-900 text-white py-4 rounded-xl font-bold">Tutup Berita</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}