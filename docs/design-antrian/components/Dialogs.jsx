// Cek Status Mandiri dialog and Reschedule dialog.

const CekStatusDialog = ({ open, onClose }) => {
  const [qn, setQn] = React.useState("");
  const [nik, setNik] = React.useState("");
  const [result, setResult] = React.useState(null);

  React.useEffect(() => {
    if (open) { setQn(""); setNik(""); setResult(null); }
  }, [open]);

  if (!open) return null;

  const check = () => {
    // mock lookup
    const target = qn.trim().toUpperCase() || "S-019";
    const found = window.AS_DATA.SCHEDULE.find((s) => s.qn === target);
    if (found) {
      const pos = window.AS_DATA.SCHEDULE.findIndex((s) => s.qn === target) - 2;
      setResult({ ...found, pos: Math.max(0, pos) });
    } else {
      setResult({ notFound: true, qn: target });
    }
  };

  return (
    <div className="as-modal-backdrop" onClick={(e) => { if (e.target.classList.contains("as-modal-backdrop")) onClose(); }}>
      <div className="as-modal" style={{ width: "min(640px, 100%)" }} role="dialog" data-screen-label="Cek Status">
        <div className="as-modal-head">
          <div className="as-modal-title">
            <span className="kicker">/public/queue/status/:nomor</span>
            <h3>Cek Status Antrian</h3>
          </div>
          <button className="as-modal-close" onClick={onClose}>× Tutup</button>
        </div>
        <div className="as-modal-body">
          {!result && (
            <>
              <div className="as-alert info">
                <div className="ico">i</div>
                <div>Masukkan nomor antrian Anda untuk melihat posisi dan estimasi waktu panggilan.</div>
              </div>
              <div className="as-field">
                <label>Nomor Antrian <span className="req">*</span></label>
                <input
                  className="as-input"
                  placeholder="S-014"
                  value={qn}
                  onChange={(e) => setQn(e.target.value.toUpperCase())}
                />
                <span className="hint">Format: S-NNN sesuai tiket Anda</span>
              </div>
              <div className="as-field">
                <label>NIK (verifikasi)</label>
                <input
                  className="as-input"
                  placeholder="16 digit"
                  inputMode="numeric"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, "").slice(0, 16))}
                />
              </div>
            </>
          )}
          {result && result.notFound && (
            <div className="as-alert warn">
              <div className="ico">!</div>
              <div>Nomor antrian <strong>{result.qn}</strong> tidak ditemukan. Periksa kembali atau hubungi loket informasi.</div>
            </div>
          )}
          {result && !result.notFound && (
            <>
              <div className="as-callup" style={{ marginTop: 0, gridTemplateColumns: "1fr" }}>
                <div className="as-callup-main" style={{ borderRight: 0 }}>
                  <span className="as-callup-tag">
                    <span className="pulse" style={{ background: result.status === "live" ? "#22c55e" : "#eab308" }}/>
                    {result.status === "live" ? "Sedang Dipanggil" : result.status === "done" ? "Sudah Selesai" : "Menunggu Giliran"}
                  </span>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "clamp(64px, 9vw, 120px)", lineHeight: ".9", letterSpacing: "-.04em" }}>
                    {result.qn}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: ".85rem", opacity: .65, letterSpacing: ".08em" }}>{result.nomor_perkara} · {result.jenis}</div>
                </div>
              </div>
              <div className="as-confirm" style={{ marginTop: "1rem" }}>
                <div className="as-confirm-row"><span className="lbl">Posisi</span><span className="val">{result.pos === 0 ? "Berikutnya" : `${result.pos} antrian lagi`}</span></div>
                <div className="as-confirm-row"><span className="lbl">Estimasi Panggilan</span><span className="val">±{result.pos * 16 + 5} menit lagi</span></div>
                <div className="as-confirm-row"><span className="lbl">Ruang Sidang</span><span className="val">{result.ruang}</span></div>
                <div className="as-confirm-row"><span className="lbl">Agenda</span><span className="val">{result.agenda}</span></div>
              </div>
            </>
          )}
        </div>
        <div className="as-modal-foot">
          {!result && (
            <>
              <button className="as-btn ghost" onClick={onClose}>Batal</button>
              <button className="as-btn primary" onClick={check}>Cek Status →</button>
            </>
          )}
          {result && (
            <>
              <button className="as-btn ghost" onClick={() => setResult(null)}>← Cek Lain</button>
              <button className="as-btn primary" onClick={onClose}>Tutup</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const RescheduleDialog = ({ open, onClose }) => {
  const [slot, setSlot] = React.useState(null);
  const [done, setDone] = React.useState(false);
  const slots = window.AS_DATA.SLOTS.map((s) => s.time === "10:00" ? { ...s, current: true } : s);

  React.useEffect(() => { if (open) { setSlot(null); setDone(false); } }, [open]);
  if (!open) return null;

  return (
    <div className="as-modal-backdrop" onClick={(e) => { if (e.target.classList.contains("as-modal-backdrop")) onClose(); }}>
      <div className="as-modal" role="dialog" data-screen-label="Reschedule">
        <div className="as-modal-head">
          <div className="as-modal-title">
            <span className="kicker">PUT /public/queue/reschedule</span>
            <h3>Ganti Jadwal Antrian</h3>
          </div>
          <button className="as-modal-close" onClick={onClose}>× Tutup</button>
        </div>
        <div className="as-modal-body">
          {done ? (
            <div className="as-alert success">
              <div className="ico">✓</div>
              <div><strong>Jadwal berhasil dipindahkan.</strong> Nomor antrian Anda <strong style={{ fontFamily: "var(--font-mono)" }}>S-014</strong> tidak berubah. Slot baru: <strong>{slot?.time} WITA</strong>.</div>
            </div>
          ) : (
            <>
              <div className="as-alert warn">
                <div className="ico">!</div>
                <div>Slot saat ini <strong>10:00 WITA</strong> akan dilepas. Nomor antrian <strong style={{ fontFamily: "var(--font-mono)" }}>S-014</strong> Anda tetap sama. Pilih slot baru di bawah.</div>
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: ".75rem", letterSpacing: ".14em", textTransform: "uppercase", margin: "0 0 1rem", opacity: .65 }}>
                [ Slot tersedia · Senin, 23 Mei 2026 ]
              </p>
              <div className="as-slots">
                {slots.map((s) => {
                  const avail = s.capacity - s.booked;
                  const isFull = avail <= 0 || s.current;
                  const sel = slot?.time === s.time;
                  return (
                    <button
                      key={s.time}
                      className={`as-slot ${sel ? "is-selected" : ""} ${isFull ? "is-full" : ""}`}
                      disabled={isFull}
                      onClick={() => setSlot(s)}
                    >
                      <span className="time">{s.time}</span>
                      {s.current ? <span className="badge" style={{ color: "#000" }}>Slot saat ini</span>
                        : isFull ? <span className="badge">Penuh</span>
                        : <span className="cap">{avail} dari {s.capacity} tersedia</span>}
                      <span className="bar"><i style={{ width: `${(s.booked / s.capacity) * 100}%` }}/></span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div className="as-modal-foot">
          {done ? (
            <button className="as-btn primary" onClick={onClose}>Selesai</button>
          ) : (
            <>
              <button className="as-btn ghost" onClick={onClose}>Batal</button>
              <button className="as-btn primary" disabled={!slot} onClick={() => setDone(true)}>Ganti ke Slot Baru →</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

window.CekStatusDialog = CekStatusDialog;
window.RescheduleDialog = RescheduleDialog;
