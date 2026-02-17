import React, {
  useEffect,
  useState,
  useCallback,
  useRef
} from 'react';

import Cropper from 'react-easy-crop';
import { supabase } from "./supabase";

import {
  Search, User, X, Award, TrendingUp, Users,
  MapPin, Phone, ShieldCheck, Star, Trophy, Save,
  Loader2, Edit3, ChevronLeft, ChevronRight,
  Zap, Sparkles, RefreshCcw, Camera, Scissors, Plus
} from 'lucide-react';

import { v4 as uuidv4 } from 'uuid';

/* ======================
   CONSTANTS & HELPERS
====================== */

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

const safeParseInt = (val: any, fallback = 0) => {
  const num = parseInt(val);
  return isNaN(num) ? fallback : num;
};

const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.crossOrigin = "anonymous";
    image.src = url;
  });

/* ======================
   INTERFACE
====================== */

interface Registrant {
  id: string;
  nama: string;
  whatsapp: string;
  kategori: string;
  domisili: string;
  foto_url: string;
  jenis_kelamin: string;
  rank: number;
  points: number;
  seed: string;
  bio: string;
  prestasi: string;
  status?: string;
}

/* ======================
   MAIN COMPONENT
====================== */

export default function ManajemenAtlet() {

  /* STATE */

  const [atlets, setAtlets] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAtlet, setSelectedAtlet] = useState<Registrant | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStats, setEditingStats] =
    useState<Partial<Registrant> | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newAtlet, setNewAtlet] = useState({
    nama: '',
    whatsapp: '',
    kategori: 'SENIOR',
    domisili: '',
    seed: 'UNSEEDED',
    points: 0,
    bio: 'Atlet PB US 162',
    prestasi: 'Regular Player',
    foto_url: ''
  });

  /* IMAGE */

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  /* NOTIFICATION */

  const [showSuccess, setShowSuccess] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const BUCKET_NAME = 'atlet_photos';

  /* ======================
     LIFECYCLE
  ====================== */

  useEffect(() => {
    fetchAtlets();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /* ======================
     FETCH DATA
  ====================== */

  const fetchAtlets = async () => {

    setLoading(true);

    try {

      const { data: pendaftaran, error: pError } =
        await supabase
          .from('pendaftaran')
          .select('*')
          .order('nama');

      if (pError) throw pError;

      const { data: rankings, error: rError } =
        await supabase
          .from('rankings')
          .select('*')
          .order('total_points', { ascending: false });

      if (rError) throw rError;

      const safeRankings = rankings || [];

      if (pendaftaran) {

        const formatted = pendaftaran.map((atlet: any) => {

          const rankPosisi = safeRankings.findIndex(
            (r: any) =>
              (r.player_name || r.nama)
                ?.trim()
                .toLowerCase() ===
              atlet.nama?.trim().toLowerCase()
          );

          const rankingMatch =
            rankPosisi !== -1
              ? safeRankings[rankPosisi]
              : null;

          return {
            ...atlet,
            points: rankingMatch?.total_points || 0,
            rank: rankPosisi !== -1 ? rankPosisi + 1 : 0,
            seed: rankingMatch?.seed || 'UNSEEDED',
            foto_url:
              atlet.foto_url ||
              rankingMatch?.photo_url ||
              '',
            bio:
              rankingMatch?.bio ||
              "No biography available.",
            prestasi:
              rankingMatch?.achievement ||
              "Regular Player"
          };
        });

        setAtlets(formatted);
      }

    } catch (err: any) {
      console.error("Fetch Error:", err.message);
    }

    finally {
      setLoading(false);
    }
  };

  /* ======================
     SEED HANDLER
  ====================== */

  const handleSeedChange = (
    seed: string,
    isEditing = false
  ) => {

    const seedConfig: Record<string, any> = {
      A: { base: 10000, age: 'SENIOR' },
      'B+': { base: 8500, age: 'SENIOR' },
      'B-': { base: 7000, age: 'SENIOR' },
      C: { base: 5500, age: 'MUDA' },
      UNSEEDED: { base: 0, age: 'SENIOR' }
    };

    const config = seedConfig[seed];

    if (isEditing) {

      setEditingStats(prev => ({
        ...prev,
        seed,
        points: config.base,
        kategori: config.age
      }));

    } else {

      setNewAtlet(prev => ({
        ...prev,
        seed,
        points: config.base,
        kategori: config.age
      }));

    }
  };

  /* ======================
     FILE UPLOAD
  ====================== */

  const onFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    if (file.size > MAX_IMAGE_SIZE) {
      alert("Maksimal 2MB!");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("File harus gambar!");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setIsCropping(true);
    };

    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback(
    (_: any, area: any) => {
      setCroppedAreaPixels(area);
    }, []
  );

  const handleUploadCroppedImage = async () => {

    if (!imageToCrop || !croppedAreaPixels) return;

    setUploadingImage(true);

    try {

      const image = await createImage(imageToCrop);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx?.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      const blob = await new Promise<Blob>(
        (resolve, reject) => {
          canvas.toBlob(b => {
            if (!b) reject();
            else resolve(b);
          }, 'image/jpeg', 0.8);
        });

      const fileName =
        `atlet-${uuidv4()}.jpg`;

      const { error } =
        await supabase
          .storage
          .from(BUCKET_NAME)
          .upload(fileName, blob);

      if (error) throw error;

      const { data } =
        supabase
          .storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);

      setNewAtlet(prev => ({
        ...prev,
        foto_url: data.publicUrl
      }));

      setIsCropping(false);
      setImageToCrop(null);

      showNotif("Foto berhasil diupload");

    } catch {

      alert("Upload gagal");

    } finally {

      setUploadingImage(false);

    }
  };

  /* ======================
     NOTIFICATION
  ====================== */

  const showNotif = (msg: string) => {

    setNotifMessage(msg);
    setShowSuccess(true);

    if (timeoutRef.current)
      clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  /* ======================
     ADD ATLET
  ====================== */

  const handleAddNewAtlet = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (isSubmitting) {
      await sleep(300);
      return;
    }

    setIsSubmitting(true);
    setIsSaving(true);

    try {

      const name = newAtlet.nama.trim();

      await supabase
        .from('pendaftaran')
        .upsert({
          nama: name,
          whatsapp: newAtlet.whatsapp,
          kategori: newAtlet.kategori,
          domisili: newAtlet.domisili,
          foto_url: newAtlet.foto_url,
          status: 'verified'
        }, { onConflict: 'nama' });

      await supabase
        .from('rankings')
        .upsert({
          player_name: name,
          category: newAtlet.kategori,
          seed: newAtlet.seed,
          total_points: newAtlet.points,
          photo_url: newAtlet.foto_url,
          bio: newAtlet.bio,
          achievement: newAtlet.prestasi
        }, { onConflict: 'player_name' });

      showNotif("Atlet berhasil ditambah");

      setIsAddModalOpen(false);

      await fetchAtlets();

    } catch (err: any) {

      alert(err.message);

    } finally {

      setIsSaving(false);
      setIsSubmitting(false);

    }
  };

  /* ======================
     EDIT PERFORMANCE
  ====================== */

  const handleUpdateStats = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!editingStats?.nama) return;

    setIsSaving(true);
    setIsSubmitting(true);

    try {

      await supabase
        .from('pendaftaran')
        .update({
          kategori: editingStats.kategori
        })
        .eq('nama', editingStats.nama);

      await supabase
        .from('rankings')
        .upsert({
          player_name: editingStats.nama,
          category: editingStats.kategori,
          seed: editingStats.seed,
          total_points: editingStats.points
        }, { onConflict: 'player_name' });

      showNotif("Data diperbarui");

      await fetchAtlets();

      setIsEditModalOpen(false);

    } finally {

      setIsSaving(false);
      setIsSubmitting(false);

    }
  };

  /* ======================
     FILTER & PAGINATION
  ====================== */

  const filteredAtlets =
    atlets.filter(a =>
      a.nama
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;

  const currentItems =
    filteredAtlets.slice(indexFirst, indexLast);

  const totalPages =
    Math.ceil(filteredAtlets.length / itemsPerPage);

  /* ======================
     RENDER
  ====================== */

  return (
    <div className="h-screen bg-slate-50 p-6">

      <h1 className="text-3xl font-bold mb-6">
        Manajemen Atlet
      </h1>

      <input
        className="w-full p-3 border rounded mb-6"
        placeholder="Cari atlet..."
        onChange={e => setSearchTerm(e.target.value)}
      />

      {loading ? (

        <p>Loading...</p>

      ) : (

        <div className="grid grid-cols-4 gap-4">

          {currentItems.map(atlet => (

            <div
              key={atlet.id || atlet.nama}
              className="p-4 bg-white rounded shadow cursor-pointer"
              onClick={() => setSelectedAtlet(atlet)}
            >

              <img
                src={atlet.foto_url || '/user.png'}
                className="w-full h-40 object-cover rounded mb-3"
              />

              <h3 className="font-bold">
                {atlet.nama}
              </h3>

              <p>
                {atlet.points} pts
              </p>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}
