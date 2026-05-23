const Schedule = ({ data, onBook }) => {
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const STATUS_LABEL = window.AS_DATA.STATUS_LABEL;

  const filters = [
    { id: "all",       label: "Semua",      count: data.length },
    { id: "live",      label: "Berlangsung",count: data.filter(d => d.status === "live").length },
    { id: "scheduled", label: "Terjadwal",  count: data.filter(d => d.status === "scheduled").length },
    { id: "done",      label: "Selesai",    count: data.filter(d => d.status === "done").length },
    { id: "delayed",   label: "Ditunda",    count: data.filter(d => d.status === "delayed").length },
  ];

  const rows = data.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (!q) return true;
    const hay = `${r.qn} ${r.nomor_perkara} ${r.pihak} ${r.lawan || ""} ${r.ruang} ${r.agenda} ${r.jenis}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <section className="as-section" id="sec-jadwal" data-screen-label="Jadwal Sidang">
      <div className="as-section-head">
        <div>
          <p className="kicker"><span className="as-dot live" /> Auto-refresh tiap 60 detik</p>
          <h2 className="jk-h2">Jadwal Sidang Hari Ini</h2>
        </div>
        <div className="ctrls">
          <div className="as-search">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: ".8rem", opacity: .55 }}>⌕</span>
            <input
              placeholder="cari perkara, pihak, ruangan..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && <button className="as-btn sm ghost" onClick={() => setQ("")} style={{ border: 0, padding: ".3rem .5rem" }}>×</button>}
          </div>
          <button className="as-btn" style={{ marginLeft: -2 }} title="Refresh">↻ Refresh</button>
        </div>
      </div>

      <div className="as-chips">
        {filters.map((f) => (
          <button
            key={f.id}
            className={`as-chip ${filter === f.id ? "is-active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label} <span className="count">[{f.count}]</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span className="as-chip" style={{ cursor: "default", opacity: .65 }}>
          Terakhir disinkron: {new Date().toLocaleTimeString("id-ID")}
        </span>
      </div>

      <div className="as-sched" role="table" aria-label="Jadwal sidang hari ini">
        <div className="as-sched-head" role="row">
          <div>Antrian</div>
          <div>Perkara</div>
          <div>Para Pihak</div>
          <div>Waktu</div>
          <div>Agenda</div>
          <div>Ruangan</div>
          <div>Status</div>
        </div>
        {rows.length === 0 && (
          <div style={{ padding: "3rem 2rem", textAlign: "center", fontFamily: "var(--font-sans)", color: "var(--fg-3)", fontSize: ".9rem", borderTop: "1px solid var(--border)" }}>
            Tidak ada jadwal yang cocok.&nbsp;
            <button className="as-btn sm" onClick={() => { setQ(""); setFilter("all"); }} style={{ marginLeft: ".5rem" }}>Reset filter</button>
          </div>
        )}
        {rows.map((r) => (
          <div key={r.qn} className={`as-sched-row ${r.status === "live" ? "is-active" : ""}`} role="row" style={{ position: "relative" }}>
            <div>
              <span className="qn">{r.qn}</span>
            </div>
            <div className="perkara">
              {r.nomor_perkara}
              <span className="jenis">{r.jenis}</span>
            </div>
            <div className="pihak">
              {r.pihak}
              {r.lawan && <small>vs. {r.lawan}</small>}
            </div>
            <div>
              <span className="waktu">{r.waktu}<small>WITA</small></span>
            </div>
            <div className="agenda">{r.agenda}</div>
            <div className="ruang">{r.ruang}</div>
            <div>
              <span className={`as-status ${r.status}`}>
                <span className="pip"/>{STATUS_LABEL[r.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

window.Schedule = Schedule;
