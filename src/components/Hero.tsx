import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabase'; 

// Data Statis Original (Sebagai Fallback)
const defaultSlides = [
  {
    id: 1,
    title: 'Pusat Pelatihan PB US 162 Bilibili',
    image: '/whatsapp_image_2026-02-02_at_08.39.03.jpeg',
  },
  {
    id: 2,
    title: 'Keluarga Besar Atlet Kami',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(1).jpeg',
  },
  {
    id: 3,
    title: 'Talenta Muda Terpadu',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(2).jpeg',
  },
  {
    id: 4,
    title: 'Semangat Juara Bersama',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(3).jpeg',
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [settings, setSettings] = useState({ duration: 7 });

  // FETCHING DATA: Mengambil konfigurasi dinamis dari Supabase
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'hero_config')
          .single();

        if (data && data.value) {
          const config = data.value;
          if (config.slides && Array.isArray(config.slides)) {
            setSlides(config.slides);
            setSettings(config.settings || { duration: 7 });
          } else if (Array.isArray(config)) {
            setSlides(config);
          }
        }
      } catch (err) {
        console.error("Error fetching hero data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  // Timer Auto-slide dinamis
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, settings.duration * 1000);
    return () => clearInterval(timer);
  }, [slides, currentSlide, settings.duration]);

  // Fungsi Navigasi Manual
  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  return (
    <section id="home" className="relative h-[100dvh] w-full overflow-hidden bg-[#050505]">
      
      {/* Background Section */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              index === currentSlide ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            {/* CONTAINER GAMBAR: Memastikan rasio tetap terjaga sesuai hasil crop admin */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
              <img
                src={slide.image}
                alt={slide.title || "Hero Image"}
                // PENTING: object-cover memastikan gambar memenuhi layar, 
                // namun karena sudah di-crop 16:9 di admin, fokusnya akan tetap di tengah.
                className={`w-full h-full object-cover object-center transition-transform duration-[12000ms] ease-out ${
                  index === currentSlide ? 'scale-105' : 'scale-100'
                }`}
              />
              
              {/* VIGNETTE & OVERLAY: Menambah fokus ke tengah dan keterbacaan teks */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 z-10" />
            </div>

            {/* CONTENT: Judul Slide yang muncul sesuai data admin */}
            <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 transition-all duration-1000 delay-300 ${
              index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase text-white mb-4 drop-shadow-2xl">
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-blue-500 drop-shadow-md">
                  {slide.subtitle}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Side Navigation Dots */}
      <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center gap-4 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => !isTransitioning && setCurrentSlide(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
              index === currentSlide ? 'h-10 bg-blue-600' : 'bg-white/20 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Bottom Navigation Area */}
      <div className="absolute bottom-10 left-6 right-6 md:left-12 flex items-end justify-between z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-2xl rounded-full border border-white/5 p-1 shadow-2xl">
            <button 
              onClick={handlePrev} 
              className="p-3 hover:bg-white/10 text-white rounded-full transition-all active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="w-[1px] h-4 bg-white/10" />
            <button 
              onClick={handleNext} 
              className="p-3 hover:bg-white/10 text-white rounded-full transition-all active:scale-90"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="hidden md:block ml-4">
             <p className="text-[10px] font-black italic text-white/40 tracking-widest">
                {String(currentSlide + 1).padStart(2, '0')} <span className="mx-2">/</span> {String(slides.length).padStart(2, '0')}
             </p>
          </div>
        </div>

        {/* Branding Estetik */}
        <div className="hidden lg:block">
           <p className="text-[9px] font-black uppercase tracking-[0.6em] text-blue-600/50">
             PREMIUM TRAINING FACILITY
           </p>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-500">Syncing Visuals</p>
        </div>
      )}
    </section>
  );
}