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
    maps_url: '', 
    maps_iframe: '', 
    operating_hours: 'Senin - Sabtu: 08.00 - 22.00 WITA' 
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
    // Optimasi: max-h-screen dan overflow-hidden (opsional) untuk membatasi scroll
    <div className="max-w-6xl mx-auto p-4 lg:p-6 animate-in fade-in duration-500 min-h-screen flex flex-col justify-center">
      {successMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-[10px] uppercase flex items-center gap-3 shadow-2xl border border-white/20">
          <CheckCircle2 size={14} /> {successMsg}
        </div>
      )}

      {/* Header dibuat lebih compact */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black italic tracking-tighter uppercase leading-none">
            SYNC<span className="text-blue-600"> LANDING PAGE</span>
          </h1>
          <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            Informasi "Hubungi Kami" & Lokasi
          </p>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-[10px] font-bold text-zinc-600 uppercase">Status: <span className="text-emerald-500 italic">Live Sync</span></span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* KOLOM KIRI: Informasi Utama (7/12) */}
          <div className="lg:col-span-7 space-y-4 bg-zinc-900/50 p-5 lg:p-6 rounded-[2rem] border border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase flex items-center gap-2 px-1">
                  <Mail size={10}/> Email Resmi
                </label>
                <input 
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-blue-600 transition-all font-medium"
                  value={contactData.email}
                  onChange={e => setContactData({...contactData, email: e.target.value})}
                  placeholder="admin@pbus162.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase flex items-center gap-2 px-1">
                  <Phone size={10}/> WhatsApp
                </label>
                <input 
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-blue-600 transition-all font-medium"
                  value={contactData.phone}
                  onChange={e => setContactData({...contactData, phone: e.target.value})}
                  placeholder="628..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-500 uppercase flex items-center gap-2 px-1">
                <MapPin size={10}/> Alamat Lengkap
              </label>
              <textarea 
                rows={2}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-blue-600 transition-all font-medium resize-none"
                value={contactData.address}
                onChange={e => setContactData({...contactData, address: e.target.value})}
                placeholder="Jl. Andi Makkasau..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-500 uppercase flex items-center gap-2 px-1">
                <Clock size={10}/> Jam Operasional
              </label>
              <input 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-blue-600 transition-all font-medium text-emerald-400"
                value={contactData.operating_hours}
                onChange={e => setContactData({...contactData, operating_hours: e.target.value})}
              />
            </div>
          </div>

          {/* KOLOM KANAN: Maps & Preview (5/12) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-zinc-900/50 p-5 rounded-[2rem] border border-white/5 space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase flex items-center gap-2 px-1">
                  <LinkIcon size={10}/> URL Navigasi
                </label>
                <input 
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-[11px] outline-none focus:border-blue-600 transition-all font-medium text-blue-400"
                  value={contactData.maps_url}
                  onChange={e => setContactData({...contactData, maps_url: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase flex items-center gap-2 px-1">
                  <Globe size={10}/> Iframe SRC
                </label>
                <input 
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-[11px] outline-none focus:border-blue-600 transition-all font-medium text-zinc-400"
                  value={contactData.maps_iframe}
                  onChange={e => setContactData({...contactData, maps_iframe: e.target.value})}
                />
              </div>
            </div>

            {/* Preview Langsung Masuk ke Grid agar hemat tempat */}
            <div className="flex-1 min-h-[140px] bg-zinc-950 rounded-[2rem] overflow-hidden border border-white/5">
              {contactData.maps_iframe ? (
                <iframe 
                  src={contactData.maps_iframe} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(90%)' }} 
                  loading="lazy" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700 text-[10px] uppercase font-bold">Map Preview</div>
              )}
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={issaving}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg"
        >
          {issaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
          UPDATE LANDING PAGE
        </button>
      </form>
    </div>
  );
}