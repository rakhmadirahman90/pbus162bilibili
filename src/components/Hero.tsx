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
    setTimeout(() => setIsTransitioning(false), 1500); 
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1500);
  };

  return (
    <section 
      id="home" 
      className="relative w-full h-screen h-[100dvh] overflow-hidden bg-black"
    >
      {/* h-[100dvh] (Dynamic Viewport Height) adalah kunci agar di HP 
        tampilan tetap Full Screen meskipun ada bar URL browser.
      */}
      
      {/* Background Section (Slide Gambar) */}
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
              
              {/* Overlay gelap halus agar gambar tidak terlalu mentah */}
              <div className="absolute inset-0 bg-black/10 z-10" />
            </div>
          </div>
        ))}
      </div>

      {/* Side Navigation Dots - Diatur agar presisi di tengah vertikal */}
      <div className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => !isTransitioning && setCurrentSlide(index)}
            className={`w-1 md:w-1.5 rounded-full transition-all duration-500 ${
              index === currentSlide 
                ? 'h-8 md:h-12 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                : 'h-1.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Bottom Navigation Area - Diatur agar aman dari 'Home Bar' HP */}
      <div className="absolute bottom-10 left-6 right-6 md:left-12 flex items-end justify-between z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-black/30 backdrop-blur-2xl rounded-2xl border border-white/10 p-1.5">
            <button 
              onClick={handlePrev} 
              className="p-3.5 hover:bg-white/10 text-white rounded-xl transition-all active:scale-90"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="w-[1px] h-5 bg-white/10 mx-1" />
            <button 
              onClick={handleNext} 
              className="p-3.5 hover:bg-white/10 text-white rounded-xl transition-all active:scale-90"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          
          {/* Slide Indicator Simple */}
          <div className="ml-2 font-mono text-[11px] tracking-widest text-white/50">
            <span className="text-white">0{currentSlide + 1}</span> / 0{slides.length}
          </div>
        </div>

        {/* Branding Tipis (Sembunyi di HP agar bersih) */}
        <div className="hidden lg:block">
           <p className="text-[9px] font-bold uppercase tracking-[0.6em] text-white/20 italic">
             PB US 162 <span className="opacity-50">ENGINE</span>
           </p>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-white/5 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </section>
  );
}