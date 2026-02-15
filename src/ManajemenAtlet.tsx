import React, { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import { 
  Search, User, X, Award, TrendingUp, Users, 
  MapPin, Phone, ShieldCheck, Star, Trophy, Save, Loader2, Edit3,
  ChevronLeft, ChevronRight, Zap, Sparkles, RefreshCcw
} from 'lucide-react';

interface Registrant {
  id: string;
  nama: string;
  whatsapp: string;
  kategori: string;
  domisili: string;
  foto_url: string;
  jenis_kelamin: string;
  rank: number;
  points: number;
  seed: string;
  bio: string;
  prestasi: string;
  status?: string;
}

export default function ManajemenAtlet() {
  const [atlets, setAtlets] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAtlet, setSelectedAtlet] = useState<Registrant | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStats, setEditingStats] = useState<Partial<Registrant> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');

  useEffect(() => {
    fetchAtlets();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchAtlets = async () => {
    setLoading(true);
    console.log("🔄 Memulai sinkronisasi data dari Supabase...");
    
    try {
      // PERBAIKAN: Query diperjelas dan menambahkan pengecekan error yang lebih detail
      const { data, error } = await supabase
        .from('pendaftaran')
        .select(`
          *,
          atlet_stats (
            rank,
            points,
            seed,
            bio,
            prestasi_terakhir
          )
        `)
        .order('nama', { ascending: true });
      
      if (error) {
        console.error("❌ Supabase Error:", error.message);
        throw error;
      }

      if (data) {
        console.log("✅ Data mentah berhasil ditarik:", data.length, "baris ditemukan.");
        
        const formattedData = data.map((item: any) => {
          // Supabase return atlet_stats sebagai array karena relasi 1-to-many atau many-to-one
          const stats = Array.isArray(item.atlet_stats) ? item.atlet_stats[0] : item.atlet_stats;
          
          return {
            id: item.id,
            nama: item.nama || 'Tanpa Nama',
            whatsapp: item.whatsapp || '-',
            kategori: item.kategori || 'UMUM',
            domisili: item.domisili || 'Parepare',
            foto_url: item.foto_url || '',
            jenis_kelamin: item.jenis_kelamin || '-',
            status: item.status || 'Inactive',
            // Gunakan optional chaining dan fallback yang aman
            rank: stats?.rank ?? 0,
            points: stats?.points ?? 0,
            seed: stats?.seed ?? 'UNSEEDED',
            bio: stats?.bio ?? "Profil atlet profesional belum dilengkapi.",
            prestasi: stats?.prestasi_terakhir ?? "NEW CONTENDER"
          };
        });

        console.log("📊 Data terformat:", formattedData);
        setAtlets(formattedData);
      }
    } catch (err) {
      console.error("❌ Critical Fetch Error:", err);
      // Cek apakah tabel pendaftaran benar-benar ada
      alert("Gagal mengambil data. Pastikan tabel 'pendaftaran' tersedia di Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStats || !editingStats.id) return;
    
    setIsSaving(true);
    try {
      // 1. UPSERT KE ATLET_STATS
      const { data: checkStats } = await supabase
        .from('atlet_stats')
        .select('id')
        .eq('pendaftaran_id', editingStats.id)
        .maybeSingle();

      const statsPayload = {
        pendaftaran_id: editingStats.id,
        rank: Number(editingStats.rank) || 0,
        points: Number(editingStats.points) || 0,
        seed: editingStats.seed || 'UNSEEDED',
        bio: editingStats.bio || '',
        prestasi_terakhir: editingStats.prestasi 
      };

      if (checkStats) {
        await supabase.from('atlet_stats').update(statsPayload).eq('pendaftaran_id', editingStats.id);
      } else {
        await supabase.from('atlet_stats').insert([statsPayload]);
      }

      // 2. SINKRONISASI KE TABEL RANKINGS
      await supabase
        .from('rankings')
        .upsert({
          player_name: editingStats.nama,
          category: editingStats.kategori,
          seed: editingStats.seed,
          total_points: Number(editingStats.points) || 0,
          rank: editingStats.rank?.toString() || "0"
        }, { onConflict: 'player_name' });

      // 3. UPDATE STATUS DI TABEL PENDAFTARAN
      await supabase.from('pendaftaran').update({ status: 'Active' }).eq('id', editingStats.id);

      await fetchAtlets();
      
      setNotifMessage("Data Terintegrasi!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setIsEditModalOpen(false);
      setSelectedAtlet(null);
    } catch (err) {
      console.error("Update Error:", err);
      alert("Gagal memperbarui data. Cek koneksi atau database.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAtlets = atlets.filter(a => 
    a.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAtlets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAtlets.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-50 z-0"></div>
      
      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-blue-600 animate-pulse" />
              <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase">Pro Database System</p>
            </div>
            <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">
              Manajemen <span className="text-blue-600">Atlet</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm">Dashboard kendali data profil dan performa atlet.</p>
          </div>
          
          <div className="bg-white px-8 py-4 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-100 flex items-center gap-6">
             <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Atlet</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{atlets.length}</p>
             </div>
             <div className="w-[1px] h-10 bg-slate-100"></div>
             <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ranked</p>
                <p className="text-2xl font-black text-blue-600 leading-none">{atlets.filter(a => a.rank > 0).length}</p>
             </div>
             <button onClick={fetchAtlets} className="p-3 bg-slate-50 hover:bg-blue-50 rounded-full transition-colors text-slate-400 hover:text-blue-600">
                <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
             </button>
          </div>
        </div>

        <div className="relative mb-10 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={22} />
          <input 
            type="text"
            placeholder="CARI NAMA ATLET..."
            className="w-full pl-14 pr-8 py-5 bg-white rounded-[2rem] border-none shadow-sm focus:ring-4 focus:ring-blue-100 transition-all font-black uppercase text-sm tracking-widest placeholder:text-slate-300"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-32 text-center">
               <Loader2 className="animate-spin m-auto text-blue-600 mb-4" size={40} />
               <p className="font-black text-slate-300 uppercase italic tracking-[0.3em]">Mengunduh Data Atlet...</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <Users className="m-auto text-slate-200 mb-4" size={60} />
               <p className="font-black text-slate-300 uppercase italic tracking-[0.3em]">Data Tidak Ditemukan</p>
               <button onClick={fetchAtlets} className="mt-4 text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline">Refresh Database</button>
            </div>
          ) : (
            currentItems.map((atlet) => (
              <div 
                key={atlet.id}
                onClick={() => setSelectedAtlet(atlet)}
                className="bg-white p-5 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group border border-slate-100 relative overflow-hidden"
              >
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-5 bg-slate-100 shadow-inner">
                  {atlet.foto_url ? (
                    <img src={atlet.foto_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={atlet.nama} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                      <User size={60} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xl text-white text-[9px] font-black px-4 py-1.5 rounded-full border border-white/20 uppercase tracking-tighter">
                    #{atlet.rank || '0'} GLOBAL
                  </div>
                </div>
                <div className="px-2">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">{atlet.kategori}</p>
                  <h3 className="text-lg font-black text-slate-900 uppercase italic truncate mb-4 leading-tight">{atlet.nama}</h3>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Points</p>
                      <p className="text-sm font-black text-slate-900 tracking-tighter">{atlet.points.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Seed</p>
                      <p className="text-[10px] font-black text-emerald-600 italic tracking-tighter uppercase">{atlet.seed}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-16">
            <button 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`min-w-[48px] h-12 rounded-xl font-black text-sm transition-all ${
                    currentPage === i + 1 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* MODAL DETAIL ATLET */}
      {selectedAtlet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
          <div className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-[3rem] overflow-hidden flex flex-col md:flex-row border border-white/5">
            <button onClick={() => setSelectedAtlet(null)} className="absolute top-8 right-8 z-50 p-3 bg-white/5 hover:bg-red-500 text-white rounded-full border border-white/10"><X size={24} /></button>
            <div className="w-full md:w-[45%] relative bg-zinc-900 min-h-[300px]">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10"></div>
              {selectedAtlet.foto_url ? (
                <img src={selectedAtlet.foto_url} className="w-full h-full object-cover" alt={selectedAtlet.nama} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800"><User size={150} className="text-white/5" /></div>
              )}
            </div>
            <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-8">
                <div className="flex gap-2">
                  <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-lg border border-blue-600/30 uppercase tracking-widest italic">{selectedAtlet.kategori}</span>
                </div>
                <button onClick={() => { setEditingStats(selectedAtlet); setIsEditModalOpen(true); }} className="flex items-center gap-2 text-white/30 hover:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-white/5 px-4 py-2 rounded-full hover:bg-white/5"><Edit3 size={14} /> UPDATE STATS</button>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-10 leading-[0.85]">{selectedAtlet.nama}</h2>
              <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <TrendingUp className="text-blue-500 mb-3" size={24} />
                    <p className="text-[10px] font-black text-white/20 uppercase mb-1">Standing</p>
                    <p className="text-3xl font-black text-white italic">#{selectedAtlet.rank}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <Zap className="text-amber-500 mb-3" size={24} />
                    <p className="text-[10px] font-black text-white/20 uppercase mb-1">Points</p>
                    <p className="text-3xl font-black text-white italic">{selectedAtlet.points.toLocaleString()}</p>
                  </div>
              </div>
              <div className="bg-blue-600/5 p-8 rounded-3xl border border-blue-600/10">
                  <p className="text-slate-400 text-sm leading-relaxed italic font-medium">"{selectedAtlet.bio}"</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT PERFORMA */}
      {isEditModalOpen && editingStats && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-2xl uppercase italic tracking-tighter">Edit <span className="text-blue-600">Performance</span></h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 rounded-full"><X size={24}/></button>
            </div>
            <form onSubmit={handleUpdateStats} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rank</label>
                  <input type="number" className="w-full px-6 py-4 bg-slate-100 rounded-2xl border-none font-black" value={editingStats.rank} onChange={e => setEditingStats({...editingStats, rank: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Points</label>
                  <input type="number" className="w-full px-6 py-4 bg-slate-100 rounded-2xl border-none font-black" value={editingStats.points} onChange={e => setEditingStats({...editingStats, points: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seed</label>
                  <input type="text" className="w-full px-6 py-4 bg-slate-100 rounded-2xl border-none font-black uppercase" value={editingStats.seed} onChange={e => setEditingStats({...editingStats, seed: e.target.value})} />
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bio</label>
                  <textarea rows={3} className="w-full px-6 py-4 bg-slate-100 rounded-2xl border-none font-bold text-sm" value={editingStats.bio} onChange={e => setEditingStats({...editingStats, bio: e.target.value})} />
              </div>
              <button disabled={isSaving} className="w-full py-5 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 transition-all">
                {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                Publish & Synchronize
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NOTIFICATION */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] transition-all duration-700 ${showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-blue-500/50 px-10 py-6 rounded-[2.5rem] flex items-center gap-6">
          <Zap size={24} className="text-white fill-white animate-bounce" />
          <h4 className="text-white font-black uppercase tracking-tighter text-xl italic">{notifMessage}</h4>
        </div>
      </div>

    </div>
  );
}