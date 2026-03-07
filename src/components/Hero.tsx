import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
              /* PERBAIKAN FOKUS: 
                 - object-cover: Memenuhi layar penuh.
                 - object-[center_20%]: Pada mobile, fokus ditarik sedikit ke atas (20% dari atas) 
                   agar wajah/kepala orang tidak terpotong oleh bagian atas layar HP.
                 - md:object-center: Kembali ke tengah pada desktop.
              */
              className={`w-full h-full object-cover object-[center_20%] md:object-center transition-transform duration-[20000ms] ease-out ${
                index === currentSlide ? 'scale-110' : 'scale-100'
              }`}
            />
            {/* Overlay Gradasi Dinamis - Lebih gelap di bawah agar UI navigasi 'pop out' */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent via-50% to-black/90 z-10" />
          </div>
        ))}
      </div>

      {/* Side Progress Indicators (Dots) */}
      <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => !isTransitioning && setCurrentSlide(index)}
            className={`transition-all duration-700 rounded-full ${
              index === currentSlide 
                ? 'h-8 md:h-10 w-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]' 
                : 'h-1.5 w-1 bg-white/20 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Main Controls */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex flex-col items-center gap-8 md:gap-12 z-30">
        
        {/* Row 1: Navigation */}
        <div className="w-full flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-black/40 backdrop-blur-xl rounded-full border border-white/10 p-1">
              <button onClick={handlePrev} className="p-3 md:p-4 text-white/60 hover:text-white transition-all active:scale-75">
                <ChevronLeft size={20} className="md:w-6 md:h-6" />
              </button>
              <div className="w-[1px] h-6 bg-white/10" />
              <button onClick={handleNext} className="p-3 md:p-4 text-white/60 hover:text-white transition-all active:scale-75">
                <ChevronRight size={20} className="md:w-6 md:h-6" />
              </button>
            </div>
            <span className="text-white/40 font-mono text-[9px] md:text-[10px] tracking-[0.3em] uppercase">
              <span className="text-white">0{currentSlide + 1}</span> / 0{slides.length}
            </span>
          </div>

          <div className="hidden md:block">
             <p className="text-[9px] font-black uppercase tracking-[0.8em] text-white/20 italic">
               PB US 162 <span className="text-blue-600/50">AUTHORITY</span>
             </p>
          </div>
        </div>

        {/* Row 2: Scroll Down Indicator */}
        <button 
          onClick={scrollToAbout}
          className="group flex flex-col items-center gap-2 md:gap-3 transition-opacity hover:opacity-100 opacity-40 mb-4 md:mb-0"
        >
          <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.5em] text-white group-hover:text-blue-500 transition-colors">
            Discovery
          </span>
          <div className="w-[1px] h-8 md:h-12 bg-gradient-to-b from-blue-500 to-transparent relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-scroll-line" />
          </div>
        </button>
      </div>

      {/* Loading Engine Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center gap-5">
          <div className="w-10 h-10 border border-white/5 border-t-blue-600 rounded-full animate-spin shadow-[0_0_30px_rgba(37,99,235,0.2)]" />
        </div>
      )}

      <style>{`
        @keyframes scroll-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .animate-scroll-line {
          animation: scroll-line 2.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
      `}</style>
    </section>
  );
}