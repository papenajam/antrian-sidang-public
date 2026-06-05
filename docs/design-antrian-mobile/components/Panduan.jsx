// Panduan (how it works) + Footer

const Panduan = ({ onBook }) => {
  const STEPS = [
    { num: "01", title: "Verifikasi Data", body: "Masukkan nomor perkara dan NIK 16 digit. Sistem akan mengecek validasi pihak terdaftar di SIPP secara otomatis." },
    { num: "02", title: "Pilih Slot Waktu", body: "Grid slot 30 menit dengan kapasitas 8 antrian per slot. Slot yang penuh akan otomatis dinonaktifkan." },
    { num: "03", title: "Konfirmasi", body: "Periksa ringkasan booking Anda. Setelah dikonfirmasi, slot akan terkunci atas nama Anda." },
    { num: "04", title: "Tiket Digital", body: "Dapatkan nomor antrian + QR code. Cetak atau simpan sebagai bukti registrasi di loket pengadilan." },
  ];

  return (
    <section className="as-section" id="sec-panduan" data-screen-label="Panduan">
      <div className="as-section-head">
        <div>
          <p className="kicker">Empat langkah · ±2 menit</p>
          <h2 className="jk-h2">Cara mendaftar antrian</h2>
        </div>
        <div className="ctrls">
          <button className="as-btn primary lg" onClick={onBook}>Mulai Daftar →</button>
        </div>
      </div>
      <div className="as-steps">
        {STEPS.map((s) => (
          <div key={s.num} className="as-step">
            <span className="num">{s.num}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            <div style={{ flex: 1 }} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: ".7rem", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--fg-4)", paddingTop: ".75rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
              <span style={{ flex: 1, height: 1, background: "var(--border)" }}></span>
              Step {s.num} / 04
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const FooterCta = ({ onBook }) => {
  return (
    <>
      <section className="as-footer-cta" data-screen-label="Footer CTA">
        <p style={{ fontFamily: "var(--font-mono)", fontSize: ".82rem", letterSpacing: 0, textTransform: "none", color: "rgba(255,255,255,.55)", margin: "0 0 1.25rem", display: "inline-flex", alignItems: "center", gap: ".5rem", justifyContent: "center" }}>
          <span style={{ width: 6, height: 6, background: "#34d399", borderRadius: 99, display: "inline-block" }}></span>
          Siap mendaftar?
        </p>
        <h2 className="jk-h2">Hemat waktu.<br/>Daftar online.</h2>
        <p>Tidak perlu antre berjam-jam di gedung pengadilan. Daftar dari rumah, datang sesuai slot Anda, selesai.</p>
        <div style={{ display: "inline-flex", gap: ".65rem" }}>
          <button className="as-btn lg accent" onClick={onBook}>Daftar Antrian Sekarang →</button>
          <button className="as-btn lg ghost on-dark">Pelajari Selengkapnya</button>
        </div>
      </section>
      <footer className="as-footer">
        <div>
          <span className="lbl">Instansi</span>
          Pengadilan Agama Penajam
        </div>
        <div>
          <span className="lbl">Jam Operasional</span>
          Sen — Jum · 08:00 — 16:00 WITA
        </div>
        <div>
          <span className="lbl">Sistem</span>
          v0.1.0 · MVP · Live
        </div>
        <div>
          <span className="lbl">Kontak</span>
          (0542) 7654321
        </div>
      </footer>
    </>
  );
};

window.Panduan = Panduan;
window.FooterCta = FooterCta;
