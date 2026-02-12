import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  // Fungsi untuk scroll halus dengan offset (menghindari tertutup navbar)
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Menyesuaikan tinggi navbar agar judul tidak tertutup
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand & Deskripsi */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/photo_2026-02-03_00-32-07.jpg"
                alt="Logo PB US 162"
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
              />
              <h3 className="text-xl font-bold">PB US 162 Bilibili</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Membina legenda masa depan dengan fasilitas standar nasional dan sport-science.
            </p>
          </div>

          {/* Navigasi Lengkap */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-blue-400 uppercase tracking-widest">Navigasi</h4>
            <ul className="space-y-3">
              {[
                { name: 'Beranda', id: 'home' },
                { name: 'Berita', id: 'news' },
                { name: 'Atlet', id: 'players' },      
                { name: 'Peringkat', id: 'rankings' }, 
                { name: 'Galeri', id: 'gallery' },   
                { name: 'Tentang', id: 'about' }
              ].map((item) => (
                <li key={item.id}>
                  <a 
                    href={`#${item.id}`}
                    onClick={(e) => scrollToSection(e, item.id)}
                    className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-300 text-sm inline-block cursor-pointer"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-blue-400 uppercase tracking-widest">Kontak</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-blue-500 mt-1 shrink-0" />
                <span className="text-gray-400 text-sm">
                  Jl. Andi Makkasau No. 171, Parepare, Indonesia
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} className="text-blue-500 shrink-0" />
                <a href="tel:+6281219027234" className="text-gray-400 hover:text-white text-sm transition-colors">
                  +62 812 1902 7234
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-blue-500 shrink-0" />
                <a href="mailto:info@pbus162bilibili.id" className="text-gray-400 hover:text-white text-sm transition-colors">
                  info@pbus162bilibili.id
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-blue-400 uppercase tracking-widest">Ikuti Kami</h4>
            <div className="flex space-x-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="bg-slate-800 hover:bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

        </div>
        // Di dalam Navbar Landing Page Anda:
<Link 
  to="/login" 
  className="text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
>
  Admin Portal
</Link>

        {/* Bottom Footer */}
        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} PB US 162 Bilibili. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
    
  );
}