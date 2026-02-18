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
      // PERBAIKAN LOGIKA WAKTU: Menyesuaikan rentang waktu agar mencakup seluruh hari (00:00:00 s/d 23:59:59)
      const date = new Date(selectedDate);
      let startDate, endDate;

      if (filterType === 'harian') {
        startDate = new Date(date.setHours(0,0,0,0)).toISOString();
        endDate = new Date(date.setHours(23,59,59,999)).toISOString();
      } else if (filterType === 'bulanan') {
        startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();
      } else {
        startDate = new Date(date.getFullYear(), 0, 1).toISOString();
        endDate = new Date(date.getFullYear(), 11, 31, 23, 59, 59).toISOString();
      }

      // Query data dengan filter waktu yang lebih luas
      const [reg, match, news, gallery, audit] = await Promise.all([
        supabase.from('pendaftaran').select('*', { count: 'exact', head: true }).gte('created_at', startDate).lte('created_at', endDate),
        supabase.from('pertandingan').select('*', { count: 'exact', head: true }).gte('created_at', startDate).lte('created_at', endDate),
        supabase.from('berita').select('*', { count: 'exact', head: true }).gte('created_at', startDate).lte('created_at', endDate),
        supabase.from('galeri').select('*', { count: 'exact', head: true }).gte('created_at', startDate).lte('created_at', endDate),
        // Gunakan kolom 'created_at' untuk filter utama karena ini standar Supabase
        supabase.from('audit_poin')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false })
      ]);

      if (audit.error) throw audit.error;

      // Jika data audit masih kosong, kita coba ambil tanpa filter waktu untuk memastikan koneksi database OK
      let auditData = audit.data || [];
      if (auditData.length === 0) {
        const { data: fallback } = await supabase.from('audit_poin').select('*').limit(5).order('created_at', { ascending: false });
        if (fallback && fallback.length > 0) {
            console.log("Data ditemukan di DB tapi tidak lolos filter waktu:", fallback);
        }
      }

      const totalPoin = auditData.reduce((acc, curr) => acc + Math.abs(curr.perubahan || 0), 0);
      
      setDetailLogs(auditData);
      setStats({
        pendaftaran: reg.count || 0,
        pertandingan: match.count || 0,
        poinTerdistribusi: totalPoin,
        beritaBaru: news.count || 0,
        galeriBaru: gallery.count || 0
      });

    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = detailLogs.filter(log => 
    (log.atlet_nama?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (log.admin_email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-12 bg-[#050505] min-h-screen text-white font-sans">
      
      {/* Header & Filter Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            REKAPITULASI <span className="text-blue-600">SISTEM</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 bg-zinc-900/50 p-2 rounded-[2rem] border border-white/5 shadow-2xl">
          <select 
            value={filterType} 
            onChange={(e: any) => setFilterType(e.target.value)}
            className="bg-zinc-800 text-[10px] font-black uppercase px-4 py-2 rounded-full outline-none border border-transparent focus:border-blue-600"
          >
            <option value="harian">Harian</option>
            <option value="bulanan">Bulanan</option>
            <option value="tahunan">Tahunan</option>
          </select>
          
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-black/40 text-[10px] font-black uppercase px-4 py-2 rounded-full border border-zinc-800 outline-none"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-white/5">
            <p className="text-zinc-500 text-[9px] font-black uppercase">Mutasi Poin</p>
            <h2 className="text-4xl font-black italic mt-1 text-emerald-500">{stats.poinTerdistribusi}</h2>
        </div>
        {/* Tambahkan card stats lainnya di sini... */}
      </div>

      {/* Log Activity Section */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <History size={14} className="text-blue-500" /> Log Aktivitas Audit Poin
          </h3>
          
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
            <input 
              type="text"
              placeholder="CARI NAMA ATLET..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-full py-2 pl-10 pr-10 text-[10px] font-black uppercase outline-none focus:border-blue-600"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/20 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                <th className="px-8 py-6">Waktu</th>
                <th className="px-8 py-6">Admin</th>
                <th className="px-8 py-6">Atlet</th>
                <th className="px-8 py-6 text-right">Mutasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin inline-block text-blue-600" /></td></tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-all">
                    <td className="px-8 py-6 text-[10px] font-bold text-zinc-400">
                      {/* Gunakan kolom 'waktu' dari DB jika ada, jika tidak pakai created_at */}
                      {log.waktu ? new Date(log.waktu).toLocaleTimeString('id-ID') : new Date(log.created_at).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="px-8 py-6 text-[10px] font-black text-blue-500 uppercase">{log.admin_email?.split('@')[0]}</td>
                    <td className="px-8 py-6 text-[11px] font-black uppercase italic tracking-tighter">{log.atlet_nama}</td>
                    <td className="px-8 py-6 text-right font-black text-emerald-500">
                      {log.perubahan > 0 ? `+${log.perubahan}` : log.perubahan}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-32 text-center">
                    <Database size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20">Tidak ada aktivitas terdeteksi</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}