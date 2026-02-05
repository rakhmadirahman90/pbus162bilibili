import React, { useState, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  X, Target, Star, ShieldCheck, 
  ChevronLeft, ChevronRight, UserCheck, Users, 
  Search, Award, ArrowRight
} from 'lucide-react';

interface Player {
  id: number;
  name: string;
  category: string;
  ageGroup: string;
  rank: number;
  image: string;
  bio: string;
  isChampion?: boolean;
}

const playersData: Player[] = [
  // --- SEEDED A (Senior) ---
  { id: 1, name: 'Agustilaar', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 1, image: 'whatsapp_image_2026-02-05_at_11.38.00.jpeg', bio: 'Mempertahankan posisi puncak klasemen dengan konsistensi permainan yang luar biasa.' },
  { id: 2, name: 'Darwis (TNI)', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 2, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Runner-up turnamen terakhir, menunjukkan pertahanan komando yang sulit ditembus.' },
  { id: 3, name: 'Salman', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 3, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Ahli dalam permainan netting tipis yang sering membuat lawan mati langkah.' },
  { id: 4, name: 'Lutfi', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 4, image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Dikenal dengan smash keras menyilang yang menjadi senjata utama dalam menyerang.' },
  { id: 5, name: 'Udin', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 5, image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Strategis lapangan yang mampu membaca pergerakan lawan dengan sangat cepat.' },
  { id: 6, name: 'Aldy Sandra', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 6, image: 'https://images.pexels.com/photos/11224855/pexels-photo-11224855.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Pemain dengan mobilitas tinggi, selalu siap mengejar bola di area manapun.' },
  { id: 7, name: 'Mustakim', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 7, image: 'whatsapp_image_2026-02-05_at_10.36.22.jpeg', bio: 'Eksekutor poin yang handal dengan penempatan bola yang cerdas.' },
  { id: 8, name: 'Rifai', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 8, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Mempunyai variasi pukulan lob dan drop shot yang sangat menipu.' },
  { id: 9, name: 'Acos', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 9, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Spesialis ganda yang sangat kompak dan komunikatif di dalam lapangan.' },
  { id: 10, name: 'Herman', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 10, image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Pemain dengan mental juara yang stabil dalam kondisi poin kritis.' },

  // --- SEEDED B+ (Senior) ---
  { id: 11, name: 'Dr. Khaliq', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 11, bio: 'Memadukan kecerdasan strategi dengan teknik dasar yang sangat kuat.', image: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 12, name: 'H. Ismail', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 12, bio: 'Senior dengan jam terbang tinggi yang sangat dihormati di lapangan.', image: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 13, name: 'Momota', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 13, bio: 'Gaya bermain lincah dan atraktif, selalu memberikan tontonan menarik.', image: 'https://images.pexels.com/photos/4307869/pexels-photo-4307869.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 14, name: 'Saleh', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 14, bio: 'Pemain yang gigih dan tidak mudah menyerah sebelum bola menyentuh lantai.', image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 15, name: 'H. Zaidi', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 15, bio: 'Fokus pada akurasi pukulan jarak jauh yang menyulitkan lawan.', image: 'https://images.pexels.com/photos/3812743/pexels-photo-3812743.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 16, name: 'Zainuddin', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 16, bio: 'Penguasaan area depan net yang sangat dominan dan responsif.', image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 17, name: 'Bustan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 17, bio: 'Dikenal dengan servis pendek yang sulit dikembalikan secara menyerang.', image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 18, name: 'H. Wawan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 18, bio: 'Mempunyai daya tahan yang baik dalam reli-reli panjang.', image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 19, name: 'Lumpue', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 19, bio: 'Pemain bertipe penyerang yang selalu mencari celah kelengahan lawan.', image: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 20, name: 'Madhy', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 20, bio: 'Teknik backhand yang kuat dan akurat menjadi ciri khasnya.', image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 21, name: 'Vhio', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 21, bio: 'Anak muda potensial yang sudah menembus level Seeded Senior.', image: 'whatsapp_image_2026-02-05_at_10.34.12.jpeg' },
  { id: 22, name: 'Anto', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 22, bio: 'Selalu tampil tenang dan mampu menjaga ritme permainan tim.', image: 'https://images.pexels.com/photos/428333/pexels-photo-428333.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 23, name: 'Lukman', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 23, bio: 'Spesialis bola-bola drive cepat yang menekan lawan.', image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 24, name: 'Sandra', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 24, bio: 'Pemain yang ulet dengan penempatan bola yang tidak terduga.', image: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 25, name: 'Amri', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 25, bio: 'Mengandalkan kecerdikan dalam mengatur pola serangan.', image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 26, name: 'Nasri Lapas', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 26, bio: 'Fisik prima yang selalu stabil di setiap set pertandingan.', image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 27, name: 'Aprijal', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 27, bio: 'Agresif dalam melakukan serangan balik cepat.', image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 28, name: 'Arifuddin', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 28, bio: 'Pemahaman posisi yang baik saat bermain ganda.', image: 'https://images.pexels.com/photos/837358/pexels-photo-837358.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 29, name: 'H Amier', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 29, bio: 'Membawa ketenangan dan arahan strategis bagi pasangannya.', image: 'https://images.pexels.com/photos/842567/pexels-photo-842567.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 30, name: 'Rustam', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 30, bio: 'Pemain dengan pukulan keras yang sering merepotkan lawan.', image: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 31, name: 'A. Arwan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 31, bio: 'Lincah dan gesit dalam menutup ruang kosong di lapangan.', image: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 32, name: 'Laganing', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 32, bio: 'Konsistensi tinggi dalam menjaga performa permainan.', image: 'https://images.pexels.com/photos/937481/pexels-photo-937481.jpeg?auto=compress&cs=tinysrgb&w=600' },

  // --- SEEDED B- (Senior) ---
  { id: 33, name: 'A. Mansur', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 33, bio: 'Pemain senior yang ulet dan penuh pengalaman.', image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 34, name: 'Darwis R.', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 34, bio: 'Pertahanan kokoh dan penempatan bola yang menyulitkan lawan.', image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 35, name: 'Prof. Fikri', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 35, bio: 'Gaya bermain cerdas dan taktis sesuai dengan analisis lapangan.', image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 36, name: 'Ali', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 36, bio: 'Pemain muda yang berkembang pesat di kategori senior.', image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 37, name: 'Saldy', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 37, bio: 'Spesialis permainan bola cepat dan drive-drive tajam.', image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 38, name: 'Mulyadi', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 38, bio: 'Andal dalam mengatur serangan dari area baseline.', image: 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 39, name: 'Haedir', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 39, bio: 'Pemain dengan semangat tinggi dan tidak kenal lelah.', image: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 40, name: 'H Fitra', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 40, bio: 'Teknik netting yang halus menjadi keunggulan utamanya.', image: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 41, name: 'Marzuki', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 41, bio: 'Solid dalam menjaga area pertahanan bersama pasangan.', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 42, name: 'Kurnia', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 42, bio: 'Smash yang akurat seringkali menghasilkan poin krusial.', image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=600' },

  // --- SEEDED C (Muda) ---
  { id: 43, name: 'Ust. Usman', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 1, bio: 'Pemimpin klasemen Seeded C dengan teknik netting paling stabil.', image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 44, name: 'H. Tantong', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 2, bio: 'Lincah dalam menjangkau bola-bola sulit di depan net.', image: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 45, name: 'Surakati', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 3, bio: 'Andal dalam serangan smes keras yang menghujam tajam.', image: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 46, name: 'H. Hasym', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 4, bio: 'Memiliki kontrol permainan yang stabil di setiap pertandingan.', image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 47, name: 'H. Faizal', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 5, bio: 'Pemain cerdas yang pandai memanfaatkan kesalahan lawan.', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 48, name: 'Markus', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 6, bio: 'Semangat muda dengan pukulan drive yang sangat bertenaga.', image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 49, name: 'H. Ude', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 7, bio: 'Ketenangan luar biasa dalam menghadapi serangan bertubi-tubi.', image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 50, name: 'Hidayatullah', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 8, isChampion: true, image: 'whatsapp_image_2025-12-30_at_15.33.37.jpeg', bio: 'Bintang muda yang baru saja menunjukkan performa gemilang di turnamen terakhir.' },
  { id: 51, name: 'H. Pangeran', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 9, bio: 'Gaya bermain yang rapi dan minim kesalahan sendiri.', image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 52, name: 'H. Anwar', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 10, bio: 'Andal dalam bola-bola lob panjang yang merepotkan posisi lawan.', image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 53, name: 'Syarifuddin', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 11, bio: 'Ulet dalam bertahan dan cepat dalam melakukan serangan transisi.', image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 54, name: 'Yakob', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 12, bio: 'Pemain penutup yang solid dengan smes yang sangat akurat.', image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

export default function Players() {
  const [currentTab, setCurrentTab] = useState('Atlet Senior');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // FUNGSI AKTIF UNTUK TOMBOL "LIHAT SEMUA PEMAIN"
  const handleViewAll = () => {
    setSearchTerm(""); 
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const counts = useMemo(() => ({
    Senior: playersData.filter(p => p.ageGroup === 'Atlet Senior').length,
    Muda: playersData.filter(p => p.ageGroup === 'Atlet Muda').length
  }), []);

  const filteredPlayers = useMemo(() => {
    return playersData
      .filter(p => p.ageGroup === currentTab && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.rank - b.rank);
  }, [currentTab, searchTerm]);

  return (
    <section id="atlet" ref={sectionRef} className="py-20 bg-[#050505] text-white min-h-screen font-sans">
      
      {/* --- MODAL DETAIL --- */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedPlayer(null)} />
          <div className="relative bg-[#111] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300">
            <button onClick={() => setSelectedPlayer(null)} className="absolute top-4 right-4 z-20 text-white/50 hover:text-white transition-colors">
              <X size={28} />
            </button>
            <div className="w-full md:w-1/2 aspect-square">
              <img src={selectedPlayer.image} className="w-full h-full object-cover" alt={selectedPlayer.name} />
            </div>
            <div className="p-8 flex flex-col justify-center flex-1">
              <p className="text-blue-500 font-bold text-[10px] tracking-widest mb-2 flex items-center gap-2">
                <ShieldCheck size={14} /> ELITE MEMBER
              </p>
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">{selectedPlayer.name}</h2>
              <div className="flex gap-4 mb-6">
                <div className="bg-white/5 p-3 rounded-xl flex-1">
                  <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Kategori</p>
                  <p className="text-sm font-bold">{selectedPlayer.category}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl flex-1">
                  <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Rank</p>
                  <p className="text-sm font-bold">#{selectedPlayer.rank}</p>
                </div>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed italic border-l-2 border-blue-600 pl-4">
                "{selectedPlayer.bio}"
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        {/* --- HEADER --- */}
        <div className="mb-12 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="bg-blue-600 text-[10px] font-black px-2 py-1 rounded tracking-[0.2em] inline-block mb-2 uppercase">PROFIL PEMAIN</span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase">
                KENAL LEBIH <span className="text-blue-600">DEKAT</span>
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
               <button 
                 onClick={handleViewAll}
                 className="flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-bold transition-colors group"
               >
                 Lihat Semua Pemain 
                 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>
          <div className="h-px bg-zinc-800 w-full mt-8" />
        </div>

        {/* --- FILTER & SEARCH --- */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button 
              onClick={() => setCurrentTab('Atlet Senior')} 
              className={`px-6 py-2.5 rounded-lg text-[11px] font-black tracking-wider transition-all flex items-center gap-2 ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}
            >
              SENIOR <span className="opacity-50">{counts.Senior}</span>
            </button>
            <button 
              onClick={() => setCurrentTab('Atlet Muda')} 
              className={`px-6 py-2.5 rounded-lg text-[11px] font-black tracking-wider transition-all flex items-center gap-2 ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}
            >
              MUDA <span className="opacity-50">{counts.Muda}</span>
            </button>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama pemain..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-600 text-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* --- SWIPER CARDS --- */}
        <div className="relative group/slider">
          <Swiper
            key={currentTab + searchTerm}
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            onBeforeInit={(swiper) => {
              // @ts-ignore
              swiper.params.navigation.prevEl = prevRef.current;
              // @ts-ignore
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            breakpoints={{ 
              640: { slidesPerView: 2 }, 
              1024: { slidesPerView: 4 } 
            }}
            className="!pb-16"
          >
            {filteredPlayers.map((player) => (
              <SwiperSlide key={player.id}>
                <div 
                  onClick={() => setSelectedPlayer(player)} 
                  className="group cursor-pointer relative aspect-[4/5.5] rounded-2xl overflow-hidden bg-zinc-900 transition-transform duration-500 hover:-translate-y-2 border border-zinc-800"
                >
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <span className="bg-blue-600 text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      {player.category}
                    </span>
                    {player.isChampion && (
                      <span className="bg-yellow-500 text-black text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
                        <Award size={10} /> CHAMPION
                      </span>
                    )}
                  </div>

                  <img 
                    src={player.image} 
                    alt={player.name} 
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" 
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-blue-400 font-bold text-[9px] uppercase mb-1 tracking-widest">
                      Kenal Lebih Dekat
                    </p>
                    <h3 className="text-xl font-black uppercase leading-tight tracking-tighter group-hover:text-blue-400 transition-colors mb-3">
                      {player.name}
                    </h3>
                    <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-[0.1em] border-t border-white/10 pt-3">
                      Rank #{player.rank} • {player.ageGroup}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          <button ref={prevRef} className="absolute left-[-24px] top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl invisible group-hover/slider:visible hover:scale-110">
            <ChevronLeft size={24} />
          </button>
          <button ref={nextRef} className="absolute right-[-24px] top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl invisible group-hover/slider:visible hover:scale-110">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}