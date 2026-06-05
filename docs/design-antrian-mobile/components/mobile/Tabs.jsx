// Mobile tabs: Beranda, Jadwal, Tiket, Akun

const STATUS_LABEL = { live: "Berlangsung", done: "Selesai", scheduled: "Terjadwal", delayed: "Ditunda" };

// ───────── BERANDA ─────────
const TabBeranda = ({ live, waiting, done, onOpenSheet, setActive, onOpenStatus }) => {
  const I = window.Icons;
  const hour = new Date().getHours();
  const greet = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";

  return (
    <div className="m-pad">
      {/* Greeting card */}
      <div className="m-greet">
        <p className="kicker">{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h2>{greet}, Sdr/Sdri 👋</h2>
        <p>Pantau antrian sidang Anda secara real-time hari ini.</p>
      </div>

      {/* Live call-up */}
      <div className="m-callup">
        <span className="m-callup-tag"><span className="pip" /> Sedang Dipanggil</span>
        <div className="m-callup-num">{live.qn}</div>
        <div className="m-callup-name">{live.pihak}{live.lawan && <span className="vs"> vs. {live.lawan}</span>}</div>
        <div className="m-callup-meta">{live.nomor_perkara} · {live.ruang}</div>
        <div className="m-callup-stats">
          <div>
            <div className="v">{waiting}</div>
            <div className="l">Menunggu</div>
          </div>
          <div>
            <div className="v">{done}</div>
            <div className="l">Selesai</div>
          </div>
          <div>
            <div className="v">±{waiting * 18}<span style={{ fontSize: ".75rem", opacity: .7 }}>m</span></div>
            <div className="l">Estimasi</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="m-quickrow">
        <button className="m-quick" onClick={onOpenSheet}>
          <span className="ico"><I.plus size={20} /></span>
          <span className="lbl">Daftar Antrian</span>
        </button>
        <button className="m-quick" onClick={onOpenStatus}>
          <span className="ico"><I.search size={20} /></span>
          <span className="lbl">Cek Status</span>
        </button>
        <button className="m-quick" onClick={() => setActive("ticket")}>
          <span className="ico"><I.ticket size={20} /></span>
          <span className="lbl">Tiket Saya</span>
        </button>
        <button className="m-quick" onClick={() => setActive("jadwal")}>
          <span className="ico"><I.cal size={20} /></span>
          <span className="lbl">Lihat Jadwal</span>
        </button>
      </div>

      {/* Announcement */}
      <div className="m-section">
        <div className="m-section-head">
          <h3>Pengumuman</h3>
          <button className="more">Lihat semua</button>
        </div>
        <div className="m-anno">
          <div className="ico">!</div>
          <div className="body">
            <strong>Libur Hari Raya — 25 Mei 2026</strong>
            <p>Tidak ada sidang. Pendaftaran antrian tetap dapat dilakukan untuk tanggal lain.</p>
          </div>
        </div>
      </div>

      {/* Layanan */}
      <div className="m-section">
        <div className="m-section-head">
          <h3>Jenis Layanan</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { l: "Cerai Gugat", c: "var(--primary-3)", bg: "var(--primary-soft)", n: 24 },
            { l: "Cerai Talak", c: "#92580a", bg: "var(--gold-soft)", n: 18 },
            { l: "Itsbat Nikah", c: "#9a3412", bg: "var(--accent-soft)", n: 12 },
            { l: "Waris", c: "var(--fg-2)", bg: "var(--bg-muted)", n: 9 },
          ].map((s) => (
            <div key={s.l} style={{
              padding: "14px 14px",
              background: "var(--bg-elev)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              boxShadow: "var(--sh-sm)",
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: s.bg, color: s.c,
                display: "grid", placeItems: "center",
                fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: ".82rem",
                marginBottom: 8,
              }}>{s.l[0]}</div>
              <div style={{ fontSize: ".85rem", fontWeight: 600, color: "var(--fg)" }}>{s.l}</div>
              <div style={{ fontSize: ".7rem", color: "var(--fg-3)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{s.n} perkara · bulan ini</div>
            </div>
          ))}
        </div>
      </div>

      {/* About strip */}
      <div className="m-section">
        <div style={{
          background: "linear-gradient(135deg, var(--gold-soft) 0%, var(--bg-elev) 100%)",
          border: "1px solid color-mix(in oklab, var(--gold-2) 22%, transparent)",
          borderRadius: "var(--r-md)",
          padding: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "var(--gold-2)", color: "#fff",
              display: "grid", placeItems: "center",
            }}><I.shield size={20} /></div>
            <div>
              <div style={{ fontWeight: 600, fontSize: ".95rem" }}>Terverifikasi SIPP</div>
              <div style={{ fontSize: ".72rem", color: "#7c4a06", fontFamily: "var(--font-mono)" }}>Mahkamah Agung RI</div>
            </div>
          </div>
          <p style={{ fontSize: ".8rem", color: "#7c4a06", margin: 0, lineHeight: 1.5 }}>
            Data sidang disinkronkan langsung dengan Sistem Informasi Penelusuran Perkara (SIPP) setiap 30 detik.
          </p>
        </div>
      </div>
    </div>
  );
};

// ───────── JADWAL ─────────
const TabJadwal = ({ data, onScroll }) => {
  const I = window.Icons;
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState("all");

  const filters = [
    { id: "all",       label: "Semua",     count: data.length },
    { id: "live",      label: "Live",      count: data.filter(d => d.status === "live").length },
    { id: "scheduled", label: "Terjadwal", count: data.filter(d => d.status === "scheduled").length },
    { id: "done",      label: "Selesai",   count: data.filter(d => d.status === "done").length },
    { id: "delayed",   label: "Ditunda",   count: data.filter(d => d.status === "delayed").length },
  ];

  const rows = data.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (!q) return true;
    const hay = `${r.qn} ${r.nomor_perkara} ${r.pihak} ${r.lawan || ""} ${r.ruang} ${r.agenda} ${r.jenis}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="m-pad">
      <div className="m-section" style={{ marginTop: 0 }}>
        <div className="m-section-head">
          <div>
            <h3>Jadwal Sidang</h3>
            <div style={{ fontSize: ".74rem", color: "var(--fg-3)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
              <span className="as-dot live" style={{ marginRight: 6 }} />Auto-refresh 60s
            </div>
          </div>
          <button className="m-iconbtn" aria-label="Refresh"><I.refresh size={18} /></button>
        </div>

        <div className="m-daterow">
          <button className="m-iconbtn"><I.chev style={{ transform: "scaleX(-1)" }} size={18} /></button>
          <div className="m-datepill">
            <div>
              <div className="day">Hari ini</div>
              <div className="date">23 Mei 2026</div>
            </div>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: ".68rem",
              background: "var(--primary-soft)",
              padding: "4px 10px",
              borderRadius: 999,
              color: "var(--primary-3)",
              fontWeight: 600,
              border: "1px solid color-mix(in oklab, var(--primary) 20%, transparent)",
            }}>{data.length} sidang</div>
          </div>
          <button className="m-iconbtn"><I.chev size={18} /></button>
        </div>

        <div className="m-search">
          <I.search size={18} />
          <input
            placeholder="Cari perkara, pihak, ruangan..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="m-filters">
          {filters.map((f) => (
            <button key={f.id} className={`m-chip ${filter === f.id ? "is-active" : ""}`} onClick={() => setFilter(f.id)}>
              {f.label} <span className="ct">{f.count}</span>
            </button>
          ))}
        </div>

        <div className="m-schedlist">
          {rows.length === 0 && (
            <div className="m-empty">
              <div className="ico"><I.ban size={26} /></div>
              <h4>Tidak ada jadwal</h4>
              <p>Filter atau pencarian Anda tidak menemukan jadwal yang cocok.</p>
              <button className="m-btn" onClick={() => { setQ(""); setFilter("all"); }}>Reset filter</button>
            </div>
          )}
          {rows.map((r) => (
            <div key={r.qn} className={`m-schedcard ${r.status === "live" ? "is-live" : ""}`}>
              <div className="row1">
                <span className="qn">{r.qn}</span>
                <span className={`as-status ${r.status}`}>
                  <span className="pip" />{STATUS_LABEL[r.status]}
                </span>
                <span className="time">{r.waktu}</span>
              </div>
              <div className="perkara">
                {r.pihak}{r.lawan && <span style={{ color: "var(--fg-3)" }}> vs. {r.lawan}</span>}
                <small>{r.nomor_perkara} · {r.jenis}</small>
              </div>
              <div className="meta">
                <span><I.pin size={13} style={{ marginRight: 3, verticalAlign: "-2px" }} /> {r.ruang}</span>
                <span><I.doc size={13} style={{ marginRight: 3, verticalAlign: "-2px" }} /> {r.agenda}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ───────── TIKET ─────────
const TabTiket = ({ onOpenSheet }) => {
  const I = window.Icons;
  const [hasTicket, setHasTicket] = React.useState(true);

  if (!hasTicket) {
    return (
      <div className="m-pad">
        <div className="m-section" style={{ marginTop: 0 }}>
          <div className="m-section-head">
            <h3>Tiket Saya</h3>
          </div>
          <div className="m-empty">
            <div className="ico"><I.ticket size={28} /></div>
            <h4>Belum ada tiket aktif</h4>
            <p>Daftar antrian sekarang untuk mendapatkan tiket digital.</p>
            <button className="m-btn accent block" onClick={onOpenSheet}>Daftar Antrian Sekarang</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-pad">
      <div className="m-section" style={{ marginTop: 0 }}>
        <div className="m-section-head">
          <div>
            <h3>Tiket Aktif</h3>
            <div style={{ fontSize: ".74rem", color: "var(--fg-3)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
              Diregistrasi 09:42 WITA · valid hari ini
            </div>
          </div>
          <button className="m-iconbtn" onClick={() => setHasTicket(false)} title="(demo) toggle empty"><I.ban size={16} /></button>
        </div>

        <div className="m-ticket">
          <div className="m-ticket-top">
            <p className="kicker">Pengadilan Agama Penajam</p>
            <div className="m-ticket-num">S-021</div>
            <div className="m-ticket-name">Ahmad Surya bin Rahmat</div>
            <div className="m-ticket-meta">0145/Pdt.G/2026/PA.Pnj · Cerai Gugat</div>
          </div>
          <div className="m-ticket-cut"><div className="dash" /></div>
          <div className="m-ticket-bot">
            <div className="row"><span className="l">Slot Datang</span><span className="v">10:00 WITA</span></div>
            <div className="row"><span className="l">Posisi</span><span className="v">3 antrian lagi</span></div>
            <div className="row"><span className="l">Estimasi</span><span className="v">±10:24 WITA</span></div>
            <div className="row"><span className="l">Ruang</span><span className="v">Akan diumumkan</span></div>
            <div className="m-ticket-qr">
              <window.FakeQR seed="S-021-AHMAD-SURYA" />
            </div>
          </div>
        </div>

        <div className="m-ticket-actions">
          <button className="m-btn"><I.copy size={16} /> Salin Nomor</button>
          <button className="m-btn"><I.share size={16} /> Bagikan</button>
        </div>
        <button className="m-btn block" style={{ marginTop: 8 }}><I.rotate size={16} /> Ganti Jadwal</button>

        <div className="m-section">
          <div className="m-section-head">
            <h3>Riwayat Tiket</h3>
          </div>
          <div className="m-list">
            {[
              { qn: "S-008", date: "12 Mei 2026", agenda: "Mediasi Tahap I", status: "done" },
              { qn: "S-003", date: "29 Apr 2026", agenda: "Sidang Pertama", status: "done" },
            ].map((h) => (
              <button key={h.qn} className="m-listrow">
                <span className="ico" style={{ background: "var(--primary-soft)", color: "var(--primary-3)" }}>
                  <I.ticket size={18} />
                </span>
                <span className="lbl">
                  {h.qn} · {h.agenda}
                  <small>{h.date} · Hadir</small>
                </span>
                <I.chev size={18} className="chev" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ───────── AKUN ─────────
const TabAkun = () => {
  const I = window.Icons;

  return (
    <div className="m-pad">
      <div className="m-section" style={{ marginTop: 0 }}>
        <div className="m-section-head">
          <h3>Akun Saya</h3>
        </div>

        <div className="m-profile">
          <div className="m-avatar">AS</div>
          <div className="m-profile-info">
            <strong>Ahmad Surya</strong>
            <small>NIK · 3201•••••••••0001</small>
          </div>
          <button className="m-iconbtn"><I.chev size={18} /></button>
        </div>

        <div className="m-list">
          <button className="m-listrow">
            <span className="ico" style={{ background: "var(--primary-soft)", color: "var(--primary-3)" }}><I.notif size={18} /></span>
            <span className="lbl">Notifikasi<small>WhatsApp · Push · Email</small></span>
            <I.chev size={18} className="chev" />
          </button>
          <button className="m-listrow">
            <span className="ico" style={{ background: "var(--gold-soft)", color: "#92580a" }}><I.lang size={18} /></span>
            <span className="lbl">Bahasa<small>Indonesia</small></span>
            <I.chev size={18} className="chev" />
          </button>
          <button className="m-listrow">
            <span className="ico" style={{ background: "var(--accent-soft)", color: "#9a3412" }}><I.shield size={18} /></span>
            <span className="lbl">Privasi & Keamanan<small>Verifikasi NIK aktif</small></span>
            <I.chev size={18} className="chev" />
          </button>
        </div>

        <div className="m-section-head" style={{ marginTop: 18 }}>
          <h3>Bantuan</h3>
        </div>
        <div className="m-list">
          <button className="m-listrow">
            <span className="ico"><I.help size={18} /></span>
            <span className="lbl">Pusat Bantuan</span>
            <I.chev size={18} className="chev" />
          </button>
          <button className="m-listrow">
            <span className="ico"><I.chat size={18} /></span>
            <span className="lbl">Hubungi Petugas<small>(0542) 7654321</small></span>
            <I.chev size={18} className="chev" />
          </button>
          <button className="m-listrow">
            <span className="ico"><I.info size={18} /></span>
            <span className="lbl">Tentang Aplikasi<small>v0.1.0 · MVP</small></span>
            <I.chev size={18} className="chev" />
          </button>
        </div>

        <button className="m-btn block" style={{ marginTop: 18, color: "var(--danger)", borderColor: "color-mix(in oklab, var(--danger) 22%, transparent)" }}>
          <I.logout size={16} /> Keluar dari Akun
        </button>

        <div style={{ textAlign: "center", padding: "20px 0 8px", fontSize: ".7rem", color: "var(--fg-4)", fontFamily: "var(--font-mono)" }}>
          Antrian Sidang PWA · Pengadilan Agama Penajam<br/>
          © 2026 Mahkamah Agung RI
        </div>
      </div>
    </div>
  );
};

window.TabBeranda = TabBeranda;
window.TabJadwal = TabJadwal;
window.TabTiket = TabTiket;
window.TabAkun = TabAkun;
