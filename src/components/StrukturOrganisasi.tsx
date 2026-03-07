import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { 
  ShieldCheck, Award, Users, ChevronDown, GripVertical, 
  Save, Loader2, Eye, Star, UserCheck, GraduationCap, 
  Briefcase, Settings, LayoutDashboard 
} from 'lucide-react';
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
  sort_order?: number;
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
      className={`flex items-center gap-4 p-4 bg-white border ${isDragging ? 'border-blue-500 shadow-xl' : 'border-slate-200'} rounded-2xl mb-3 group transition-shadow`}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-blue-600 p-1">
        <GripVertical size={18} />
      </button>
      
      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
        <img 
          src={member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`} 
          className="w-full h-full object-cover" 
          alt={member.name}
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- KODE BARU: REALTIME SUBSCRIPTION ---
  // Menghubungkan Live Preview dengan perubahan data di Kelola Struktur
  useEffect(() => {
    fetchMembers();

    const channel = supabase
      .channel('organizational_changes')
      .on(
        'postgres_changes', 
        { event: '*', table: 'organizational_structure', schema: 'public' }, 
        () => {
          // Jika ada anggota baru ditambah/dihapus di menu lain, tarik data ulang
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('organizational_structure')
        .select('*')
        .order('level', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Error fetching structure:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMembers((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // KODE BARU: Otomatis update sort_order lokal agar UI konsisten
        return newArray.map((item, idx) => ({ ...item, sort_order: idx }));
      });
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      // Hanya kirim ID dan sort_order untuk efisiensi
      const updates = members.map((m, index) => ({
        id: m.id,
        sort_order: index,
        name: m.name,
        level: m.level,
        role: m.role,
        category: m.category,
        photo_url: m.photo_url
      }));

      const { error } = await supabase.from('organizational_structure').upsert(updates);
      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Berhasil Dipublikasikan',
        text: 'Urutan struktur organisasi telah diperbarui secara permanen.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // --- HELPER UNTUK HEADER SEKSI ---
  const SectionHeader = ({ title, icon: Icon, colorClass = "bg-[#1E293B]" }: { title: string, icon: any, colorClass?: string }) => (
    <div className="flex flex-col items-center mb-12">
      <div className={`${colorClass} px-8 py-3 rounded-2xl flex items-center gap-3 shadow-lg border border-slate-700/50`}>
        <Icon className="text-blue-400" size={18} />
        <span className="text-white font-black text-[11px] uppercase tracking-[0.2em]">{title}</span>
      </div>
      <div className="w-[2px] h-10 bg-gradient-to-b from-slate-300 to-transparent mt-0"></div>
    </div>
  );

  // --- HELPER UNTUK CARD ANGGOTA ---
  const MemberCard = ({ m, isMain = false }: { m: Member, isMain?: boolean }) => (
    <div className={`bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 p-6 flex flex-col items-center text-center ${isMain ? 'w-72' : 'w-64'}`}>
      <div className={`${isMain ? 'w-32 h-32' : 'w-24 h-24'} rounded-[1.8rem] overflow-hidden bg-slate-50 border-4 border-slate-50 mb-5 shadow-inner`}>
        <img 
          src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=0D8ABC&color=fff`} 
          className="w-full h-full object-cover" 
          alt={m.name}
        />
      </div>
      <h4 className="font-black text-slate-900 text-[13px] uppercase italic leading-tight mb-2 px-2">{m.name}</h4>
      <div className="bg-blue-600 px-4 py-1.5 rounded-full">
        <p className="text-white font-black text-[9px] uppercase tracking-tighter">{m.role}</p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest italic">Menghubungkan ke Database...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Tombol Floating */}
      <div className="fixed bottom-10 right-10 z-[100]">
        <button 
          onClick={handlePublish}
          disabled={isSaving}
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-2xl active:scale-95 disabled:opacity-50 transition-all"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          PUBLIKASIKAN URUTAN
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* PANEL KIRI: EDITOR */}
        <div className="w-full lg:w-[400px] bg-white border-r border-slate-200 h-screen overflow-y-auto p-6 lg:sticky lg:top-0">
          <div className="mb-8 flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Settings className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">Structure Editor</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Drag untuk ubah urutan</p>
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={members.map(m => m.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {members.map((member) => (
                  <SortableMemberItem key={member.id} member={member} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          {members.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
              <p className="text-slate-400 text-xs font-bold uppercase">Belum ada data anggota</p>
            </div>
          )}
        </div>

        {/* PANEL KANAN: LIVE PREVIEW */}
        <div className="flex-1 h-screen overflow-y-auto bg-[#FBFCFE]">
          <div className="p-4 flex justify-center sticky top-0 z-50">
            <div className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 px-6 py-2 rounded-full flex items-center gap-3">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Eye size={12}/> Live Preview Mode
               </span>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6 pb-40">
            <div className="text-center mb-24 pt-10">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 italic tracking-tighter mb-4 uppercase">
                STRUKTUR <span className="text-blue-600">ORGANISASI</span>
              </h1>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.4em]">PB US 162 • Periode 2024 - 2028</p>
            </div>

            <div className="space-y-20 relative">
              {/* LVL 1 - 7 Filter Logics */}
              {[
                { lvl: 1, title: "Penanggung Jawab", icon: ShieldCheck, color: "bg-red-900" },
                { lvl: 2, title: "Dewan Penasehat", icon: Star, color: "bg-amber-600" },
                { lvl: 3, title: "Dewan Pembina", icon: UserCheck, color: "bg-emerald-700" },
                { lvl: 4, title: "Ketua Umum", icon: LayoutDashboard, color: "bg-blue-900" },
                { lvl: 5, title: "Dewan Pengurus Inti", icon: Users, color: "bg-slate-800" },
                { lvl: 6, title: "Kepala Pelatih", icon: GraduationCap, color: "bg-indigo-900" },
                { lvl: 7, title: "Koordinator & Anggota Bidang", icon: Briefcase, color: "bg-slate-900" },
              ].map((section) => {
                const filtered = members.filter(m => m.level === section.lvl);
                if (filtered.length === 0) return null;

                return (
                  <section key={section.lvl}>
                    <SectionHeader title={section.title} icon={section.icon} colorClass={section.color} />
                    <div className={`flex flex-wrap justify-center gap-8 ${section.lvl === 5 || section.lvl === 7 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center' : ''}`}>
                      {filtered.map(m => (
                        <MemberCard key={m.id} m={m} isMain={section.lvl === 1 || section.lvl === 4 || section.lvl === 6} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}