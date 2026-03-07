import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabase'; 

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
          setSlides(config.slides || config);
          setSettings(config.settings || { duration: 7 });
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
    const timer = setInterval(() => handleNext(), settings.duration * 1000);
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
    <section id="home" className="relative w-full h-[100dvh] overflow-hidden bg-black">
      
      {/* Background Visual Layer */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              index === currentSlide ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            {/* PERBAIKAN FINAL UNTUK FULLSCREEN & WAJAH TENGAH:
              1. object-cover: Wajib agar tidak ada warna hitam di atas/bawah (Full Screen).
              2. object-[center_20%]: Menggeser titik potong. 
                 - 'center' memastikan sisi kiri-kanan terpotong seimbang (objek tetap di tengah).
                 - '20%' memastikan bagian ATAS gambar (wajah) diprioritaskan agar tidak hilang di layar HP yang tinggi.
            */}
            <img
              src={slide.image}
              alt=""
              className={`w-full h-full object-cover object-[center_20%] md:object-center transition-transform duration-[20000ms] ease-out 
                ${index === currentSlide ? 'scale-110' : 'scale-100'}
              `}
            />
            
            {/* Overlay Gradient untuk visibilitas navigasi */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 z-10" />
          </div>
        ))}
      </div>

      {/* Kontrol Navigasi Samping */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => !isTransitioning && setCurrentSlide(index)}
            className={`transition-all duration-500 rounded-full ${
              index === currentSlide ? 'h-8 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'h-1.5 w-1 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Kontrol Navigasi Bawah */}
      <div className="absolute bottom-10 left-0 right-0 px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-black/30 backdrop-blur-md rounded-full border border-white/10 p-1">
            <button onClick={handlePrev} className="p-3 text-white/70 hover:text-white transition-all active:scale-75">
              <ChevronLeft size={20} />
            </button>
            <div className="w-[1px] h-4 bg-white/10" />
            <button onClick={handleNext} className="p-3 text-white/70 hover:text-white transition-all active:scale-75">
              <ChevronRight size={20} />
            </button>
          </div>
          <span className="text-[10px] text-white/50 font-mono tracking-widest">
            {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
    </section>
  );
}