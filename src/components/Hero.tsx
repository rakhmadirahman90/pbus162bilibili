import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabase'; 

// Data Statis Original (Sebagai Fallback)
const defaultSlides = [
  {
    id: 1,
    image: '/whatsapp_image_2026-02-02_at_08.39.03.jpeg',
  },
  {
    id: 2,
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(1).jpeg',
  },
  {
    id: 3,
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(2).jpeg',
  },
  {
    id: 4,
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(3).jpeg',
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [settings, setSettings] = useState({ duration: 7 });

  // FETCHING DATA
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

  // Timer Auto-slide
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, settings.duration * 1000);
    return () => clearInterval(timer);
  }, [slides, currentSlide, settings.duration]);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1500);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1500);
  };

  return (
    <section id="home" className="relative w-full overflow-hidden bg-[#050505]">
      
      {/* PERBAIKAN STRUKTUR RESPONSIF:
        - Mobile: h-[70dvh] (70% tinggi layar HP) agar tidak "gepeng" dan tertutup section lain.
        - Desktop (md): h-screen (Tinggi penuh layar) untuk tampilan sinematik.
      */}
      <div className="relative w-full h-[70dvh] md:h-screen lg:h-screen">
        
        {/* Background Slides */}
        <div className="absolute inset-0 z-0">
          {slides.map((slide, index) => (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                index === currentSlide ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
            >
              <div className="relative w-full h-full">
                <img
                  src={slide.image}
                  alt="" 
                  className={`w-full h-full object-cover object-center transition-transform duration-[12000ms] ease-out ${
                    index === currentSlide ? 'scale-110' : 'scale-100'
                  }`}
                />
                
                {/* Overlay Gradasi agar transisi ke section bawah lebih halus & navigasi terbaca */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              </div>
            </div>
          ))}
        </div>

        {/* Side Navigation Dots - Dioptimalkan untuk Mobile & Desktop */}
        <div className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 md:gap-4 z-30">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => !isTransitioning && setCurrentSlide(index)}
              className={`w-1 md:w-1.5 rounded-full transition-all duration-500 ${
                index === currentSlide 
                  ? 'h-6 md:h-10 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)]' 
                  : 'h-1.5 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Bottom Navigation Area */}
        <div className="absolute bottom-8 left-6 right-6 md:left-12 md:right-12 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            {/* Navigasi Panah yang lebih Modern */}
            <div className="flex items-center bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-1">
              <button 
                onClick={handlePrev} 
                className="p-3 hover:bg-white/10 text-white rounded-xl transition-all active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="w-[1px] h-4 bg-white/10 mx-1" />
              <button 
                onClick={handleNext} 
                className="p-3 hover:bg-white/10 text-white rounded-xl transition-all active:scale-90"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Slide Counter (Indikator Angka) */}
            <div className="hidden sm:block text-white/40 font-mono text-[10px] tracking-widest">
              <span className="text-white">{(currentSlide + 1).toString().padStart(2, '0')}</span> / {slides.length.toString().padStart(2, '0')}
            </div>
          </div>

          {/* Branding Aesthetic - Menyembunyikan di HP agar tidak sumpek */}
          <div className="hidden md:block">
             <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20 italic">
               PB US 162 <span className="text-blue-600/40">Authority</span>
             </p>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-[#050505] z-[200] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Syncing Visuals</p>
          </div>
        </div>
      )}
    </section>
  );
}