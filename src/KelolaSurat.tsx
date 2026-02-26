import React, { useState, useEffect } from 'react';
import { supabase } from "./supabase"; // Pastikan path sesuai
import { 
  Plus, FileText, Download, Trash2, Calendar, X, 
  Upload, Send, Search, CheckCircle, Clock 
} from 'lucide-react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';

export function KelolaSurat() {
  // --- STATE LAMA (TIDAK BERUBAH) ---
  const [suratList, setSuratList] = useState<any[]>([]);
  const [jenisFilter, setJenisFilter] = useState('KELUAR');

  // --- STATE BARU (TAMBAHAN LENGKAP) ---
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // State Form untuk Surat Baru
  const [formData, setFormData] = useState({
    nomor_surat: '',
    perihal: '',
    tujuan_instansi: '',
    isi_surat: '',
    tanggal_surat: new Date().toISOString().split('T')[0],
    jenis_surat: 'KELUAR', // Default mengikuti tab
    file_url: '',
    nama_ketua: 'NAMA KETUA PBSI', // Default
    nama_sekretaris: 'NAMA SEKRETARIS PBSI' // Default
  });

  // --- EFFECT UNTUK FETCH DATA ---
  useEffect(() => {
    fetchSurat();
  }, [jenisFilter]);

  const fetchSurat = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('arsip_surat')
        .select('*')
        .eq('jenis_surat', jenisFilter)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuratList(data || []);
    } catch (error: any) {
      console.error('Error fetch surat:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI UPLOAD (UNTUK SURAT MASUK) ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `surat/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets') // Ganti dengan nama bucket Anda
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      setFormData({ ...formData, file_url: data.publicUrl });
      
      Swal.fire('Berhasil', 'File berhasil diunggah', 'success');
    } catch (error: any) {
      Swal.fire('Gagal Upload', error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  // --- FUNGSI SIMPAN SURAT ---
  const handleSimpanSurat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('arsip_surat')
        .insert([{ ...formData, jenis_surat: jenisFilter }]);

      if (error) throw error;

      Swal.fire('Tersimpan', `Surat ${jenisFilter} berhasil diarsipkan`, 'success');
      setIsModalOpen(false);
      setFormData({
        nomor_surat: '', perihal: '', tujuan_instansi: '', isi_surat: '',
        tanggal_surat: new Date().toISOString().split('T')[0],
        jenis_surat: jenisFilter, file_url: '',
        nama_ketua: 'NAMA KETUA PBSI', nama_sekretaris: 'NAMA SEKRETARIS PBSI'
      });
      fetchSurat();
    } catch (error: any) {
      Swal.fire('Gagal', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // --- FUNGSI HAPUS ---
  const handleHapusSurat = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Arsip?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Ya, Hapus'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('arsip_surat').delete().eq('id', id);
      if (!error) {
        Swal.fire('Dihapus', 'Arsip surat telah dibuang.', 'success');
        fetchSurat();
      }
    }
  };

  // --- FUNGSI CETAK PDF (INTEGRASI DARI KODE SEBELUMNYA) ---
  const cetakSuratPDF = async (surat: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Kop Surat
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("PENGURUS CABANG PERSATUAN BULUTANGKIS SELURUH INDONESIA", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(16);
    doc.text("PBSI KOTA PAREPARE", pageWidth / 2, 28, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Sekretariat: Jl. Alamat Lengkap No. 123, Email: pbsi@email.com", pageWidth / 2, 34, { align: "center" });
    
    doc.setLineWidth(0.8);
    doc.line(15, 37, pageWidth - 15, 37);
    doc.setLineWidth(0.2);
    doc.line(15, 38, pageWidth - 15, 38);

    // Body
    doc.text(`Nomor  : ${surat.nomor_surat}`, 20, 50);
    doc.text(`Perihal : ${surat.perihal}`, 20, 56);
    doc.text(`${new Date(surat.tanggal_surat).toLocaleDateString('id-ID')}`, pageWidth - 20, 50, { align: "right" });

    doc.text("Kepada Yth,", 20, 75);
    doc.setFont("helvetica", "bold");
    doc.text(surat.tujuan_instansi, 20, 81);
    
    doc.setFont("helvetica", "normal");
    doc.text("Dengan hormat,", 20, 95);
    const isiSplit = doc.splitTextToSize(surat.isi_surat, pageWidth - 40);
    doc.text(isiSplit, 20, 102);

    // TTD Area
    const footerY = 200;
    doc.text("Ketua Umum,", 30, footerY);
    doc.text("Sekretaris,", pageWidth - 70, footerY);
    
    doc.setFont("helvetica", "bold");
    doc.text(surat.nama_ketua, 30, footerY + 35);
    doc.text(surat.nama_sekretaris, pageWidth - 70, footerY + 35);

    doc.save(`Surat_${surat.nomor_surat}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER KONTROL - TETAP */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black italic text-slate-900">MANAJEMEN <span className="text-blue-600">SURAT</span></h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Arsip Digital & TTD Elektronik</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> BUAT SURAT {jenisFilter}
          </button>
        </div>
      </div>

      {/* TAB SURAT MASUK / KELUAR - TETAP */}
      <div className="flex gap-2 p-1 bg-slate-100 w-fit rounded-2xl">
        <button 
          onClick={() => setJenisFilter('KELUAR')}
          className={`px-8 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all ${jenisFilter === 'KELUAR' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}
        >SURAT KELUAR</button>
        <button 
          onClick={() => setJenisFilter('MASUK')}
          className={`px-8 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all ${jenisFilter === 'MASUK' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}
        >SURAT MASUK</button>
      </div>

      {/* LIST SURAT - DENGAN LOGIKA FETCH */}
      {loading ? (
        <div className="flex flex-col items-center py-20 text-slate-400">
          <Clock className="animate-spin mb-2" />
          <p className="font-bold text-[10px] tracking-widest uppercase">Memuat Arsip...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suratList.map((surat: any) => (
            <div key={surat.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <FileText size={24} />
                </div>
                <div className="flex gap-2">
                  {surat.file_url && (
                    <a href={surat.file_url} target="_blank" rel="noreferrer" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                      <Download size={18} />
                    </a>
                  )}
                  <button onClick={() => handleHapusSurat(surat.id)} className="p-2 hover:bg-rose-50 rounded-xl text-rose-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="font-black text-slate-900 leading-tight uppercase">{surat.perihal}</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">No: {surat.nomor_surat}</p>
              
              <div className="mt-6 pt-4 border-t border-dashed border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Calendar size={12}/> {new Date(surat.tanggal_surat).toLocaleDateString('id-ID')}
                </span>
                {jenisFilter === 'KELUAR' ? (
                  <button onClick={() => cetakSuratPDF(surat)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Cetak PDF</button>
                ) : (
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Arsip Masuk</span>
                )}
              </div>
            </div>
          ))}
          {suratList.length === 0 && (
            <div className="col-span-full py-10 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-[10px] tracking-widest">TIDAK ADA ARSIP SURAT {jenisFilter}</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL FORM SURAT (KODE BARU LENGKAP) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black italic uppercase">Input Surat {jenisFilter}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X /></button>
            </div>
            
            <form onSubmit={handleSimpanSurat} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nomor Surat</label>
                  <input required value={formData.nomor_surat} onChange={e => setFormData({...formData, nomor_surat: e.target.value})} type="text" placeholder="Contoh: 001/PBSI/2026" className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tanggal</label>
                  <input required value={formData.tanggal_surat} onChange={e => setFormData({...formData, tanggal_surat: e.target.value})} type="date" className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{jenisFilter === 'KELUAR' ? 'Tujuan Instansi' : 'Pengirim'}</label>
                <input required value={formData.tujuan_instansi} onChange={e => setFormData({...formData, tujuan_instansi: e.target.value})} type="text" placeholder="Kepada Yth / Dari..." className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Perihal Surat</label>
                <input required value={formData.perihal} onChange={e => setFormData({...formData, perihal: e.target.value})} type="text" placeholder="Judul / Perihal" className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold" />
              </div>

              {jenisFilter === 'KELUAR' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Isi Ringkas Surat</label>
                  <textarea required value={formData.isi_surat} onChange={e => setFormData({...formData, isi_surat: e.target.value})} rows={5} placeholder="Tuliskan isi surat secara lengkap..." className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold"></textarea>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Upload Scan Surat (PDF/JPG)</label>
                  <div className="relative group">
                    <input type="file" onChange={handleFileUpload} className="hidden" id="fileSurat" />
                    <label htmlFor="fileSurat" className="w-full flex items-center justify-center gap-3 py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all">
                      {uploading ? <Clock className="animate-spin text-blue-600" /> : <Upload className="text-slate-400 group-hover:text-blue-600" />}
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest">
                        {formData.file_url ? 'FILE BERHASIL DIPILIH' : 'KLIK UNTUK UNGGAH SCAN SURAT'}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSaving || uploading}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black tracking-widest uppercase text-[10px] shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? 'SEDANG MENYIMPAN...' : <><Send size={16}/> SIMPAN ARSIP SURAT</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}