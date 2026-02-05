import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  // Fungsi untuk scroll halus
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Menghitung offset jika Anda memiliki header fixed (sekitar 80px)
      const offset = 80; 
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
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/photo_2026-02-03_00-32-07.jpg"
                alt="Logo"
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
              />
              <h3 className="text-xl font-bold">PB US 162 Bilibili</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Ekosistem pembinaan bulutangkis terpadu yang menggabungkan disiplin, teknik modern, dan semangat juang.
            </p>
          </div>

          {/* Navigation - LENGKAP & BISA DIKLIK */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-blue-400 uppercase tracking-widest">Navigasi</h4>
            <ul className="space-y-3">
              {[
                { name: 'Beranda', id: 'home' },
                { name: 'Berita', id: 'news' },
                { name: 'Atlet', id: 'atlet' },
                { name: 'Peringkat', id: 'ranking' },
                { name: 'Galeri', id: 'gallery' },
                { name: 'Tentang', id: 'about' }
              ].map((item) => (
                <li key={item.id}>
                  <a 
                    href={`#${item.id}`}
                    onClick={(e) => handleScroll(e, item.id)}
                    className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-300 text-sm inline-block"
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
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3 text-gray-400">
                <MapPin size={18} className="text-blue-500 shrink-0" />
                <span>Parepare, Sulawesi Selatan, Indonesia</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone size={18} className="text-blue-500 shrink-0" />
                <span>+62 812 1902 7234</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail size={18} className="text-blue-500 shrink-0" />
                <span>info@pbus162bilibili.id</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-blue-400 uppercase tracking-widest">Ikuti Kami</h4>
            <div className="flex space-x-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 transition-colors">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} PB US 162 Bilibili. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}