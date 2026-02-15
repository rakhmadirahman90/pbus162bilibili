import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "../supabase";
import { 
  Plus, Trash2, MoveUp, MoveDown, 
  Image as ImageIcon, Upload, RefreshCcw, 
  CheckCircle2, AlertCircle, Clock, Zap,
  Layers, Settings2
} from 'lucide-react';

const KelolaHero: React.FC = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [sliderSettings, setSliderSettings] = useState({
    duration: 6, // Default 6 detik
    effect: 'fade' // Default efek fade
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // State Form
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'hero_config')
      .maybeSingle();

    if (!error && data?.value) {
      const val = data.value;
      // Jika format baru (objek dengan slides dan settings)
      if (val.slides) {
        setSlides(val.slides);
        setSliderSettings(val.settings || { duration: 6, effect: 'fade' });
      } else {
        // Fallback jika format lama (hanya array slides)
        setSlides(Array.isArray(val) ? val : []);
      }
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const filePath = `hero-sliders/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
    } catch (err: any) {
      alert("Gagal upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const saveToDatabase = async (updatedSlides: any[], updatedSettings = sliderSettings) => {
    const payload = {
      slides: updatedSlides,
      settings: updatedSettings
    };

    const { error } = await supabase
      .from('site_settings')
      .upsert({ 
        key: 'hero_config', 
        value: payload,
        label: 'Konfigurasi Slider Hero Utama'
      });

    if (!error) {
      setSlides(updatedSlides);
      setSliderSettings(updatedSettings);
      triggerSuccess();
    } else {
      alert("Gagal menyimpan: " + error.message);
    }
  };

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !title) {
      setFormError("Foto dan Judul wajib ada");
      return;
    }

    const newSlide = {
      id: Date.now(),
      title,
      subtitle,
      image: imageUrl,
    };

    const updatedSlides = [...slides, newSlide];
    await saveToDatabase(updatedSlides);
    
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setFormError(null);
  };

  const deleteSlide = async (id: number) => {
    if (!window.confirm("Hapus foto ini?")) return;
    const updatedSlides = slides.filter(s => s.id !== id);
    await saveToDatabase(updatedSlides);
  };

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    await saveToDatabase(newSlides);
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
              HERO <span className="text-blue-600">ENGINE</span>
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">
              Manajemen Visual & Pengaturan Animasi Slider
            </p>
          </div>
          <button 
            onClick={fetchHeroData}
            className="flex items-center gap-3 px-8 py-4 bg-zinc-900 rounded-2xl border border-white/5 hover:bg-zinc-800 transition-all active:scale-95 shadow-2xl"
          >
            <RefreshCcw size={18} className={isLoading ? 'animate-spin text-blue-500' : 'text-zinc-400'} />
            <span className="text-[10px] font-black uppercase tracking-widest">Resync Data</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* SISI KIRI: SETTINGS & FORM */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Global Settings Card */}
            <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(37,99,235,0.3)] relative overflow-hidden group">
               <Settings2 className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 text-white/90">
                 <Zap size={16} /> Slider Behavior
               </h3>
               
               <div className="space-y-6 relative z-10">
                 <div>
                   <label className="text-[9px] font-black uppercase text-blue-100 flex items-center gap-2 mb-3">
                     <Clock size={12} /> Auto-Slide Duration (Seconds)
                   </label>
                   <input 
                     type="range" min="3" max="15" step="1"
                     value={sliderSettings.duration}
                     onChange={(e) => setSliderSettings({...sliderSettings, duration: parseInt(e.target.value)})}
                     onMouseUp={() => saveToDatabase(slides, sliderSettings)}
                     className="w-full h-1.5 bg-blue-400 rounded-lg appearance-none cursor-pointer accent-white"
                   />
                   <div className="flex justify-between mt-2 text-[10px] font-black text-white">
                     <span>3s</span>
                     <span className="bg-white text-blue-600 px-3 py-0.5 rounded-full">{sliderSettings.duration} DETIK</span>
                     <span>15s</span>
                   </div>
                 </div>

                 <button 
                   onClick={() => saveToDatabase(slides, sliderSettings)}
                   className="w-full bg-black/20 hover:bg-black/40 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/10"
                 >
                   Update Animation Settings
                 </button>
               </div>
            </div>

            {/* Form Tambah */}
            <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 flex items-center gap-2 text-blue-500">
                <Plus size={16} /> Register New Slide
              </h3>
              
              <form onSubmit={handleAddSlide} className="space-y-5">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative w-full h-44 bg-black border-2 border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-600/50 transition-all overflow-hidden"
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon size={32} className="mx-auto text-zinc-700 mb-3" />
                      <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Select Visual Asset</p>
                    </div>
                  )}
                  {isUploading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><RefreshCcw className="animate-spin text-blue-500" /></div>}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />

                <input 
                  type="text" placeholder="Title Line" 
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black border border-white/5 rounded-xl px-5 py-4 text-xs font-bold focus:border-blue-600 outline-none"
                />
                <textarea 
                  placeholder="Subtitle detail description..." 
                  value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-black border border-white/5 rounded-xl px-5 py-4 text-xs font-bold focus:border-blue-600 outline-none h-28 resize-none"
                />

                {formError && <p className="text-red-500 text-[9px] font-black uppercase tracking-tighter flex items-center gap-2"><AlertCircle size={14}/> {formError}</p>}

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl active:scale-95">
                  Publish to Hero
                </button>
              </form>
            </div>
          </div>

          {/* SISI KANAN: LIST ASSETS */}
          <div className="lg:col-span-8 space-y-4">
            {slides.length === 0 ? (
              <div className="text-center py-40 border-2 border-dashed border-zinc-900 rounded-[3rem] opacity-30">
                <Layers size={64} className="mx-auto mb-6" />
                <p className="font-black uppercase text-[10px] tracking-[0.4em]">Empty Gallery</p>
              </div>
            ) : (
              slides.map((slide, index) => (
                <div 
                  key={slide.id} 
                  className="group flex flex-col md:flex-row items-center gap-6 bg-zinc-900 border border-white/5 p-6 rounded-[2.5rem] hover:border-blue-600/40 transition-all relative overflow-hidden"
                >
                  <div className="relative w-full md:w-56 h-36 rounded-[1.5rem] overflow-hidden flex-shrink-0 shadow-2xl">
                    <img src={slide.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-xl">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <h4 className="font-black uppercase italic text-lg tracking-tighter text-white mb-2">{slide.title}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed line-clamp-2">{slide.subtitle}</p>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <div className="flex bg-black p-1.5 rounded-2xl border border-white/5">
                      <button onClick={() => moveSlide(index, 'up')} className="p-2 text-zinc-500 hover:text-white transition-colors"><MoveUp size={18}/></button>
                      <button onClick={() => moveSlide(index, 'down')} className="p-2 text-zinc-500 hover:text-white transition-colors"><MoveDown size={18}/></button>
                    </div>
                    <button 
                      onClick={() => deleteSlide(slide.id)}
                      className="p-4 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-lg active:scale-95"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 transition-all duration-1000 z-[100] ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
        <div className="bg-blue-600 px-10 py-5 rounded-full flex items-center gap-4 shadow-[0_30px_60px_rgba(37,99,235,0.4)] border border-white/20">
          <div className="bg-white/20 p-2 rounded-full text-white"><CheckCircle2 size={20} /></div>
          <span className="font-black uppercase text-[11px] tracking-[0.3em]">Cloud System Synced</span>
        </div>
      </div>
    </div>
  );
};

export default KelolaHero;