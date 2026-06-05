// TopBar + BottomNav + FakeQR for the mobile PWA

const TopBar = ({ title, subtitle, notif = 2 }) => (
  <div className="m-topbar">
    <div className="m-topbar-brand">
      <div className="m-logo-mark">PA</div>
      <div className="m-topbar-text">
        <small>{subtitle || "Pengadilan Agama"}</small>
        <strong>{title || "Penajam Paser Utara"}</strong>
      </div>
    </div>
    <button className="m-iconbtn" aria-label="Notifikasi">
      <window.Icons.bell size={18} />
      {notif > 0 && <span className="badge">{notif}</span>}
    </button>
  </div>
);

const BottomNav = ({ active, setActive, onFab }) => {
  const tabs = [
    { id: "home",    label: "Beranda", icon: "home" },
    { id: "jadwal",  label: "Jadwal",  icon: "cal" },
    { id: "ticket",  label: "Tiket",   icon: "ticket" },
    { id: "akun",    label: "Akun",    icon: "user" },
  ];
  const I = window.Icons;
  return (
    <div className="m-bottomnav">
      {tabs.slice(0, 2).map((t) => {
        const IconC = I[t.icon];
        return (
          <button key={t.id} className={`m-tab ${active === t.id ? "is-active" : ""}`} onClick={() => setActive(t.id)}>
            <IconC size={22} />
            <span className="lbl">{t.label}</span>
          </button>
        );
      })}
      <button className="m-fab" onClick={onFab} aria-label="Daftar antrian">
        <I.plus size={24} />
        <span className="fab-lbl">Daftar</span>
      </button>
      {tabs.slice(2).map((t) => {
        const IconC = I[t.icon];
        return (
          <button key={t.id} className={`m-tab ${active === t.id ? "is-active" : ""}`} onClick={() => setActive(t.id)}>
            <IconC size={22} />
            <span className="lbl">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// Procedural QR-like SVG (decorative) with brand colors
const FakeQR = ({ seed = "QUEUE", size = 25, dark = "#0f5f2e", light = "#f4d27a" }) => {
  const grid = React.useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const g = [];
    const rand = () => { h = (h * 1664525 + 1013904223) >>> 0; return (h % 1000) / 1000; };
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
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
      <rect width={px} height={px} fill={dark} />
      {grid.map((row, y) => row.map((v, x) => v ? (
        <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill={light} />
      ) : null))}
    </svg>
  );
};

window.TopBar = TopBar;
window.BottomNav = BottomNav;
window.FakeQR = FakeQR;
