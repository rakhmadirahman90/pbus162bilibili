import React, { useState, useEffect } from 'react';
import { supabase } from "../supabase";
import { 
  Trophy, User, Activity, CheckCircle2, 
  Plus, Loader2, Trash2, Send, Clock, AlertCircle, Sparkles, RefreshCcw
} from 'lucide-react';

const AdminMatch: React.FC = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State Baru untuk UI Notification
  const [showSuccess, setShowSuccess] = useState(false);

  // State Form
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [kategori, setKategori] = useState('Harian');
  const [hasil, setHasil] = useState('Menang');

  // KONFIGURASI POIN (Matriks Poin)
  const POINT_MAP: Record<string, Record<string, number>> = {
    'Harian': { 'Menang': 20, 'Seri': 10, 'Kalah': 5 },
    'Sparing': { 'Menang': 100, 'Seri': 50, 'Kalah': 25 },
    'Internal': { 'Menang': 300, 'Seri': 0, 'Kalah': 50 },
    'Eksternal': { 'Menang': 500, 'Seri': 0, 'Kalah': 100 },
  };

  const CATEGORIES = [
    { id: 'Harian', label: 'Latihan Harian', points: '20/10/5' },
    { id: 'Sparing', label: 'Sparing Partner', points: '100/50/25' },
    { id: 'Internal', label: 'Turnamen Internal', points: '300/--/50' },
    { id: 'Eksternal', label: 'Turnamen Eksternal', points: '500/--/100' },
  ];

  useEffect(() => {
    fetchPlayers();
    fetchRecentMatches();

    const channel = supabase
      .channel('admin_realtime')
      .on('postgres_changes', { event: '*', table: 'pertandingan', schema: 'public' }, () => {
        fetchRecentMatches();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchPlayers = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('pendaftaran').select('id, nama, kategori').order('nama');
    if (data) setPlayers(data);
    setIsLoading(false);
  };

  const fetchRecentMatches = async () => {
    const { data } = await supabase
      .from('pertandingan')
      .select(`
        id,
        pendaftaran_id,
        kategori_kegiatan,
        hasil,
        created_at,
        pendaftaran ( nama )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setRecentMatches(data);
  };

  /**
   * PENYEMPURNAAN FUNGSI SINKRONISASI
   * Mendukung dual-column (points & poin) dan perbaikan update manual
   */
  const syncPlayerPerformance = async (playerId: string, pointsToAdd: number) => {
    try {
      // 1. Ambil data stats atlet saat ini
      const { data: currentStats } = await supabase
        .from('atlet_stats')
        .select('*')
        .eq('pendaftaran_id', playerId)
        .maybeSingle();

      // Mendukung kolom lama (points) atau kolom baru (poin)
      const existingPoints = currentStats?.poin || currentStats?.points || 0;
      const newTotalPoints = existingPoints + pointsToAdd;
      
      const playerInfo = players.find(p => p.id === playerId);
      if (!playerInfo) throw new Error("Data atlet tidak ditemukan");

      // 2. Update tabel atlet_stats (Gunakan kedua kolom points & poin untuk keamanan)
      const { error: updateStatsError } = await supabase
        .from('atlet_stats')
        .upsert({
          pendaftaran_id: playerId,
          player_name: playerInfo.nama,
          points: newTotalPoints, // Kolom lama
          poin: newTotalPoints,   // Kolom baru
          last_match_at: new Date().toISOString()
        }, { onConflict: 'pendaftaran_id' });

      if (updateStatsError) throw updateStatsError;

      // 3. Sinkronisasi ke tabel rankings (Gunakan player_name sebagai kunci unik)
      const { error: rankingError } = await supabase
        .from('rankings')
        .upsert({
          player_name: playerInfo.nama,
          category: playerInfo.kategori || 'Senior',
          total_points: newTotalPoints, // Kolom lama
          poin: newTotalPoints,         // Kolom baru
          seed: currentStats?.seed || 'UNSEEDED',
          bonus: pointsToAdd >= 100 ? pointsToAdd : 0
        }, { onConflict: 'player_name' });

      if (rankingError) throw rankingError;

      return true;
    } catch (err: any) {
      console.error("Sinkronisasi Gagal:", err.message);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 1. Simpan history pertandingan
      const { error: matchError } = await supabase
        .from('pertandingan')
        .insert([{ 
          pendaftaran_id: selectedPlayer, 
          kategori_kegiatan: kategori, 
          hasil: hasil 
        }]);

      if (matchError) throw matchError;

      // 2. Kalkulasi Poin
      const pointsToAdd = POINT_MAP[kategori][hasil] || 0;
      
      // 3. Jalankan Sinkronisasi Poin & Ranking
      const syncSuccess = await syncPlayerPerformance(selectedPlayer, pointsToAdd);

      if (syncSuccess) {
        setSelectedPlayer('');
        setHasil('Menang');
        setKategori('Harian');
        
        setShowSuccess(true);
        fetchRecentMatches();
        setTimeout(() => setShowSuccess(false), 4000);
      } else {
         throw new Error("Gagal menyinkronkan data ke tabel ranking.");
      }

    } catch (err: any) {
      alert("Gagal memperbarui: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * FUNGSI HAPUS DENGAN AUTO-REDUCE POINT
   * Menghapus log pertandingan sekaligus mengurangi poin pemain secara otomatis
   */
  const deleteMatch = async (id: string) => {
    const matchToDelete = recentMatches.find(m => m.id === id);
    if (!matchToDelete) return;

    if (!confirm(`Hapus log ${matchToDelete.pendaftaran?.nama}? Poin akan dikurangi sesuai hasil pertandingan ini.`)) return;
    
    try {
      // 1. Hitung poin yang harus ditarik kembali
      const pointsToSubtract = -(POINT_MAP[matchToDelete.kategori_kegiatan][matchToDelete.hasil] || 0);
      
      // 2. Kurangi poin di database
      const syncSuccess = await syncPlayerPerformance(matchToDelete.pendaftaran_id, pointsToSubtract);
      
      if (!syncSuccess) throw new Error("Gagal menyesuaikan poin saat menghapus.");

      // 3. Hapus baris pertandingan
      const { error } = await supabase.from('pertandingan').delete().eq('id', id);
      if (error) throw error;

      fetchRecentMatches();
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/5 blur-[100px] rounded-full -z-10" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Sparkles size={20} className="text-blue-500" />
               </div>
               <p className="text-zinc-500 text-[10px] font-black tracking-[0.3em] uppercase">
                  PB US 162 Admin System
               </p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
              UPDATE <span className="text-blue-600 underline decoration-blue-900/50">MATCH</span> POINTS
            </h1>
          </div>
          
          <div className="flex gap-4">
             <button onClick={() => { fetchPlayers(); fetchRecentMatches(); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95">
                <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh Sync
             </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Form */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full" />
              
              <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">
                    <User size={14} /> Pilih Atlet Bertanding
                  </label>
                  <select 
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    required
                    className="w-full bg-black/60 border border-zinc-800 rounded-2xl py-4 px-5 focus:border-blue-600 outline-none transition-all text-sm font-bold appearance-none cursor-pointer hover:border-zinc-700"
                  >
                    <option value="">-- Cari Nama Atlet --</option>
                    {players.map(p => (
                      <option key={p.id} value={p.id}>{p.nama} ({p.kategori})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">
                      <Activity size={14} /> Kategori Laga
                    </label>
                    <select 
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-800 rounded-2xl py-4 px-5 focus:border-blue-600 outline-none transition-all text-sm font-bold"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">
                      <Trophy size={14} /> Hasil Skor
                    </label>
                    <select 
                      value={hasil}
                      onChange={(e) => setHasil(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-800 rounded-2xl py-4 px-5 focus:border-blue-600 outline-none transition-all text-sm font-bold"
                    >
                      <option value="Menang">MENANG (W)</option>
                      <option value="Seri">SERI (D)</option>
                      <option value="Kalah">KALAH (L)</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !selectedPlayer}
                  className="w-full group relative overflow-hidden bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-blue-600/30"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                  {isSubmitting ? "SYNCING TO DATABASE..." : "SUBMIT & UPDATE RANKING"}
                </button>
              </form>
            </div>

            {/* History Table */}
            <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-[2.5rem]">
              <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">
                <Clock size={14} /> Riwayat Update Terbaru
              </h3>
              
              <div className="space-y-4">
                {recentMatches.length === 0 ? (
                  <p className="text-zinc-700 text-xs italic p-4 border border-dashed border-zinc-800 rounded-2xl text-center">Belum ada riwayat input.</p>
                ) : (
                  recentMatches.map((match: any) => (
                    <div key={match.id} className="flex items-center justify-between bg-black/40 p-5 rounded-3xl border border-white/5 group hover:border-blue-600/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-[10px] ${
                          match.hasil === 'Menang' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {match.hasil[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase italic tracking-tighter">{match.pendaftaran?.nama}</p>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{match.kategori_kegiatan} • {match.hasil}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteMatch(match.id)} className="p-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Rules Sidebar */}
          <div className="space-y-6">
            <div className="bg-blue-600/5 border border-blue-600/20 p-8 rounded-[2.5rem]">
              <h3 className="text-[10px] font-black tracking-widest uppercase text-blue-500 mb-6 flex items-center gap-2">
                <Activity size={14} /> Matrix Poin
              </h3>
              <div className="space-y-5">
                {CATEGORIES.map(cat => (
                  <div key={cat.id} className="flex justify-between items-center group">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">{cat.label}</span>
                    <span className="text-[10px] font-mono font-black text-white px-2 py-1 bg-white/5 rounded-md border border-white/5 group-hover:border-blue-500/50 transition-all">{cat.points}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 border border-white/5 p-8 rounded-[2.5rem]">
              <div className="flex gap-4 items-start">
                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                <p className="text-[10px] text-zinc-400 font-bold leading-relaxed uppercase">
                  Data yang disubmit akan secara otomatis melakukan <span className="text-white">Upsert</span> pada tabel statistik dan tabel ranking global.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Success Notification */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 transform ${
        showSuccess ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-90 pointer-events-none'
      }`}>
        <div className="bg-zinc-950/90 backdrop-blur-3xl border border-blue-500/50 px-10 py-6 rounded-[3rem] shadow-2xl flex items-center gap-6">
          <div className="bg-blue-600 p-4 rounded-2xl rotate-12">
            <CheckCircle2 size={28} className="text-white" />
          </div>
          <div>
            <h4 className="text-white font-black uppercase text-xl italic leading-none mb-1">SUCCESS!</h4>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Rankings Synchronized</p>
          </div>
        </div>
      </div>

      <style>{`
        select option { background-color: #0c0c0c; color: #fff; }
      `}</style>
    </div>
  );
};

export default AdminMatch;