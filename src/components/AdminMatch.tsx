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
    const { data } = await supabase.from('pendaftaran').select('id, nama, kategori').order('nama');
    if (data) setPlayers(data);
  };

  const fetchRecentMatches = async () => {
    const { data } = await supabase
      .from('pertandingan')
      .select(`
        id,
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
   * FUNGSI SINKRONISASI TOTAL (Update atlet_stats & rankings secara bersamaan)
   */
  const syncPlayerPerformance = async (playerId: string, pointsToAdd: number) => {
    try {
      // 1. Ambil data stats atlet saat ini (atau buat baru jika tidak ada)
      const { data: currentStats, error: statsError } = await supabase
        .from('atlet_stats')
        .select('*')
        .eq('pendaftaran_id', playerId)
        .maybeSingle();

      const newTotalPoints = (currentStats?.points || 0) + pointsToAdd;
      const playerInfo = players.find(p => p.id === playerId);

      // 2. Update tabel atlet_stats
      const { error: updateStatsError } = await supabase
        .from('atlet_stats')
        .upsert({
          pendaftaran_id: playerId,
          points: newTotalPoints,
          last_match_at: new Date().toISOString()
        });

      if (updateStatsError) throw updateStatsError;

      // 3. Sinkronisasi ke tabel rankings untuk Landing Page
      // Kita gunakan upsert dengan onConflict 'player_name'
      const { error: rankingError } = await supabase
        .from('rankings')
        .upsert({
          player_name: playerInfo?.nama,
          category: playerInfo?.kategori || 'Senior',
          total_points: newTotalPoints,
          seed: currentStats?.seed || 'UNSEEDED',
          bonus: pointsToAdd >= 100 ? pointsToAdd : 0 // Anggap poin besar sebagai bonus di tampilan
        }, { onConflict: 'player_name' });

      if (rankingError) throw rankingError;

      return true;
    } catch (err) {
      console.error("Sync Error:", err);
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

      // 2. Jalankan Sinkronisasi Poin
      const pointsToAdd = POINT_MAP[kategori][hasil] || 0;
      const syncSuccess = await syncPlayerPerformance(selectedPlayer, pointsToAdd);

      if (syncSuccess) {
        // Reset Form
        setSelectedPlayer('');
        setHasil('Menang');
        setKategori('Harian');
        
        // UI Feedback
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
      }

    } catch (err: any) {
      alert("Gagal memperbarui: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteMatch = async (id: string) => {
    if (!confirm("Hapus log ini? Peringatan: Menghapus riwayat tidak otomatis mengurangi poin di ranking. Gunakan fitur koreksi poin di Manajemen Atlet untuk penyesuaian.")) return;
    try {
      const { error } = await supabase.from('pertandingan').delete().eq('id', id);
      if (error) throw error;
      fetchRecentMatches();
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans relative overflow-hidden">
      {/* Ornamen Latar Belakang */}
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
                  Sistem Informasi PB US 162
               </p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
              INPUT <span className="text-blue-600 underline decoration-blue-900/50">SKOR</span> MATCH
            </h1>
          </div>
          
          <div className="flex gap-4">
             <button onClick={() => { fetchPlayers(); fetchRecentMatches(); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">
                <RefreshCcw size={14} /> Refresh Data
             </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Form Utama */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-1 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">
                      <User size={14} /> Atlet Bertanding
                    </label>
                    <select 
                      value={selectedPlayer}
                      onChange={(e) => setSelectedPlayer(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-zinc-800 rounded-2xl py-4 px-5 focus:border-blue-600 outline-none transition-all text-sm appearance-none cursor-pointer hover:border-zinc-700 font-bold"
                    >
                      <option value="">Cari Nama Atlet...</option>
                      {players.map(p => (
                        <option key={p.id} value={p.id}>{p.nama} — ({p.kategori})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">
                      <Activity size={14} /> Jenis Event
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
                      <Trophy size={14} /> Hasil Pertandingan
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
                  <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-20deg] -translate-x-full group-hover:translate-x-[250%] transition-transform duration-700" />
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                  {isSubmitting ? "MENYIMPAN DATA..." : "PUBLIKASIKAN SKOR"}
                </button>
              </form>
            </div>

            {/* Recent Matches List */}
            <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-[2.5rem]">
              <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">
                <Clock size={14} /> Log Aktivitas Terakhir
              </h3>
              
              <div className="space-y-4">
                {recentMatches.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-zinc-800 rounded-3xl">
                    <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest italic">Belum ada aktivitas hari ini.</p>
                  </div>
                ) : (
                  recentMatches.map((match: any) => (
                    <div key={match.id} className="flex items-center justify-between bg-black/40 p-5 rounded-3xl border border-white/5 group hover:border-blue-600/30 transition-all hover:translate-x-1">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black italic text-xs ${
                          match.hasil === 'Menang' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {match.hasil[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white uppercase italic tracking-tighter">{match.pendaftaran?.nama}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-md font-black uppercase">{match.kategori_kegiatan}</span>
                            <span className="text-[9px] text-zinc-600 font-bold">{new Date(match.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteMatch(match.id)}
                        className="p-3 text-zinc-800 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info & Standar Poin */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/5 border border-blue-600/20 p-8 rounded-[2.5rem]">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="text-blue-500" size={18} />
                <h3 className="text-[11px] font-black tracking-widest uppercase text-white">Scoring Rules</h3>
              </div>
              <div className="space-y-4">
                {CATEGORIES.map(cat => (
                  <div key={cat.id} className="group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-zinc-400 font-black uppercase tracking-tighter">{cat.label}</span>
                      <span className="text-[10px] font-mono font-black text-blue-400">{cat.points}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600/30 w-full group-hover:bg-blue-600 transition-all duration-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 p-8 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <AlertCircle size={40} className="text-amber-500" />
              </div>
              <h3 className="text-[10px] font-black tracking-widest uppercase text-amber-500 mb-3">Penting!</h3>
              <p className="text-[10px] text-amber-500/70 leading-relaxed font-bold uppercase tracking-tight italic">
                Data yang di-submit akan langsung mengubah posisi ranking di <span className="text-white underline">Landing Page</span>. Pastikan Nama Atlet & Hasil sudah benar sebelum publikasi.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* CUSTOM SUCCESS NOTIFICATION - FLOAT */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 transform ${
        showSuccess ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-90 pointer-events-none'
      }`}>
        <div className="bg-zinc-950/90 backdrop-blur-3xl border border-blue-500/50 px-10 py-6 rounded-[3rem] shadow-[0_20px_80px_rgba(0,0,0,0.8),0_0_40px_rgba(37,99,235,0.3)] flex items-center gap-6 min-w-[380px]">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600 blur-xl opacity-50 animate-pulse" />
            <div className="relative bg-blue-600 p-4 rounded-2xl shadow-lg rotate-12 group-hover:rotate-0 transition-transform">
              <CheckCircle2 size={28} className="text-white" />
            </div>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-tighter text-xl italic leading-none mb-1">DATA PUBLISHED!</h4>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Sinkronisasi Cloud Berhasil</p>
          </div>
          <div className="absolute bottom-3 left-10 right-10 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
             <div className="h-full bg-blue-600 animate-[progress_4s_linear]" style={{ width: showSuccess ? '100%' : '0%' }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        select option {
          background-color: #000;
          color: #fff;
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

export default AdminMatch;