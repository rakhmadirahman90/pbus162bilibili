import { Calendar, ArrowRight, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from "../supabase";

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
          .order('tanggal', { ascending: false });

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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500">
          {visibleNews.map((news) => (
            <div
              key={news.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all group flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              {/* Image Container Card: Menggunakan object-top agar kepala tidak terpotong */}
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <img
                  src={news.gambar_url}
                  alt={news.judul}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
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

      {/* Modal Detail Berita - FIXED & SMOOTH SCROLL */}
      {selectedNews && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col scale-in-center transition-all">
            
            {/* Tombol Close Elegan */}
            <button 
              onClick={() => setSelectedNews(null)} 
              className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md hover:bg-red-500 hover:text-white rounded-full text-white md:text-gray-600 md:bg-gray-100 transition-all z-20 shadow-xl"
            >
              <X size={24} />
            </button>
            
            {/* Area Scrollable dengan Scrollbar Smooth */}
            <div className="overflow-y-auto custom-scrollbar-smooth flex-grow">
              
              {/* Image Header: Menggunakan aspect-video dan object-top agar proporsional */}
              <div className="w-full relative bg-gray-100 aspect-video md:h-[450px]">
                <img 
                  src={selectedNews.gambar_url} 
                  alt={selectedNews.judul} 
                  className="w-full h-full object-cover object-top" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
              </div>
              
              <div className="p-8 md:p-14 -mt-10 relative bg-white rounded-t-[3rem]">
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <span className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-200">
                    {selectedNews.kategori}
                  </span>
                  <div className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-widest italic">
                    <Calendar size={16} className="mr-2 text-blue-500" /> {selectedNews.tanggal}
                  </div>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 italic uppercase tracking-tighter leading-[0.9] border-b pb-8">
                  {selectedNews.judul}
                </h2>
                
                <div className="space-y-8">
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 rounded-full"></div>
                    <p className="text-xl md:text-2xl italic text-gray-600 pl-8 py-2 leading-relaxed font-light">
                      {selectedNews.ringkasan}
                    </p>
                  </div>
                  
                  <div className="text-gray-700 text-lg leading-[1.8] whitespace-pre-wrap font-medium">
                    {selectedNews.konten}
                  </div>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-100">
                  <button 
                    onClick={() => setSelectedNews(null)} 
                    className="w-full bg-gray-900 hover:bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-[0.3em] transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]"
                  >
                    Tutup Berita
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Internal untuk Smooth Scroll & Custom Scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar-smooth {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #f3f4f6;
          scroll-behavior: smooth;
        }
        .custom-scrollbar-smooth::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-smooth::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }
        .custom-scrollbar-smooth::-webkit-scrollbar-thumb {
          background-color: #3b82f6;
          border-radius: 10px;
        }
        .scale-in-center {
          animation: scale-in-center 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }
        @keyframes scale-in-center {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}} />
    </section>
  );
}