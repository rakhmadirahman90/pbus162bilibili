import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase'; 
import { 
  Wallet, Plus, Search, Calendar, User, ArrowUpRight, 
  ArrowDownLeft, FileText, Loader2, CheckCircle2 
} from 'lucide-react';

interface Atlet {
  id: string;
  nama: string;
}

interface KasEntry {
  id: string;
  created_at: string;
  tanggal_transaksi: string;
  nama_pembayar: string;
  kategori: string;
  jumlah: number;
  tipe: 'masuk' | 'keluar';
}

export default function KasManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kasData, setKasData] = useState<KasEntry[]>([]);
  const [atlets, setAtlets] = useState<Atlet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState({
    nama_pembayar: '',
    kategori: 'Iuran Bulanan Tetap (10k)',
    jumlah: 10000,
    tanggal_transaksi: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: kas, error: kasError } = await supabase
        .from('kas_pb')
        .select('*')
        .order('tanggal_transaksi', { ascending: false });

      // DISESUAIKAN: Mengambil data dari tabel atlet_stats
      const { data: atletData, error: atletError } = await supabase
        .from('atlet_stats')
        .select('id, nama')
        .order('nama', { ascending: true });

      if (!kasError) setKasData(kas || []);
      if (!atletError) setAtlets(atletData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_pembayar) return alert("Pilih atau isi nama pembayar!");
    
    setSaving(true);
    try {
      const { error } = await supabase.from('kas_pb').insert([
        { ...formData, tipe: 'masuk' }
      ]);

      if (!error) {
        setFormData({ ...formData, nama_pembayar: '' });
        setSearchTerm('');
        fetchData();
        alert('Transaksi Berhasil Disimpan!');
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredAtlets = atlets.filter(a => 
    a.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSaldo = kasData.reduce((acc, curr) => acc + curr.jumlah, 0);

  return (
    <div className="p-6 lg:p-10 bg-[#050505] min-h-screen text-white font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Wallet size={28} />
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-emerald-400">
              Financial <span className="text-white">Reports</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase ml-1">
            PB. BILI BILI 162 TREASURY SYSTEM
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Kas Terkumpul</p>
          <h2 className="text-3xl font-black italic text-emerald-400">Rp {totalSaldo.toLocaleString()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORM SECTION */}
        <div className="lg:col-span-4">
          <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem]">
            <h3 className="text-emerald-400 font-black italic uppercase text-lg mb-6 flex items-center gap-2">
              <Plus size={20} /> Input Transaksi
            </h3>
            
            <form onSubmit={handleSave} className="space-y-5">
              {/* KATEGORI */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Kategori</label>
                <select 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-emerald-500 outline-none"
                  value={formData.kategori}
                  onChange={(e) => {
                    const val = e.target.value;
                    let nominal = 10000;
                    if (val === 'Pembayaran Shuttlecock') nominal = 5000;
                    if (val === 'Pendaftaran Atlet Baru') nominal = 50000;
                    setFormData({...formData, kategori: val, jumlah: nominal});
                  }}
                >
                  <option value="Iuran Bulanan Tetap (10k)">Iuran Bulanan Tetap (10k)</option>
                  <option value="Pembayaran Shuttlecock">Pembayaran Shuttlecock</option>
                  <option value="Pendaftaran Atlet Baru">Pendaftaran Atlet Baru</option>
                  <option value="Sumbangan Sukarela">Sumbangan Sukarela</option>
                </select>
              </div>

              {/* TANGGAL */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Tanggal</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="date"
                    required
                    className="w-full bg-black border border-white/10 rounded-xl p-4 pl-12 text-sm focus:border-emerald-500 outline-none"
                    value={formData.tanggal_transaksi}
                    onChange={(e) => setFormData({...formData, tanggal_transaksi: e.target.value})}
                  />
                </div>
              </div>

              {/* SEARCH NAMA (atlet_stats) */}
              <div className="relative">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Nama Pembayar</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text"
                    placeholder="Ketik nama untuk mencari..."
                    className="w-full bg-black border border-white/10 rounded-xl p-4 pl-12 text-sm focus:border-emerald-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setFormData({...formData, nama_pembayar: e.target.value});
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                  />
                </div>
                
                {showDropdown && searchTerm && filteredAtlets.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-[#111] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                    {filteredAtlets.map((atlet) => (
                      <div 
                        key={atlet.id}
                        className="p-3 hover:bg-emerald-500/10 cursor-pointer text-sm border-b border-white/5"
                        onClick={() => {
                          setFormData({...formData, nama_pembayar: atlet.nama});
                          setSearchTerm(atlet.nama);
                          setShowDropdown(false);
                        }}
                      >
                        {atlet.nama}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* NOMINAL */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Nominal (Rp)</label>
                <input 
                  type="number"
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-emerald-500 outline-none"
                  value={formData.jumlah}
                  onChange={(e) => setFormData({...formData, jumlah: parseInt(e.target.value) || 0})}
                />
              </div>

              <button 
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-widest py-5 rounded-2xl transition-all flex items-center justify-center gap-2 mt-4"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                {saving ? 'PROSES...' : 'SIMPAN DATA'}
              </button>
            </form>
          </div>
        </div>

        {/* LEDGER TABLE */}
        <div className="lg:col-span-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Financial_Ledger_v1.0</h3>
              <Search size={16} className="text-slate-500" />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-500 border-b border-white/5">
                    <th className="p-6">Tanggal</th>
                    <th className="p-6">Nama Atlet</th>
                    <th className="p-6">Kategori</th>
                    <th className="p-6 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={4} className="p-20 text-center text-slate-500">Memuat data...</td></tr>
                  ) : (
                    kasData.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors text-sm">
                        <td className="p-6 text-slate-400 font-mono">
                          {new Date(item.tanggal_transaksi).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-6 font-bold">{item.nama_pembayar}</td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                            item.kategori === 'Pembayaran Shuttlecock' 
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}>
                            {item.kategori}
                          </span>
                        </td>
                        <td className="p-6 text-right font-black italic text-emerald-400">
                          Rp {item.jumlah.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}