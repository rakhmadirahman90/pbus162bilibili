import React, { useState, useEffect } from 'react';
import { supabase } from './supabase'; // Pastikan path ke supabase benar
import { 
  Plus, FileText, Download, Trash2, Calendar, 
  Search, Mail, Send 
} from 'lucide-react';

// Gunakan Named Export agar cocok dengan import { KelolaSurat } di App.tsx
export function KelolaSurat() {
  const [suratList, setSuratList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurat = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('arsip_surat') // Pastikan tabel ini ada di Supabase Anda
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setSuratList(data);
        }
      } catch (err) {
        console.error("Error fetching surat:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurat();
  }, []);

  return (
    <div className="p-6 md:p-10 text-white max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-500">
            <Mail size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Kelola Surat</h1>
            <p className="text-slate-400 text-sm font-medium">Arsip dan Manajemen Surat Organisasi</p>
          </div>
        </div>
        
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20">
          <Plus size={18} /> Tambah Surat Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm">
          <FileText className="text-blue-500 mb-4" />
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Arsip</h3>
          <p className="text-4xl font-black mt-2 tracking-tighter">{suratList.length}</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
        <div className="p-6 border-b border-white/10 bg-white/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nomor surat atau perihal..." 
              className="w-full pl-12 pr-6 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">Tanggal</th>
                <th className="px-8 py-5">Nomor Surat</th>
                <th className="px-8 py-5">Perihal</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-500 italic">Memuat data surat...</td>
                </tr>
              ) : suratList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-500 italic">Belum ada data surat yang tersimpan.</td>
                </tr>
              ) : (
                suratList.map((surat) => (
                  <tr key={surat.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6 text-sm font-medium text-slate-300">{new Date(surat.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="px-8 py-6 text-sm font-bold text-white">{surat.nomor_surat}</td>
                    <td className="px-8 py-6 text-sm text-slate-400">{surat.perihal}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-blue-600/20 text-blue-500 rounded-lg transition-colors"><Download size={16} /></button>
                        <button className="p-2 hover:bg-rose-600/20 text-rose-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
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
  );
}