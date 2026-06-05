// Bottom-sheet booking wizard — 4 steps optimized for mobile

const addMin = (hhmm, mins) => {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const t = h * 60 + m + mins;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

const SlotGrid = ({ slot, setSlot, slots }) => (
  <div className="m-slots">
    {slots.map((s) => {
      const avail = s.capacity - s.booked;
      const isFull = avail <= 0;
      const sel = slot?.time === s.time;
      return (
        <button
          key={s.time}
          className={`m-slot ${sel ? "is-selected" : ""} ${isFull ? "is-full" : ""}`}
          disabled={isFull}
          onClick={() => setSlot(s)}
        >
          <div className="time">{s.time}</div>
          <div className="cap">{isFull ? "Penuh" : `${avail}/${s.capacity}`}</div>
          <div className="bar"><i style={{ width: `${(s.booked / s.capacity) * 100}%` }} /></div>
        </button>
      );
    })}
  </div>
);

const SheetDaftar = ({ open, onClose, slots }) => {
  const I = window.Icons;
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState({ nomor: "", nik: "", nama: "", telp: "" });
  const [error, setError] = React.useState({});
  const [slot, setSlot] = React.useState(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (open) { setStep(1); setForm({ nomor: "", nik: "", nama: "", telp: "" }); setError({}); setSlot(null); setCopied(false); }
  }, [open]);

  const queueNumber = React.useMemo(() => {
    const base = 21 + Math.floor(Math.random() * 6);
    return `S-${String(base).padStart(3, "0")}`;
  }, [slot, step === 4]);

  if (!open) return null;

  const validateStep1 = () => {
    const errs = {};
    if (!/^\d+\/[A-Za-z.]+\/\d{4}\/PA\.[A-Za-z]+$/i.test(form.nomor.trim())) errs.nomor = "Format nomor perkara tidak sesuai.";
    if (form.nik.length !== 16) errs.nik = "NIK harus 16 digit.";
    if (!form.nama.trim()) errs.nama = "Nama wajib diisi.";
    setError(errs);
    return Object.keys(errs).length === 0;
  };

  const titles = ["Verifikasi Data", "Pilih Slot Waktu", "Konfirmasi", "Tiket Anda"];

  return (
    <>
      <div className="m-sheet-backdrop" onClick={onClose} />
      <div className="m-sheet">
        <div className="m-sheet-handle" />
        <div className="m-sheet-head">
          <div>
            <h3>{titles[step - 1]}</h3>
            <div style={{ fontSize: ".7rem", color: "var(--fg-3)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
              Langkah {step} dari 4
            </div>
          </div>
          <button className="closebtn" onClick={onClose} aria-label="Tutup">
            <I.close size={18} />
          </button>
        </div>

        <div className="m-sheet-body">
          {/* progress */}
          <div className="m-stepper">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={`seg ${n < step ? "is-done" : n === step ? "is-active" : ""}`} />
            ))}
          </div>

          {step === 1 && (
            <>
              <div className="m-alert info">
                <span className="ico"><I.info size={14} /></span>
                <span>Masukkan nomor perkara sesuai dokumen panggilan sidang Anda.</span>
              </div>
              <div className="m-field">
                <label>Nomor Perkara <span className="req">*</span></label>
                <input className="m-input" placeholder="1234/Pdt.G/2026/PA.Pnj" value={form.nomor} onChange={(e) => setForm({ ...form, nomor: e.target.value })} />
                {error.nomor && <div className="err">! {error.nomor}</div>}
              </div>
              <div className="m-field">
                <label>NIK Pemohon <span className="req">*</span></label>
                <input
                  className="m-input"
                  inputMode="numeric"
                  maxLength={16}
                  placeholder="16 digit"
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                />
                <div className="hint">{form.nik.length}/16 digit</div>
                {error.nik && <div className="err">! {error.nik}</div>}
              </div>
              <div className="m-field">
                <label>Nama Lengkap <span className="req">*</span></label>
                <input className="m-input" placeholder="Sesuai KTP" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
              </div>
              <div className="m-field">
                <label>WhatsApp / Telepon</label>
                <input className="m-input" inputMode="tel" placeholder="081XXXXXXXXX" value={form.telp} onChange={(e) => setForm({ ...form, telp: e.target.value })} />
                <div className="hint">Untuk notifikasi panggilan antrian</div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="m-alert info">
                <span className="ico"><I.clock size={14} /></span>
                <span>Pilih slot kedatangan. Datanglah 15 menit lebih awal untuk registrasi ulang.</span>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: ".72rem", color: "var(--fg-3)", marginBottom: 10, letterSpacing: ".04em", textTransform: "uppercase" }}>
                Slot Tersedia · Sen, 23 Mei
              </div>
              <SlotGrid slot={slot} setSlot={setSlot} slots={slots} />
            </>
          )}

          {step === 3 && (
            <>
              <div className="m-alert warn">
                <span className="ico"><I.alert size={14} /></span>
                <span>Periksa kembali data Anda. Slot akan terkunci atas nama Anda setelah konfirmasi.</span>
              </div>
              <div className="m-summary">
                <div className="row"><span className="l">Nomor Perkara</span><span className="v">{form.nomor || "—"}</span></div>
                <div className="row"><span className="l">Nama</span><span className="v">{form.nama || "—"}</span></div>
                <div className="row"><span className="l">NIK</span><span className="v">{form.nik.replace(/(\d{4})(?=\d)/g, "$1 ") || "—"}</span></div>
                <div className="row"><span className="l">Slot</span><span className="v">{slot?.time} WITA</span></div>
                <div className="row"><span className="l">Tanggal</span><span className="v">23 Mei 2026</span></div>
                <div className="row"><span className="l">Estimasi</span><span className="v">±{slot?.time} – {addMin(slot?.time, 30)}</span></div>
                <div className="row"><span className="l">Notifikasi WA</span><span className="v">{form.telp || "—"}</span></div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="m-success">
                <div style={{
                  width: 64, height: 64, margin: "0 auto 14px",
                  borderRadius: 999,
                  background: "var(--primary-soft)",
                  color: "var(--primary-3)",
                  display: "grid", placeItems: "center",
                  border: "2px solid color-mix(in oklab, var(--primary) 25%, transparent)",
                }}><I.check size={32} /></div>
                <p className="big">{queueNumber}</p>
                <p style={{ fontSize: ".88rem", color: "var(--fg-3)", margin: "8px 0 0", fontFamily: "var(--font-mono)" }}>
                  Nomor antrian Anda
                </p>
              </div>

              <div className="m-ticket" style={{ marginTop: 18 }}>
                <div className="m-ticket-top">
                  <p className="kicker">Pengadilan Agama Penajam</p>
                  <div className="m-ticket-num" style={{ fontSize: 60 }}>{queueNumber}</div>
                  <div className="m-ticket-name">{form.nama || "—"}</div>
                  <div className="m-ticket-meta">{form.nomor}</div>
                </div>
                <div className="m-ticket-cut"><div className="dash" /></div>
                <div className="m-ticket-bot">
                  <div className="row"><span className="l">Tanggal</span><span className="v">23 Mei 2026</span></div>
                  <div className="row"><span className="l">Slot</span><span className="v">{slot?.time} WITA</span></div>
                  <div className="row"><span className="l">Estimasi</span><span className="v">±{slot?.time} – {addMin(slot?.time, 30)}</span></div>
                  <div className="m-ticket-qr">
                    <window.FakeQR seed={queueNumber + (form.nik || "")} />
                  </div>
                </div>
              </div>

              <div className="m-ticket-actions" style={{ marginTop: 12 }}>
                <button className="m-btn" onClick={() => { navigator.clipboard?.writeText(queueNumber); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                  <I.copy size={16} /> {copied ? "Tersalin" : "Salin"}
                </button>
                <button className="m-btn"><I.share size={16} /> Bagikan</button>
              </div>

              <p style={{ fontSize: ".75rem", color: "var(--fg-3)", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
                Notifikasi WhatsApp akan dikirim ke <strong>{form.telp || "(tidak terdaftar)"}</strong><br />
                30 menit sebelum giliran Anda dipanggil.
              </p>
            </>
          )}
        </div>

        <div className="m-sheet-foot">
          {step === 1 && (
            <>
              <button className="m-btn" onClick={onClose}>Batal</button>
              <button className="m-btn primary" onClick={() => { if (validateStep1()) setStep(2); }}>Verifikasi & Lanjut</button>
            </>
          )}
          {step === 2 && (
            <>
              <button className="m-btn" onClick={() => setStep(1)}>Kembali</button>
              <button className="m-btn primary" disabled={!slot} onClick={() => setStep(3)}>Lanjut</button>
            </>
          )}
          {step === 3 && (
            <>
              <button className="m-btn" onClick={() => setStep(2)}>Kembali</button>
              <button className="m-btn accent" onClick={() => setStep(4)}>Konfirmasi Pendaftaran</button>
            </>
          )}
          {step === 4 && (
            <button className="m-btn primary" style={{ flex: 1 }} onClick={onClose}>Selesai</button>
          )}
        </div>
      </div>
    </>
  );
};

// Cek status dialog (lightweight inline modal — uses bottom sheet style)
const SheetCekStatus = ({ open, onClose, schedule }) => {
  const I = window.Icons;
  const [qn, setQn] = React.useState("");
  const [result, setResult] = React.useState(null);

  React.useEffect(() => { if (open) { setQn(""); setResult(null); } }, [open]);
  if (!open) return null;

  const check = () => {
    const target = (qn.trim().toUpperCase() || "S-014");
    const found = schedule.find((s) => s.qn === target);
    if (!found) { setResult({ notFound: true, qn: target }); return; }
    const idx = schedule.findIndex((s) => s.qn === target);
    const ahead = schedule.slice(0, idx).filter((s) => s.status === "scheduled" || s.status === "live").length;
    setResult({ ...found, pos: ahead });
  };

  return (
    <>
      <div className="m-sheet-backdrop" onClick={onClose} />
      <div className="m-sheet" style={{ maxHeight: "75%" }}>
        <div className="m-sheet-handle" />
        <div className="m-sheet-head">
          <h3>Cek Status Antrian</h3>
          <button className="closebtn" onClick={onClose}><I.close size={18} /></button>
        </div>
        <div className="m-sheet-body">
          {!result && (
            <>
              <div className="m-alert info">
                <span className="ico"><I.info size={14} /></span>
                <span>Masukkan nomor antrian Anda (S-NNN) untuk melihat posisi & estimasi panggilan.</span>
              </div>
              <div className="m-field">
                <label>Nomor Antrian</label>
                <input className="m-input" placeholder="S-014" value={qn} onChange={(e) => setQn(e.target.value.toUpperCase())} />
                <div className="hint">Format sesuai tiket Anda</div>
              </div>
            </>
          )}
          {result && result.notFound && (
            <div className="m-alert warn">
              <span className="ico"><I.alert size={14} /></span>
              <span>Nomor antrian <strong>{result.qn}</strong> tidak ditemukan. Periksa kembali atau hubungi loket informasi.</span>
            </div>
          )}
          {result && !result.notFound && (
            <>
              <div className="m-callup" style={{ marginTop: 0 }}>
                <span className="m-callup-tag" style={{
                  background: result.status === "live" ? "rgba(234,88,12,.18)" : "rgba(212,160,23,.18)",
                  borderColor: result.status === "live" ? "rgba(234,88,12,.4)" : "rgba(212,160,23,.4)",
                  color: result.status === "live" ? "#fdba74" : "var(--gold-3)",
                }}>
                  <span className="pip" style={{ background: result.status === "live" ? "var(--accent-2)" : "var(--gold-2)" }} />
                  {result.status === "live" ? "Sedang Dipanggil" : result.status === "done" ? "Sudah Selesai" : "Menunggu Giliran"}
                </span>
                <div className="m-callup-num">{result.qn}</div>
                <div className="m-callup-name">{result.pihak}</div>
                <div className="m-callup-meta">{result.nomor_perkara}</div>
                <div className="m-callup-stats">
                  <div>
                    <div className="v">{result.pos === 0 ? "—" : result.pos}</div>
                    <div className="l">Antrian Sebelum</div>
                  </div>
                  <div>
                    <div className="v">±{result.pos * 16 + 5}m</div>
                    <div className="l">Estimasi</div>
                  </div>
                  <div>
                    <div className="v" style={{ fontSize: "1rem" }}>{result.ruang}</div>
                    <div className="l">Ruang</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="m-sheet-foot">
          {!result && (
            <>
              <button className="m-btn" onClick={onClose}>Batal</button>
              <button className="m-btn primary" onClick={check}>Cek Status</button>
            </>
          )}
          {result && (
            <>
              <button className="m-btn" onClick={() => setResult(null)}>Cek Lain</button>
              <button className="m-btn primary" onClick={onClose}>Tutup</button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

window.SheetDaftar = SheetDaftar;
window.SheetCekStatus = SheetCekStatus;
