import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase'; 
import { 
  Plus, FileText, Download, Trash2, Search, Mail, X, Send, Loader2, Eye, Printer 
} from 'lucide-react';

export function KelolaSurat() {
  const [suratList, setSuratList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form Lengkap
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    nomor_surat: '',
    lampiran: '-',
    perihal: '',
    tujuan: '',
    isi_surat: '',
    penandatangan: '',
    jabatan: ''
  });

  const fetchSurat = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('arsip_surat')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setSuratList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSurat(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('arsip_surat').insert([formData]);
      if (error) throw error;
      setIsModalOpen(false);
      setShowPreview(false);
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        nomor_surat: '', lampiran: '-', perihal: '', tujuan: '', isi_surat: '', penandatangan: '', jabatan: ''
      });
      fetchSurat();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 text-white max-w-7xl mx-auto min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-500"><Mail size={32} /></div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Administrasi Surat</h1>
            <p className="text-slate-400 text-sm font-medium">Pembuatan & Pengarsipan Digital</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
          <Plus size={18} /> Buat Surat Baru
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Cari arsip..." className="w-full pl-12 pr-6 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-sm" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-8 py-5">No. Surat</th>
                <th className="px-8 py-5">Perihal</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {suratList.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6 font-bold">{s.nomor_surat}</td>
                  <td className="px-8 py-6 text-slate-400">{s.perihal}</td>
                  <td className="px-8 py-6 text-right"><button className="p-2 text-rose-500"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT & PREVIEW */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-6xl rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
            
            {/* LEFT: FORM INPUT */}
            <div className="w-full md:w-1/2 p-8 overflow-y-auto border-r border-white/5 custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Draft Surat</h2>
                <button onClick={() => setIsModalOpen(false)}><X /></button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Surat</label>
                        <input type="date" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm" value={formData.tanggal} onChange={(e)=>setFormData({...formData, tanggal: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nomor Surat</label>
                        <input type="text" placeholder="No/SK/2024" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm" value={formData.nomor_surat} onChange={(e)=>setFormData({...formData, nomor_surat: e.target.value})} />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Tujuan Surat (Yth.)</label>
                    <input type="text" placeholder="Nama Penerima / Instansi" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm" value={formData.tujuan} onChange={(e)=>setFormData({...formData, tujuan: e.target.value})} />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Perihal</label>
                    <input type="text" placeholder="Undangan / Pemberitahuan" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm" value={formData.perihal} onChange={(e)=>setFormData({...formData, perihal: e.target.value})} />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Isi Surat</label>
                    <textarea rows={6} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm resize-none" placeholder="Tulis paragraf surat..." value={formData.isi_surat} onChange={(e)=>setFormData({...formData, isi_surat: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Penandatangan</label>
                        <input type="text" placeholder="Nama Jelas" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm" value={formData.penandatangan} onChange={(e)=>setFormData({...formData, penandatangan: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Jabatan</label>
                        <input type="text" placeholder="Ketua Umum" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm" value={formData.jabatan} onChange={(e)=>setFormData({...formData, jabatan: e.target.value})} />
                    </div>
                </div>

                <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-4 bg-blue-600 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                   {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={16} />} Simpan & Arsipkan
                </button>
              </div>
            </div>

            {/* RIGHT: LIVE PREVIEW (KERTAS A4) */}
            <div className="hidden md:block w-1/2 p-8 bg-slate-800/50 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4 text-slate-400">
                    <Eye size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Preview Kertas A4</span>
                </div>
                
                {/* SIMULASI KERTAS */}
                <div className="bg-white text-black p-[2cm] shadow-2xl min-h-[29.7cm] w-full text-[12pt] leading-relaxed font-serif origin-top scale-[0.85]">
                    {/* KOP SURAT */}
                    <div className="text-center border-b-[3px] border-black pb-2 mb-6">
                        <h1 className="text-xl font-bold uppercase leading-tight">Pengurus Besar Olahraga Indonesia</h1>
                        <p className="text-[10pt] font-normal italic">Jl. Jendral Sudirman No. 123, Jakarta Selatan | Telp: (021) 555-0192</p>
                        <p className="text-[9pt] font-bold tracking-widest uppercase">Email: admin@organisasi.id | Website: www.organisasi.id</p>
                    </div>

                    {/* DETAIL SURAT */}
                    <div className="flex justify-between mb-8">
                        <div className="space-y-1">
                            <p><span className="w-24 inline-block">Nomor</span> : {formData.nomor_surat || '___/___/2024'}</p>
                            <p><span className="w-24 inline-block">Lampiran</span> : {formData.lampiran}</p>
                            <p><span className="w-24 inline-block">Perihal</span> : <strong>{formData.perihal || '________________'}</strong></p>
                        </div>
                        <div className="text-right">
                            <p>Jakarta, {new Date(formData.tanggal).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</p>
                        </div>
                    </div>

                    {/* TUJUAN */}
                    <div className="mb-8">
                        <p>Yth. <strong>{formData.tujuan || '________________'}</strong></p>
                        <p>di Tempat</p>
                    </div>

                    {/* ISI SURAT */}
                    <div className="mb-12 text-justify whitespace-pre-wrap min-h-[10cm]">
                        {formData.isi_surat || "Silahkan ketik isi surat pada form di sebelah kiri untuk melihat preview paragraf secara rapi..."}
                    </div>

                    {/* TANDA TANGAN */}
                    <div className="flex justify-end">
                        <div className="text-center w-64">
                            <p className="mb-20">{formData.jabatan || 'Jabatan'}</p>
                            <p className="font-bold underline uppercase">{formData.penandatangan || 'Nama Penandatangan'}</p>
                            <p className="text-[10pt]">NIP/ID: 2024.01.001</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}