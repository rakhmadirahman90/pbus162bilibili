import React, { useState, useEffect } from 'react';
import { supabase } from "../supabase";
import { Save, MapPin, Phone, Mail, Link as LinkIcon, Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminContact() {
  const [loading, setLoading] = useState(true);
  const [issaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [contactData, setContactData] = useState({
    address: '',
    phone: '',
    email: '',
    maps_url: ''
  });

  useEffect(() => {
    fetchContact();
  }, []);

  async function fetchContact() {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) setContactData(data);
    } catch (err: any) {
      console.error("Error fetch contact:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Menggunakan upsert agar jika data ID 1 belum ada maka dibuat, jika ada diupdate
      const { error } = await supabase
        .from('contacts')
        .upsert({ id: 1, ...contactData });

      if (error) throw error;
      
      setSuccessMsg("Kontak berhasil diperbarui!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
      {successMsg && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[150] bg-green-600 text-white px-6 py-3 rounded-full font-bold text-xs uppercase flex items-center gap-3 shadow-2xl">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
          SETTING<span className="text-blue-600"> KONTAK</span>
        </h1>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Update informasi hubungi kami di Landing Page</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2">
              <Mail size={12}/> Email Resmi
            </label>
            <input 
              className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-medium"
              value={contactData.email}
              onChange={e => setContactData({...contactData, email: e.target.value})}
              placeholder="admin@pbus162.com"
            />
          </div>

          {/* WhatsApp/Phone */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2">
              <Phone size={12}/> Nomor WhatsApp
            </label>
            <input 
              className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-medium"
              value={contactData.phone}
              onChange={e => setContactData({...contactData, phone: e.target.value})}
              placeholder="628123456789"
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2">
            <MapPin size={12}/> Alamat Lengkap
          </label>
          <textarea 
            rows={3}
            className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-medium"
            value={contactData.address}
            onChange={e => setContactData({...contactData, address: e.target.value})}
            placeholder="Jl. Raya Badminton No. 162..."
          />
        </div>

        {/* Google Maps Link */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2">
            <LinkIcon size={12}/> Link Google Maps (URL)
          </label>
          <input 
            className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-medium text-blue-400"
            value={contactData.maps_url}
            onChange={e => setContactData({...contactData, maps_url: e.target.value})}
            placeholder="https://goo.gl/maps/..."
          />
        </div>

        <button 
          type="submit"
          disabled={issaving}
          className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all"
        >
          {issaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
          SIMPAN INFORMASI KONTAK
        </button>
      </form>
    </div>
  );
}