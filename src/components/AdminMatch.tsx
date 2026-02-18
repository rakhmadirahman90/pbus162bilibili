import React, { useState, useEffect } from 'react';
import { supabase } from "../supabase";
import { 
  Trophy, User, Activity, CheckCircle2, 
  Plus, Loader2, Trash2, Send, Clock, AlertCircle, Sparkles, RefreshCcw, Search, X, RotateCcw,
  ShieldCheck, ArrowRightLeft, ChevronDown
} from 'lucide-react';

const AdminMatch: React.FC = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State UI Notification & Search
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRollbackSuccess, setShowRollbackSuccess] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');

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
      .channel('admin_realtime_v2')
      .on('postgres_changes', 
        { event: '*', table: 'pertandingan', schema: 'public' }, 
        () => {
          fetchRecentMatches();
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, []);

  const fetchPlayers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pendaftaran')
        .select('id, nama, kategori')
        .order('nama');
      
      if (error) throw error;
      if (data) setPlayers(data);
    } catch (err: any) {
      console.error("Gagal mengambil data pemain:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentMatches = async () => {
    try {
      const { data, error } = await supabase
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
        .limit(10);
      
      if (error) throw error;
      if (data) setRecentMatches(data);
    } catch (err: any) {
      console.error("Gagal mengambil riwayat pertandingan:", err.message);
    }
  };

  /**
   * Log Audit yang lebih lengkap
   */
  const createAuditLog = async (atletNama: string, perubahan: number, sebelum: number, sesudah: number, kat: string, res: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const labelTipe = res === "Rollback" ? `Rollback: ${kat}` : `${kat} (${res})`;

      await supabase.from('audit_poin').insert([{
        atlet_nama: atletNama,
        perubahan: perubahan,
        poin_sebelum: sebelum,
        poin_sesudah: sesudah,
        admin_email: user?.email || 'System Master Admin',
        tipe_kegiatan: labelTipe,
        created_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.error("Gagal mencatat audit log:", err);
    }
  };

  /**
   * Sinkronisasi ke atlet_stats dan rankings
   */
  const syncPlayerPerformance = async (playerId: string, pointsToAdd: number, currentKategori: string, currentHasil: string) => {
    try {
      // 1. Ambil Stats Saat Ini
      const { data: currentStats, error: statsError } = await supabase
        .from('atlet_stats')
        .select('*')
        .eq('pendaftaran_id', playerId)
        .maybeSingle();

      if (statsError) throw statsError;

      const existingPoints = currentStats?.points ?? currentStats?.poin ?? 0;
      const newTotalPoints = Math.max(0, existingPoints + pointsToAdd); 
      
      const playerInfo = players.find(p => p.id === playerId);
      if (!playerInfo) throw new Error("Data atlet tidak ditemukan");

      // 2. Update atlet_stats
      const statsPayload: any = {
        pendaftaran_id: playerId,
        player_name: playerInfo.nama,
        last_match_at: new Date().toISOString(),
        points: newTotalPoints,
        poin: newTotalPoints // Dual mapping untuk keamanan skema
      };

      const { error: upsertStatsError } = await supabase
        .from('atlet_stats')
        .upsert(statsPayload, { onConflict: 'pendaftaran_id' });

      if (upsertStatsError) throw upsertStatsError;

      // 3. Update rankings
      const rankingPayload: any = {
        player_name: playerInfo.nama,
        category: playerInfo.kategori || 'Senior',
        total_points: newTotalPoints,
        seed: currentStats?.seed || 'UNSEEDED',
        updated_at: new Date().toISOString()
      };

      const { error: rankingError } = await supabase
        .from('rankings')
        .upsert(rankingPayload, { onConflict: 'player_name' });

      if (rankingError) console.warn("Update ranking non-kritikal:", rankingError.message);

      // 4. Catat Audit Log
      await createAuditLog(playerInfo.nama, pointsToAdd, existingPoints, newTotalPoints, currentKategori, currentHasil);

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
      // Simpan Pertandingan
      const { error: matchError } = await supabase
        .from('pertandingan')
        .insert([{ 
          pendaftaran_id: selectedPlayer, 
          kategori_kegiatan: kategori, 
          hasil: hasil 
        }]);

      if (matchError) throw matchError;

      // Hitung Poin
      const pointsToAdd = POINT_MAP[kategori][hasil] || 0;
      
      // Sinkronisasi
      const syncSuccess = await syncPlayerPerformance(selectedPlayer, pointsToAdd, kategori, hasil);

      if (syncSuccess) {
        setSelectedPlayer('');
        setSearchTerm('');
        setShowSuccess(true);
        fetchRecentMatches();
        setTimeout(() => setShowSuccess(false), 4000);
      } else {
         throw new Error("Poin gagal disinkronkan ke stats.");
      }

    } catch (err: any) {
      alert("Error System: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteMatch = async (id: string) => {
    const matchToDelete = recentMatches.find(m => m.id === id);
    if (!matchToDelete) return;

    const confirmMsg = `Konfirmasi Rollback match ${matchToDelete.pendaftaran?.nama}? Poin atlet akan dikurangi ${POINT_MAP[matchToDelete.kategori_kegiatan][matchToDelete.hasil]} pts.`;
    
    if (!window.confirm(confirmMsg)) return;
    
    setIsLoading(true);
    try {
      const pointsToSubtract = -(POINT_MAP[matchToDelete.kategori_kegiatan][matchToDelete.hasil] || 0);
      
      const syncSuccess = await syncPlayerPerformance(
        matchToDelete.pendaftaran_id, 
        pointsToSubtract, 
        matchToDelete.kategori_kegiatan, 
        "Rollback"
      );
      
      if (!syncSuccess) throw new Error("Gagal melakukan rollback poin.");

      const { error } = await supabase
        .from('pertandingan')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setShowRollbackSuccess(true);
      fetchRecentMatches();
      setTimeout(() => setShowRollbackSuccess(false), 3000);
      
    } catch (err: any) {
      alert("Rollback Gagal: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlayers = players.filter(p => 
    p.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans relative overflow-hidden">
      {/* Efek Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/5 blur-[100px] rounded-full -z-10" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Sparkles size={20} className="text-blue-500" />
               </div>
               <p className="text-zinc-500 text-[10px] font-black tracking-[0.3em] uppercase">PB US 162 Admin Engine</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
              MANAGE <span className="text-blue-600 underline decoration-blue-900/50">POINTS</span>
            </h1>
          </div>
          
          <div className="flex gap-4">
             <button onClick={() => { fetchPlayers(); fetchRecentMatches(); }} 
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
                disabled={isLoading}>
                <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} /> Force Refresh
             </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Form Section */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full" />
              
              <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
                    <ShieldCheck className="text-blue-500" size={24} />
                    <div>
                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Database Integrity Verified</p>
                        <p className="text-[10px] text-zinc-500 font-bold leading-tight">Sistem akan melakukan kalkulasi poin dan sinkronisasi ranking secara realtime.</p>
                    </div>
                </div>

                {/* Player Search & Select */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    <User size={14} /> Pilih Atlet Penerima
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <input 
                      type="text" 
                      placeholder="Cari nama..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-3 pl-12 pr-5 focus:border-blue-600 outline-none transition-all text-xs font-bold text-white placeholder:text-zinc-700"
                    />
                  </div>
                  <div className="relative">
                    <select 
                      value={selectedPlayer}
                      onChange={(e) => setSelectedPlayer(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-zinc-800 rounded-2xl py-4 px-5 focus:border-blue-600 outline-none transition-all text-sm font-bold appearance-none cursor-pointer hover:border-zinc-700 text-white"
                    >
                      <option value="">-- {searchTerm ? 'Hasil Pencarian' : 'Pilih dari List'} --</option>
                      {filteredPlayers.map(p => (
                        <option key={p.id} value={p.id}>{p.nama} ({p.kategori})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={18} />
                  </div>
                </div>

                {/* Match Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                      <Activity size={14} /> Jenis Kegiatan
                    </label>
                    <select value={kategori} onChange={(e) => setKategori(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-800 rounded-2xl py-4 px-5 focus:border-blue-600 outline-none transition-all text-sm font-bold text-white">
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                      <Trophy size={14} /> Hasil Akhir
                    </label>
                    <select value={hasil} onChange={(e) => setHasil(e.target.value)}
                      className="w-full bg-black/60 border border-zinc-800 rounded-2xl py-4 px-5 focus:border-blue-600 outline-none transition-all text-sm font-bold text-white">
                      <option value="Menang">MENANG (WIN)</option>
                      <option value="Seri">SERI (DRAW)</option>
                      <option value="Kalah">KALAH (LOSE)</option>
                    </select>
                  </div>
                </div>

                <div className="p-5 bg-blue-600/5 border border-blue-600/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ArrowRightLeft className="text-blue-500" size={18} />
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Perolehan Poin:</span>
                    </div>
                    <span className="text-2xl font-black italic text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                        +{POINT_MAP[kategori][hasil]} <span className="text-xs not-italic text-zinc-600 ml-1">PTS</span>
                    </span>
                </div>

                <button type="submit" disabled={isSubmitting || !selectedPlayer}
                  className="w-full group relative overflow-hidden bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl shadow-blue-600/20">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  {isSubmitting ? "SINKRONISASI DATA..." : "KONFIRMASI PERUBAHAN"}
                </button>
              </form>
            </div>

            {/* Riwayat Input Section */}
            <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-[2.5rem]">
              <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">
                <Clock size={14} /> Recent Log Input
              </h3>
              <div className="space-y-4">
                {recentMatches.length === 0 ? (
                  <div className="py-10 border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center opacity-40">
                    <Activity size={32} className="mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Belum ada aktivitas hari ini</p>
                  </div>
                ) : (
                  recentMatches.map((match: any) => (
                    <div key={match.id} className="flex items-center justify-between bg-zinc-950/50 p-5 rounded-3xl border border-white/5 group hover:border-blue-600/20 transition-all hover:bg-black/60">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-[10px] rotate-3 group-hover:rotate-0 transition-transform ${
                          match.hasil === 'Menang' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                          {match.hasil[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase italic tracking-tighter">{match.pendaftaran?.nama}</p>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                             {match.kategori_kegiatan} <span className="w-1 h-1 bg-zinc-800 rounded-full" /> {match.hasil}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-mono text-zinc-700 hidden md:block">
                           {new Date(match.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button onClick={() => deleteMatch(match.id)} className="p-3 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Trophy size={60} />
              </div>
              <h3 className="text-[10px] font-black tracking-widest uppercase text-blue-500 mb-6 flex items-center gap-2">
                <Activity size={14} /> Matrix Point Configuration
              </h3>
              <div className="space-y-5">
                {CATEGORIES.map(cat => (
                  <div key={cat.id} className="group/item">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-[10px] text-zinc-400 font-bold uppercase">{cat.label}</span>
                       <span className="text-[10px] font-mono font-black text-white px-2 py-1 bg-white/5 rounded-md border border-white/5 group-hover/item:border-blue-500/50 transition-all">{cat.points}</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                       <div className={`h-full bg-blue-600 transition-all duration-1000 ${cat.id === kategori ? 'w-full' : 'w-0'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 p-8 rounded-[2.5rem]">
              <div className="flex gap-4 items-start">
                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                <div>
                   <p className="text-[10px] text-amber-600 font-black uppercase mb-1">Attention Admin</p>
                   <p className="text-[10px] text-zinc-500 font-bold leading-relaxed uppercase italic">
                     Setiap penghapusan log (Delete) akan memicu <span className="text-white">Negative Point Sync</span> pada statistik atlet. Gunakan hanya jika terjadi kesalahan input.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 transform ${
        showSuccess ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-90 pointer-events-none'}`}>
        <div className="bg-zinc-950/90 backdrop-blur-3xl border border-emerald-500/50 px-10 py-6 rounded-[3rem] shadow-[0_0_50px_rgba(16,185,129,0.2)] flex items-center gap-6">
          <div className="bg-emerald-600 p-4 rounded-2xl rotate-12 shadow-lg shadow-emerald-500/40">
            <CheckCircle2 size={28} className="text-white" />
          </div>
          <div>
            <h4 className="text-white font-black uppercase text-xl italic leading-none mb-1">VERIFIED!</h4>
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">Data Synchronized Successfully</p>
          </div>
        </div>
      </div>

      {/* ROLLBACK NOTIFICATION overlay */}
      {showRollbackSuccess && (
         <div className="fixed inset-0 z-[999] flex items-center justify-center animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <div className="bg-zinc-900 border border-red-500/30 p-12 rounded-[3.5rem] flex flex-col items-center gap-6 relative animate-in zoom-in duration-500">
               <div className="w-24 h-24 bg-red-600 rounded-[2rem] flex items-center justify-center rotate-12 shadow-2xl shadow-red-500/20">
                  <RotateCcw size={40} className="text-white -rotate-12" />
               </div>
               <div className="text-center">
                  <h2 className="text-white text-4xl font-black italic tracking-tighter uppercase mb-2">ROLLBACK COMPLETE</h2>
                  <p className="text-zinc-500 font-bold tracking-[0.3em] text-[10px] uppercase">Poin atlet telah disesuaikan kembali</p>
               </div>
            </div>
         </div>
      )}

      <style>{`
        select option { background-color: #0c0c0c; color: #fff; padding: 15px; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #2563eb; }
      `}</style>
    </div>
  );
};

export default AdminMatch;