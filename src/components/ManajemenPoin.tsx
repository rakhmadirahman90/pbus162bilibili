import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Trophy, Plus, Minus, Search, User, Loader2, 
  ChevronLeft, ChevronRight, Zap, CheckCircle2, Sparkles 
} from 'lucide-react';

export default function ManajemenPoin() {
  const [atlets, setAtlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAmount, setLastAmount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAtlets();
  }, []);

  const fetchAtlets = async () => {
    setLoading(true);
    try {
      // 1. Ambil data profil
      const { data: profiles, error: pError } = await supabase
        .from('pendaftaran')
        .select('id, nama, kategori, kategori_atlet')
        .order('nama', { ascending: true });

      if (pError) throw pError;

      // 2. Ambil data stats secara menyeluruh
      const { data: stats, error: sError } = await supabase
        .from('atlet_stats')
        .select('*');

      if (sError) throw sError;

      // 3. LOGGING UNTUK DEBUGGING (Cek di Console Browser/F12)
      console.log("PROFILES FROM DB:", profiles);
      console.log("STATS FROM DB:", stats);

      // 4. MAPPING DATA
      const finalData = profiles.map(p => {
        // Cari poin berdasarkan pendaftaran_id
        // Gunakan .trim() dan .toLowerCase() untuk memastikan ID benar-benar cocok
        const statMatch = stats?.find(s => 
          s.pendaftaran_id?.toString().trim() === p.id?.toString().trim()
        );

        if (p.nama.includes("ARWAN")) {
          console.log("DEBUG ARWAN:", { 
            profileID: p.id, 
            foundInStats: statMatch ? "YES" : "NO",
            pointsFound: statMatch?.points 
          });
        }

        return {
          ...p,
          display_points: statMatch ? Number(statMatch.points) : 0,
          stat_id: statMatch ? statMatch.id : null
        };
      });

      setAtlets(finalData);
    } catch (err) {
      console.error("Critical Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePoin = async (atlet: any, currentPoints: number, amount: number) => {
    setUpdatingId(atlet.id);
    const newPoints = Math.max(0, currentPoints + amount);

    // Cek apakah data di atlet_stats sudah ada, jika tidak, kita insert baru
    let updateError;
    
    const { data: checkExist } = await supabase
      .from('atlet_stats')
      .select('id')
      .eq('pendaftaran_id', atlet.id)
      .single();

    if (checkExist) {
      const { error } = await supabase
        .from('atlet_stats')
        .update({ points: newPoints })
        .eq('pendaftaran_id', atlet.id);
      updateError = error;
    } else {
      // Jika Arwan tidak punya baris di atlet_stats, buatkan baris baru
      const { error } = await supabase
        .from('atlet_stats')
        .insert([{ pendaftaran_id: atlet.id, points: newPoints, rank: 0 }]);
      updateError = error;
    }

    if (!updateError) {
      setAtlets(prev => prev.map(a => 
        a.id === atlet.id ? { ...a, display_points: newPoints } : a
      ));
      setLastAmount(amount);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Audit log silent update
      supabase.auth.getUser().then(({data}) => {
        if(data.user) {
          supabase.from('audit_poin').insert([{
            admin_email: data.user.email,
            atlet_nama: atlet.nama,
            poin_sebelum: currentPoints,
            poin_sesudah: newPoints,
            perubahan: amount
          }]).then();
        }
      });
    }
    setUpdatingId(null);
  };

  const filteredAtlets = atlets.filter(a => 
    a.nama?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAtlets.length / itemsPerPage);
  const currentItems = filteredAtlets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Manajemen <span className="text-blue-600 underline decoration-blue-900/30">Poin</span>
          </h1>
          <div className="mt-2">
            <span className="bg-blue-600/20 text-blue-400 text-[10px] px-3 py-1 rounded-full font-bold border border-blue-600/30">
              <Zap size={10} className="inline mr-1" /> RE-MAPPING ACTIVE
            </span>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" 
            placeholder="Cari atlet..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 text-white font-bold outline-none focus:border-blue-600"
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className="grid gap-4 mb-8">
        {loading ? (
          <div className="py-20 flex flex-col items-center opacity-50">
            <Loader2 className="animate-spin mb-4" />
            <p className="text-[10px] font-black tracking-widest uppercase">Deep Scanning Database...</p>
          </div>
        ) : (
          currentItems.map((atlet) => (
            <div key={atlet.id} className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between group transition-all">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-blue-500 transition-all border border-white/5">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{atlet.nama}</h3>
                  <p className="text-zinc-600 text-[9px] font-bold italic uppercase tracking-widest">ID: {atlet.id.slice(0, 8)}</p>
                </div>
              </div>

              <div className="flex items-center gap-10 mt-6 md:mt-0">
                <div className="text-right">
                  <p className="text-[9px] text-zinc-600 font-black mb-1 italic">Verified Balance</p>
                  <p className="text-3xl font-black text-white">
                    {atlet.display_points.toLocaleString()} <span className="text-blue-600 text-sm">PTS</span>
                  </p>
                </div>

                <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                  <button 
                    disabled={updatingId === atlet.id}
                    onClick={() => handleUpdatePoin(atlet, atlet.display_points, -100)}
                    className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-red-600 flex items-center justify-center transition-all disabled:opacity-20"
                  >
                    {updatingId === atlet.id ? <Loader2 size={18} className="animate-spin" /> : <Minus size={20} />}
                  </button>
                  <button 
                    disabled={updatingId === atlet.id}
                    onClick={() => handleUpdatePoin(atlet, atlet.display_points, 100)}
                    className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-green-600 flex items-center justify-center transition-all disabled:opacity-20"
                  >
                    {updatingId === atlet.id ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination & Success Notification tetap sama */}
      {/* ... bagian pagination dan success notification ... */}
    </div>
  );
}