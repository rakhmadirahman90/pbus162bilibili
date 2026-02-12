import { Calendar, ArrowRight, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from "./supabase"; // Pastikan path file supabase.js anda benar

// Definisi tipe data sesuai kolom database
interface Berita {
  id: string | number;
  judul: string;
  ringkasan: string;
  konten: string;
  kategori: string;
  gambar_url: string;
  tanggal: string;
}

export default function News() {
  const [beritaList, setBeritaList] = useState<Berita[]>([]);
  const [selectedNews, setSelectedNews] = useState<Berita | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mengambil data dari Supabase saat halaman dimuat
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('berita')
          .select('*')
          .order('tanggal', { ascending: false }); // Berita terbaru di atas

        if (error) throw error;
        if (data) setBeritaList(data);
      } catch (err) {
        console.error("Gagal memuat berita:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Logika tampilan: Tampilkan 4 berita pertama, atau semua jika tombol diklik
  const visibleNews = showAll ? beritaList : beritaList.slice(0, 4);

  if (loading) {
    return (
      <div className="py-20 text-center bg-gray-50">
        <Loader2 className="animate-spin m-auto text-blue-600 mb-4" size={40} />
        <p className="text-gray-500 font-bold uppercase tracking-widest">Memuat Berita Terkini...</p>
      </div>
    );
  }

  return (
    <section id="news" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 italic uppercase tracking-tighter">
            Berita <span className="text-blue-600">Terkini</span>
          </h2>
          <p className="text-xl text-gray-600">Update terbaru tentang prestasi dan kegiatan klub PB US 162</p>
        </div>

        {/* Grid Berita Dinamis */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500">
          {visibleNews.map((news) => (
            <div
              key={news.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all group flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={news.gambar_url}
                  alt={news.judul}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {news.kategori}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center text-gray-400 text-xs mb-3 font-bold uppercase">
                  <Calendar size={14} className="mr-2 text-blue-600" />
                  {news.tanggal}
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2 line-clamp-2 italic uppercase leading-tight group-hover:text-blue-600 transition-colors">
                  {news.judul}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
                  {news.ringkasan}
                </p>
                <button 
                  onClick={() => setSelectedNews(news)}
                  className="text-blue-600 hover:text-blue-800 font-black text-xs uppercase tracking-widest flex items-center group/btn mt-auto"
                >
                  Baca Selengkapnya
                  <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tombol Load More Dinamis */}
        {beritaList.length > 4 && (
          <div className="text-center mt-12">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 uppercase text-xs tracking-widest"
            >
              {showAll ? (
                <>Sembunyikan <ChevronUp size={18} /></>
              ) : (
                <>Lihat Semua Berita <ChevronDown size={18} /></>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Modal Detail Berita */}
      {selectedNews && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button 
              onClick={() => setSelectedNews(null)} 
              className="absolute top-5 right-5 p-2 bg-gray-100 hover:bg-red-500 hover:text-white rounded-full text-gray-600 transition-all z-10"
            >
              <X size={20} />
            </button>
            
            <div className="h-72 w-full overflow-hidden">
              <img src={selectedNews.gambar_url} alt="" className="w-full h-full object-cover" />
            </div>
            
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {selectedNews.kategori}
                </span>
                <div className="flex items-center text-gray-400 text-xs font-bold uppercase italic">
                  <Calendar size={14} className="mr-2" /> {selectedNews.tanggal}
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 italic uppercase tracking-tighter leading-none">
                {selectedNews.judul}
              </h2>
              
              <div className="space-y-6">
                <p className="text-lg italic text-gray-500 border-l-4 border-blue-500 pl-6 py-2 bg-blue-50/50">
                  {selectedNews.ringkasan}
                </p>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedNews.konten}
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedNews(null)} 
                className="mt-10 w-full bg-gray-900 hover:bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}