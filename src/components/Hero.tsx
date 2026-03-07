import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MousePointer2 } from 'lucide-react';
import { supabase } from '../supabase'; 

// Data Statis Original (Sebagai Fallback)
const defaultSlides = [
  { id: 1, image: '/whatsapp_image_2026-02-02_at_08.39.03.jpeg' },
  { id: 2, image: '/whatsapp_image_2026-02-02_at_09.53.05_(1).jpeg' },
  { id: 3, image: '/whatsapp_image_2026-02-02_at_09.53.05_(2).jpeg' },
  { id: 4, image: '/whatsapp_image_2026-02-02_at_09.53.05_(3).jpeg' },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [settings, setSettings] = useState({ duration: 7 });

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'hero_config')
          .single();

        if (data?.value) {
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

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => { handleNext(); }, settings.duration * 1000);
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

  // Fungsi untuk scroll otomatis ke section di bawahnya
  const scrollToAbout = () => {
    const nextSection = document.getElementById('tentang-kami') || document.getElementById('about');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative w-full h-[100dvh] overflow-hidden bg-black">
      
      {/* Background Visual Engine */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              index === currentSlide ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            <img
              src={slide.image}
              alt=""
              className={`w-full h-full object-cover object-center transition-transform duration-[15000ms] ease-out ${
                index === currentSlide ? 'scale-110' : 'scale-100'
              }`}
            />
            {/* Overlay Gradasi - Membuat bagian bawah lebih gelap untuk UI */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 z-10" />
          </div>
        ))}
      </div>

      {/* Side Progress Indicators (Dots) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => !isTransitioning && setCurrentSlide(index)}
            className={`transition-all duration-700 rounded-full ${
              index === currentSlide 
                ? 'h-10 w-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]' 
                : 'h-1.5 w-1 bg-white/20 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Main Controls - Navigation & Scroll Indicator */}
      <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col items-center gap-12 z-30">
        
        {/* Row 1: Left/Right Navigation */}
        <div className="w-full flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-5">
            <div className="flex items-center bg-black/20 backdrop-blur-2xl rounded-full border border-white/5 p-1">
              <button onClick={handlePrev} className="p-4 text-white/60 hover:text-white transition-all active:scale-75">
                <ChevronLeft size={24} />
              </button>
              <div className="w-[1px] h-6 bg-white/10" />
              <button onClick={handleNext} className="p-4 text-white/60 hover:text-white transition-all active:scale-75">
                <ChevronRight size={24} />
              </button>
            </div>
            <span className="text-white/40 font-mono text-[10px] tracking-[0.3em] uppercase">
              <span className="text-white">0{currentSlide + 1}</span> / 0{slides.length}
            </span>
          </div>

          <div className="hidden md:block">
             <p className="text-[9px] font-black uppercase tracking-[0.8em] text-white/20 italic">
               PB US 162 <span className="text-blue-600/50">ENGINE</span>
             </p>
          </div>
        </div>

        {/* Row 2: Scroll Down Indicator Animated */}
        <button 
          onClick={scrollToAbout}
          className="group flex flex-col items-center gap-3 transition-opacity hover:opacity-100 opacity-60"
        >
          <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/50 group-hover:text-blue-500 transition-colors">
            Scroll Discovery
          </span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-blue-500 to-transparent relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-scroll-line" />
          </div>
        </button>
      </div>

      {/* Loading Engine Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-[#050505] z-[200] flex flex-col items-center justify-center gap-5">
          <div className="w-12 h-12 border border-white/5 border-t-blue-600 rounded-full animate-spin shadow-[0_0_30px_rgba(37,99,235,0.2)]" />
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600">Powering System</p>
        </div>
      )}

      {/* Custom Styles for Animation */}
      <style>{`
        @keyframes scroll-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .animate-scroll-line {
          animation: scroll-line 2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
      `}</style>
    </section>
  );
}