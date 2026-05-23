// Hero: big "ANTRIAN" letter grid (Jeriken-style reveal),
// then a brutalist intro box + 3 live stats.

const useTick = (ms) => {
  const [, set] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
};

const NumberTicker = ({ value, suffix = "" }) => {
  const [n, setN] = React.useState(value);
  const prev = React.useRef(value);
  React.useEffect(() => {
    let raf, start;
    const dur = 900;
    const from = prev.current;
    const to = value;
    if (from === to) return;
    const animate = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(animate);
      else prev.current = to;
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n.toLocaleString("id-ID")}{suffix}</>;
};

const FEATURES = [
  { l: "✓", w: "Verifikasi Otomatis", d: "Tervalidasi langsung dengan SIPP Mahkamah Agung — tidak perlu dokumen fisik tambahan." },
  { l: "⏱", w: "Real-time Tracking", d: "Pantau posisi antrian dan estimasi panggilan dengan sinkronisasi setiap 30 detik." },
  { l: "↻", w: "Reschedule Fleksibel", d: "Ganti slot waktu sebelum H-1 tanpa kehilangan nomor antrian Anda." },
  { l: "✦", w: "Notifikasi WhatsApp", d: "Dapatkan pemberitahuan 30 menit sebelum giliran Anda dipanggil ke ruang sidang." },
];

const Hero = ({ onBook, onScrollJadwal, stats }) => {
  return (
    <>
      <section className="as-bigbox" data-screen-label="Hero · Title">
        <p className="as-pretitle">Layanan Antrian Digital · Sistem Online</p>
        <h1 className="jk-h1">Daftar antrian sidang,<br/>tanpa antre.</h1>
        <p className="as-sub">
          Layanan digital Pengadilan Agama Penajam — daftar antrian sidang, pantau
          giliran Anda secara real-time, dan kelola jadwal tanpa harus berdesakan
          di gedung pengadilan.
        </p>
        <div className="as-meta">
          <span className="as-meta-item"><span className="as-dot live"/> Sistem Online</span>
          <span className="as-meta-item">Sinkronisasi SIPP · 30s</span>
          <span className="as-meta-item">Mahkamah Agung RI</span>
          <span className="as-meta-item" style={{ marginLeft: "auto" }}>{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
        <div className="as-row" style={{ marginTop: "2rem" }}>
          <button className="as-btn accent lg" onClick={onBook} style={{ flex: "0 0 auto" }}>
            Daftar Antrian Sekarang
            <span aria-hidden="true">→</span>
          </button>
          <button className="as-btn lg" onClick={onScrollJadwal} style={{ flex: "0 0 auto" }}>
            Lihat Jadwal Sidang
          </button>
        </div>
      </section>

      {/* feature cards */}
      <div className="as-letters">
        {FEATURES.map((it, i) => (
          <div key={i} className="as-letter" data-desc={it.d}>
            <span>{it.l}</span>
            <span className="word">{it.w}</span>
          </div>
        ))}
      </div>

      {/* live stats */}
      <div className="as-stats" data-screen-label="Hero · Stats">
        <div className="as-stat">
          <div className="label">
            <span>Antrian Terdaftar</span>
            <span className="tag">HARI INI</span>
          </div>
          <div className="num"><NumberTicker value={stats.terdaftar} /></div>
          <div className="delta">↑ 12% vs kemarin · 09:42 WITA</div>
        </div>
        <div className="as-stat">
          <div className="label">
            <span>Sidang Hari Ini</span>
            <span className="tag">SIPP</span>
          </div>
          <div className="num"><NumberTicker value={stats.sidang} /></div>
          <div className="delta">3 sedang berlangsung · 5 selesai</div>
        </div>
        <div className="as-stat dark">
          <div className="label">
            <span>Tingkat Kehadiran</span>
            <span className="tag" style={{ borderColor: "#fff" }}>30 HARI</span>
          </div>
          <div className="num"><NumberTicker value={stats.kehadiran} suffix="%" /></div>
          <div className="delta">▲ 4.2% improvement · 124/130 hadir</div>
        </div>
      </div>
    </>
  );
};

window.Hero = Hero;
window.NumberTicker = NumberTicker;
