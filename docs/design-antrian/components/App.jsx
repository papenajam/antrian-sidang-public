const { useState, useEffect, useMemo } = React;

const App = () => {
  const [page, setPage] = useState("home");
  const [bookOpen, setBookOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [reschedOpen, setReschedOpen] = useState(false);

  // live-ish stats
  const [stats, setStats] = useState({ terdaftar: 47, sidang: 32, kehadiran: 95 });
  useEffect(() => {
    const t = setInterval(() => {
      setStats((s) => ({
        terdaftar: Math.max(40, Math.min(70, s.terdaftar + Math.floor(Math.random() * 3) - 1)),
        sidang: s.sidang,
        kehadiran: Math.max(90, Math.min(99, s.kehadiran + (Math.random() > 0.5 ? 0 : (Math.random() > 0.5 ? 1 : -1)))),
      }));
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const SCHEDULE = window.AS_DATA.SCHEDULE;
  const live = SCHEDULE.find((s) => s.status === "live") || SCHEDULE[0];
  const waiting = SCHEDULE.filter((s) => s.status === "scheduled").length;
  const done = SCHEDULE.filter((s) => s.status === "done").length;

  const scrollTo = (id) => {
    const el = document.getElementById(`sec-${id}`);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }} data-screen-label="Antrian Sidang">
      <LineGrid />
      <div className="as-pad" style={{ position: "relative", zIndex: 5, paddingBottom: 24 }}>
        <Header
          page={page}
          setPage={setPage}
          onBook={() => setBookOpen(true)}
        />

        <Hero
          stats={stats}
          onBook={() => setBookOpen(true)}
          onScrollJadwal={() => scrollTo("jadwal")}
        />

        <QueueStatus
          live={live}
          waiting={waiting}
          done={done}
          onCekStatus={() => setStatusOpen(true)}
          onReschedule={() => setReschedOpen(true)}
        />

        <Schedule data={SCHEDULE} onBook={() => setBookOpen(true)} />

        <Panduan onBook={() => setBookOpen(true)} />

        <FooterCta onBook={() => setBookOpen(true)} />
      </div>

      <BookingWizard open={bookOpen} onClose={() => setBookOpen(false)} />
      <CekStatusDialog open={statusOpen} onClose={() => setStatusOpen(false)} />
      <RescheduleDialog open={reschedOpen} onClose={() => setReschedOpen(false)} />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
