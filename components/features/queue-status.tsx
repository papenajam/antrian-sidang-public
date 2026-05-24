"use client"

import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { RescheduleDialog } from "./reschedule-dialog"
import { CekStatusDialog } from "./cek-status-dialog"
import { useCurrentCall } from "@/lib/hooks/use-current-call"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

/**
 * Props untuk QueueStatus — mendukung mode dengan booking aktif
 * agar tombol Ganti Jadwal bisa diaktifkan.
 */
interface QueueStatusProps {
  queueNumber?: string
  perkaraId?: number
  currentSlot?: string
  tanggal?: string
  isActive?: boolean
}

/**
 * Sub-komponen Cell untuk kolom kanan — menampilkan label, nilai, dan sublabel.
 * Dipakai untuk Menunggu, Selesai, dan Berikutnya.
 *
 * Token fallback: valueClass mengasumsikan teks putih dari parent callup-gradient.
 */
function Cell({
  label,
  value,
  sublabel,
  valueClass,
}: {
  label: string
  value: string
  sublabel: string
  valueClass: string
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/[.08] p-5 px-6 last:border-0">
      {/* Label kategori kecil */}
      <span className="text-[.72rem] font-medium uppercase tracking-[.04em] text-white/55">
        {label}
      </span>
      {/* Nilai utama */}
      <span className={cn("font-semibold leading-[1.15] text-white", valueClass)}>
        {value}
      </span>
      {/* Sub-label deskriptif */}
      <span className="text-[.72rem] text-white/45">{sublabel}</span>
    </div>
  )
}

/**
 * Komponen utama QueueStatus — menampilkan status panggilan sidang secara live.
 * Menggunakan useCurrentCall untuk data real-time dengan polling 30 detik.
 *
 * Kolom kiri: nomor antrian besar + detail perkara + action buttons.
 * Kolom kanan: 3 cells — Menunggu, Selesai, Berikutnya.
 *
 * Token --gold-3 (#f4d27a, dark: sama) dipakai di gradient nomor antrian.
 * Fallback: jika data null, tampilkan "—" dan pesan empty state.
 */
export function QueueStatus({
  queueNumber: propQueueNumber,
  perkaraId: propPerkaraId,
  currentSlot: propCurrentSlot,
  tanggal: propTanggal,
  isActive = false,
}: QueueStatusProps) {
  // Data live dari hook — menggantikan useState + useEffect fetch lama
  const { data, isLoading } = useCurrentCall()

  // State dialog reschedule
  const [showReschedule, setShowReschedule] = useState(false)

  // State cek status — modal akan diimplementasikan di Task 3.3
  const [showCekStatus, setShowCekStatus] = useState(false)

  // Booking state untuk validasi tombol Ganti Jadwal
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

  const hasActiveBooking = isActive || bookingState.queueNumber !== null

  /** Tangani klik Cek Status Saya — buka CekStatusDialog */
  const handleCekStatus = () => {
    setShowCekStatus(true)
  }

  /** Tangani klik Ganti Jadwal — buka RescheduleDialog jika booking aktif */
  const handleReschedule = () => {
    if (
      !bookingState.queueNumber ||
      !bookingState.perkaraId ||
      !bookingState.currentSlot ||
      !bookingState.tanggal
    ) {
      toast.warning("Fitur ganti jadwal tersedia setelah Anda melakukan booking")
      return
    }
    setShowReschedule(true)
  }

  // Hitung estimasi waktu tunggu: setiap nomor rata-rata 18 menit
  const waitingCount = data?.waitingCount ?? 0
  const doneCount = data?.doneCount ?? 0
  const estimasiMenit = waitingCount * 18

  // ── Loading state: skeleton sederhana ──────────────────────────────────────
  if (isLoading) {
    return (
      <div
        id="sec-status"
        data-section="queue-status"
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
        data-section="queue-status"
        className="callup-gradient relative overflow-hidden rounded-[var(--radius-2xl)]"
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

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1.4fr_1fr]">
          {/* ── KOLOM KIRI — Panggilan aktif ─────────────────────────────── */}
          <div className="flex flex-col gap-3 p-6 md:p-10">
            {/* Tag pill: status live vs tidak aktif */}
            <span className="inline-flex items-center gap-2 self-start rounded-full border border-accent/40 bg-accent/15 px-3.5 py-1.5 font-mono text-[.72rem] uppercase tracking-[.04em] text-orange-300">
              <span
                className={cn(
                  "h-2 w-2 rounded-full bg-accent",
                  data?.current && "animate-as-pulse"
                )}
              />
              {data?.current ? "Sedang Dipanggil" : "Tidak ada panggilan aktif"}
            </span>

            {/* Nomor antrian HUGE — gradient gold-3 ke putih */}
            {/* Token: --gold-3 (#f4d27a light, #f4d27a dark — sama) */}
            <div
              className="bg-clip-text text-transparent font-bold leading-[.9] tracking-[-.06em]"
              style={{
                fontSize: "clamp(80px, 12vw, 180px)",
                backgroundImage:
                  "linear-gradient(180deg, #fff 0%, var(--gold-3) 100%)",
              }}
            >
              {data?.current?.queueNumber || "—"}
            </div>

            {/* Detail pihak berperkara — hanya ditampilkan jika ada panggilan aktif */}
            {data?.current ? (
              <>
                <div>
                  {/* Nama pihak dan lawan */}
                  <div className="text-xl font-semibold leading-[1.25] text-white">
                    {data.current.pihak}
                    {data.current.lawan && (
                      <span className="opacity-60"> vs. {data.current.lawan}</span>
                    )}
                  </div>
                  {/* Nomor perkara dan jenis */}
                  <div className="mt-1.5 font-mono text-[.82rem] text-white/60">
                    {data.current.nomorPerkara} · {data.current.jenis}
                  </div>
                </div>

                {/* Meta: ruang · agenda · waktu mulai — satu elemen untuk kemudahan testing */}
                <div className="mt-auto pt-4 text-[.9rem] font-medium text-white/75">
                  {`${data.current.ruang} · ${data.current.agenda} · Mulai pukul ${data.current.waktu} WITA`}
                </div>
              </>
            ) : (
              /* Empty state: tidak ada panggilan aktif */
              <p className="text-white/55">Menunggu jadwal sidang berikutnya</p>
            )}

            {/* Action buttons */}
            <div className="mt-4 flex gap-2.5">
              <button
                onClick={handleCekStatus}
                className="flex-1 rounded-[var(--radius-xl)] border border-white/[.18] bg-white/[.04] px-4 py-3 text-[.82rem] font-medium text-white/90 backdrop-blur-md transition-colors hover:bg-white/10"
              >
                Cek Status Saya
              </button>
              <button
                onClick={handleReschedule}
                disabled={!hasActiveBooking}
                className="flex-1 rounded-[var(--radius-xl)] border border-white/[.18] bg-white/[.04] px-4 py-3 text-[.82rem] font-medium text-white/90 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Ganti Jadwal
              </button>
            </div>
          </div>

          {/* ── KOLOM KANAN — 3 cells ringkasan ──────────────────────────── */}
          <div className="relative z-10 grid grid-rows-3 border-t border-white/[.08] md:border-l md:border-t-0">
            {/* Cell Menunggu */}
            <Cell
              label="Menunggu"
              value={String(waitingCount)}
              sublabel={`Estimasi tunggu ±${estimasiMenit} menit`}
              valueClass="text-[2rem]"
            />
            {/* Cell Selesai */}
            <Cell
              label="Selesai"
              value={String(doneCount)}
              sublabel="Rata-rata 16 menit/sidang"
              valueClass="text-[2rem]"
            />
            {/* Cell Berikutnya */}
            <Cell
              label="Berikutnya"
              value={
                data?.next
                  ? `${data.next.queueNumber} · ${data.next.ruang}`
                  : "—"
              }
              sublabel={
                data?.next
                  ? `±${data.next.waktu} WITA · ${data.next.agenda}`
                  : "Belum ada"
              }
              valueClass="text-[1.05rem]"
            />
          </div>
        </div>
      </section>

      {/* Dialog ganti jadwal — hanya dirender jika booking state lengkap */}
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
              toast.success("Jadwal berhasil diubah!")
            }}
          />
        )}

      {/* Dialog cek status antrian berdasarkan nomor antrian */}
      <CekStatusDialog open={showCekStatus} onOpenChange={setShowCekStatus} />
    </>
  )
}
