const Header = ({ page, setPage, onBook }) => {
  const NAV = [
    { id: "home", label: "Beranda" },
    { id: "jadwal", label: "Jadwal" },
    { id: "status", label: "Cek Status" },
    { id: "panduan", label: "Panduan" },
  ];

  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (n) => String(n).padStart(2, "0");
  const clock = `${fmt(now.getHours())}:${fmt(now.getMinutes())}:${fmt(now.getSeconds())} WITA`;

  return (
    <header className="as-header" role="banner">
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); setPage("home"); }}
        className="as-logo"
        style={{ textDecoration: "none", color: "#fff" }}
      >
        <div className="as-logo-mark">PA</div>
        <div className="as-logo-text">
          <small>Pengadilan Agama</small>
          <strong>PENAJAM PASER UTARA</strong>
        </div>
      </a>
      {NAV.map((n) => (
        <button
          key={n.id}
          className={`as-nav-item ${page === n.id ? "is-active" : ""}`}
          onClick={() => {
            setPage(n.id);
            const el = document.getElementById(`sec-${n.id}`);
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
          }}
        >
          {n.label}
        </button>
      ))}
    </header>
  );
};

window.Header = Header;
