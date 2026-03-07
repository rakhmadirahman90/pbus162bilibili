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

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1500); // Sinkron dengan durasi transisi opacity
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1500);
  };

  return (
    <section id="home" className="relative w-full overflow-hidden bg-black">
      
      {/* ASPECT RATIO CONTAINER 
          Menggunakan aspect-video (16:9) agar area tampilan 
          persis sama dengan rasio cropper di Admin.
      */}
      <div className="relative w-full aspect-video md:h-screen">
        
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
                  alt="" // Teks dihilangkan sesuai permintaan
                  className={`w-full h-full object-cover object-center transition-transform duration-[12000ms] ease-out ${
                    index === currentSlide ? 'scale-105' : 'scale-100'
                  }`}
                />
                
                {/* Overlay Gelap Halus */}
                <div className="absolute inset-0 bg-black/10 z-10" />
              </div>
            </div>
          ))}
        </div>

        {/* Side Navigation Dots (Indikator Samping) */}
        <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center gap-4 z-30">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => !isTransitioning && setCurrentSlide(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'h-8 bg-white' : 'bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Bottom Navigation (Controls) */}
        <div className="absolute bottom-10 left-6 right-6 md:left-12 flex items-end justify-between z-30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-2xl rounded-full border border-white/10 p-1.5">
              <button 
                onClick={handlePrev} 
                className="p-3 hover:bg-white/10 text-white rounded-full transition-all active:scale-90"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={22} />
              </button>
              <div className="w-[1px] h-4 bg-white/20" />
              <button 
                onClick={handleNext} 
                className="p-3 hover:bg-white/10 text-white rounded-full transition-all active:scale-90"
                aria-label="Next Slide"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>

          {/* Branding Aesthetic */}
          <div className="hidden lg:block">
             <p className="text-[9px] font-black uppercase tracking-[0.6em] text-white/40 italic">
               PB US 162 <span className="text-white/20">Elite Performance</span>
             </p>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-white/5 border-t-white rounded-full animate-spin" />
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Initializing Engine</p>
          </div>
        </div>
      )}
    </section>
  );
}