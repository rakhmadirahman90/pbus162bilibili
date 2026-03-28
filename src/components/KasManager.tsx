import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase'; // Sesuaikan path ke file supabase config Anda
import { 
  Wallet, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText,
  Loader2,
  CheckCircle2
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

  // Form State
  const [formData, setFormData] = useState({
    nama_pembayar: '',
    kategori: 'Iuran Bulanan Tetap (10k)',
    jumlah: 10000,
    tanggal_transaksi: new Date().toISOString().split('T')[0] // Default hari ini
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Ambil Data Kas
      const { data: kas, error: kasError } = await supabase
        .from('kas_pb')
        .select('*')
        .order('tanggal_transaksi', { ascending: false });

      // Ambil Data Atlet untuk dropdown
      const { data: atletData, error: atletError } = await supabase
        .from('atlet')
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
    setSaving(true);
    try {
      const { error } = await supabase.from('kas_pb').insert([
        {
          ...formData,
          tipe: 'masuk' // Default pendaftaran/iuran adalah masuk
        }
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

  // Kalkulasi Saldo
  const totalSaldo = kasData.reduce((acc, curr) => acc + curr.jumlah, 0);

  return (
    <div className="p-6 lg:p-10 bg-[#050505] min-h-screen text-white font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Wallet className="text-emerald-400" size={28} />
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-emerald-400">
              Financial <span className="text-white">Reports</span>
            </h1>
          </div>
          <p className="text-slate-500 text-xs font-bold tracking-[0.3em] uppercase ml-1">
            PB. BILI BILI 162 INTERNAL TREASURY
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-xs font-black uppercase tracking-widest">
          <FileText size={16} /> Export PDF Report
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Harian', val: 'Rp 0', color: 'text-white' },
          { label: 'Mingguan', val: 'Rp 0', color: 'text-blue-400' },
          { label: 'Bulanan', val: 'Rp 0', color: 'text-purple-400' },
          { label: 'Total Saldo', val: `Rp ${totalSaldo.toLocaleString()}`, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-current" /> {stat.label}
            </p>
            <h2 className={`text-2xl font-black italic ${stat.color}`}>{stat.val}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORM LEFT */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem]">
            <h3 className="text-emerald-400 font-black italic uppercase tracking-tighter text-xl mb-6 flex items-center gap-2">
              <Plus size={20} /> New Entry
            </h3>
            
            <form onSubmit={handleSave} className="space-y-5">
              {/* KATEGORI */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Kategori</label>
                <select 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-emerald-500 outline-none transition-all"
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
                  <option value="Denda Terlambat">Denda Terlambat</option>
                </select>
              </div>

              {/* TANGGAL TRANSAKSI */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Tanggal Transaksi</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="date"
                    required
                    className="w-full bg-black border border-white/10 rounded-xl p-4 pl-12 text-sm focus:border-emerald-500 outline-none transition-all"
                    value={formData.tanggal_transaksi}
                    onChange={(e) => setFormData({...formData, tanggal_transaksi: e.target.value})}
                  />
                </div>
              </div>

              {/* SEARCH NAMA ATLET */}
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Nama Pembayar (Atlet)</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text"
                    required
                    placeholder="Cari nama atlet..."
                    className="w-full bg-black border border-white/10 rounded-xl p-4 pl-12 text-sm focus:border-emerald-500 outline-none transition-all"
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

              {/* NOMINAL (BISA DIEDIT) */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Nominal (Rp)</label>
                <input 
                  type="number"
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-emerald-500 outline-none transition-all"
                  value={formData.jumlah}
                  onChange={(e) => setFormData({...formData, jumlah: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl text-center">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Payable Amount</p>
                <h4 className="text-3xl font-black italic">Rp {formData.jumlah.toLocaleString()}</h4>
              </div>

              <button 
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl transition-all shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                {saving ? 'Processing...' : 'Simpan Transaksi'}
              </button>
            </form>
          </div>
        </div>

        {/* TABLE RIGHT */}
        <div className="lg:col-span-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Financial_Ledger.sh</h3>
              <Search size={16} className="text-slate-500" />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                    <th className="p-6">Date</th>
                    <th className="p-6">Member</th>
                    <th className="p-6">Category</th>
                    <th className="p-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-slate-500 font-bold italic">Loading Ledger...</td>
                    </tr>
                  ) : kasData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-slate-500 font-bold italic">Belum ada data kas.</td>
                    </tr>
                  ) : (
                    kasData.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-all">
                        <td className="p-6 text-xs text-slate-400 font-mono">
                          {new Date(item.tanggal_transaksi).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-6 font-bold text-sm tracking-tight">{item.nama_pembayar}</td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                            item.kategori === 'Pembayaran Shuttlecock' 
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                            : 'bg-white/5 text-white border-white/10'
                          }`}>
                            {item.kategori}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <div className={`text-sm font-black italic flex items-center justify-end gap-2 ${item.tipe === 'masuk' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.tipe === 'masuk' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                            Rp {item.jumlah.toLocaleString()}
                          </div>
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