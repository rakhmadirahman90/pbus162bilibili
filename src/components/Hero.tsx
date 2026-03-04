import { useState, useEffect } from 'react';
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
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, settings.duration * 1000);
    return () => clearInterval(timer);
  }, [slides, currentSlide, settings.duration]);

  return (
    <section id="home" className="relative h-[100dvh] w-full overflow-hidden bg-black">
      {/* Background Section Hanya Gambar dengan Ken Burns Effect */}
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
                alt={slide.title || "Hero Image"}
                className={`w-full h-full object-cover object-center transition-transform duration-[12000ms] ease-out ${
                  index === currentSlide ? 'scale-110' : 'scale-100'
                }`}
              />
              
              {/* Overlay Halus Gelap agar transisi antar gambar lebih sinematik */}
              <div className="absolute inset-0 bg-black/20 z-10" />
            </div>
          </div>
        ))}
      </div>

      {/* Loading Overlay Minimalis */}
      {loading && (
        <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </section>
  );
}