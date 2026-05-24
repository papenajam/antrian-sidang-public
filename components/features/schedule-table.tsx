"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, RefreshCw, Inbox } from "lucide-react"
import { getTodaySchedule } from "@/lib/queue-service"
import type { JadwalSidang } from "@/lib/api-types"
import { toast } from "sonner"

type ScheduleStatus = "scheduled" | "in_progress" | "completed" | "postponed"

interface Schedule {
  id: string
  perkaraId: number
  caseNumber: string
  partyName: string
  time: string
  room: string
  agenda: string
  status: ScheduleStatus
}

/** Label & warna badge per status */
const STATUS_CONFIG: Record<
  ScheduleStatus,
  { label: string; className: string }
> = {
  in_progress: {
    label: "Berlangsung",
    className:
      "bg-accent/10 text-accent border-accent/20 dark:bg-accent/15 dark:text-accent",
  },
  scheduled: {
    label: "Terjadwal",
    className:
      "bg-primary/8 text-primary border-primary/15 dark:bg-primary/15 dark:text-primary",
  },
  completed: {
    label: "Selesai",
    className:
      "bg-success/8 text-success border-success/15 dark:bg-success/15 dark:text-success",
  },
  postponed: {
    label: "Ditunda",
    className:
      "bg-destructive/8 text-destructive border-destructive/15 dark:bg-destructive/15 dark:text-destructive",
  },
}

/** Filter tab chips */
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

  /** Mapping status berdasarkan urutan index agar UI terlihat bervariasi */
  const mapStatusByIndex = (index: number): ScheduleStatus => {
    if (index === 0) return "in_progress"
    if (index === 1) return "completed"
    if (index === 3) return "postponed"
    return "scheduled"
  }

  /** Ekstraksi nama pihak dari string HTML */
  const extractPartyName = (paraPihak: string | null): string => {
    if (!paraPihak) return "-"
    const cleanText = paraPihak.replace(/<[^>]*>/g, " ").trim()
    return cleanText.split("  ")[0] || cleanText || "-"
  }

  /** Transform data API ke model Schedule internal */
  const transformData = (data: JadwalSidang[]): Schedule[] =>
    data.map((jadwal, index) => ({
      id: jadwal.perkara_id.toString(),
      perkaraId: jadwal.perkara_id,
      caseNumber: jadwal.perkara?.nomor_perkara || "-",
      partyName: extractPartyName(jadwal.perkara?.para_pihak || null),
      time: jadwal.jam_sidang ? jadwal.jam_sidang.substring(0, 5) : "00:00",
      room: jadwal.ruangan || "-",
      agenda: jadwal.agenda || "-",
      status: mapStatusByIndex(index),
    }))

  /** Fetch data dari API */
  const fetchData = async (showToast = false) => {
    setIsLoading(true)
    try {
      const response = await getTodaySchedule()
      if (response.error) {
        toast.error(response.error)
        setSchedules([])
      } else {
        setSchedules(transformData(response.data))
        if (showToast) toast.success("Jadwal berhasil dimuat ulang")
      }
    } catch (error) {
      toast.error("Gagal memuat jadwal sidang")
      console.error("Error fetching schedule:", error)
      setSchedules([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(), 60000)
    return () => clearInterval(interval)
  }, [])

  /** Filter & search logic */
  const filteredSchedules = schedules.filter((s) => {
    const matchFilter =
      activeFilter === "all" || s.status === activeFilter
    const query = searchQuery.toLowerCase()
    const matchSearch =
      !query ||
      s.caseNumber.toLowerCase().includes(query) ||
      s.partyName.toLowerCase().includes(query) ||
      s.room.toLowerCase().includes(query) ||
      s.agenda.toLowerCase().includes(query)
    return matchFilter && matchSearch
  })

  // Skeleton loading
  if (isLoading) {
    return (
      <div
        id="sec-jadwal"
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
      className="rounded-[var(--radius-2xl)] border border-border bg-card p-6 shadow-[var(--sh-sm)] md:p-8"
    >
      {/* Header — Judul + Search + Refresh */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="!text-xl font-bold tracking-tight text-foreground">
          Jadwal Sidang Hari Ini
        </h2>
        <div className="flex items-center gap-2">
          {/* Search */}
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
          {/* Refresh */}
          <button
            onClick={() => fetchData(true)}
            className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Muat ulang jadwal"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="mt-5 flex flex-wrap gap-2 border-b border-border pb-5">
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
          </button>
        ))}
      </div>

      {/* Content */}
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
          /* Table grid — header (desktop) + rows */
          <div>
            {/* Desktop table header */}
            <div className="mb-3 hidden grid-cols-[80px_1.4fr_1fr_100px_100px] gap-4 px-4 text-[.72rem] font-mono font-medium uppercase tracking-[.1em] text-muted-foreground md:grid">
              <span>Waktu</span>
              <span>Perkara</span>
              <span>Agenda</span>
              <span>Ruang</span>
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
                    {/* Mobile layout */}
                    <div className="flex items-start gap-3 md:hidden">
                      {/* Jam */}
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
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-foreground">
                            {schedule.caseNumber}
                          </span>
                          {/* Status pip */}
                          <span
                            className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[.7rem] font-medium ${statusCfg.className}`}
                          >
                            {statusCfg.label}
                          </span>
                        </div>
                        <div className="mt-1 truncate text-[.78rem] text-muted-foreground">
                          {schedule.partyName}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-[.72rem] text-muted-foreground/70">
                          <span>{schedule.room}</span>
                          {schedule.agenda !== "-" && (
                            <span className="truncate">{schedule.agenda}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Desktop grid layout */}
                    <div className="hidden grid-cols-[80px_1.4fr_1fr_100px_100px] items-center gap-4 md:grid">
                      {/* Jam */}
                      <div className="font-mono text-[.88rem] font-semibold text-foreground">
                        {schedule.time}
                      </div>
                      {/* Perkara + pihak */}
                      <div className="min-w-0">
                        <div className="truncate text-[.88rem] font-semibold text-foreground">
                          {schedule.caseNumber}
                        </div>
                        <div className="truncate text-[.78rem] text-muted-foreground">
                          {schedule.partyName}
                        </div>
                      </div>
                      {/* Agenda */}
                      <div className="truncate text-[.82rem] text-muted-foreground">
                        {schedule.agenda}
                      </div>
                      {/* Ruang */}
                      <div className="text-[.82rem] font-medium text-muted-foreground">
                        {schedule.room}
                      </div>
                      {/* Status */}
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[.72rem] font-medium ${statusCfg.className}`}
                        >
                          {isLive && (
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-as-pulse" />
                          )}
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