"use client"

import { useState, useEffect, useCallback } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, RefreshCw, Inbox } from "lucide-react"
import { getTodaySchedule } from "@/lib/queue-service"
import type { JadwalSidang } from "@/lib/api-types"
import { parseParaPihak } from "@/lib/parse-para-pihak"
import { toast } from "sonner"

type ScheduleStatus = "scheduled" | "in_progress" | "completed" | "postponed"

/** Model internal jadwal sidang setelah transform dari API */
interface Schedule {
  id: string
  perkaraId: number
  queueNumber: string | null
  caseNumber: string
  caseType: string
  partyName: string
  opposingParty: string | null
  time: string
  room: string
  agenda: string
  status: ScheduleStatus
}

/**
 * Konfigurasi tampilan badge status sidang.
 * Catatan token:
 * - --primary-soft ada di globals.css
 * - --accent-soft tidak ada → fallback bg-accent/10
 * - --gold, --gold-soft ada di globals.css
 */
const STATUS_CONFIG: Record<
  ScheduleStatus,
  { label: string; className: string; pipClass: string }
> = {
  in_progress: {
    label: "Sedang Berlangsung",
    className: "bg-accent/10 text-accent border-accent/20 dark:bg-accent/15",
    pipClass: "bg-accent",
  },
  scheduled: {
    label: "Terjadwal",
    className:
      "bg-primary/8 text-primary border-primary/15 dark:bg-primary/15",
    pipClass: "bg-primary",
  },
  completed: {
    label: "Selesai",
    className: "bg-muted text-muted-foreground border-border",
    pipClass: "bg-[var(--fg-4)]",
  },
  postponed: {
    label: "Ditunda",
    className:
      "bg-[var(--gold-soft)] text-[#92580a] border-[color-mix(in_oklab,var(--gold)_35%,transparent)] dark:bg-[rgba(244,210,122,.1)] dark:text-[var(--gold)]",
    pipClass: "bg-[var(--gold)]",
  },
}

/** Definisi tab filter jadwal */
const FILTER_TABS: {
  key: "all" | ScheduleStatus
  label: string
}[] = [
  { key: "all", label: "Semua" },
  { key: "in_progress", label: "Berlangsung" },
  { key: "scheduled", label: "Terjadwal" },
  { key: "completed", label: "Selesai" },
  { key: "postponed", label: "Ditunda" },
]

export function ScheduleTable() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | ScheduleStatus>(
    "all"
  )
  const [lastSync, setLastSync] = useState<string>("")

  /** Mapping status berdasarkan urutan index agar UI terlihat bervariasi */
  const mapStatusByIndex = (index: number): ScheduleStatus => {
    if (index === 0) return "in_progress"
    if (index === 1) return "completed"
    if (index === 3) return "postponed"
    return "scheduled"
  }

  /** Transform data API ke model Schedule internal menggunakan parseParaPihak */
  const transformData = (data: JadwalSidang[]): Schedule[] =>
    data.map((jadwal, index) => {
      const { pihak, lawan } = parseParaPihak(jadwal.perkara?.para_pihak || null)
      return {
        id: jadwal.perkara_id.toString(),
        perkaraId: jadwal.perkara_id,
        queueNumber: jadwal.queue_number ?? null,
        caseNumber: jadwal.perkara?.nomor_perkara || "-",
        caseType: jadwal.perkara?.jenis_perkara_nama || "-",
        partyName: pihak,
        opposingParty: lawan,
        time: jadwal.jam_sidang ? jadwal.jam_sidang.substring(0, 5) : "00:00",
        room: jadwal.ruangan || "-",
        agenda: jadwal.agenda || "-",
        status: mapStatusByIndex(index),
      }
    })

  /** Hitung jumlah jadwal per filter key */
  const filterCount = (key: "all" | ScheduleStatus): number => {
    if (key === "all") return schedules.length
    return schedules.filter((s) => s.status === key).length
  }

  /** Fetch data jadwal dari API */
  const fetchData = useCallback(async (showToast = false) => {
    setIsLoading(true)
    try {
      const response = await getTodaySchedule()
      if (response.error) {
        toast.error(response.error)
        setSchedules([])
      } else {
        setSchedules(transformData(response.data))
        // Catat waktu sinkronisasi terakhir
        setLastSync(
          new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        )
        if (showToast) toast.success("Jadwal berhasil dimuat ulang")
      }
    } catch (error) {
      toast.error("Gagal memuat jadwal sidang")
      console.error("Error fetching schedule:", error)
      setSchedules([])
    } finally {
      setIsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchData()
    // Auto-refresh setiap 60 detik
    const interval = setInterval(() => fetchData(), 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  /** Filter & search logic */
  const filteredSchedules = schedules.filter((s) => {
    const matchFilter =
      activeFilter === "all" || s.status === activeFilter
    const query = searchQuery.toLowerCase()
    const matchSearch =
      !query ||
      s.caseNumber.toLowerCase().includes(query) ||
      s.partyName.toLowerCase().includes(query) ||
      (s.opposingParty?.toLowerCase().includes(query) ?? false) ||
      s.room.toLowerCase().includes(query) ||
      s.agenda.toLowerCase().includes(query)
    return matchFilter && matchSearch
  })

  // Tampilkan skeleton saat loading pertama kali
  if (isLoading) {
    return (
      <div
        id="sec-jadwal"
        data-section="schedule"
        className="rounded-[var(--radius-2xl)] border border-border bg-card p-6 shadow-[var(--sh-sm)] md:p-8"
      >
        <Skeleton className="mb-6 h-6 w-44" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <section
      id="sec-jadwal"
      data-section="schedule"
      className="rounded-[var(--radius-2xl)] border border-border bg-card p-6 shadow-[var(--sh-sm)] md:p-8"
    >
      {/* Header — Kicker + Judul + Search + Refresh */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {/* Kicker auto-refresh */}
          <p className="inline-flex items-center gap-2 font-mono text-[.72rem] text-muted-foreground mb-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-as-pulse" />
            Auto-refresh tiap 60 detik
          </p>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Jadwal Sidang Hari Ini
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Kolom pencarian */}
          <div className="relative flex-1 sm:w-56 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari perkara, pihak..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-border bg-background pl-9 pr-3 py-2 text-[.82rem] font-medium outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-ring"
            />
          </div>
          {/* Tombol refresh manual */}
          <button
            onClick={() => fetchData(true)}
            className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Muat ulang jadwal"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Filter chips + sync timestamp */}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-b border-border pb-5">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`rounded-full border px-3.5 py-1.5 text-[.78rem] font-medium transition-all duration-200 cursor-pointer ${
              activeFilter === tab.key
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            {tab.label}
            {/* Jumlah item per filter */}
            <span className="ml-1.5 opacity-60">[{filterCount(tab.key)}]</span>
          </button>
        ))}
        {/* Chip timestamp sinkronisasi terakhir */}
        {lastSync && (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 font-mono text-[.7rem] text-muted-foreground">
            <RefreshCw className="h-3 w-3" />
            Terakhir disinkron · {lastSync}
          </span>
        )}
      </div>

      {/* Konten tabel */}
      <div className="mt-5">
        {filteredSchedules.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="mb-1 text-base font-semibold text-foreground">
              {searchQuery || activeFilter !== "all"
                ? "Tidak ditemukan"
                : "Belum ada jadwal sidang"}
            </h3>
            <p className="max-w-xs text-[.82rem] text-muted-foreground">
              {searchQuery || activeFilter !== "all"
                ? "Coba ubah kata kunci atau filter status."
                : "Data akan muncul otomatis setelah ada jadwal terdaftar."}
            </p>
            <button
              onClick={() => {
                setSearchQuery("")
                setActiveFilter("all")
                fetchData(true)
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-[.82rem] font-medium text-primary-foreground shadow-[var(--sh-sm)] transition-all hover:-translate-y-px hover:shadow-[var(--sh)] cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        ) : (
          /* Grid 7 kolom — header (desktop) + baris */
          <div>
            {/* Header kolom desktop — 7 kolom */}
            <div className="mb-3 hidden md:grid grid-cols-[76px_1.4fr_1.3fr_96px_1.2fr_96px_130px] gap-0 px-4 text-[.68rem] font-mono font-medium uppercase tracking-[.06em] text-muted-foreground">
              <span>Antrian</span>
              <span>Perkara</span>
              <span>Para Pihak</span>
              <span>Waktu</span>
              <span>Agenda</span>
              <span>Ruangan</span>
              <span className="text-right">Status</span>
            </div>

            <div className="space-y-2.5">
              {filteredSchedules.map((schedule) => {
                const statusCfg = STATUS_CONFIG[schedule.status]
                const isLive = schedule.status === "in_progress"

                return (
                  <div
                    key={schedule.id}
                    className={`relative rounded-[var(--radius-lg)] border p-4 transition-all duration-200 hover:-translate-y-px hover:shadow-[var(--sh)] ${
                      isLive
                        ? "border-accent/30 bg-accent/[.03] dark:bg-accent/[.05]"
                        : "border-border bg-card hover:border-[color-mix(in_oklab,var(--border)_80%,var(--foreground)_20%)]"
                    }`}
                  >
                    {/* Layout mobile */}
                    <div className="flex items-start gap-3 md:hidden">
                      {/* Jam sidang dalam kotak */}
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] text-sm font-bold ${
                          isLive
                            ? "bg-accent text-white"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <div className="text-center leading-tight">
                          <div>{schedule.time.split(":")[0]}</div>
                          <div className="text-[10px] opacity-70">
                            {schedule.time.split(":")[1]}
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        {/* Nomor perkara + nomor antrian + badge status */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-semibold text-foreground">
                            {schedule.caseNumber}
                          </span>
                          {/* Pill nomor antrian (jika ada) */}
                          {schedule.queueNumber && (
                            <span className="flex-shrink-0 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/15 px-2 py-0.5 font-mono text-[.7rem] font-semibold dark:bg-primary/15">
                              {schedule.queueNumber}
                            </span>
                          )}
                          {/* Badge status */}
                          <span
                            className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[.7rem] font-medium ${statusCfg.className}`}
                          >
                            {statusCfg.label}
                          </span>
                        </div>
                        {/* Jenis perkara */}
                        <div className="mt-0.5 truncate text-[.72rem] text-muted-foreground/70">
                          {schedule.caseType}
                        </div>
                        {/* Nama pihak utama */}
                        <div className="mt-1 truncate text-[.78rem] text-muted-foreground">
                          {schedule.partyName}
                        </div>
                        {/* Pihak lawan (jika ada) */}
                        {schedule.opposingParty && (
                          <div className="mt-0.5 truncate text-[.72rem] text-muted-foreground/70">
                            vs. {schedule.opposingParty}
                          </div>
                        )}
                        {/* Ruang + agenda */}
                        <div className="mt-1 flex items-center gap-3 text-[.72rem] text-muted-foreground/70">
                          <span>{schedule.room}</span>
                          {schedule.agenda !== "-" && (
                            <span className="truncate">{schedule.agenda}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Layout desktop — grid 7 kolom */}
                    <div className="hidden md:grid grid-cols-[76px_1.4fr_1.3fr_96px_1.2fr_96px_130px] items-center gap-0 px-2">
                      {/* 1. Antrian — pill nomor antrian */}
                      <div>
                        {schedule.queueNumber ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/15 px-2.5 py-1 font-mono text-[.78rem] font-semibold dark:bg-primary/15">
                            {schedule.queueNumber}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50 font-mono text-[.78rem]">
                            —
                          </span>
                        )}
                      </div>
                      {/* 2. Perkara — nomor + jenis perkara */}
                      <div className="min-w-0">
                        <div className="truncate text-[.88rem] font-semibold text-foreground">
                          {schedule.caseNumber}
                        </div>
                        <div className="truncate text-[.72rem] text-muted-foreground">
                          {schedule.caseType}
                        </div>
                      </div>
                      {/* 3. Para Pihak — pihak utama + pihak lawan */}
                      <div className="min-w-0">
                        <div className="truncate text-[.82rem] text-foreground">
                          {schedule.partyName}
                        </div>
                        {schedule.opposingParty && (
                          <div className="truncate text-[.72rem] text-muted-foreground">
                            vs. {schedule.opposingParty}
                          </div>
                        )}
                      </div>
                      {/* 4. Waktu sidang */}
                      <div className="font-mono text-[.88rem] font-semibold text-foreground">
                        {schedule.time}
                      </div>
                      {/* 5. Agenda sidang */}
                      <div className="truncate text-[.82rem] text-muted-foreground">
                        {schedule.agenda}
                      </div>
                      {/* 6. Ruangan sidang */}
                      <div className="text-[.82rem] font-medium text-muted-foreground">
                        {schedule.room}
                      </div>
                      {/* 7. Status — badge dengan pip indicator */}
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[.72rem] font-medium ${statusCfg.className}`}
                        >
                          <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${statusCfg.pipClass} ${isLive ? "animate-as-pulse" : ""}`}
                          />
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
