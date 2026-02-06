import React, { useState } from 'react';
import { supabase } from '../supabase'; 
import { Loader2, Send, CheckCircle2, User, Phone, MapPin, Award, Image as ImageIcon, ChevronDown } from 'lucide-react';

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  // Daftar kategori umur lengkap termasuk VETERAN
  const kategoriUmur = [
    "Pra Dini (U-9)",
    "Usia Dini (U-11)",
    "Anak-anak (U-13)",
    "Pemula (U-15)",
    "Remaja (U-17)",
    "Taruna (U-19)",
    "Dewasa / Umum",
    "Veteran (35+ / 40+)"
  ];

  const [formData, setFormData] = useState({
    nama: '',
    whatsapp: '',
    kategori: kategoriUmur[0],
    domisili: '',
    pengalaman: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let publicUrl = "";

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `identitas/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('identitas-atlet')
          .upload(filePath, file);

        if (uploadError) throw new Error("Gagal upload foto: " + uploadError.message);

        const { data: urlData } = supabase.storage
          .from('identitas-atlet')
          .getPublicUrl(filePath);
        
        publicUrl = urlData.publicUrl;
      }

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

      if (dbError) throw new Error("Gagal simpan ke database: " + dbError.message);

      const adminPhoneNumber = "6281219027234";
      const message = `*PENDAFTARAN ATLET BARU PB US 162*%0A%0A` +
                      `*Nama:* ${formData.nama}%0A` +
                      `*Domisili:* ${formData.domisili}%0A` +
                      `*Kategori:* ${formData.kategori}%0A` +
                      `*Pengalaman:* ${formData.pengalaman || '-'}%0A` +
                      `*Link Foto:* ${publicUrl}`;
      
      window.open(`https://wa.me/${adminPhoneNumber}?text=${message}`, '_blank');
      
      setSubmitted(true);
      setFormData({ nama: '', whatsapp: '', kategori: kategoriUmur[0], domisili: '', pengalaman: '' });
      setFile(null);

    } catch (err: any) {
      console.error(err);
      alert("Terjadi Kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto my-12 p-10 bg-green-50 rounded-[3rem] border-2 border-green-100 text-center animate-in fade-in zoom-in duration-500">
        <CheckCircle2 size={80} className="text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-slate-900 mb-4">BERHASIL!</h2>
        <p className="text-slate-600 mb-8 font-medium">Data pendaftaran telah tersimpan ke sistem kami.</p>
        <button 
          onClick={() => setSubmitted(false)} 
          className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-slate-800 transition-all active:scale-95"
        >
          Daftar Kembali
        </button>
      </div>
    );
  }

  const inputClass = "w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all";

  return (
    <section className="py-12 px-4">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100">
        <h2 className="text-2xl font-black text-slate-900 mb-8 text-center uppercase tracking-tight">Formulir Pendaftaran</h2>
        
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-400" size={18} />
            <input 
              required 
              value={formData.nama}
              className={inputClass}
              placeholder="Nama Lengkap" 
              onChange={e => setFormData({...formData, nama: e.target.value})} 
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-4 text-slate-400" size={18} />
            <input 
              required 
              type="tel"
              value={formData.whatsapp}
              className={inputClass}
              placeholder="Nomor WA (Contoh: 62812...)" 
              onChange={e => setFormData({...formData, whatsapp: e.target.value})} 
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
            <input 
              required 
              value={formData.domisili}
              className={inputClass}
              placeholder="Kota Domisili" 
              onChange={e => setFormData({...formData, domisili: e.target.value})} 
            />
          </div>

          {/* Kategori Umur dengan Veteran */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Kategori Umur</label>
            <div className="relative group">
              <Award className="absolute left-4 top-4 text-slate-400" size={18} />
              <select 
                value={formData.kategori}
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none cursor-pointer"
                onChange={e => setFormData({...formData, kategori: e.target.value})}
              >
                {kategoriUmur.map((kat) => (
                  <option key={kat} value={kat}>
                    {kat}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-4 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors" size={18} />
            </div>
          </div>

          <div className="relative">
            <Award className="absolute left-4 top-4 text-slate-400" size={18} />
            <textarea 
              value={formData.pengalaman}
              className={`${inputClass} min-h-[80px] resize-none`}
              placeholder="Pengalaman Bertanding (Jika ada)" 
              onChange={e => setFormData({...formData, pengalaman: e.target.value})} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Foto Identitas (Akte/KK/KTP)</label>
            <div className="relative group">
              <input 
                required 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={e => setFile(e.target.files?.[0] || null)} 
              />
              <div className={`w-full px-4 py-3.5 rounded-2xl border-2 border-dashed transition-all flex items-center justify-between ${file ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200 group-hover:border-blue-500'}`}>
                <span className="text-slate-700 text-sm truncate max-w-[200px]">
                  {file ? file.name : "Pilih file gambar..."}
                </span>
                <ImageIcon size={18} className={file ? "text-green-500" : "text-blue-500"} />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 disabled:cursor-not-allowed mt-2 active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>MEMPROSES...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>DAFTAR SEKARANG</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}