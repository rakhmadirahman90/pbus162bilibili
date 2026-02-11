import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const ManajemenPendaftaran = () => {
  const [registrants, setRegistrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', nama: '', whatsapp: '', kategori: '' });

  const fetchRegistrants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('pendaftaran').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setRegistrants(data || []);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegistrants(); }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold uppercase italic">Data Calon Atlet</h2>
        <button 
          onClick={() => { setFormData({ id: '', nama: '', whatsapp: '', kategori: '' }); setShowAddModal(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          + TAMBAH ATLET
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400">Nama Lengkap</th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400">WhatsApp</th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {registrants.map((item) => (
              <tr key={item.id} className="border-t border-slate-50">
                <td className="p-4 font-bold text-sm uppercase">{item.nama}</td>
                <td className="p-4 text-sm text-blue-600">{item.whatsapp}</td>
                <td className="p-4 text-center">
                  <button onClick={() => { setFormData(item); setShowEditModal(true); }} className="p-2 bg-amber-50 text-amber-600 rounded-lg mr-2">✏️</button>
                  <button className="p-2 bg-red-50 text-red-600 rounded-lg">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal Edit/Tambah di sini... (singkatnya) */}
    </div>
  );
};

export default ManajemenPendaftaran;