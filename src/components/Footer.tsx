import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  // Fungsi untuk scroll halus dengan offset (menghindari tertutup navbar)
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Sesuaikan dengan tinggi header Anda
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
                { name: 'Atlet', id: 'atlet' },      // Sudah Aktif
                { name: 'Peringkat', id: 'ranking' }, // Sudah Aktif
                { name: 'Galeri', id: 'gallery' },   // Sudah Aktif
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

          {/* Bagian Kontak & Social Media tetap sama seperti sebelumnya... */}
          {/* ... */}

        </div>
      </div>
    </footer>
  );
}