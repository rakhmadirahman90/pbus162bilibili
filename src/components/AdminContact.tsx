import React, { useState, useEffect } from 'react';
import { supabase } from "../supabase";
import { Save, MapPin, Phone, Mail, Link as LinkIcon, Loader2, CheckCircle2, Clock, Globe } from 'lucide-react';

export default function AdminContact() {
  const [loading, setLoading] = useState(true);
  const [issaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [contactData, setContactData] = useState({
    address: '',
    phone: '',
    email: '',
    maps_url: '', // Link untuk tombol "Buka di Google Maps"
    maps_iframe: '', // Link src dari embed iframe Google Maps
    operating_hours: 'Senin - Sabtu: 08.00 - 22.00 WITA' // Sesuai tampilan Landing Page
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
      const { error } = await supabase
        .from('contacts')
        .upsert({ id: 1, ...contactData });

      if (error) throw error;
      
      setSuccessMsg("Informasi Landing Page Berhasil Disinkronkan!");
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
    <div className="max-w-5xl mx-auto p-6 animate-in fade-in duration-500">
      {successMsg && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[150] bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-xs uppercase flex items-center gap-3 shadow-2xl border border-white/20">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
          SYNC<span className="text-blue-600"> LANDING PAGE</span>
        </h1>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
          Kelola Informasi "Hubungi Kami" & Lokasi Markas Besar
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* KOLOM KIRI: Informasi Dasar */}
          <div className="lg:col-span-2 space-y-6 bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2">
                  <Phone size={12}/> WhatsApp (Tanpa '+')
                </label>
                <input 
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-medium"
                  value={contactData.phone}
                  onChange={e => setContactData({...contactData, phone: e.target.value})}
                  placeholder="628123456789"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2">
                <MapPin size={12}/> Alamat Lengkap Markas Besar
              </label>
              <textarea 
                rows={2}
                className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-medium"
                value={contactData.address}
                onChange={e => setContactData({...contactData, address: e.target.value})}
                placeholder="Jl. Andi Makkasau No.171, Ujung Lare..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2">
                <Clock size={12}/> Jam Operasional
              </label>
              <input 
                className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-medium text-emerald-400"
                value={contactData.operating_hours}
                onChange={e => setContactData({...contactData, operating_hours: e.target.value})}
                placeholder="Senin - Sabtu: 08.00 - 22.00 WITA"
              />
            </div>
          </div>

          {/* KOLOM KANAN: Maps & Navigation */}
          <div className="lg:col-span-1 space-y-6 bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2">
                <LinkIcon size={12}/> URL Navigasi (Button)
              </label>
              <input 
                className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-medium text-blue-400 text-xs"
                value={contactData.maps_url}
                onChange={e => setContactData({...contactData, maps_url: e.target.value})}
                placeholder="https://goo.gl/maps/..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2">
                <Globe size={12}/> Embed Iframe SRC (Map)
              </label>
              <textarea 
                rows={4}
                className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-medium text-zinc-400 text-xs"
                value={contactData.maps_iframe}
                onChange={e => setContactData({...contactData, maps_iframe: e.target.value})}
                placeholder="Ambil dari Google Maps > Share > Embed Map > Copy src saja"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={issaving}
          className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/20"
        >
          {issaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
          PUBLIKASIKAN KE LANDING PAGE
        </button>
      </form>
      
      {/* PREVIEW SECTION */}
      <div className="mt-10 p-6 border border-dashed border-zinc-800 rounded-3xl">
        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-4">Preview Iframe Map:</p>
        <div className="w-full h-48 bg-zinc-950 rounded-2xl overflow-hidden">
          {contactData.maps_iframe ? (
            <iframe 
              src={contactData.maps_iframe} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              loading="lazy" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700 text-[10px] uppercase font-bold">Map Belum Dikonfigurasi</div>
          )}
        </div>
      </div>
    </div>
  );
}