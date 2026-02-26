export function KelolaSurat() {
  const [suratList, setSuratList] = useState([]);
  const [jenisFilter, setJenisFilter] = useState('KELUAR');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER KONTROL */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black italic text-slate-900">MANAJEMEN <span className="text-blue-600">SURAT</span></h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Arsip Digital & TTD Elektronik</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2">
            <Plus size={16} /> BUAT SURAT KELUAR
          </button>
        </div>
      </div>

      {/* TAB SURAT MASUK / KELUAR */}
      <div className="flex gap-2 p-1 bg-slate-100 w-fit rounded-2xl">
        <button 
          onClick={() => setJenisFilter('KELUAR')}
          className={`px-8 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all ${jenisFilter === 'KELUAR' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}
        >SURAT KELUAR</button>
        <button 
          onClick={() => setJenisFilter('MASUK')}
          className={`px-8 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all ${jenisFilter === 'MASUK' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}
        >SURAT MASUK</button>
      </div>

      {/* LIST SURAT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suratList.map((surat: any) => (
          <div key={surat.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                <FileText size={24} />
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><Download size={18} /></button>
                <button className="p-2 hover:bg-rose-50 rounded-xl text-rose-500"><Trash2 size={18} /></button>
              </div>
            </div>
            <h3 className="font-black text-slate-900 leading-tight">{surat.perihal}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">No: {surat.nomor_surat}</p>
            
            <div className="mt-6 pt-4 border-t border-dashed border-slate-100 flex justify-between items-center">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                 <Calendar size={12}/> {surat.tanggal_surat}
               </span>
               <button onClick={() => cetakSuratPDF(surat)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Cetak PDF</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}