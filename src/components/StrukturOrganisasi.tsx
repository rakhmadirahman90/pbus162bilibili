import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ShieldCheck, Award, Users, ChevronDown, GripVertical, Save, Loader2, Eye } from 'lucide-react';
// Import library DnD
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Swal from 'sweetalert2';

interface Member {
  id: string;
  name: string;
  role: string;
  category: string;
  level: number;
  photo_url: string;
  sort_order?: number; // Tambahan untuk urutan custom
}

// --- KOMPONEN ITEM LIST YANG BISA DI-DRAG (ADMIN SIDE) ---
function SortableMemberItem({ member }: { member: Member }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-white border ${isDragging ? 'border-blue-500 shadow-xl' : 'border-slate-200'} rounded-2xl mb-3 group`}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-blue-600">
        <GripVertical size={18} />
      </button>
      
      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0">
        <img 
          src={member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`} 
          className="w-full h-full object-cover" 
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-black text-slate-900 truncate uppercase italic">{member.name}</h4>
        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">{member.role}</p>
      </div>
      
      <div className="px-2 py-1 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase">
        Lvl {member.level}
      </div>
    </div>
  );
}

export default function StrukturOrganisasi() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Sensor untuk DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('organizational_structure')
        .select('*')
        .order('level', { ascending: true })
        .order('sort_order', { ascending: true }) // Pastikan ada kolom sort_order di DB
        .order('name', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Error fetching structure:", err);
    } finally {
      setLoading(false);
    }
  };

  // Logika Drag End
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMembers((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Simpan urutan ke Database
  const handlePublish = async () => {
    setIsSaving(true);
    try {
      // Kita update sort_order berdasarkan posisi array saat ini
      const updates = members.map((m, index) => ({
        id: m.id,
        sort_order: index,
        // Sertakan kolom wajib lainnya jika RLS memerlukan
        name: m.name,
        level: m.level,
        role: m.role,
        category: m.category
      }));

      const { error } = await supabase
        .from('organizational_structure')
        .upsert(updates);

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Berhasil Dipublikasikan',
        text: 'Urutan struktur organisasi telah diperbarui.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest italic">Sinkronisasi Database...</p>
    </div>
  );

  // --- RENDER HELPER (KODE LAMA ANDA) ---
  const renderSeksiGrid = () => {
    const seksiMembers = members.filter(m => m.level === 3);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 relative">
        {seksiMembers.map((m) => (
          <div key={m.id} className="relative group">
             <div className="bg-white p-5 rounded-[2rem] shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-50 shrink-0">
                      <img 
                        src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=0D8ABC&color=fff`} 
                        className="w-full h-full object-cover" 
                      />
                   </div>
                   <div className="text-left">
                      <h4 className="font-black text-slate-900 text-[11px] uppercase italic leading-tight">{m.name}</h4>
                      <p className="text-blue-600 font-bold text-[9px] uppercase tracking-wider mt-0.5">{m.role}</p>
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Tombol Aksi Floating */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col gap-4">
        <button 
          onClick={handlePublish}
          disabled={isSaving}
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-2xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          PUBLIKASIKAN PERUBAHAN
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        
        {/* PANEL KIRI: EDITOR DRAG & DROP */}
        <div className="w-full lg:w-[400px] bg-white border-r border-slate-200 h-screen overflow-y-auto p-6 sticky top-0">
          <div className="mb-8">
            <h2 className="text-xl font-black text-slate-900 italic uppercase italic tracking-tighter">Pengelola Struktur</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Geser untuk mengatur urutan</p>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={members.map(m => m.id)} strategy={verticalListSortingStrategy}>
              {members.map((member) => (
                <SortableMemberItem key={member.id} member={member} />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* PANEL KANAN: LIVE PREVIEW (KODE UI LAMA ANDA) */}
        <div className="flex-1 h-screen overflow-y-auto bg-[#FBFCFE]">
          <div className="p-4 flex justify-center sticky top-0 z-50">
            <div className="bg-white/80 backdrop-blur shadow-sm border border-slate-100 px-6 py-2 rounded-full flex items-center gap-3">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Eye size={12}/> Live Preview Mode
               </span>
            </div>
          </div>

          {/* MULAI KODE RENDER UI LAMA */}
          <div className="max-w-7xl mx-auto px-4 pb-32 font-sans">
            <div className="text-center mb-24 pt-10">
              <div className="inline-block px-4 py-1.5 mb-4 bg-blue-50 rounded-full border border-blue-100">
                  <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Official Management</p>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 italic tracking-tighter mb-4 uppercase leading-none">
                Struktur <span className="text-blue-600">Organisasi</span>
              </h1>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">PB US 162 • Periode 2024 - 2028</p>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-200 via-blue-100 to-transparent -translate-x-1/2 hidden lg:block"></div>

              {/* LEVEL 1 */}
              <div className="relative z-10 mb-24">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-amber-500 text-white p-2 rounded-xl mb-6 shadow-lg shadow-amber-200">
                    <ShieldCheck size={24} />
                  </div>
                  <h2 className="text-slate-900 font-black uppercase tracking-[0.3em] text-[12px] mb-10">
                    Penasehat & Penanggung Jawab
                  </h2>
                  <div className="flex flex-wrap justify-center gap-6 max-w-4xl">
                    {members.filter(m => m.level === 1).map(m => (
                      <div key={m.id} className="relative group">
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-blue-50 text-center w-64 group-hover:border-blue-500 transition-all duration-500">
                          <div className="w-24 h-24 mx-auto mb-4 rounded-[1.5rem] overflow-hidden border-4 border-slate-50 group-hover:scale-105 transition-transform duration-500 shadow-inner">
                            <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=0D8ABC&color=fff`} className="w-full h-full object-cover" />
                          </div>
                          <h3 className="font-black text-slate-900 text-[13px] italic uppercase leading-tight">{m.name}</h3>
                          <div className="mt-3 px-3 py-1 bg-slate-50 rounded-full inline-block">
                             <p className="text-blue-600 font-black text-[9px] uppercase tracking-tighter">{m.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center mb-20 relative z-10">
                 <div className="bg-white p-2 rounded-full shadow-md border border-slate-100">
                    <ChevronDown className="text-blue-600 animate-bounce" size={20} />
                 </div>
              </div>

              {/* LEVEL 2 */}
              <div className="relative z-10 mb-24">
                <div className="flex flex-col items-center">
                  <div className="bg-blue-600 text-white p-2 rounded-xl mb-6 shadow-lg shadow-blue-200">
                    <Award size={24} />
                  </div>
                  <h2 className="text-slate-900 font-black uppercase tracking-[0.3em] text-[12px] mb-10 text-center">
                    Dewan Pengurus Inti
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-10">
                    {members.filter(m => m.level === 2).map(m => (
                      <div key={m.id} className="bg-white p-8 rounded-[3rem] shadow-lg border border-slate-100 text-center group hover:shadow-blue-900/5 transition-all duration-500">
                        <div className="relative inline-block mb-4">
                          <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-blue-50 group-hover:border-blue-600 transition-all duration-500 shadow-lg">
                            <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-lg shadow-md">
                             <Award size={14} />
                          </div>
                        </div>
                        <h3 className="font-black text-slate-900 text-lg italic uppercase leading-tight tracking-tighter">{m.name}</h3>
                        <p className="text-blue-600 font-black text-[10px] uppercase mt-2 tracking-widest">{m.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* LEVEL 3 */}
              <div className="relative z-10 px-10">
                <div className="flex flex-col items-center">
                   <div className="bg-slate-800 text-white p-2 rounded-xl mb-6 shadow-lg shadow-slate-200">
                      <Users size={24} />
                   </div>
                   <h2 className="text-slate-900 font-black uppercase tracking-[0.3em] text-[12px] mb-4">
                      Bidang & Koordinator
                   </h2>
                   <div className="w-full h-[1px] bg-slate-200 max-w-xs mb-10"></div>
                   {renderSeksiGrid()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}