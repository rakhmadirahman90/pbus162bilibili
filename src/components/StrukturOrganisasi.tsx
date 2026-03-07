import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabase';
import { 
  ShieldCheck, GripVertical, Save, Loader2, Eye, Settings,
  Award, Star, Target, Briefcase, Users
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
import { motion, AnimatePresence } from 'framer-motion';

interface Member {
  id: string;
  name: string;
  role: string;
  category: string;
  level: number;
  photo_url: string;
  sort_order: number;
}

// --- KOMPONEN ITEM LIST DI PANEL EDITOR (KIRI) ---
function SortableMemberItem({ member }: { member: Member }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.id });
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.6 : 1 
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-3 bg-[#1E293B] border ${isDragging ? 'border-blue-500 shadow-xl' : 'border-slate-700'} rounded-xl mb-2 transition-colors`}>
      <button {...attributes} {...listeners} className="cursor-grab text-slate-500 hover:text-blue-400 p-1">
        <GripVertical size={16} />
      </button>
      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-600">
        <img src={member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[10px] font-bold text-white uppercase truncate">{member.name}</h4>
        <p className="text-[9px] text-blue-400 uppercase font-medium">Lvl {member.level} - {member.role}</p>
      </div>
    </div>
  );
}

export default function StrukturOrganisasi() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), 
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- FETCH DATA DENGAN ORDER TERBARU ---
  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('organizational_structure')
        .select('*')
        .order('sort_order', { ascending: true }); // Mengikuti urutan manual dari admin
      
      if (error) throw error;
      if (data) setMembers(data);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchMembers();
    
    // Realtime Sync agar Landing Page & Admin Selalu Sama
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { 
        event: '*', 
        table: 'organizational_structure', 
        schema: 'public' 
      }, () => {
        fetchMembers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

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
      // Mapping ulang sort_order berdasarkan posisi list saat ini
      const updates = members.map((m, index) => ({ 
        id: m.id,
        name: m.name,
        role: m.role,
        category: m.category,
        level: m.level,
        photo_url: m.photo_url,
        sort_order: index 
      }));

      const { error } = await supabase.from('organizational_structure').upsert(updates);
      if (error) throw error;

      Swal.fire({ 
        icon: 'success', 
        title: 'STRUKTUR DIPUBLIKASIKAN!', 
        text: 'Tampilan Landing Page telah diperbarui.',
        timer: 2000, 
        showConfirmButton: false, 
        background: '#0F172A', 
        color: '#fff' 
      });
    } catch (err: any) { 
      Swal.fire('Gagal Update', err.message, 'error'); 
    } finally { 
      setIsSaving(false); 
    }
  };

  // --- LOGIKA PENGELOMPOKAN BIDANG (LEVEL 7) ---
  const groupedFields = useMemo(() => {
    const fields: { [key: string]: Member[] } = {};
    members.filter(m => m.level === 7).forEach(m => {
      const role = m.role.toLowerCase();
      let fieldName = "Lainnya";
      if (role.includes("humas")) fieldName = "Bidang Humas";
      else if (role.includes("pertandingan")) fieldName = "Bidang Pertandingan";
      else if (role.includes("sarana")) fieldName = "Bidang Sarpras";
      else if (role.includes("prestasi")) fieldName = "Bidang Pembinaan Prestasi";
      else if (role.includes("dana") || role.includes("usaha")) fieldName = "Bidang Dana & Usaha";
      
      if (!fields[fieldName]) fields[fieldName] = [];
      fields[fieldName].push(m);
    });
    return fields;
  }, [members]);

  // --- COMPONENT: CARD SESUAI LANDING PAGE ---
  const OrgCard = ({ m }: { m: Member }) => (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center group relative"
    >
      <div className="w-32 h-32 bg-white rounded-3xl shadow-xl border border-slate-100 p-2 flex flex-col items-center justify-center transition-all group-hover:-translate-y-2 group-hover:shadow-2xl">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 mb-2 border-2 border-slate-50 shadow-inner">
          <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`} className="w-full h-full object-cover" alt={m.name} />
        </div>
        <h4 className="text-[9px] font-black text-slate-800 uppercase italic text-center leading-tight px-1 truncate w-full">{m.name}</h4>
        <div className="absolute -bottom-3 bg-blue-600 px-3 py-1 rounded-full shadow-lg border-2 border-white min-w-[80px] text-center">
          <p className="text-[7px] text-white font-black uppercase tracking-tighter whitespace-nowrap">{m.role}</p>
        </div>
      </div>
    </motion.div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-4">
      <Loader2 className="text-blue-500 animate-spin" size={40} />
      <div className="text-blue-500 font-black uppercase tracking-[0.3em]">Syncing Database...</div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0F172A] overflow-hidden font-sans">
      
      {/* LEFT PANEL: DATABASE MANAGEMENT */}
      <div className="w-85 border-r border-slate-800 flex flex-col bg-[#0A0F1E] p-6 overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Settings size={20} /></div>
          <div>
            <h2 className="text-sm font-black text-white uppercase italic">Sequence Editor</h2>
            <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Atur Urutan Tampilan</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={members.map(m => m.id)} strategy={verticalListSortingStrategy}>
              {members.map((member) => (
                <SortableMemberItem key={member.id} member={member} />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button 
            onClick={handlePublish}
            disabled={isSaving}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Publish to Landing Page
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: LIVE PREVIEW (MATCHING LANDING PAGE) */}
      <div className="flex-1 bg-[#F1F5F9] overflow-y-auto relative p-8 md:p-16 custom-scrollbar">
        <div className="sticky top-0 z-50 flex justify-center mb-10 pointer-events-none">
          <div className="bg-white/90 backdrop-blur px-6 py-2 rounded-full border border-slate-200 flex items-center gap-3 shadow-xl pointer-events-auto">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Landing Page Live Preview</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Header Landing Page Simulation */}
          <div className="text-center mb-20">
            <h1 className="text-5xl font-black text-slate-900 italic uppercase tracking-tighter mb-6">
              Struktur <span className="text-blue-600">Organisasi</span>
            </h1>
            <div className="flex justify-center gap-3">
               <span className="px-5 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black tracking-widest shadow-lg shadow-blue-600/20">STRUKTUR UTAMA →</span>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-24 pb-40">
            
            {/* LEVEL 4: KETUA UMUM (TOP) */}
            <div className="flex flex-col items-center">
              <div className="bg-slate-900 text-white px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest mb-10 shadow-xl">Top Hierarchy</div>
              <div className="flex flex-wrap justify-center gap-10">
                {members.filter(m => m.level === 4).map(m => <OrgCard key={m.id} m={m} />)}
              </div>
              <div className="h-20 w-[2px] bg-gradient-to-b from-slate-300 to-transparent mt-4" />
            </div>

            {/* LEVEL 5: PENGURUS INTI (ROW) */}
            <div className="w-full">
              <div className="flex flex-col items-center mb-12">
                <div className="bg-blue-600 text-white px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg">Pengurus Inti</div>
              </div>
              <div className="flex flex-wrap justify-center gap-12">
                {members.filter(m => m.level === 5).map(m => <OrgCard key={m.id} m={m} />)}
              </div>
            </div>

            {/* LEVEL 7: BIDANG-BIDANG DENGAN GROUPING */}
            <div className="w-full space-y-24">
              <div className="flex flex-col items-center">
                <div className="bg-amber-500 text-white px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg">Departemen & Bidang</div>
              </div>
              
              {Object.entries(groupedFields).map(([fieldName, fieldMembers]) => (
                <div key={fieldName} className="flex flex-col items-center">
                   <div className="inline-block bg-white border border-slate-200 px-6 py-2 rounded-full mb-12 shadow-sm">
                      <span className="text-blue-600 font-black uppercase text-[11px] italic tracking-widest">{fieldName}</span>
                   </div>
                   <div className="flex flex-wrap justify-center gap-10">
                      {fieldMembers.map(m => <OrgCard key={m.id} m={m} />)}
                   </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.5); }
      `}</style>
    </div>
  );
}