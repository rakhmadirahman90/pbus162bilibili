import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Wallet, Plus, Search, FileText, Loader2, CheckCircle2, Filter, Trash2, Edit3, X 
} from 'lucide-react'; 
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// URL Logo dari Supabase Storage
const PB_LOGO_URL = "https://hykrsqsznmrtszhfywjz.supabase.co/storage/v1/object/public/assets/logo1.png";

interface Atlet {
  id: string;
  player_name: string;
}

interface KasEntry {
  id: string;
  created_at: string;
  tanggal_transaksi: string;
  nama_pembayar: string;
  kategori: string;
  jumlah_bayar: number;
  jumlah_bola: number;
  tipe_anggota: string; 
}

export default function KasManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kasData, setKasData] = useState<KasEntry[]>([]);
  const [atlets, setAtlets] = useState<Atlet[]>([]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().substring(0, 7));

  const initialForm = {
    nama_pembayar: '',
    kategori: 'Iuran Bulanan Tetap (10k)',
    jumlah_bayar: 10000, 
    jumlah_bola: 0,
    tipe_anggota: 'Anggota Tetap',
    tanggal_transaksi: new Date().toISOString().split('T')[0] 
  };

  const [formData, setFormData] = useState(initialForm);

  // Filter & Total Logic
  const filteredData = kasData.filter(item => item.tanggal_transaksi.startsWith(filterMonth));
  const totalSaldoFiltered = filteredData.reduce((acc, curr) => acc + (curr.jumlah_bayar || 0), 0);
  const totalSaldoGlobal = kasData.reduce((acc, curr) => acc + (curr.jumlah_bayar || 0), 0);

  // --- HELPER: Transparansi Logo ---
  const getTransparentImageData = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; 
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error("Gagal mendapatkan context canvas"));
        }
      };
      img.onerror = (e) => reject(e);
    });
  };

  // --- LOGIKA PERHITUNGAN OTOMATIS (ENHANCED) ---
  useEffect(() => {
    if (formData.kategori === 'Pembayaran Shuttlecock') {
      const hargaPerBola = formData.tipe_anggota === 'Anggota Tetap' ? 4000 : 5000;
      setFormData(prev => ({ 
        ...prev, 
        jumlah_bayar: (prev.jumlah_bola || 0) * hargaPerBola 
      }));
    } else if (formData.kategori === 'Iuran Bulanan Tetap (10k)') {
      setFormData(prev => ({ ...prev, jumlah_bayar: 10000, jumlah_bola: 0 }));
    } else if (formData.kategori === 'Pendaftaran Atlet Baru') {
      setFormData(prev => ({ ...prev, jumlah_bayar: 50000, jumlah_bola: 0 }));
    }
  }, [formData.jumlah_bola, formData.tipe_anggota, formData.kategori]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kasResponse, atletResponse] = await Promise.all([
        supabase.from('kas_pb').select('*').order('tanggal_transaksi', { ascending: false }),
        supabase.from('atlet_stats').select('id, player_name').order('player_name', { ascending: true })
      ]);

      if (kasResponse.error) throw kasResponse.error;
      if (atletResponse.error) throw atletResponse.error;

      setKasData(kasResponse.data || []);
      setAtlets(atletResponse.data || []);
      
      // Set default name if form is empty
      if (atletResponse.data?.length > 0 && !formData.nama_pembayar) {
        setFormData(prev => ({ ...prev, nama_pembayar: atletResponse.data[0].player_name }));
      }
    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_pembayar) return alert("Pilih nama atlet!");

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('kas_pb').update(formData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('kas_pb').insert([formData]);
        if (error) throw error;
      }
      
      setEditingId(null);
      setFormData({ ...initialForm, nama_pembayar: atlets[0]?.player_name || '' });
      fetchData(); 
      alert('Data berhasil disimpan!');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan ini?")) return;
    try {
      const { error } = await supabase.from('kas_pb').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      alert(`Gagal: ${error.message}`);
    }
  };

  const handleEditClick = (item: KasEntry) => {
    setEditingId(item.id);
    setFormData({
      nama_pembayar: item.nama_pembayar,
      kategori: item.kategori,
      jumlah_bayar: item.jumlah_bayar,
      jumlah_bola: item.jumlah_bola || 0,
      tipe_anggota: item.tipe_anggota || 'Anggota Tetap',
      tanggal_transaksi: item.tanggal_transaksi
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exportToPDF = async () => {
    try {
      const doc = new jsPDF();
      const dateStr = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      // 1. Logo
      try {
        const transparentLogo = await getTransparentImageData(PB_LOGO_URL);
        doc.addImage(transparentLogo, 'PNG', 14, 10, 22, 22, undefined, 'FAST');
      } catch (e) {
        console.error("CORS/Logo error", e);
      }

      // 2. Header
      doc.setFontSize(20).setFont("helvetica", "bold").setTextColor(30, 64, 175);
      doc.text('PB. BILI BILI 162', 42, 18);
      doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(100);
      doc.text('Jl. Bili-Bili No. 162, Kota Parepare, Sulawesi Selatan', 42, 24);
      doc.text(`Periode Laporan: ${filterMonth} | Dicetak: ${dateStr}`, 42, 29);

      doc.setDrawColor(30, 64, 175).setLineWidth(0.8).line(14, 38, 196, 38);

      // 3. Table
      const tableRows = filteredData.map(item => [
        new Date(item.tanggal_transaksi).toLocaleDateString('id-ID'),
        item.nama_pembayar,
        item.kategori,
        item.jumlah_bola || '-',
        `Rp ${item.jumlah_bayar.toLocaleString()}`
      ]);

      autoTable(doc, {
        head: [["Tanggal", "Nama Member", "Kategori", "Bola", "Total"]],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [30, 64, 175], fontSize: 10, halign: 'center' },
        columnStyles: { 3: { halign: 'center' }, 4: { halign: 'right' } },
      });

      // 4. Footer
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(10).setFont("helvetica", "bold").setTextColor(30, 64, 175);
      doc.text(`TOTAL PERIODE: Rp ${totalSaldoFiltered.toLocaleString()}`, 192, finalY, { align: 'right' });

      const signY = finalY + 25;
      doc.setTextColor(0).setFont("helvetica", "normal");
      doc.text('Parepare, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), 145, signY);
      doc.text('Bendahara PB162,', 145, signY + 7);
      doc.text('( ___________________ )', 145, signY + 30);

      doc.save(`Laporan_Kas_${filterMonth}.pdf`);
    } catch (error) {
      alert("Gagal ekspor PDF.");
    }
  };

  return (
    <div className="p-6 lg:p-10 bg-[#050505] min-h-screen text-white font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg"><Wallet className="text-blue-400" size={28} /></div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-blue-400">
              Financial <span className="text-white">Reports</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase ml-1">PB. BILI BILI 162 INTERNAL TREASURY</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
            <Filter size={14} className="text-blue-400" />
            <input type="month" className="bg-transparent text-xs font-bold outline-none text-white uppercase" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
          </div>
          <button onClick={exportToPDF} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Kas Periode Ini
          </p>
          <h2 className="text-2xl font-black italic text-blue-400">Rp {totalSaldoFiltered.toLocaleString()}</h2>
        </div>
        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Total Saldo Global
          </p>
          <h2 className="text-2xl font-black italic text-white">Rp {totalSaldoGlobal.toLocaleString()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-4">
          <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] sticky top-10">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-blue-400 font-black italic uppercase tracking-tighter text-xl flex items-center gap-2">
                  {editingId ? <Edit3 size={20} /> : <Plus size={20} />} 
                  {editingId ? 'Update Entry' : 'New Entry'}
                </h3>
                {editingId && (
                    <button onClick={() => {setEditingId(null); setFormData(initialForm);}} className="text-slate-500 hover:text-white"><X size={20}/></button>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Kategori</label>
                <select className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none" value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})}>
                  <option value="Iuran Bulanan Tetap (10k)">Iuran Bulanan Tetap (10k)</option>
                  <option value="Pembayaran Shuttlecock">Pembayaran Shuttlecock</option>
                  <option value="Pendaftaran Atlet Baru">Pendaftaran Atlet Baru</option>
                  <option value="Sumbangan Sukarela">Sumbangan Sukarela</option>
                </select>
              </div>

              {formData.kategori === 'Pembayaran Shuttlecock' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Tipe</label>
                    <select className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs outline-none" value={formData.tipe_anggota} onChange={(e) => setFormData({...formData, tipe_anggota: e.target.value})}>
                      <option value="Anggota Tetap">Tetap (4k)</option>
                      <option value="Anggota Tidak Tetap">Tidak Tetap (5k)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Jml Bola</label>
                    <input type="number" min="0" className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs outline-none" value={formData.jumlah_bola || ''} onChange={(e) => setFormData({...formData, jumlah_bola: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Tanggal</label>
                <input type="date" required className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm outline-none" value={formData.tanggal_transaksi} onChange={(e) => setFormData({...formData, tanggal_transaksi: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Nama Pembayar</label>
                <select required className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm outline-none" value={formData.nama_pembayar} onChange={(e) => setFormData({...formData, nama_pembayar: e.target.value})}>
                  <option value="" disabled>Pilih Atlet...</option>
                  {atlets.map((atlet) => (
                    <option key={atlet.id} value={atlet.player_name} className="bg-black">{atlet.player_name}</option>
                  ))}
                </select>
              </div>

              {(formData.kategori === 'Sumbangan Sukarela') && (
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Nominal (Rp)</label>
                   <input type="number" className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm outline-none" value={formData.jumlah_bayar} onChange={(e) => setFormData({...formData, jumlah_bayar: parseInt(e.target.value) || 0})} />
                 </div>
              )}

              <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-2xl text-center">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Tagihan</p>
                <h4 className="text-3xl font-black italic">Rp {formData.jumlah_bayar.toLocaleString()}</h4>
              </div>

              <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <CheckCircle2 size={18} /> : <Plus size={18} />)}
                {editingId ? 'Update Transaksi' : 'Simpan Transaksi'}
              </button>
            </form>
          </div>
        </div>

        {/* Table Section */}
        <div className="lg:col-span-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Ledger_Entry_{filterMonth}.log</h3>
              <Search size={16} className="text-slate-500" />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                    <th className="p-6">Member</th>
                    <th className="p-6">Category</th>
                    <th className="p-6 text-center">Bola</th>
                    <th className="p-6 text-right">Amount</th>
                    <th className="p-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={32} /></td></tr>
                  ) : filteredData.length > 0 ? filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-all group">
                      <td className="p-6">
                        <p className="font-bold text-sm tracking-tight">{item.nama_pembayar}</p>
                        <p className="text-[9px] text-slate-500 uppercase">{new Date(item.tanggal_transaksi).toLocaleDateString('id-ID')}</p>
                      </td>
                      <td className="p-6">
                        <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase">{item.kategori}</span>
                      </td>
                      <td className="p-6 text-center font-mono text-xs">{item.jumlah_bola || '-'}</td>
                      <td className="p-6 text-right font-black italic text-blue-400">Rp {item.jumlah_bayar.toLocaleString()}</td>
                      <td className="p-6">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(item)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg"><Edit3 size={14}/></button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="p-10 text-center text-slate-500 text-xs italic">Tidak ada data.</td></tr>
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