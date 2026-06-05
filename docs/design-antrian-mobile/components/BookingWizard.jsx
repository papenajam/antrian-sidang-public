// Booking Wizard — 4 steps per PRD:
//  1. Validasi (nomor perkara + NIK)
//  2. Pilih Slot
//  3. Konfirmasi
//  4. Tiket digital + QR

const Stepper = ({ step }) => {
  const steps = ["Validasi", "Pilih Slot", "Konfirmasi", "Tiket"];
  return (
    <div className="as-stepper">
      {steps.map((s, i) => {
        const n = i + 1;
        const state = n < step ? "is-done" : n === step ? "is-active" : "";
        return (
          <div key={s} className={`as-step-pill ${state}`}>
            <span className="n">{n < step ? "✓" : n}</span>
            <span>Langkah {n} — {s}</span>
          </div>
        );
      })}
    </div>
  );
};

const fmtNomor = (s) => s.replace(/\s+/g, "").toUpperCase();

const StepValidate = ({ form, setForm, error }) => (
  <>
    <div className="as-alert info">
      <div className="ico">i</div>
      <div>
        Masukkan <strong>nomor perkara</strong> sesuai dokumen panggilan sidang dan <strong>NIK</strong> 16 digit
        yang terdaftar sebagai pihak. Data Anda hanya dipakai untuk verifikasi dan tidak disimpan.
      </div>
    </div>

    <div className="as-row">
      <div className="as-field">
        <label>Nomor Perkara <span className="req">*</span></label>
        <input
          className={`as-input ${error?.nomor ? "error" : ""}`}
          placeholder="1234/Pdt.G/2026/PA.Pnj"
          value={form.nomor}
          onChange={(e) => setForm({ ...form, nomor: e.target.value })}
        />
        {error?.nomor && <span className="err">! {error.nomor}</span>}
        <span className="hint">Format: nomor/jenis/tahun/instansi</span>
      </div>
      <div className="as-field">
        <label>NIK Pemohon <span className="req">*</span></label>
        <input
          className={`as-input ${error?.nik ? "error" : ""}`}
          placeholder="16 digit · 3201XXXXXXXXXXXX"
          inputMode="numeric"
          maxLength={16}
          value={form.nik}
          onChange={(e) => setForm({ ...form, nik: e.target.value.replace(/\D/g, "").slice(0, 16) })}
        />
        {error?.nik && <span className="err">! {error.nik}</span>}
        <span className="hint">{form.nik.length}/16 digit</span>
      </div>
    </div>
    <div className="as-row">
      <div className="as-field">
        <label>Nama Lengkap <span className="req">*</span></label>
        <input
          className="as-input"
          placeholder="Sesuai KTP"
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
        />
      </div>
      <div className="as-field">
        <label>No. WhatsApp / Telepon</label>
        <input
          className="as-input"
          placeholder="081XXXXXXXXX"
          inputMode="tel"
          value={form.telp}
          onChange={(e) => setForm({ ...form, telp: e.target.value })}
        />
        <span className="hint">Untuk notifikasi panggilan antrian</span>
      </div>
    </div>
  </>
);

const StepSlot = ({ slot, setSlot, slots }) => (
  <>
    <div className="as-alert info">
      <div className="ico">i</div>
      <div>
        Pilih slot waktu kedatangan Anda. Tiap slot menampung <strong>8 antrian</strong>. Datanglah
        15 menit sebelum slot dimulai untuk registrasi ulang.
      </div>
    </div>
    <p style={{ fontFamily: "var(--font-mono)", fontSize: ".75rem", letterSpacing: ".14em", textTransform: "uppercase", margin: "0 0 1rem", opacity: .65 }}>
      [ Slot tersedia · Senin, 23 Mei 2026 ]
    </p>
    <div className="as-slots">
      {slots.map((s) => {
        const avail = s.capacity - s.booked;
        const isFull = avail <= 0;
        const sel = slot?.time === s.time;
        return (
          <button
            key={s.time}
            className={`as-slot ${sel ? "is-selected" : ""} ${isFull ? "is-full" : ""}`}
            disabled={isFull}
            onClick={() => setSlot(s)}
          >
            <span className="time">{s.time}</span>
            {isFull ? (
              <span className="badge">Penuh</span>
            ) : (
              <span className="cap">{avail} dari {s.capacity} tersedia</span>
            )}
            <span className="bar"><i style={{ width: `${(s.booked / s.capacity) * 100}%` }}/></span>
          </button>
        );
      })}
    </div>
  </>
);

const StepConfirm = ({ form, slot, perkara }) => (
  <>
    <div className="as-alert warn">
      <div className="ico">!</div>
      <div>
        Mohon periksa kembali data Anda. Setelah dikonfirmasi, slot akan terkunci atas nama Anda. Untuk mengganti, gunakan menu <strong>Ganti Jadwal</strong>.
      </div>
    </div>
    <div className="as-confirm">
      <div className="as-confirm-row"><span className="lbl">Nomor Perkara</span><span className="val">{form.nomor}</span></div>
      <div className="as-confirm-row"><span className="lbl">Jenis Perkara</span><span className="val">{perkara?.jenis || "Cerai Gugat"}</span></div>
      <div className="as-confirm-row"><span className="lbl">Nama Pemohon</span><span className="val">{form.nama || "—"}</span></div>
      <div className="as-confirm-row"><span className="lbl">NIK</span><span className="val">{form.nik.replace(/(\d{4})(?=\d)/g, "$1 ")}</span></div>
      <div className="as-confirm-row"><span className="lbl">Waktu Kedatangan</span><span className="val">{slot?.time} WITA</span></div>
      <div className="as-confirm-row"><span className="lbl">Estimasi Antrian</span><span className="val">Posisi ke-{slot?.booked + 1} dari {slot?.capacity}</span></div>
      <div className="as-confirm-row"><span className="lbl">Notifikasi</span><span className="val">{form.telp || "Tidak ada"}</span></div>
      <div className="as-confirm-row"><span className="lbl">Tanggal Sidang</span><span className="val">Senin, 23 Mei 2026</span></div>
    </div>
  </>
);

// Procedural QR-like SVG (decorative — not a real encoder). Stable per seed.
const FakeQR = ({ seed = "QUEUE", size = 25 }) => {
  const grid = React.useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const g = [];
    const rand = () => { h = (h * 1664525 + 1013904223) >>> 0; return (h % 1000) / 1000; };
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        // corner finder patterns
        const inFinder = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
        if (inFinder) {
          const px = x < 7 ? x : (size - 1 - x);
          const py = y < 7 ? y : (size - 1 - y);
          const onRing = (px === 0 || px === 6 || py === 0 || py === 6);
          const onCore = (px >= 2 && px <= 4 && py >= 2 && py <= 4);
          row.push(onRing || onCore ? 1 : 0);
        } else {
          row.push(rand() > 0.52 ? 1 : 0);
        }
      }
      g.push(row);
    }
    return g;
  }, [seed, size]);
  const cell = 8;
  const px = size * cell;
  return (
    <svg viewBox={`0 0 ${px} ${px}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={px} height={px} fill="#000" />
      {grid.map((row, y) => row.map((v, x) => v ? (
        <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="#fff" />
      ) : null))}
    </svg>
  );
};

const StepTicket = ({ form, slot, perkara, queueNumber, onCopy, onPrint, copied }) => (
  <>
    <div className="as-alert success">
      <div className="ico">✓</div>
      <div>
        <strong>Pendaftaran berhasil.</strong> Simpan tiket digital ini. Anda dapat
        menunjukkan QR code di loket pengadilan, atau cetak untuk arsip pribadi.
      </div>
    </div>
    <div className="as-ticket">
      <div className="as-ticket-main">
        <span className="as-ticket-kicker">Antrian Sidang · Pengadilan Agama Penajam</span>
        <span className="as-ticket-num">{queueNumber}</span>
        <div className="as-ticket-row">
          <span className="lbl">Atas Nama</span>
          <span className="val">{form.nama || "—"}</span>
        </div>
        <div className="as-ticket-row">
          <span className="lbl">Nomor Perkara</span>
          <span className="val">{form.nomor}</span>
        </div>
        <div className="as-row" style={{ gap: 0, marginTop: ".5rem" }}>
          <button className="as-btn ghost on-dark sm" onClick={onCopy}>{copied ? "✓ Tersalin" : "Salin Nomor"}</button>
          <button className="as-btn ghost on-dark sm" onClick={onPrint} style={{ marginLeft: -2 }}>Cetak Tiket</button>
        </div>
      </div>
      <div className="as-ticket-side">
        <div className="as-ticket-row">
          <span className="lbl">Tanggal · Waktu</span>
          <span className="val">23 Mei 2026 · {slot?.time} WITA</span>
        </div>
        <div className="as-ticket-row">
          <span className="lbl">Estimasi Mulai</span>
          <span className="val">±{slot?.time} – {addMin(slot?.time, 30)} WITA</span>
        </div>
        <div className="as-ticket-row">
          <span className="lbl">Ruang</span>
          <span className="val">Akan diumumkan saat panggilan</span>
        </div>
        <div className="as-qr" aria-label="QR code antrian">
          <FakeQR seed={queueNumber + form.nik} />
        </div>
      </div>
    </div>
    <p style={{ fontFamily: "var(--font-mono)", fontSize: ".75rem", marginTop: "1.25rem", opacity: .55, textAlign: "center", letterSpacing: ".06em" }}>
      Notifikasi WhatsApp akan dikirim ke {form.telp || "(tidak terdaftar)"} 30 menit sebelum panggilan.
    </p>
  </>
);

const addMin = (hhmm, mins) => {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const t = h * 60 + m + mins;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

const BookingWizard = ({ open, onClose }) => {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState({ nomor: "", nik: "", nama: "", telp: "" });
  const [error, setError] = React.useState({});
  const [slot, setSlot] = React.useState(null);
  const [perkara, setPerkara] = React.useState(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setStep(1);
      setForm({ nomor: "", nik: "", nama: "", telp: "" });
      setError({});
      setSlot(null);
      setPerkara(null);
      setCopied(false);
    }
  }, [open]);

  // Pretend validate against API (uses sample db)
  const validateStep1 = () => {
    const errs = {};
    if (!/^\d+\/[A-Za-z.]+\/\d{4}\/PA\.[A-Za-z]+$/.test(form.nomor.trim())) {
      errs.nomor = "Format nomor perkara tidak sesuai.";
    }
    if (form.nik.length !== 16) errs.nik = "NIK harus 16 digit.";
    if (!form.nama.trim()) errs.nama = "Nama wajib diisi.";
    setError(errs);
    if (Object.keys(errs).length) return false;
    // mock perkara lookup
    const found = window.AS_DATA.PERKARA_DB.find((p) => p.nomor.toLowerCase() === form.nomor.trim().toLowerCase());
    setPerkara(found || { nomor: form.nomor, jenis: "Cerai Gugat" });
    return true;
  };

  const queueNumber = React.useMemo(() => {
    if (!slot) return "S-???";
    const base = 21 + Math.floor(Math.random() * 6);
    return `S-${String(base).padStart(3, "0")}`;
  }, [slot, step]);

  const onCopy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(queueNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onPrint = () => window.print();

  if (!open) return null;

  return (
    <div className="as-modal-backdrop" onClick={(e) => { if (e.target.classList.contains("as-modal-backdrop")) onClose(); }}>
      <div className="as-modal" role="dialog" aria-modal="true" data-screen-label={`Booking · Step ${step}`}>
        <div className="as-modal-head">
          <div className="as-modal-title">
            <span className="kicker">/public/queue/book</span>
            <h3>Daftar Antrian Sidang</h3>
          </div>
          <button className="as-modal-close" onClick={onClose} aria-label="Tutup">× Tutup</button>
        </div>
        <Stepper step={step} />

        <div className="as-modal-body">
          {step === 1 && <StepValidate form={form} setForm={setForm} error={error} />}
          {step === 2 && <StepSlot slot={slot} setSlot={setSlot} slots={window.AS_DATA.SLOTS} />}
          {step === 3 && <StepConfirm form={form} slot={slot} perkara={perkara} />}
          {step === 4 && <StepTicket form={form} slot={slot} perkara={perkara} queueNumber={queueNumber} onCopy={onCopy} onPrint={onPrint} copied={copied} />}
        </div>

        <div className="as-modal-foot">
          {step > 1 && step < 4 && (
            <button className="as-btn ghost" onClick={() => setStep((s) => s - 1)}>← Kembali</button>
          )}
          {step === 1 && (
            <>
              <button className="as-btn ghost" onClick={onClose}>Batal</button>
              <button className="as-btn primary" onClick={() => { if (validateStep1()) setStep(2); }}>Verifikasi & Lanjut →</button>
            </>
          )}
          {step === 2 && (
            <button className="as-btn primary" onClick={() => slot && setStep(3)} disabled={!slot}>Lanjut ke Konfirmasi →</button>
          )}
          {step === 3 && (
            <button className="as-btn primary" onClick={() => setStep(4)}>Konfirmasi Pendaftaran ✓</button>
          )}
          {step === 4 && (
            <>
              <button className="as-btn ghost" onClick={onClose}>Selesai</button>
              <button className="as-btn primary" onClick={() => { setStep(1); setForm({ nomor: "", nik: "", nama: "", telp: "" }); setSlot(null); }}>Daftarkan Pihak Lain →</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

window.BookingWizard = BookingWizard;
window.FakeQR = FakeQR;
