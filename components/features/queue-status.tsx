"use client"

import { useState, useEffect } from "react"
import { NumberTicker } from "@/components/magic/number-ticker"
import { Skeleton } from "@/components/ui/skeleton"
import { RescheduleDialog } from "./reschedule-dialog"
import { getTodaySchedule, calculateQueueStatistics } from "@/lib/queue-service"
import { toast } from "sonner"

interface QueueData {
  currentNumber: number
  waitingCount: number
  processedToday: number
  lastUpdated: string
}

interface QueueStatusProps {
  queueNumber?: string
  perkaraId?: number
  currentSlot?: string
  tanggal?: string
  isActive?: boolean
}

export function QueueStatus({
  queueNumber: propQueueNumber,
  perkaraId: propPerkaraId,
  currentSlot: propCurrentSlot,
  tanggal: propTanggal,
  isActive = false,
}: QueueStatusProps) {
  const [data, setData] = useState<QueueData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showReschedule, setShowReschedule] = useState(false)
  const [hasData, setHasData] = useState(false)

  const [bookingState] = useState<{
    queueNumber: string | null
    perkaraId: number | null
    currentSlot: string | null
    tanggal: string | null
  }>({
    queueNumber: propQueueNumber || null,
    perkaraId: propPerkaraId || null,
    currentSlot: propCurrentSlot || null,
    tanggal: propTanggal || null,
  })

  const fetchData = async () => {
    try {
      const scheduleResponse = await getTodaySchedule()

      if (scheduleResponse.error) {
        toast.error(scheduleResponse.error)
        return
      }

      const statistics = calculateQueueStatistics(scheduleResponse.data, [])

      // Periksa apakah data real tersedia
      const hasRealData =
        statistics.currentNumber > 0 ||
        statistics.waitingCount > 0 ||
        statistics.processedToday > 0 ||
        scheduleResponse.data.length > 0

      setHasData(hasRealData)
      setData({
        currentNumber: statistics.currentNumber,
        waitingCount: statistics.waitingCount,
        processedToday: statistics.processedToday,
        lastUpdated: statistics.lastUpdated || "-",
      })
    } catch (error) {
      toast.error("Gagal memuat status antrian")
      console.error("Error fetching queue status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleCheckStatus = () => {
    if (bookingState.queueNumber) {
      toast.info(`Cek status untuk: ${bookingState.queueNumber}`)
    } else {
      toast.info("Fitur cek status akan segera tersedia.")
    }
  }

  const handleReschedule = () => {
    if (
      !bookingState.queueNumber ||
      !bookingState.perkaraId ||
      !bookingState.currentSlot ||
      !bookingState.tanggal
    ) {
      toast.warning(
        "Fitur ganti jadwal tersedia setelah Anda melakukan booking"
      )
      return
    }
    setShowReschedule(true)
  }

  const hasActiveBooking = isActive || bookingState.queueNumber !== null

  // Skeleton loading
  if (isLoading) {
    return (
      <div
        id="sec-status"
        className="callup-gradient overflow-hidden rounded-[var(--radius-2xl)] p-6 md:p-10"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.4fr_1fr]">
          <Skeleton className="h-56 w-full rounded-2xl bg-white/10" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
            <Skeleton className="h-24 rounded-2xl bg-white/10" />
            <Skeleton className="h-24 rounded-2xl bg-white/10" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <section
        id="sec-status"
        className="callup-gradient relative overflow-hidden rounded-[var(--radius-2xl)] p-6 md:p-10"
      >
        {/* Ambient glow di balik konten */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 0% 0%, rgba(212,160,23,.25), transparent 55%), radial-gradient(ellipse 50% 60% at 100% 80%, rgba(234,88,12,.12), transparent 55%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-[1.4fr_1fr]">
          {/* ── KOLOM KIRI — Panggilan aktif ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                <div className="h-2 w-2 animate-as-pulse rounded-full bg-accent" />
                <span className="text-[.78rem] font-medium uppercase tracking-wide text-white/70">
                  Live · Panggilan Aktif
                </span>
              </div>
              {data?.lastUpdated && data.lastUpdated !== "-" && (
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[.7rem] font-mono text-white/40">
                  {data.lastUpdated}
                </span>
              )}
            </div>

            {/* Nomor antrian besar */}
            <div className="flex-1 flex flex-col items-center justify-center rounded-[var(--radius-xl)] bg-white/[.04] border border-white/[.08] p-8 text-center">
              <div className="text-[clamp(64px,8vw,120px)] font-bold leading-none tracking-[-0.04em] text-gradient-gold drop-shadow-[0_2px_10px_rgba(212,160,23,.35)]">
                {!hasData && data?.currentNumber === 0 ? (
                  <span className="text-white/30">—</span>
                ) : (
                  <NumberTicker
                    value={data?.currentNumber || 0}
                    duration={1.5}
                    showDashForZero={true}
                  />
                )}
              </div>
              <span className="mt-3 inline-flex items-center gap-2 font-mono text-[.82rem] font-medium text-white/50">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-as-pulse" />
                Nomor Antrian Saat Ini
              </span>
            </div>
          </div>

          {/* ── KOLOM KANAN — Ringkasan ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
            {/* Menunggu */}
            <div className="rounded-[var(--radius-lg)] bg-white/[.04] border border-white/[.08] p-5">
              <div className="flex items-center gap-2 text-[.78rem] font-medium text-white/50">
                <span className="h-2 w-2 rounded-full bg-[var(--gold)]" />
                Antrian Menunggu
              </div>
              <div className="mt-2 text-[clamp(32px,3vw,44px)] font-bold leading-none tracking-[-0.04em] text-white">
                {!hasData && data?.waitingCount === 0 ? (
                  <span className="text-white/30">—</span>
                ) : (
                  <NumberTicker
                    value={data?.waitingCount || 0}
                    duration={1}
                    showDashForZero={true}
                  />
                )}
              </div>
              <div className="mt-1 text-[.72rem] text-white/35 font-mono">
                Estimasi 15-20 menit per nomor
              </div>
            </div>

            {/* Selesai */}
            <div className="rounded-[var(--radius-lg)] bg-white/[.04] border border-white/[.08] p-5">
              <div className="flex items-center gap-2 text-[.78rem] font-medium text-white/50">
                <span className="h-2 w-2 rounded-full bg-success" />
                Selesai Hari Ini
              </div>
              <div className="mt-2 text-[clamp(32px,3vw,44px)] font-bold leading-none tracking-[-0.04em] text-white">
                {!hasData && data?.processedToday === 0 ? (
                  <span className="text-white/30">—</span>
                ) : (
                  <NumberTicker
                    value={data?.processedToday || 0}
                    duration={1}
                    showDashForZero={true}
                  />
                )}
              </div>
              <div className="mt-1 text-[.72rem] text-white/35 font-mono">
                Sidang yang sudah dipanggil
              </div>
            </div>

            {/* Tombol aksi */}
            <div className="grid grid-cols-2 gap-3 sm:col-span-2 md:col-span-1">
              <button
                onClick={handleCheckStatus}
                className="rounded-[var(--radius-md)] border border-white/10 bg-white/5 px-4 py-3 text-[.82rem] font-medium text-white/80 transition-all duration-200 hover:bg-white/10 cursor-pointer"
              >
                Cek Status
              </button>
              <button
                onClick={handleReschedule}
                disabled={!hasActiveBooking}
                className="rounded-[var(--radius-md)] border border-[var(--gold)]/20 bg-[var(--gold)]/10 px-4 py-3 text-[.82rem] font-medium text-[var(--gold)] transition-all duration-200 hover:bg-[var(--gold)]/20 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                title={
                  !hasActiveBooking
                    ? "Fitur ganti jadwal tersedia setelah booking"
                    : ""
                }
              >
                Ganti Jadwal
              </button>
            </div>
          </div>
        </div>

        {/* Info jika belum ada data */}
        {!hasData && (
          <div className="relative z-10 mt-6 flex items-center gap-3 rounded-[var(--radius-md)] bg-white/[.04] border border-white/[.08] p-4">
            <span className="text-[.82rem] text-white/50">
              Belum ada data antrian hari ini — data muncul otomatis setelah ada pendaftaran.
            </span>
          </div>
        )}
      </section>

      {/* Dialog ganti jadwal */}
      {bookingState.queueNumber &&
        bookingState.perkaraId &&
        bookingState.currentSlot &&
        bookingState.tanggal && (
          <RescheduleDialog
            open={showReschedule}
            onOpenChange={setShowReschedule}
            queueNumber={bookingState.queueNumber}
            perkaraId={bookingState.perkaraId}
            currentSlot={bookingState.currentSlot}
            tanggal={bookingState.tanggal}
            onSuccess={() => {
              fetchData()
              toast.success("Jadwal berhasil diubah!")
            }}
          />
        )}
    </>
  )
}