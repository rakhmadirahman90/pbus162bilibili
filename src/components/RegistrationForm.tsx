import React, { useState } from 'react';
import { supabase } from '../supabase'; 
import { Loader2, Send, CheckCircle2, User, Phone, MapPin, Award, Image as ImageIcon, ChevronDown, Users } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let publicUrl = "";
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `identitas/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('identitas-atlet').upload(filePath, file);
        if (uploadError) throw new Error("Gagal upload foto: " + uploadError.message);
        const { data: urlData } = supabase.storage.from('identitas-atlet').getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      const { error: dbError } = await supabase
        .from('pendaftaran')
        .insert([{ 
          nama: formData.nama.toUpperCase(), 
          whatsapp: formData.whatsapp, 
          jenis_kelamin: formData.jenis_kelamin,
          kategori: formData.kategori,
          domisili: formData.domisili,
          pengalaman: formData.pengalaman,
          foto_url: publicUrl 
        }]);

      if (dbError) throw dbError;

      const adminPhoneNumber = "6281219027234";
      const waMessage = window.encodeURIComponent(`*PENDAFTARAN ATLET BARU*\n\n*Nama:* ${formData.nama}\n*Gender:* ${formData.jenis_kelamin}\n*Kategori:* ${formData.kategori}`);
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
      <div className="max-w-md mx-auto my-12 p-10 bg-green-50 rounded-[3rem] border-2 border-green-200 text-center shadow-xl">
        <CheckCircle2 size={80} className="text-green-600 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-slate-900 mb-4">BERHASIL!</h2>
        <button onClick={() => setSubmitted(false)} className="bg-slate-900 text-white px-10 py-4 rounded-full font-black uppercase">Daftar Lagi</button>
      </div>
    );
  }

  const inputClass = "w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold outline-none focus:border-blue-600 transition-all";

  return (
    <section className="py-12 px-4 bg-slate-50">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-10 bg-white rounded-[2.5rem] shadow-xl border border-slate-100">
        <h2 className="text-3xl font-black text-slate-900 mb-8 text-center uppercase">Pendaftaran</h2>
        
        <div className="space-y-5">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input required value={formData.nama} className={inputClass} placeholder="NAMA LENGKAP" onChange={e => setFormData({...formData, nama: e.target.value})} />
          </div>

          {/* INPUT JENIS KELAMIN */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase ml-2">Jenis Kelamin</label>
            <div className="grid grid-cols-2 gap-4">
              {['Putra', 'Putri'].map((gender) => (
                <label key={gender} className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer font-bold transition-all ${formData.jenis_kelamin === gender ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <input type="radio" className="hidden" name="jenis_kelamin" value={gender} checked={formData.jenis_kelamin === gender} onChange={e => setFormData({...formData, jenis_kelamin: e.target.value})} />
                  <Users size={18} /> {gender.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input required value={formData.whatsapp} className={inputClass} placeholder="WHATSAPP" onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
          </div>

          <div className="relative group">
            <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select value={formData.kategori} className={`${inputClass} appearance-none`} onChange={e => setFormData({...formData, kategori: e.target.value})}>
              {kategoriUmur.map((kat) => <option key={kat} value={kat}>{kat}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />} DAFTAR SEKARANG
          </button>
        </div>
      </form>
    </section>
  );
}