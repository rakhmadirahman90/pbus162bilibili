import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { 
  ShieldCheck, GripVertical, Save, Loader2, Eye, Settings 
} from 'lucide-react';
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
  sort_order?: number;
}

// --- KOMPONEN ITEM LIST DI PANEL EDITOR (KIRI) ---
function SortableMemberItem({ member }: { member: Member }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-3 bg-[#1E293B] border ${isDragging ? 'border-blue-500 shadow-xl' : 'border-slate-700'} rounded-xl mb-2`}>
      <button {...attributes} {...listeners} className="cursor-grab text-slate-500 hover:text-blue-400">
        <GripVertical size={16} />
      </button>
      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-600">
        <img src={member.photo_url} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[10px] font-bold text-white uppercase truncate">{member.name}</h4>
        <p className="text-[9px] text-blue-400 uppercase font-medium">{member.role}</p>
      </div>
    </div>
  );
}

export default function StrukturOrganisasi() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    fetchMembers();
    const channel = supabase.channel('structure_db_sync').on('postgres_changes', { event: '*', table: 'organizational_structure', schema: 'public' }, () => fetchMembers()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase.from('organizational_structure').select('*').order('level', { ascending: true }).order('sort_order', { ascending: true });
      if (error) throw error;
      setMembers(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

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

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      const updates = members.map((m, index) => ({ ...m, sort_order: index }));
      const { error } = await supabase.from('organizational_structure').upsert(updates);
      if (error) throw error;
      Swal.fire({ icon: 'success', title: 'Sequence Published', timer: 1500, showConfirmButton: false, background: '#0F172A', color: '#fff' });
    } catch (err: any) { Swal.fire('Error', err.message, 'error'); } finally { setIsSaving(false); }
  };

  // --- COMPONENT: CARD SESUAI LANDING PAGE (KANAN) ---
  const OrgCard = ({ m }: { m: Member }) => (
    <div className="flex flex-col items-center group relative">
      <div className="w-32 h-32 bg-white rounded-3xl shadow-xl border border-slate-100 p-2 flex flex-col items-center justify-center transition-transform group-hover:scale-105">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 mb-2 border-2 border-slate-50 shadow-inner">
          <img src={m.photo_url} className="w-full h-full object-cover" alt={m.name} />
        </div>
        <h4 className="text-[10px] font-black text-slate-800 uppercase italic text-center leading-tight px-1">{m.name}</h4>
        <div className="absolute -bottom-3 bg-blue-600 px-3 py-1 rounded-full shadow-lg border-2 border-white">
          <p className="text-[7px] text-white font-black uppercase tracking-tighter">{m.role}</p>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-blue-500 animate-pulse font-black uppercase tracking-[0.3em]">Loading System...</div>;

  return (
    <div className="flex h-screen bg-[#0F172A] overflow-hidden">
      {/* LEFT PANEL: DATABASE MANAGEMENT (DARK MODE) */}
      <div className="w-80 border-r border-slate-800 flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Settings size={20} /></div>
          <div>
            <h2 className="text-sm font-black text-white uppercase italic italic">Sequence Editor</h2>
            <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Urutan Management</p>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={members.map(m => m.id)} strategy={verticalListSortingStrategy}>
            {members.map((member) => (
              <SortableMemberItem key={member.id} member={member} />
            ))}
          </SortableContext>
        </DndContext>

        <button 
          onClick={handlePublish}
          disabled={isSaving}
          className="mt-6 w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
        >
          {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
          Publish Sequence
        </button>
      </div>

      {/* RIGHT PANEL: VISUAL PREVIEW (LIGHT MODE - MATCH LANDING PAGE) */}
      <div className="flex-1 bg-[#F8FAFC] overflow-y-auto relative p-12">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-4 py-1 rounded-full border border-slate-200 flex items-center gap-2 shadow-sm">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Live Preview Mode</span>
        </div>

        <div className="max-w-5xl mx-auto pt-10">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-black text-slate-900 italic uppercase">Tentang <span className="text-blue-600">Kami</span></h1>
            <div className="flex justify-center gap-2 mt-4">
              {['SEJARAH', 'VISI MISI', 'FASILITAS', 'STRUKTUR'].map(btn => (
                <button key={btn} className={`px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest border ${btn === 'STRUKTUR' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-200'}`}>
                  {btn} {btn === 'STRUKTUR' && '→'}
                </button>
              ))}
            </div>
          </div>

          {/* TREE STRUCTURE VISUALIZATION */}
          <div className="flex flex-col items-center space-y-16">
            {/* LVL 1 & 4 (Ketua/Pimpinan Tengah) */}
            <div className="relative">
              {members.filter(m => m.level === 4).map(m => <OrgCard key={m.id} m={m} />)}
              <div className="h-12 w-[2px] bg-slate-200 mx-auto mt-4 shadow-sm" />
            </div>

            {/* LVL 5 (Pengurus Inti - Horizontal Row) */}
            <div className="relative flex justify-center gap-10">
              {/* Garis Horizontal Penghubung */}
              <div className="absolute -top-4 left-[15%] right-[15%] h-[2px] bg-slate-200" />
              {members.filter(m => m.level === 5).map(m => (
                <div key={m.id} className="relative pt-4">
                  <div className="absolute -top-4 left-1/2 h-4 w-[2px] bg-slate-200" />
                  <OrgCard m={m} />
                </div>
              ))}
            </div>

            {/* BIDANG SEPARATOR */}
            <div className="pt-10">
              <span className="bg-blue-50 text-blue-600 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.3em] border border-blue-100">
                Bidang Pertandingan
              </span>
              <div className="h-12 w-[2px] bg-slate-200 mx-auto mt-2" />
            </div>
            
            {/* LVL 7 (Anggota Bidang) */}
            <div className="grid grid-cols-3 gap-10">
              {members.filter(m => m.level === 7).map(m => <OrgCard key={m.id} m={m} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}