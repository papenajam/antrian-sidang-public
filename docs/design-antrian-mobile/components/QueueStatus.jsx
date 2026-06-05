// Queue Status: shows the currently-called number, plus side panels
// for waiting / done / estimated wait. Maps to F-QUEUE-01..08.

const QueueStatus = ({ live, waiting, done, onCekStatus, onReschedule }) => {
  return (
    <section className="as-callup" id="sec-status" data-screen-label="Status Antrian">
      <div className="as-callup-main">
        <span className="as-callup-tag"><span className="pulse"/> Sedang Dipanggil</span>
        <div className="as-callup-num">{live.qn}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "1.25rem", lineHeight: 1.25 }}>{live.pihak}<span style={{ opacity: .6 }}>{live.lawan ? ` vs. ${live.lawan}` : ""}</span></div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: ".82rem", color: "rgba(255,255,255,.6)", marginTop: ".4rem" }}>{live.nomor_perkara} · {live.jenis}</div>
        </div>
        <div className="as-callup-meta">
          <strong>{live.ruang}</strong> &nbsp;·&nbsp; {live.agenda} &nbsp;·&nbsp; Mulai pukul {live.waktu} WITA
        </div>
        <div className="as-callup-actions">
          <button className="as-btn ghost on-dark" onClick={onCekStatus}>Cek Status Saya</button>
          <button className="as-btn ghost on-dark" onClick={onReschedule}>Ganti Jadwal</button>
        </div>
      </div>
      <div className="as-callup-side">
        <div className="as-callup-cell">
          <span className="lbl">Menunggu</span>
          <span className="val" style={{ fontSize: "2rem", letterSpacing: "-.03em" }}>{waiting}</span>
          <span className="lbl" style={{ opacity: .55 }}>Estimasi tunggu ±{waiting * 18} menit</span>
        </div>
        <div className="as-callup-cell">
          <span className="lbl">Selesai</span>
          <span className="val" style={{ fontSize: "2rem", letterSpacing: "-.03em" }}>{done}</span>
          <span className="lbl" style={{ opacity: .55 }}>Rata-rata 16 menit/sidang</span>
        </div>
        <div className="as-callup-cell">
          <span className="lbl">Berikutnya</span>
          <span className="val" style={{ fontSize: "1.05rem" }}>S-015 · Ruang 3</span>
          <span className="lbl" style={{ opacity: .55 }}>±10:00 WITA · Itsbat Nikah</span>
        </div>
      </div>
    </section>
  );
};

window.QueueStatus = QueueStatus;
