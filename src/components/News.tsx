import { Calendar, ArrowRight, X, ChevronDown, ChevronUp, Loader2, User, Eye, Heart, MessageCircle, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from "../supabase";
import { motion, AnimatePresence } from 'framer-motion';

// Interface untuk Komentar
interface Komentar {
  id: string;
  nama_user: string;
  isi_komentar: string;
  tanggal: string;
}

// Definisi tipe data yang diperluas
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

  // State Baru untuk Komentar
  const [comments, setComments] = useState<Komentar[]>([]);
  const [newComment, setNewComment] = useState({ nama: '', pesan: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      // Query dengan join untuk mendapatkan jumlah komentar per berita
      const { data, error } = await supabase
        .from('berita')
        .select(`*, komentar(count)`)
        .order('tanggal', { ascending: false });

      if (error) throw error;
      
      if (data) {
        const formattedData = data.map(item => ({
          ...item,
          comments_count: item.komentar?.[0]?.count || 0
        }));
        setBeritaList(formattedData as Berita[]);
      }
    } catch (err) {
      console.error("Gagal memuat berita:", err);
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI UNTUK MENGAMBIL KOMENTAR
  const fetchComments = async (beritaId: string) => {
    try {
      const { data, error } = await supabase
        .from('komentar')
        .select('*')
        .eq('berita_id', beritaId)
        .order('tanggal', { ascending: false });
      
      if (!error && data) setComments(data);
    } catch (err) {
      console.error("Gagal memuat komentar:", err);
    }
  };

  // FUNGSI INCREMENT VIEWS
  const handleOpenNews = async (news: Berita) => {
    setSelectedNews(news);
    fetchComments(news.id); // Ambil komentar saat modal dibuka
    
    try {
      const { error } = await supabase.rpc('increment_views', { row_id: news.id });
      
      if (error) {
        await supabase
          .from('berita')
          .update({ views: (news.views || 0) + 1 })
          .eq('id', news.id);
      }
      
      setBeritaList(prev => prev.map(item => 
        item.id === news.id ? { ...item, views: (item.views || 0) + 1 } : item
      ));
    } catch (err) {
      console.error("Error updating views:", err);
    }
  };

  // FUNGSI KIRIM KOMENTAR
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNews || !newComment.nama || !newComment.pesan) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('komentar')
        .insert([{
          berita_id: selectedNews.id,
          nama_user: newComment.nama,
          isi_komentar: newComment.pesan
        }])
        .select();

      if (!error && data) {
        setComments(prev => [data[0], ...prev]);
        setNewComment({ nama: '', pesan: '' });
        
        // Update jumlah komentar di state lokal list utama
        setBeritaList(prev => prev.map(item => 
          item.id === selectedNews.id ? { ...item, comments_count: (item.comments_count || 0) + 1 } : item
        ));
      }
    } catch (err) {
      alert("Gagal mengirim komentar");
    } finally {
      setIsSubmitting(false);
    }
  };

  // FUNGSI TOGGLE LIKE
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
                <img src={news.gambar_url} alt={news.judul} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
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
                <div className="text-gray-400 text-[10px] mb-2 font-bold uppercase tracking-tight">{news.tanggal}</div>
                <h3 
                  onClick={() => handleOpenNews(news)}
                  className="text-md font-black text-gray-900 mb-3 line-clamp-2 italic uppercase leading-tight group-hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {news.judul}
                </h3>
                
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center"><User size={10} /></div>
                    <span className="text-[9px] font-black uppercase tracking-tighter truncate max-w-[60px]">{news.penulis || 'ADMIN'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="flex items-center gap-1"><Eye size={12} /><span className="text-[10px] font-bold">{news.views || 0}</span></div>
                    <div className="flex items-center gap-1"><Heart size={12} className={likedPosts.has(news.id) ? 'text-rose-500' : ''} /><span className="text-[10px] font-bold">{news.likes || 0}</span></div>
                    <div className="flex items-center gap-1"><MessageCircle size={12} /><span className="text-[10px] font-bold">{news.comments_count || 0}</span></div>
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
              {showAll ? <><ChevronUp size={18} /> Sembunyikan</> : <>Lihat Semua Berita <ChevronDown size={18} /></>}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[2rem] max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl relative flex flex-col">
              <button onClick={() => setSelectedNews(null)} className="absolute top-5 right-5 p-2 bg-black/20 hover:bg-red-600 text-white rounded-full transition-all z-[120] backdrop-blur-md border border-white/20">
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
                      <span className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-200">{selectedNews.kategori}</span>
                      <div className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-widest italic"><Calendar size={16} className="mr-2 text-blue-500" /> {selectedNews.tanggal}</div>
                    </div>
                    <div className="flex items-center gap-6 text-gray-400 border-l pl-6 border-gray-100">
                       <div className="flex flex-col items-center"><span className="text-[10px] font-black uppercase text-gray-300">Views</span><span className="text-sm font-bold text-gray-900">{selectedNews.views || 0}</span></div>
                       <div className="flex flex-col items-center"><span className="text-[10px] font-black uppercase text-gray-300">Likes</span><span className="text-sm font-bold text-gray-900">{selectedNews.likes || 0}</span></div>
                    </div>
                  </div>
                  
                  <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-10 italic uppercase tracking-tighter leading-tight">{selectedNews.judul}</h2>
                  
                  <div className="space-y-10">
                    <div className="relative pl-8 py-2"><div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-600 rounded-full"></div><p className="text-xl md:text-2xl italic text-gray-600 leading-relaxed font-medium">{selectedNews.ringkasan}</p></div>
                    <div className="text-gray-800 text-lg leading-[1.9] whitespace-pre-wrap font-medium">{selectedNews.konten}</div>
                  </div>

                  {/* SECTION KOMENTAR */}
                  <div className="mt-16 pt-10 border-t-2 border-gray-50">
                    <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3">
                      <MessageCircle className="text-blue-600" size={28} /> Komentar ({comments.length})
                    </h3>

                    {/* Form Input Komentar */}
                    <form onSubmit={handleSubmitComment} className="mb-12 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <input 
                          type="text" 
                          placeholder="Nama Lengkap" 
                          required
                          className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm"
                          value={newComment.nama}
                          onChange={(e) => setNewComment({...newComment, nama: e.target.value})}
                        />
                      </div>
                      <textarea 
                        placeholder="Tulis pendapat Anda tentang berita ini..." 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none font-medium text-sm min-h-[120px] mb-4"
                        value={newComment.pesan}
                        onChange={(e) => setNewComment({...newComment, pesan: e.target.value})}
                      />
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Mengirim...' : <>Kirim Komentar <Send size={14} /></>}
                      </button>
                    </form>

                    {/* List Komentar */}
                    <div className="space-y-8">
                      {comments.length > 0 ? comments.map((c) => (
                        <div key={c.id} className="flex gap-4 border-b border-gray-50 pb-6 last:border-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black shrink-0">
                            {c.nama_user.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-black text-sm uppercase italic">{c.nama_user}</span>
                              <span className="text-[10px] text-gray-400 font-bold">{new Date(c.tanggal).toLocaleDateString('id-ID')}</span>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed font-medium">{c.isi_komentar}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                          <p className="text-gray-400 italic font-bold">Belum ada komentar. Jadilah yang pertama memberikan pendapat!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-20">
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