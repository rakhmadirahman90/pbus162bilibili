import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase'; 
import { 
  Plus, FileText, Download, Trash2, Search, Mail, X, Send, Loader2, Eye, Printer, Upload, Image as ImageIcon, Move, Edit3, Save
} from 'lucide-react';
import Swal from 'sweetalert2';

export function KelolaSurat() {
  const [suratList, setSuratList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // State untuk posisi Cap Stempel
  const [stempelPos, setStempelPos] = useState({ x: -40, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    nomor_surat: '',
    lampiran: '-',
    perihal: 'Permohonan Menjadi Narasumber (Penceramah) Kajian Ramadan Online',
    tempat_tanggal: `Parepare, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    tujuan_yth: 'Al Hafidz Ustadz Prof. Dr. KH. Muamar Bakry, Lc., M.A',
    jabatan_tujuan: 'Rektor UIM Al-Ghazali Makassar',
    isi_surat: `Segala puji bagi Allah SWT atas segala nikmat dan karunia-Nya yang senantiasa menyertai aktivitas kita. Shalawat serta salam semoga tetap tercurah kepada teladan kita Nabi Muhammad SAW, keluarga, serta para sahabatnya.

Dalam rangka menyemarakkan syiar Islam dan memperdalam pemahaman keagamaan di bulan suci Ramadan 1447 H, kami dari PB Bilibili 162 bermaksud menyelenggarakan kegiatan kajian rutin secara daring.`,
    hari_tanggal: '',
    waktu: '05.30 - 06.30 WITA',
    tempat_kegiatan: 'Virtual Meeting Zoom',
    tema: 'Ramadan sebagai Madrasah Integritas dan Spiritual',
    nama_ketua: 'H. Wawan',
    nama_sekretaris: 'H. Barhaman Muin S.Ag',
    logo_url: '', 
    ttd_ketua_url: '', 
    ttd_sekretaris_url: '',
    cap_stempel_url: ''    
  });

  // --- LOGIKA FETCH DATA & AUTO NUMBER ---
  const fetchSurat = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('arsip_surat')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setSuratList(data);
        // Jika ada data, ambil data terakhir untuk jadi template default
        if (data.length > 0 && !editId) {
          const last = data[0];
          generateAutoNumber(data); // Generate nomor baru berdasarkan list
          setFormData(prev => ({
            ...prev,
            lampiran: last.lampiran,
            perihal: last.perihal,
            tujuan_yth: last.tujuan_yth,
            jabatan_tujuan: last.jabatan_tujuan,
            isi_surat: last.isi_surat,
            nama_ketua: last.nama_ketua,
            nama_sekretaris: last.nama_sekretaris,
            logo_url: last.logo_url,
            ttd_ketua_url: last.ttd_ketua_url,
            ttd_sekretaris_url: last.ttd_sekretaris_url,
            cap_stempel_url: last.cap_stempel_url
          }));
        } else if (data.length === 0) {
          setFormData(prev => ({...prev, nomor_surat: '001/PB-Bilibili162/II/2026'}));
        }
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const generateAutoNumber = (list: any[]) => {
    if (list.length === 0) return '001/PB-Bilibili162/II/2026';
    const lastNomor = list[0].nomor_surat;
    const match = lastNomor.match(/^(\d+)/);
    if (match) {
      const nextNum = (parseInt(match[1]) + 1).toString().padStart(3, '0');
      const romanMonth = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][new Date().getMonth()];
      const year = new Date().getFullYear();
      setFormData(prev => ({ ...prev, nomor_surat: `${nextNum}/PB-Bilibili162/${romanMonth}/${year}` }));
    }
  };

  useEffect(() => { fetchSurat(); }, []);

  // --- FITUR SIMPAN & UPDATE ---
  const handleSaveSurat = async () => {
    setIsSubmitting(true);
    try {
      const payload = { ...formData, updated_at: new Date() };
      
      let error;
      if (editId) {
        ({ error } = await supabase.from('arsip_surat').update(payload).eq('id', editId));
      } else {
        ({ error } = await supabase.from('arsip_surat').insert([payload]));
      }

      if (error) throw error;

      Swal.fire('Berhasil!', `Surat telah ${editId ? 'diperbarui' : 'disimpan'}.`, 'success');
      setIsModalOpen(false);
      setEditId(null);
      fetchSurat();
    } catch (err: any) {
      Swal.fire('Gagal!', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: 'Hapus Surat?',
      text: "Data ini tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (confirm.isConfirmed) {
      const { error } = await supabase.from('arsip_surat').delete().eq('id', id);
      if (!error) {
        Swal.fire('Deleted!', 'Surat berhasil dihapus.', 'success');
        fetchSurat();
      }
    }
  };

  const handleEdit = (surat: any) => {
    setEditId(surat.id);
    setFormData(surat);
    setIsModalOpen(true);
  };

  // --- FUNGSI PRINT & DRAG ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => setIsDragging(true);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setStempelPos({ x: stempelPos.x + e.movementX, y: stempelPos.y + e.movementY });
    }
  };
  const handleMouseUp = () => setIsDragging(false);

  const handlePrint = () => {
    const content = printRef.current;
    const printWindow = window.open('', '_blank');
    if (printWindow && content) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak Surat - PB Bilibili 162</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print { @page { size: A4; margin: 0; } body { margin: 1.5cm; } }
              .font-serif { font-family: 'Times New Roman', Times, serif; }
            </style>
          </head>
          <body class="bg-white">
            ${content.innerHTML}
            <script>window.onload = () => { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="p-6 md:p-10 text-white max-w-7xl mx-auto min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-500"><Mail size={32} /></div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Administrasi Surat</h1>
            <p className="text-slate-400 text-sm font-medium">PB Bilibili 162 Parepare</p>
          </div>
        </div>
        <button 
          onClick={() => { setEditId(null); setIsModalOpen(true); fetchSurat(); }} 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} /> Buat Surat Baru
        </button>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <input 
              type="text" 
              placeholder="Cari nomor atau perihal..." 
              className="w-full max-w-md pl-5 pr-6 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Total: {suratList.length} Surat</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-8 py-5">Tgl Dibuat</th>
                <th className="px-8 py-5">No. Surat</th>
                <th className="px-8 py-5">Perihal</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="p-10 text-center animate-pulse text-slate-500">Memuat arsip surat...</td></tr>
              ) : suratList.filter(s => s.nomor_surat.includes(searchTerm) || s.perihal.toLowerCase().includes(searchTerm.toLowerCase())).map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6 text-xs text-slate-500">{new Date(s.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="px-8 py-6 font-bold text-blue-400">{s.nomor_surat}</td>
                  <td className="px-8 py-6 text-slate-300 max-w-xs truncate">{s.perihal}</td>
                  <td className="px-8 py-6 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => handleEdit(s)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDITOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-[98%] h-[95vh] rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden shadow-2xl">
            
            {/* FORM INPUT SISI KIRI */}
            <div className="w-full md:w-1/3 p-6 overflow-y-auto border-r border-white/5 space-y-4 custom-scrollbar bg-slate-900/50">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-xl font-black uppercase italic text-blue-500">
                  {editId ? 'Edit Surat' : 'Surat Baru'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><X size={24}/></button>
              </div>
              
              <div className="space-y-4">
                {/* Media Uploads */}
                <div className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl grid grid-cols-2 gap-2">
                  <label className="flex flex-col items-center p-2 border border-dashed border-white/10 rounded-xl hover:bg-white/5 cursor-pointer">
                    <ImageIcon size={14} className="mb-1 text-blue-400"/><span className="text-[8px] font-bold uppercase">Logo Kop</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo_url')} />
                  </label>
                  <label className="flex flex-col items-center p-2 border border-dashed border-white/10 rounded-xl hover:bg-white/5 cursor-pointer">
                    <Upload size={14} className="mb-1 text-blue-400"/><span className="text-[8px] font-bold uppercase">Cap Stempel</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cap_stempel_url')} />
                  </label>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nomor Surat</label>
                    <input type="text" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-blue-400" value={formData.nomor_surat} onChange={(e)=>setFormData({...formData, nomor_surat: e.target.value})} />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tujuan / Yth</label>
                    <input type="text" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs" value={formData.tujuan_yth} onChange={(e)=>setFormData({...formData, tujuan_yth: e.target.value})} />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Perihal</label>
                    <textarea className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs h-16" value={formData.perihal} onChange={(e)=>setFormData({...formData, perihal: e.target.value})} />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Isi Utama Surat</label>
                    <textarea className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs h-40 leading-relaxed" value={formData.isi_surat} onChange={(e)=>setFormData({...formData, isi_surat: e.target.value})} />
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-col gap-2 pt-4">
                  <button 
                    onClick={handleSaveSurat} 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18}/>}
                    {editId ? 'Update & Simpan' : 'Simpan ke Arsip'}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={handlePrint} className="flex-1 py-3 bg-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-700 transition-all border border-white/5"><Printer size={14}/> Print PDF</button>
                    <button onClick={()=>setIsModalOpen(false)} className="flex-1 py-3 bg-rose-600/10 text-rose-500 rounded-xl font-bold text-xs hover:bg-rose-600 hover:text-white transition-all">Batal</button>
                  </div>
                </div>
              </div>
            </div>

            {/* PREVIEW KERTAS SISI KANAN */}
            <div className="hidden md:block flex-1 bg-slate-950 p-10 overflow-y-auto custom-scrollbar relative" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
              <div ref={printRef} className="bg-white text-black p-[2cm] mx-auto w-[21cm] min-h-[29.7cm] shadow-2xl font-serif text-[11pt] leading-relaxed relative">
                
                {/* KOP */}
                <div className="flex items-center border-b-[4px] border-black pb-2 mb-6">
                  <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center mr-4 overflow-hidden">
                    {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center font-bold text-3xl border-4 border-black rounded-full italic">PB</div>}
                  </div>
                  <div className="text-center flex-1">
                    <h1 className="text-2xl font-bold uppercase leading-tight">PB BILIBILI 162</h1>
                    <p className="text-[8pt] leading-tight font-sans">Sekertariat: Jl. Andi Makkasau No.171, Kota Parepare, Sulawesi Selatan 91131</p>
                    <p className="text-[8pt] font-sans">Telepon: 081219027234 | Email: pbilibili162@gmail.com</p>
                  </div>
                </div>

                {/* INFO SURAT */}
                <div className="flex justify-between items-start mb-8">
                    <div className="space-y-0.5">
                        <p>Nomor : {formData.nomor_surat}</p>
                        <p>Lampiran : {formData.lampiran}</p>
                        <p>Perihal : <strong className="underline">{formData.perihal}</strong></p>
                    </div>
                    <p className="font-sans">{formData.tempat_tanggal}</p>
                </div>

                <div className="mb-8">
                    <p>Kepada Yth.</p>
                    <p className="font-bold">{formData.tujuan_yth}</p>
                    <p>{formData.jabatan_tujuan}</p>
                    <p>Di - Tempat</p>
                </div>

                <div className="space-y-4 text-justify">
                    <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
                    <p className="font-bold">Dengan hormat,</p>
                    <p className="whitespace-pre-line indent-8">{formData.isi_surat}</p>
                    
                    {formData.hari_tanggal && (
                      <div className="pl-8 space-y-1 font-bold">
                          <p>Hari/Tanggal : {formData.hari_tanggal}</p>
                          <p>Waktu : {formData.waktu}</p>
                          <p>Tempat : {formData.tempat_kegiatan}</p>
                          <p>Tema : "{formData.tema}"</p>
                      </div>
                    )}

                    <p>Demikian permohonan ini kami sampaikan. Atas perhatian, perkenan, dan kerja sama Bapak, kami ucapkan terima kasih yang sebesar-besarnya.</p>
                    <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh.</p>
                </div>

                {/* TTD SECTION */}
                <div className="mt-16 flex justify-between px-10 relative">
                    <div className="text-center w-48 relative">
                        <p className="mb-20">Ketua,</p>
                        {formData.ttd_ketua_url && <img src={formData.ttd_ketua_url} className="absolute top-6 left-1/2 -translate-x-1/2 h-24 object-contain mix-blend-multiply" />}
                        {formData.cap_stempel_url && (
                            <div 
                                onMouseDown={handleMouseDown}
                                style={{ transform: `translate(${stempelPos.x}px, ${stempelPos.y}px)` }}
                                className="absolute top-0 left-1/2 w-32 h-32 cursor-move z-20 group"
                            >
                                <img src={formData.cap_stempel_url} className="w-full h-full object-contain opacity-70 mix-blend-darken" />
                                <div className="hidden group-hover:block absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] bg-blue-600 text-white px-2 rounded-full whitespace-nowrap">GESER CAP</div>
                            </div>
                        )}
                        <p className="font-bold underline uppercase">{formData.nama_ketua}</p>
                    </div>

                    <div className="text-center w-48 relative">
                        <p className="mb-20">Sekretaris,</p>
                        {formData.ttd_sekretaris_url && <img src={formData.ttd_sekretaris_url} className="absolute top-6 left-1/2 -translate-x-1/2 h-24 object-contain mix-blend-multiply" />}
                        <p className="font-bold underline uppercase">{formData.nama_sekretaris}</p>
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