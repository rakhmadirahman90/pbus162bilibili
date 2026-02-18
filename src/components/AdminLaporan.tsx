import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Calendar, Download, Filter, FileText, 
  TrendingUp, Users, Zap, Newspaper, Image as ImageIcon,
  ChevronDown, Search, Loader2, BarChart3,
  Printer, FileSpreadsheet, History, CheckCircle2,
  ArrowUpRight, ArrowDownRight, AlertCircle, X,
  Database
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminLaporan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'harian' | 'bulanan' | 'tahunan'>('harian');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // --- KODE BARU: STATE UNTUK PENCARIAN ---
  const [searchQuery, setSearchQuery] = useState('');

  const [stats, setStats] = useState({
    pendaftaran: 0,
    pertandingan: 0,
    poinTerdistribusi: 0,
    beritaBaru: 0,
    galeriBaru: 0
  });

  const [detailLogs, setDetailLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchRekapData();
  }, [filterType, selectedDate]);

  const fetchRekapData = async () => {
    setLoading(true);
    setError(null);
    try {
      let startDate, endDate;
      const date = new Date(selectedDate);

      // --- PERBAIKAN LOGIKA TIMEZONE ---
      // Kita menarik data sedikit lebih luas (offset 24 jam) untuk memastikan 
      // data UTC 20:51 tetap masuk ke filter lokal hari yang sama
      if (filterType === 'harian') {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        
        // Konversi ke ISO untuk Supabase
        startDate = start.toISOString();
        endDate = end.toISOString();
      } else if (filterType === 'bulanan') {
        startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();
      } else {
        startDate = new Date(date.getFullYear(), 0, 1).toISOString();
        endDate = new Date(date.getFullYear(), 11, 31, 23, 59, 59).toISOString();
      }

      // Melakukan fetch data secara paralel
      const [reg, match, news, gallery, audit] = await Promise.all([
        supabase.from('pendaftaran').select('*', { count: 'exact', head: true }).gte('created_at', startDate).lte('created_at', endDate),
        supabase.from('pertandingan').select('*', { count: 'exact', head: true }).gte('created_at', startDate).lte('created_at', endDate),
        supabase.from('berita').select('*', { count: 'exact', head: true }).gte('created_at', startDate).lte('created_at', endDate),
        supabase.from('galeri').select('*', { count: 'exact', head: true }).gte('created_at', startDate).lte('created_at', endDate),
        supabase.from('audit_poin').select('*').gte('created_at', startDate).lte('created_at', endDate).order('created_at', { ascending: false })
      ]);

      if (audit.error) throw audit.error;

      // Hitung total poin dengan pengamanan nilai null
      const totalPoin = audit.data?.reduce((acc, curr) => acc + Math.abs(curr.perubahan || 0), 0) || 0;
      
      setDetailLogs(audit.data || []);
      setStats({
        pendaftaran: reg.count || 0,
        pertandingan: match.count || 0,
        poinTerdistribusi: totalPoin,
        beritaBaru: news.count || 0,
        galeriBaru: gallery.count || 0
      });

    } catch (err: any) {
      console.error("Gagal memuat laporan:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- KODE BARU: LOGIKA FILTER PENCARIAN (DENGAN SAFE-CHECK) ---
  const filteredLogs = detailLogs.filter(log => {
    const name = log.atlet_nama?.toLowerCase() || '';
    const email = log.admin_email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const exportToExcel = () => {
    const dataToExport = searchQuery ? filteredLogs : detailLogs;
    if (dataToExport.length === 0) return alert("Tidak ada data untuk diekspor");
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport.map(log => ({
      'WAKTU': log.created_at ? new Date(log.created_at).toLocaleString('id-ID') : '-',
      'ADMIN': log.admin_email,
      'ATLET': log.atlet_nama,
      'POIN AWAL': log.poin_sebelum,
      'PERUBAHAN': log.perubahan,
      'POIN AKHIR': log.poin_sesudah
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Audit");
    XLSX.writeFile(workbook, `Rekap_Laporan_${selectedDate}.xlsx`);
  };

  return (
    <div className="p-6 md:p-12 bg-[#050505] min-h-screen text-white font-sans print:bg-white print:text-black">
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase print:hidden">
          <AlertCircle size={18} />
          <span>Error Database: {error}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 print:hidden">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            REKAPITULASI <span className="text-blue-600">SISTEM</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <BarChart3 size={12} className="text-blue-500" /> Periode Laporan & Monitoring
          </p>
        </div>

        <div className="flex flex-wrap gap-3 bg-zinc-900/50 p-2 rounded-[2rem] border border-white/5 shadow-2xl">
          <select 
            value={filterType} 
            onChange={(e: any) => setFilterType(e.target.value)}
            className="bg-zinc-800 text-[10px] font-black uppercase px-4 py-2 rounded-full outline-none border border-transparent focus:border-blue-600 cursor-pointer"
          >
            <option value="harian">Harian</option>
            <option value="bulanan">Bulanan</option>
            <option value="tahunan">Tahunan</option>
          </select>
          
          <input 
            type={filterType === 'tahunan' ? 'number' : filterType === 'bulanan' ? 'month' : 'date'}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-black/40 text-[10px] font-black uppercase px-4 py-2 rounded-full border border-zinc-800 outline-none focus:border-blue-600"
          />

          <div className="flex gap-2 ml-2 border-l border-white/10 pl-4">
            <button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 px-4 rounded-full transition-all flex items-center gap-2 text-[10px] font-black uppercase">
              <FileSpreadsheet size={14} /> Excel
            </button>
            <button onClick={() => window.print()} className="bg-zinc-100 hover:bg-white text-black p-2 px-4 rounded-full transition-all flex items-center gap-2 text-[10px] font-black uppercase">
              <Printer size={14} /> Cetak
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 print:grid-cols-4 print:text-black">
        {[
          { label: 'Pendaftaran Baru', value: stats.pendaftaran, icon: Users, color: 'text-blue-500' },
          { label: 'Total Pertandingan', value: stats.pertandingan, icon: Zap, color: 'text-amber-500' },
          { label: 'Poin Tersirkulasi', value: stats.poinTerdistribusi, icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Update Konten', value: stats.beritaBaru + stats.galeriBaru, icon: FileText, color: 'text-purple-500' },
        ].map((item, idx) => (
          <div key={idx} className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden print:border-zinc-200">
            <item.icon className={`${item.color} mb-4`} size={24} />
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">{item.label}</p>
            <h2 className="text-4xl font-black italic mt-1">{loading ? '...' : item.value.toLocaleString()}</h2>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] overflow-hidden print:border-zinc-300">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <History size={14} className="text-blue-500" /> Log Aktivitas Audit Poin
          </h3>

          {/* INPUT PENCARIAN */}
          <div className="relative w-full md:w-80 print:hidden">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
            <input 
              type="text"
              placeholder="CARI NAMA ATLET / ADMIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-full py-3 pl-10 pr-10 text-[10px] font-black uppercase outline-none focus:border-blue-600 transition-all placeholder:text-zinc-700"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/20 text-zinc-500 text-[9px] font-black uppercase tracking-widest print:bg-zinc-100">
                <th className="px-8 py-6">Waktu</th>
                <th className="px-8 py-6">Admin</th>
                <th className="px-8 py-6">Target Atlet</th>
                <th className="px-8 py-6 text-right">Mutasi Poin</th>
                <th className="px-8 py-6 print:hidden text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin inline-block text-blue-600" /></td></tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-all group print:text-black">
                    <td className="px-8 py-6 text-[10px] font-bold text-zinc-400 group-hover:text-zinc-200">
                      {log.created_at ? new Date(log.created_at).toLocaleTimeString('id-ID') : '--:--'}
                    </td>
                    <td className="px-8 py-6 text-[10px] font-black text-blue-500 uppercase">
                      {log.admin_email?.split('@')[0]}
                    </td>
                    <td className="px-8 py-6 text-[11px] font-black uppercase italic tracking-tighter">
                      {log.atlet_nama || 'Tidak diketahui'}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`text-[12px] font-black ${log.perubahan > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {log.perubahan > 0 ? `+${log.perubahan}` : log.perubahan}
                        </span>
                        <span className="text-[8px] text-zinc-600 font-bold">AKHIR: {log.poin_sesudah}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 print:hidden text-center">
                      <div className="flex items-center justify-center gap-2 text-zinc-500 text-[9px] font-black uppercase">
                        <CheckCircle2 size={12} className="text-emerald-500" /> Recorded
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-10">
                      <Database size={64} />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                        {searchQuery ? "Data pencarian tidak ditemukan" : "Tidak ada aktivitas pada periode ini"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          .bg-zinc-900\\/40 { background: transparent !important; border: 1px solid #eee !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
}