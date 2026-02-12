import React, { useState } from 'react';
import { supabase } from '../supabase'; 
import { Loader2, Send, CheckCircle2, User, Phone, MapPin, Award, Image as ImageIcon, ChevronDown, VenusMars } from 'lucide-react';

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const kategoriUmur = [
    "Pra Dini (U-9)", "Usia Dini (U-11)", "Anak-anak (U-13)", 
    "Pemula (U-15)", "Remaja (U-17)", "Taruna (U-19)", 
    "Dewasa / Umum", "Veteran (35+ / 40+)"
  ];

  const [formData, setFormData] = useState({
    nama: '',
    whatsapp: '',
    jenis_kelamin: 'Putra',
    kategori: kategoriUmur[0],
    domisili: '',
    pengalaman: ''
  });

  // PENYEMPURNAAN: Validasi tipe dan ukuran file (Maks 2MB)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        alert("Hanya file gambar yang diperbolehkan!");
        return;
      }
      if (selectedFile.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar! Maksimal 2MB.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let publicUrl = "";

      if (file) {
        // PENYEMPURNAAN: Sanitasi nama file untuk menghindari karakter aneh
        const fileExt = file.name.split('.').pop();
        const cleanFileName = formData.nama.replace(/\s+/g, '-').toLowerCase();
        const fileName = `${Date.now()}-${cleanFileName}.${fileExt}`;
        const filePath = `identitas/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('identitas-atlet')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw new Error("Gagal upload foto: " + uploadError.message);

        const { data: urlData } = supabase.storage
          .from('identitas-atlet')
          .getPublicUrl(filePath);
        
        publicUrl = urlData.publicUrl;
      }

      const { error: dbError } = await supabase
        .from('pendaftaran')
        .insert([{ 
          nama: formData.nama.toUpperCase(), // Standardisasi huruf besar
          whatsapp: formData.whatsapp, 
          jenis_kelamin: formData.jenis_kelamin,
          kategori: formData.kategori,
          domisili: formData.domisili,
          pengalaman: formData.pengalaman,
          foto_url: publicUrl 
        }]);

      if (dbError) {
        if (dbError.message.includes('rankings')) {
          throw new Error("Sistem Database Error: Segera matikan 'Trigger' di Dashboard Supabase.");
        }
        throw dbError;
      }

      // PENYEMPURNAAN: Pesan WhatsApp yang lebih rapi
      const adminPhoneNumber = "6281219027234";
      const waMessage = window.encodeURIComponent(
        `*PENDAFTARAN ATLET BARU*\n\n` +
        `*Nama:* ${formData.nama.toUpperCase()}\n` +
        `*Gender:* ${formData.jenis_kelamin}\n` +
        `*Kategori:* ${formData.kategori}\n` +
        `*Domisili:* ${formData.domisili}\n` +
        `*Link Foto:* ${publicUrl}`
      );
      
      window.open(`https://wa.me/${adminPhoneNumber}?text=${waMessage}`, '_blank');
      setSubmitted(true);
    } catch (err: any) {
      alert("Kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto my-12 p-10 bg-green-50 rounded-[3rem] border-2 border-green-200 text-center shadow-xl animate-in fade-in zoom-in duration-300">
        <CheckCircle2 size={80} className="text-green-600 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-slate-900 mb-4">BERHASIL!</h2>
        <p className="text-slate-700 mb-8 font-bold">Data Anda telah aman tersimpan di sistem.</p>
        <button 
          onClick={() => { setSubmitted(false); setFile(null); }} 
          className="bg-slate-900 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          Daftar Lagi
        </button>
      </div>
    );
  }

  const inputClass = "w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all";

  return (
    <section className="py-12 px-4 bg-slate-50 min-h-screen">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 sm:p-10 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100">
        <h2 className="text-3xl font-black text-slate-900 mb-2 text-center uppercase tracking-tight">Pendaftaran</h2>
        <p className="text-center text-slate-500 font-bold mb-8 text-sm">Lengkapi data diri calon atlet di bawah ini</p>
        
        <div className="space-y-5">
          {/* Input Nama */}
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input required value={formData.nama} className={inputClass} placeholder="NAMA LENGKAP" onChange={e => setFormData({...formData, nama: e.target.value})} />
          </div>

          {/* Input WA */}
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input required type="tel" pattern="[0-9+]*" value={formData.whatsapp} className={inputClass} placeholder="NOMOR WHATSAPP (628...)" onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
          </div>

          {/* PILIHAN JENIS KELAMIN */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest italic">Jenis Kelamin</label>
            <div className="grid grid-cols-2 gap-4">
              {['Putra', 'Putri'].map((gender) => (
                <label 
                  key={gender} 
                  className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all font-bold ${
                    formData.jenis_kelamin === gender 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-300'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="jenis_kelamin" 
                    value={gender} 
                    checked={formData.jenis_kelamin === gender} 
                    className="hidden" 
                    onChange={e => setFormData({...formData, jenis_kelamin: e.target.value})} 
                  />
                  <VenusMars size={18} />
                  {gender.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          {/* Input Domisili */}
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input required value={formData.domisili} className={inputClass} placeholder="KOTA DOMISILI" onChange={e => setFormData({...formData, domisili: e.target.value})} />
          </div>

          {/* Select Kategori */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest italic">Kategori Umur</label>
            <div className="relative group">
              <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <select value={formData.kategori} className={`${inputClass} appearance-none cursor-pointer`} onChange={e => setFormData({...formData, kategori: e.target.value})}>
                {kategoriUmur.map((kat) => <option key={kat} value={kat} className="text-slate-900 font-bold">{kat}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-600" size={20} />
            </div>
          </div>

          {/* Textarea Pengalaman */}
          <div className="relative group">
            <Award className="absolute left-4 top-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <textarea value={formData.pengalaman} className={`${inputClass} min-h-[120px] pt-4 resize-none`} placeholder="PENGALAMAN BERTANDING (OPSIONAL)" onChange={e => setFormData({...formData, pengalaman: e.target.value})} />
          </div>

          {/* Upload File */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest italic">Foto Identitas (KK/Akte/KTP)</label>
            <div className="relative group">
              <input required type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
              <div className={`w-full px-5 py-4 rounded-2xl border-2 border-dashed flex items-center justify-between transition-all ${file ? 'bg-green-50 border-green-500 shadow-inner' : 'bg-slate-50 border-slate-300 group-hover:border-blue-500'}`}>
                <span className="text-slate-900 font-bold text-sm truncate max-w-[200px]">{file ? file.name : "KLIK UNTUK UNGGAH FOTO"}</span>
                <ImageIcon size={20} className={file ? "text-green-600" : "text-slate-400"} />
              </div>
            </div>
          </div>

          {/* Tombol Daftar */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? <><Loader2 className="animate-spin" size={24} /> MEMPROSES...</> : <><Send size={20} /> DAFTAR SEKARANG</>}
          </button>
        </div>
      </form>
    </section>
  );
}