import { Target, Award, Users, MapPin, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            MEMBINA <span className="text-blue-600">LEGENDA</span> MASA DEPAN
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            PB US 162 Bilibili bukan sekadar klub, melainkan ekosistem pembinaan bulutangkis terpadu yang menggabungkan disiplin, teknik modern, dan semangat juang.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Image & Experience Badge */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-600/10 rounded-full -z-10 animate-pulse"></div>
            <img
              src="https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Fasilitas PB US 162"
              className="rounded-3xl shadow-2xl object-cover h-[450px] w-full"
            />
            <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-8 rounded-2xl shadow-xl hidden md:block">
              <div className="text-4xl font-black mb-1">Cup IV</div>
              <div className="text-sm font-medium opacity-90 uppercase tracking-widest">Turnamen 2026</div>
            </div>
          </div>

          {/* Content Section */}
          <div>
            <h3 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">
              Pusat Pelatihan Berstandar Tinggi di Parepare
            </h3>
            <p className="text-slate-600 mb-6 text-lg leading-relaxed">
              Lahir dari semangat memajukan olahraga di Sulawesi Selatan, **PB US 162** kini menjadi barometer pembinaan bulutangkis regional. Kami menerapkan kurikulum latihan yang mengadaptasi standar nasional untuk memastikan setiap atlet memiliki fondasi teknik yang kuat.
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                "Pelatihan intensif berbasis sport-science",
                "Fasilitas GOR modern dengan pencahayaan standar BWF",
                "Jenjang karier atlet dari pemula hingga profesional",
                "Monitoring perkembangan poin melalui sistem klasemen digital"
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="text-blue-600" size={20} />
                  {item}
                </li>
              ))}
            </ul>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
              <div className="border border-slate-100 bg-slate-50/50 p-5 rounded-2xl hover:bg-white hover:shadow-lg transition-all">
                <div className="text-3xl font-black text-blue-600 mb-1">150+</div>
                <div className="text-xs font-bold text-slate-500 uppercase">Atlet Aktif</div>
              </div>
              <div className="border border-slate-100 bg-slate-50/50 p-5 rounded-2xl hover:bg-white hover:shadow-lg transition-all">
                <div className="text-3xl font-black text-blue-600 mb-1">20+</div>
                <div className="text-xs font-bold text-slate-500 uppercase">Coach Pro</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vision Mission Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="p-8 bg-slate-50 rounded-3xl hover:bg-blue-600 group transition-all duration-300">
            <Target className="text-blue-600 group-hover:text-white mb-6" size={40} />
            <h4 className="text-xl font-bold text-slate-900 group-hover:text-white mb-3">Visi</h4>
            <p className="text-slate-600 group-hover:text-blue-50 text-sm leading-relaxed">
              Menjadi kawah candradimuka atlet bulutangkis yang religius, disiplin, dan berprestasi dunia.
            </p>
          </div>

          <div className="p-8 bg-slate-50 rounded-3xl hover:bg-blue-600 group transition-all duration-300">
            <Award className="text-blue-600 group-hover:text-white mb-6" size={40} />
            <h4 className="text-xl font-bold text-slate-900 group-hover:text-white mb-3">Misi</h4>
            <p className="text-slate-600 group-hover:text-blue-50 text-sm leading-relaxed">
              Menyelenggarakan pembinaan terukur dan kompetisi rutin untuk mengasah mental juara.
            </p>
          </div>

          <div className="p-8 bg-slate-50 rounded-3xl hover:bg-blue-600 group transition-all duration-300">
            <Users className="text-blue-600 group-hover:text-white mb-6" size={40} />
            <h4 className="text-xl font-bold text-slate-900 group-hover:text-white mb-3">Koneksi</h4>
            <p className="text-slate-600 group-hover:text-blue-50 text-sm leading-relaxed">
              Membangun jejaring dengan klub nasional untuk menyalurkan atlet berbakat ke jenjang lebih tinggi.
            </p>
          </div>

          <div className="p-8 bg-slate-50 rounded-3xl hover:bg-blue-600 group transition-all duration-300">
            <MapPin className="text-blue-600 group-hover:text-white mb-6" size={40} />
            <h4 className="text-xl font-bold text-slate-900 group-hover:text-white mb-3">Akses</h4>
            <p className="text-slate-600 group-hover:text-blue-50 text-sm leading-relaxed">
              Menyediakan wadah olahraga yang inklusif bagi masyarakat Parepare dan sekitarnya.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}