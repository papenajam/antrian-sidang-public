// Main mobile PWA App — wires tabs + bottom nav + sheets together

const MobileApp = () => {
  const [active, setActive] = React.useState("home");
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);

  const SCHEDULE = window.AS_DATA.SCHEDULE;
  const SLOTS = window.AS_DATA.SLOTS;
  const live = SCHEDULE.find((s) => s.status === "live") || SCHEDULE[0];
  const waiting = SCHEDULE.filter((s) => s.status === "scheduled").length;
  const done = SCHEDULE.filter((s) => s.status === "done").length;

  const titles = {
    home: { title: "Penajam Paser Utara", subtitle: "Pengadilan Agama" },
    jadwal: { title: "Penajam Paser Utara", subtitle: "Pengadilan Agama" },
    ticket: { title: "Penajam Paser Utara", subtitle: "Pengadilan Agama" },
    akun: { title: "Penajam Paser Utara", subtitle: "Pengadilan Agama" },
  };

  return (
    <div className="m-app" data-screen-label={`Mobile · ${active}`}>
      <div className="m-scroll">
        <window.TopBar {...titles[active]} />

        {active === "home" && (
          <window.TabBeranda
            live={live} waiting={waiting} done={done}
            onOpenSheet={() => setSheetOpen(true)}
            onOpenStatus={() => setStatusOpen(true)}
            setActive={setActive}
          />
        )}
        {active === "jadwal" && <window.TabJadwal data={SCHEDULE} />}
        {active === "ticket" && <window.TabTiket onOpenSheet={() => setSheetOpen(true)} />}
        {active === "akun"   && <window.TabAkun />}
      </div>

      <window.BottomNav active={active} setActive={setActive} onFab={() => setSheetOpen(true)} />

      <window.SheetDaftar open={sheetOpen} onClose={() => setSheetOpen(false)} slots={SLOTS} />
      <window.SheetCekStatus open={statusOpen} onClose={() => setStatusOpen(false)} schedule={SCHEDULE} />
    </div>
  );
};

// Mount inside an iOS device frame for showcase on desktop preview.
// On a real mobile/PWA the device frame can be hidden by toggling ?bare=1.
const Root = () => {
  const params = new URLSearchParams(location.search);
  const bare = params.get("bare") === "1" || window.innerWidth < 440;

  // Auto-scale the device frame to fit any viewport height
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    if (bare) return;
    const fit = () => {
      const deviceH = 844 + 64; // height + outer breathing room
      const s = Math.min(1, (window.innerHeight - 32) / deviceH);
      setScale(s);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [bare]);

  if (bare) {
    return (
      <div style={{ position: "fixed", inset: 0 }}>
        <MobileApp />
      </div>
    );
  }
  return (
    <div style={{
      minHeight: "100vh",
      display: "grid", placeItems: "center",
      padding: "16px",
      background: "linear-gradient(180deg, #f8f7f0 0%, #eee9d8 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      <BackgroundDeco />
      <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <Pitch />
        <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
          <window.IOSDevice width={390} height={844}>
            <MobileApp />
          </window.IOSDevice>
        </div>
      </div>
    </div>
  );
};

const Pitch = () => (
  <div style={{ maxWidth: 420, color: "#1a2e22" }}>
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "6px 12px", background: "rgba(22,163,74,.1)",
      border: "1px solid rgba(22,163,74,.25)",
      borderRadius: 999, color: "#0f5f2e",
      fontFamily: "Geist Mono, monospace", fontSize: 12, fontWeight: 500,
      marginBottom: 16,
    }}>
      <span style={{ width: 6, height: 6, background: "#ea580c", borderRadius: 99 }} />
      PWA · Mobile App
    </div>
    <h1 style={{
      fontFamily: "Geist, sans-serif",
      fontSize: 48, fontWeight: 700, lineHeight: 1.05,
      letterSpacing: "-.035em", margin: "0 0 16px",
      background: "linear-gradient(180deg, #1a2e22 0%, #15803d 100%)",
      WebkitBackgroundClip: "text", backgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}>Antrian sidang<br/>di genggaman Anda.</h1>
    <p style={{ fontFamily: "Geist, sans-serif", fontSize: 16, lineHeight: 1.6, color: "#3e5145", margin: "0 0 20px" }}>
      Versi mobile PWA dari layanan Antrian Sidang Pengadilan Agama Penajam. Dirancang
      untuk dipasang ke layar utama smartphone — bottom tab navigation, akses cepat ke
      tiket, dan real-time tracking antrian.
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
      {[
        { c: "#0f5f2e", bg: "rgba(22,163,74,.08)", t: "Bottom Tab Navigation", d: "4 tab utama + 1 FAB tengah untuk Daftar Antrian." },
        { c: "#b8860b", bg: "rgba(212,160,23,.10)", t: "Tiket Digital + QR", d: "Tiket dapat di-scan langsung di loket pengadilan." },
        { c: "#ea580c", bg: "rgba(234,88,12,.10)", t: "Realtime + Push Notif", d: "Notifikasi 30 menit sebelum nomor Anda dipanggil." },
      ].map((it) => (
        <div key={it.t} style={{
          display: "flex", gap: 12, alignItems: "flex-start",
          padding: 12, background: it.bg,
          border: "1px solid color-mix(in oklab, " + it.c + " 22%, transparent)",
          borderRadius: 12,
        }}>
          <span style={{ width: 8, height: 8, background: it.c, borderRadius: 99, marginTop: 7, flex: "0 0 auto" }} />
          <div>
            <strong style={{ fontFamily: "Geist, sans-serif", fontSize: 14, fontWeight: 600, color: it.c, display: "block", marginBottom: 2 }}>{it.t}</strong>
            <span style={{ fontFamily: "Geist, sans-serif", fontSize: 13, color: "#3e5145" }}>{it.d}</span>
          </div>
        </div>
      ))}
    </div>
    <p style={{ marginTop: 18, fontFamily: "Geist Mono, monospace", fontSize: 11, color: "#6b7568" }}>
      Tip: buka di phone, atau tambahkan <code style={{ background: "#fff", padding: "2px 6px", borderRadius: 4, border: "1px solid #e8e3d3" }}>?bare=1</code> untuk full-bleed.
    </p>
  </div>
);

const BackgroundDeco = () => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
    <div style={{
      position: "absolute", top: -120, right: -120, width: 360, height: 360, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(212,160,23,.35) 0%, transparent 70%)",
      filter: "blur(40px)",
    }} />
    <div style={{
      position: "absolute", bottom: -160, left: -120, width: 420, height: 420, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(22,163,74,.25) 0%, transparent 70%)",
      filter: "blur(40px)",
    }} />
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: "radial-gradient(circle at 1px 1px, rgba(26,46,34,.07) 1px, transparent 0)",
      backgroundSize: "24px 24px",
      maskImage: "linear-gradient(to bottom, #000 30%, transparent 90%)",
    }} />
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
