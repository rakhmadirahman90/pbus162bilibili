import React, { useState, useEffect } from 'react';
import { supabase } from "../supabase";
import { 
  Newspaper, Plus, Trash2, Edit3, Save, X, 
  Image as ImageIcon, Calendar, Tag, Loader2, Zap, Search, AlertCircle, ExternalLink
} from 'lucide-react';

interface Berita {
  id: string;
  judul: string;
  ringkasan: string;
  konten: string;
  kategori: string;
  gambar_url: string;
  tanggal: string;
  created_at?: string;
}

export default function AdminBerita() {
  const [news, setNews] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // State Form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Berita>>({
    judul: '',
    ringkasan: '',
    konten: '',
    kategori: 'Prestasi',
    gambar_url: '',
    tanggal: new Date().toISOString().split('T')[0]
  });

  // State Notifikasi & Error
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('berita')
      .select('*')
      .order('tanggal', { ascending: false });
    
    if (data) setNews(data);
    setLoading(false);
  };

  const validateForm = () => {
    if (!formData.judul || formData.judul.length < 5) return "Judul terlalu pendek.";
    if (!formData.ringkasan || formData.ringkasan.length < 10) return "Ringkasan harus diisi lebih detail.";
    if (!formData.gambar_url?.startsWith('http')) return "URL Gambar tidak valid.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      setFormError(errorMsg);
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      if (editingId) {
        const { error } = await supabase.from('berita').update(formData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('berita').insert([formData]);
        if (error) throw error;
      }

      await fetchNews();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      closeModal();
    } catch (err) {
      console.error(err);
      setFormError("Koneksi gagal atau database menolak perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Hapus berita ini secara permanen? Tindakan ini tidak dapat dibatalkan.")) {
      const { error } = await supabase.from('berita').delete().eq('id', id);
      if (!error) {
        fetchNews();
      } else {
        alert("Gagal menghapus data.");
      }
    }
  };

  const openModal = (item?: Berita) => {
    setFormError(null);
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        judul: '',
        ringkasan: '',
        konten: '',
        kategori: 'Prestasi',
        gambar_url: '',
        tanggal: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingId(null);
  };

  const filteredNews = news.filter(n => 
    n.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-900/10 blur-[100px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-600/20 rounded-lg text-blue-500">
                   <Newspaper size={20} />
                </div>
                <p className="text-zinc-500 text-[10px] font-black tracking-[0.3em] uppercase">Content Management</p>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">
              UPDATE <span className="text-blue-600">BERITA TERKINI</span>
            </h1>
          </div>

          <button 
            onClick={() => openModal()}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Tulis Berita Baru
          </button>
        </div>

        {/* Search Bar & Stats */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
          <div className="relative group w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="CARI JUDUL ATAU KATEGORI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-blue-600 transition-all font-bold text-xs tracking-widest text-white placeholder:text-zinc-700"
            />
          </div>
          <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-900/50 px-6 py-4 rounded-2xl border border-white/5">
            Total Publikasi: <span className="text-blue-500">{news.length}</span> Berita
          </div>
        </div>

        {/* News Table/Grid */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="py-32 text-center flex flex-col items-center gap-4">
               <Loader2 className="animate-spin text-blue-600" size={40} />
               <div className="text-zinc-600 font-black uppercase tracking-[0.3em] italic text-sm">Mensinkronisasi Database...</div>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="py-20 text-center bg-zinc-900/20 border border-dashed border-white/10 rounded-[2.5rem]">
               <Newspaper className="mx-auto text-zinc-800 mb-4" size={48} />
               <p className="text-zinc-600 font-bold uppercase tracking-widest">Tidak ada berita ditemukan</p>
            </div>
          ) : (
            filteredNews.map((item) => (
              <div key={item.id} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 group hover:border-blue-600/30 transition-all hover:bg-zinc-900/60 shadow-xl shadow-black/20">
                <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-zinc-800 shrink-0 relative">
                  <img src={item.gambar_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <ExternalLink size={14} className="text-white" />
                  </div>
                </div>
                <div className="flex-grow space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-600/10 text-blue-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500/20">{item.kategori}</span>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold">
                      <Calendar size={12} />
                      {item.tanggal}
                    </div>
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter group-hover:text-blue-500 transition-colors leading-tight">{item.judul}</h3>
                  <p className="text-zinc-400 text-sm line-clamp-1 italic font-medium opacity-70">{item.ringkasan}</p>
                </div>
                <div className="flex gap-2 shrink-0 w-full md:w-auto">
                  <button onClick={() => openModal(item)} className="flex-1 md:flex-none p-4 bg-zinc-800/50 hover:bg-blue-600 text-zinc-400 hover:text-white rounded-xl transition-all border border-white/5 group/btn">
                    <Edit3 size={18} className="group-hover/btn:scale-110 transition-transform" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="flex-1 md:flex-none p-4 bg-zinc-800/50 hover:bg-red-600 text-zinc-400 hover:text-white rounded-xl transition-all border border-white/5 group/btn">
                    <Trash2 size={18} className="group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL EDITOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0c0c0c] w-full max-w-3xl rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(37,99,235,0.1)] flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-blue-600 rounded-full" />
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                  {editingId ? 'Edit' : 'Tulis'} <span className="text-blue-600">Berita</span>
                </h3>
              </div>
              <button onClick={closeModal} className="p-3 hover:bg-red-500/10 hover:text-red-500 rounded-full text-zinc-500 transition-all"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest animate-shake">
                  <AlertCircle size={18} />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Judul Berita</label>
                  <input required type="text" placeholder="Contoh: Tim Putri Juara..." className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm transition-all text-white placeholder:text-zinc-700" value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Kategori</label>
                  <div className="relative">
                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <select className="w-full pl-14 pr-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm transition-all cursor-pointer appearance-none text-white" value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})}>
                      <option value="Prestasi">🏆 Prestasi</option>
                      <option value="Fasilitas">🏢 Fasilitas</option>
                      <option value="Program">📅 Program</option>
                      <option value="Turnamen">🏸 Turnamen</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">URL Gambar</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                      <input required type="text" placeholder="https://images.pexels..." className="w-full pl-14 pr-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm transition-all text-white" value={formData.gambar_url} onChange={e => setFormData({...formData, gambar_url: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Tanggal Terbit</label>
                    <input type="date" className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm transition-all text-white" value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} />
                  </div>
              </div>

              {/* IMAGE PREVIEW */}
              {formData.gambar_url && formData.gambar_url.startsWith('http') && (
                <div className="w-full h-40 rounded-3xl overflow-hidden border border-white/10 relative group">
                   <img src={formData.gambar_url} className="w-full h-full object-cover" alt="Preview" />
                   <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">Preview Gambar</div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Ringkasan Singkat (Maks 150 Karakter)</label>
                <input required maxLength={150} type="text" placeholder="Ringkasan yang muncul di card depan..." className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm transition-all text-white" value={formData.ringkasan} onChange={e => setFormData({...formData, ringkasan: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Konten Berita Lengkap</label>
                <textarea rows={8} placeholder="Tulis cerita lengkap di sini..." className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-blue-600 outline-none font-medium text-sm transition-all text-white custom-scrollbar leading-relaxed" value={formData.konten} onChange={e => setFormData({...formData, konten: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4 sticky bottom-0 bg-[#0c0c0c] py-4">
                <button type="submit" disabled={isSaving} className="flex-grow py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
                  {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                  {editingId ? 'Perbarui Berita' : 'Terbitkan Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS NOTIF */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] transition-all duration-700 transform ${
        showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-zinc-900/95 backdrop-blur-2xl border border-blue-500/50 px-10 py-6 rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.3)] flex items-center gap-6">
          <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-600/40 animate-pulse">
            <Zap size={24} className="text-white fill-white" />
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-tighter text-xl italic leading-none mb-1">DATA DISINKRONISASI!</h4>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest opacity-80 italic">Konten sudah live di Landing Page</p>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
}