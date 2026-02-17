import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Plus, Trash2, Image as ImageIcon, Save, Loader2, Power, PowerOff } from 'lucide-react';
import Swal from 'sweetalert2';

interface PopupConfig {
  id: string;
  url_gambar: string;
  judul: string;
  deskripsi: string;
  is_active: boolean;
}

export default function AdminPopup() {
  const [popups, setPopups] = useState<PopupConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newPopup, setNewPopup] = useState({ url_gambar: '', judul: '', deskripsi: '' });

  const fetchPopups = async () => {
    setLoading(true);
    const { data } = await supabase.from('konfigurasi_popup').select('*').order('created_at', { ascending: false });
    if (data) setPopups(data);
    setLoading(false);
  };

  useEffect(() => { fetchPopups(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await supabase.from('konfigurasi_popup').insert([newPopup]);
    if (!error) {
      setNewPopup({ url_gambar: '', judul: '', deskripsi: '' });
      fetchPopups();
      Swal.fire('Berhasil', 'Pop-up ditambahkan', 'success');
    }
    setIsSaving(false);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('konfigurasi_popup').update({ is_active: !currentStatus }).eq('id', id);
    fetchPopups();
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({ title: 'Hapus?', icon: 'warning', showCancelButton: true });
    if (res.isConfirmed) {
      await supabase.from('konfigurasi_popup').delete().eq('id', id);
      fetchPopups();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black text-white mb-8 uppercase italic tracking-tighter">
        Kelola <span className="text-blue-500">Pop-up Promo</span>
      </h1>

      {/* FORM TAMBAH */}
      <form onSubmit={handleAdd} className="bg-[#0F172A] p-8 rounded-[2rem] border border-white/5 mb-10 space-y-4 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required className="bg-black/50 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-blue-500" placeholder="URL GAMBAR (HTTPS://...)" value={newPopup.url_gambar} onChange={e => setNewPopup({...newPopup, url_gambar: e.target.value})} />
          <input className="bg-black/50 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-blue-500" placeholder="JUDUL PROMO" value={newPopup.judul} onChange={e => setNewPopup({...newPopup, judul: e.target.value})} />
        </div>
        <textarea className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-blue-500 h-24" placeholder="DESKRIPSI SINGKAT" value={newPopup.deskripsi} onChange={e => setNewPopup({...newPopup, deskripsi: e.target.value})} />
        <button disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
          {isSaving ? <Loader2 className="animate-spin" /> : <><Plus size={20}/> TAMBAH POP-UP</>}
        </button>
      </form>

      {/* LIST POPUP */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {popups.map(item => (
          <div key={item.id} className={`group relative bg-[#0F172A] rounded-[2rem] border overflow-hidden transition-all ${item.is_active ? 'border-blue-500/50' : 'border-white/5 opacity-60'}`}>
            <div className="aspect-[4/5] overflow-hidden">
              <img src={item.url_gambar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-6">
              <h4 className="text-white font-black uppercase text-sm mb-1">{item.judul || 'Tanpa Judul'}</h4>
              <p className="text-white/40 text-xs mb-4 line-clamp-2">{item.deskripsi}</p>
              <div className="flex gap-2">
                <button onClick={() => toggleStatus(item.id, item.is_active)} className={`flex-1 py-2 rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-2 ${item.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {item.is_active ? <><Power size={14}/> AKTIF</> : <><PowerOff size={14}/> NONAKTIF</>}
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/5 text-white/40 hover:bg-rose-600 hover:text-white rounded-lg transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}