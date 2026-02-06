import React, { useState } from 'react';
// Path disesuaikan: keluar satu tingkat ke folder 'src' tempat supabase.ts berada
import { supabase } from '../supabase'; 
import { Loader2, Send, CheckCircle2, User, Phone, MapPin, Award, Image as ImageIcon } from 'lucide-react';

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    whatsapp: '',
    kategori: 'Anak-anak (U-11/U-13)',
    domisili: '',
    pengalaman: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let publicUrl = "";

      // 1. PROSES UPLOAD FOTO KE STORAGE
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('identitas-atlet')
          .upload(filePath, file);

        if (uploadError) throw new Error("Gagal upload foto: " + uploadError.message);

        const { data: urlData } = supabase.storage
          .from('identitas-atlet')
          .getPublicUrl(filePath);
        
        publicUrl = urlData.publicUrl;
      }

      // 2. SIMPAN DATA LENGKAP KE TABEL DATABASE
      const { error: dbError } = await supabase
        .from('pendaftaran')
        .insert([{ 
          nama: formData.nama, 
          whatsapp: formData.whatsapp, 
          kategori: formData.kategori,
          domisili: formData.domisili,
          pengalaman: formData.pengalaman,
          foto_url: publicUrl 
        }]);

      if (dbError) throw new Error("Gagal simpan data ke database: " + dbError.message);

      // 3. JIKA BERHASIL, BUKA WHATSAPP DENGAN DETAIL LENGKAP
      const adminPhoneNumber = "6281219027234";
      const message = `*PENDAFTARAN ATLET BARU*%0A%0A` +
                      `*Nama:* ${formData.nama}%0A` +
                      `*Domisili:* ${formData.domisili}%0A` +
                      `*Kategori:* ${formData.kategori}%0A` +
                      `*Pengalaman:* ${formData.pengalaman}%0A` +
                      `*Link Foto:* ${publicUrl}`;
      
      window.open(`https://wa.me/${adminPhoneNumber}?text=${message}`, '_blank');
      
      setSubmitted(true);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto my-12 p-10 bg-green-50 rounded-[3rem] border-2 border-green-100 text-center animate-in fade-in zoom-in duration-500">
        <CheckCircle2 size={80} className="text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-slate-900 mb-4">BERHASIL!</h2>
        <p className="text-slate-600 mb-8 font-medium">Data pendaftaran telah tersimpan. Admin akan segera memproses data Anda.</p>
        <button 
          onClick={() => setSubmitted(false)} 
          className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
        >
          Daftar Kembali
        </button>
      </div>
    );
  }

  return (
    <section className="py-12 px-4">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100">
        <h2 className="text-2xl font-black text-slate-900 mb-8 text-center uppercase tracking-tight">Formulir Pendaftaran</h2>
        
        <div className="space-y-4">
          {/* Input Nama */}
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-400" size={18} />
            <input 
              required 
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none transition-all" 
              placeholder="Nama Lengkap" 
              onChange={e => setFormData({...formData, nama: e.target.value})} 
            />
          </div>

          {/* Input WhatsApp */}
          <div className="relative">
            <Phone className="absolute left-4 top-4 text-slate-400" size={18} />
            <input 
              required 
              type="tel"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none transition-all" 
              placeholder="Nomor WA (Contoh: 62812...)" 
              onChange={e => setFormData({...formData, whatsapp: e.target.value})} 
            />
          </div>

          {/* Input Domisili */}
          <div className="relative">
            <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
            <input 
              required 
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none transition-all" 
              placeholder="Kota Domisili" 
              onChange={e => setFormData({...formData, domisili: e.target.value})} 
            />
          </div>

          {/* Pilih Kategori */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Kategori Umur</label>
            <select 
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none transition-all appearance-none"
              onChange={e => setFormData({...formData, kategori: e.target.value})}
            >
              <option>Anak-anak (U-11/U-13)</option>
              <option>Remaja (U-15/U-17)</option>
              <option>Dewasa/Umum</option>
            </select>
          </div>

          {/* Input Pengalaman */}
          <div className="relative">
            <Award className="absolute left-4 top-4 text-slate-400" size={18} />
            <textarea 
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none transition-all min-h-[80px]" 
              placeholder="Pengalaman Bertanding (Jika ada)" 
              onChange={e => setFormData({...formData, pengalaman: e.target.value})} 
            />
          </div>

          {/* Upload File */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Foto Identitas (Akte/KK/KTP)</label>
            <div className="relative group">
              <input 
                required 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={e => setFile(e.target.files?.[0] || null)} 
              />
              <div className="w-full px-4 py-3.5 rounded-2xl bg-blue-50 border-2 border-dashed border-blue-200 group-hover:border-blue-500 transition-all flex items-center justify-between">
                <span className="text-slate-500 text-sm truncate max-w-[200px]">
                  {file ? file.name : "Pilih file gambar..."}
                </span>
                <ImageIcon size={18} className="text-blue-500" />
              </div>
            </div>
          </div>

          {/* Tombol Submit */}
          <button 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 disabled:cursor-not-allowed mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={18} />}
            {loading ? "MEMPROSES..." : "DAFTAR SEKARANG"}
          </button>
        </div>
      </form>
    </section>
  );
}