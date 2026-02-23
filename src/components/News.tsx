import { Calendar, ArrowRight, X, ChevronDown, ChevronUp, Loader2, User, Eye, Heart, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from "../supabase";
import { motion, AnimatePresence } from 'framer-motion';

// Definisi tipe data yang diperluas dengan ID sebagai string (UUID)
interface Berita {
  id: string; 
  judul: string;
  ringkasan: string;
  konten: string;
  kategori: string;
  gambar_url: string;
  tanggal: string;
  penulis?: string;
  views?: number;
  likes?: number;
  comments_count?: number;
}

export default function News() {
  const [beritaList, setBeritaList] = useState<Berita[]>([]);
  const [selectedNews, setSelectedNews] = useState<Berita | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('berita')
        .select('*')
        .order('tanggal', { ascending: false });

      if (error) throw error;
      if (data) setBeritaList(data as Berita[]);
    } catch (err) {
      console.error("Gagal memuat berita:", err);
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI INCREMENT VIEWS (Mendukung UUID)
  const handleOpenNews = async (news: Berita) => {
    setSelectedNews(news);
    
    try {
      // Memanggil RPC 'increment_views' dengan parameter row_id tipe UUID
      const { error } = await supabase.rpc('increment_views', { row_id: news.id });
      
      if (error) {
        console.warn("RPC Gagal, menggunakan update manual:", error.message);
        await supabase
          .from('berita')
          .update({ views: (news.views || 0) + 1 })
          .eq('id', news.id);
      }
      
      // Update state lokal agar angka langsung bertambah di UI
      setBeritaList(prev => prev.map(item => 
        item.id === news.id ? { ...item, views: (item.views || 0) + 1 } : item
      ));
    } catch (err) {
      console.error("Error updating views:", err);
    }
  };

  // FUNGSI TOGGLE LIKE (Mendukung UUID)
  const handleLike = async (e: React.MouseEvent, newsId: string) => {
    e.stopPropagation(); 
    const isLiked = likedPosts.has(newsId);
    
    try {
      const newsItem = beritaList.find(n => n.id === newsId);
      const newLikeCount = isLiked ? Math.max(0, (newsItem?.likes || 1) - 1) : (newsItem?.likes || 0) + 1;

      const { error } = await supabase
        .from('berita')
        .update({ likes: newLikeCount })
        .eq('id', newsId);

      if (!error) {
        const newLikedPosts = new Set(likedPosts);
        if (isLiked) newLikedPosts.delete(newsId);
        else newLikedPosts.add(newsId);
        setLikedPosts(newLikedPosts);

        setBeritaList(prev => prev.map(item => 
          item.id === newsId ? { ...item, likes: newLikeCount } : item
        ));
      }
    } catch (err) {
      console.error("Gagal update likes:", err);
    }
  };

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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleNews.map((news) => (
            <div
              key={news.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all group flex flex-col border border-gray-100"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={news.gambar_url}
                  alt={news.judul}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                  {news.kategori}
                </div>
                <button 
                  onClick={(e) => handleLike(e, news.id)}
                  className={`absolute bottom-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${likedPosts.has(news.id) ? 'bg-rose-500 text-white' : 'bg-white text-gray-400 hover:text-rose-500'}`}
                >
                  <Heart size={18} fill={likedPosts.has(news.id) ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="text-gray-400 text-[10px] mb-2 font-bold uppercase tracking-tight">
                  {news.tanggal}
                </div>
                <h3 
                  onClick={() => handleOpenNews(news)}
                  className="text-md font-black text-gray-900 mb-3 line-clamp-2 italic uppercase leading-tight group-hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {news.judul}
                </h3>
                
                {/* FOOTER METADATA */}
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                      <User size={10} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter truncate max-w-[60px]">
                      {news.penulis || 'ADMIN'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye size={12} />
                      <span className="text-[10px] font-bold">{news.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart size={12} className={likedPosts.has(news.id) ? 'text-rose-500' : ''} />
                      <span className="text-[10px] font-bold">{news.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={12} />
                      <span className="text-[10px] font-bold">{news.comments_count || 0}</span>
                    </div>
                  </div>
                </div>
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

      {/* MODAL DETAIL BERITA */}
      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2rem] max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl relative flex flex-col"
            >
              <button 
                onClick={() => setSelectedNews(null)} 
                className="absolute top-5 right-5 p-2 bg-black/20 hover:bg-red-600 text-white rounded-full transition-all z-[120] backdrop-blur-md border border-white/20"
              >
                <X size={24} />
              </button>
              
              <div className="overflow-y-auto hide-scrollbar flex-grow scroll-smooth">
                <div className="relative w-full bg-slate-900">
                  <img src={selectedNews.gambar_url} alt={selectedNews.judul} className="w-full h-auto block max-h-[70vh] object-contain object-top" />
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
                </div>
                
                <div className="p-8 md:p-14 bg-white relative -mt-6 rounded-t-[2.5rem]">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <span className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-200">
                        {selectedNews.kategori}
                      </span>
                      <div className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-widest italic">
                        <Calendar size={16} className="mr-2 text-blue-500" /> {selectedNews.tanggal}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-gray-400 border-l pl-6 border-gray-100">
                       <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black uppercase text-gray-300">Views</span>
                          <span className="text-sm font-bold text-gray-900">{selectedNews.views || 0}</span>
                       </div>
                       <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black uppercase text-gray-300">Likes</span>
                          <span className="text-sm font-bold text-gray-900">{selectedNews.likes || 0}</span>
                       </div>
                    </div>
                  </div>
                  
                  <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-10 italic uppercase tracking-tighter leading-[0.95]">
                    {selectedNews.judul}
                  </h2>
                  
                  <div className="space-y-10">
                    <div className="relative pl-8 py-2">
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-600 rounded-full"></div>
                      <p className="text-xl md:text-2xl italic text-gray-600 leading-relaxed font-medium">{selectedNews.ringkasan}</p>
                    </div>
                    <div className="text-gray-800 text-lg leading-[1.9] whitespace-pre-wrap font-medium">{selectedNews.konten}</div>
                  </div>

                  <div className="mt-20 pt-10 border-t border-gray-100">
                    <button onClick={() => setSelectedNews(null)} className="w-full bg-gray-900 hover:bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-[0.4em] transition-all transform active:scale-95 shadow-xl">
                      Tutup Jendela Berita
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
}