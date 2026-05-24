"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getStatusByQueueNumber } from "@/lib/queue-service"

// State machine: input → loading → result | not-found | error
type DialogState = "input" | "loading" | "result" | "not-found" | "error"

/** Data hasil pencarian yang sudah dinormalisasi dari API response */
interface ResultData {
  queueNumber: string
  status: string
  position: number
  estimatedMinutes: number
  nomorPerkara: string
  jenis: string
  ruang: string
  agenda: string
}

interface CekStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Mapping status antrian ke label dan warna badge.
 *
 * Token fallback:
 * - `waiting` menggunakan `bg-[var(--gold)]` karena `--gold-2` tidak ada di design system.
 *   `--gold` (#b8860b light, #f4d27a dark) sudah ada dan memberikan warna amber yang tepat.
 * - Untuk token `--warning-soft` yang tidak ada, digunakan `bg-warning/10` (Tailwind semantik
 *   dengan opacity modifier) di rendering not-found state.
 * - Untuk `--primary-ring`, digunakan `ring-primary/30` via Tailwind opacity modifier.
 */
const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  in_service: { label: "Sedang Dipanggil", color: "bg-success" },
  completed: { label: "Sudah Selesai", color: "bg-muted-foreground" },
  // Fallback: --gold-2 tidak ada → pakai --gold yang tersedia di design system
  waiting: { label: "Menunggu Giliran", color: "bg-[var(--gold)]" },
  cancelled: { label: "Dibatalkan", color: "bg-destructive" },
  skipped: { label: "Dilewati", color: "bg-muted-foreground" },
  no_show: { label: "Tidak Hadir", color: "bg-destructive" },
}

/**
 * Dialog untuk mengecek status antrian berdasarkan nomor antrian.
 *
 * Menggunakan state machine: input → loading → result | not-found | error.
 * Reset ke state "input" otomatis setiap kali dialog dibuka ulang.
 *
 * @param open - Apakah dialog sedang terbuka
 * @param onOpenChange - Callback saat state open berubah
 */
export function CekStatusDialog({ open, onOpenChange }: CekStatusDialogProps) {
  const [state, setState] = useState<DialogState>("input")
  const [queueNumber, setQueueNumber] = useState("")
  const [nik, setNik] = useState("")
  const [result, setResult] = useState<ResultData | null>(null)
  // Simpan nomor yang dicari untuk pesan error not-found
  const [searched, setSearched] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Reset ke state awal setiap kali dialog dibuka.
  // eslint-disable rule ini diizinkan: pola reset-on-open adalah standar untuk controlled dialog,
  // analogous dengan pattern di header.tsx dan hydration-safe-provider.tsx dalam codebase ini.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) return
    setState("input")
    setQueueNumber("")
    setNik("")
    setResult(null)
    setSearched("")
    setErrorMsg("")
  }, [open])
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Kirim permintaan cek status ke API */
  const handleCheck = async () => {
    const qn = queueNumber.trim().toUpperCase()
    if (!qn) return
    setSearched(qn)
    setState("loading")
    try {
      const res = await getStatusByQueueNumber(qn, nik || undefined)
      if (!res.data) {
        setState("not-found")
        return
      }
      // Normalisasi data dari API ke struktur internal
      setResult({
        queueNumber: res.data.queue_number,
        status: res.data.status,
        position: res.data.position ?? 0,
        estimatedMinutes: res.data.estimated_minutes ?? 0,
        nomorPerkara: res.data.nomor_perkara ?? "-",
        jenis: res.data.jenis_perkara ?? "-",
        ruang: res.data.ruang_sidang ?? "-",
        agenda: res.data.agenda ?? "-",
      })
      setState("result")
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Gagal mengecek status")
      setState("error")
    }
  }

  /** Reset ke state input untuk melakukan pencarian lain */
  const resetToInput = () => {
    setState("input")
    setResult(null)
    setSearched("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cek Status Antrian</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* State: Input form pencarian */}
          {state === "input" && (
            <>
              {/* Info banner */}
              <div className="flex gap-3 p-3.5 bg-[var(--primary-soft)] border border-[color-mix(in_oklab,var(--primary)_18%,transparent)] rounded-[var(--radius-md)] mb-4">
                <div className="w-5 h-5 rounded-full bg-primary text-white grid place-items-center text-[.8rem] font-semibold flex-shrink-0 mt-0.5">
                  i
                </div>
                <p className="text-[.88rem] text-foreground">
                  Masukkan nomor antrian Anda untuk melihat posisi dan estimasi waktu panggilan.
                </p>
              </div>

              {/* Input nomor antrian */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label
                  htmlFor="qn"
                  className="text-[.82rem] font-medium flex items-center gap-1"
                >
                  Nomor Antrian{" "}
                  <span className="text-destructive font-semibold">*</span>
                </label>
                <input
                  id="qn"
                  className="w-full border border-border bg-card px-3.5 py-2.5 rounded-[10px] text-[.9rem] focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all"
                  placeholder="S-014"
                  value={queueNumber}
                  onChange={(e) => setQueueNumber(e.target.value.toUpperCase())}
                />
                {/* Hint format nomor antrian */}
                <span className="font-mono text-[.7rem] text-[var(--fg-4)]">
                  Format: S-NNN sesuai tiket Anda
                </span>
              </div>

              {/* Input NIK opsional */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nik" className="text-[.82rem] font-medium">
                  NIK (verifikasi)
                </label>
                <input
                  id="nik"
                  inputMode="numeric"
                  maxLength={16}
                  className="w-full border border-border bg-card px-3.5 py-2.5 rounded-[10px] text-[.9rem] focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none"
                  placeholder="16 digit"
                  value={nik}
                  onChange={(e) =>
                    setNik(e.target.value.replace(/\D/g, "").slice(0, 16))
                  }
                />
              </div>
            </>
          )}

          {/* State: Loading skeleton */}
          {state === "loading" && (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          )}

          {/* State: Hasil ditemukan */}
          {state === "result" && result && (
            <ResultDisplay result={result} />
          )}

          {/* State: Nomor antrian tidak ditemukan */}
          {/* Fallback: --warning-soft tidak ada → bg-warning/10 (Tailwind opacity modifier) */}
          {state === "not-found" && (
            <div className="flex gap-3 p-3.5 bg-warning/10 border border-warning/25 rounded-[var(--radius-md)]">
              <div className="w-5 h-5 rounded-full bg-warning text-white grid place-items-center text-[.8rem] font-semibold flex-shrink-0 mt-0.5">
                !
              </div>
              <p className="text-[.88rem] text-[#92400e]">
                Nomor antrian <strong>{searched}</strong> tidak ditemukan. Periksa
                kembali atau hubungi loket informasi.
              </p>
            </div>
          )}

          {/* State: Error jaringan atau server */}
          {state === "error" && (
            <div className="flex gap-3 p-3.5 bg-destructive/10 border border-destructive/30 rounded-[var(--radius-md)]">
              <div className="w-5 h-5 rounded-full bg-destructive text-white grid place-items-center text-[.8rem] font-semibold flex-shrink-0 mt-0.5">
                !
              </div>
              <p className="text-[.88rem] text-destructive">{errorMsg}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {/* Footer untuk state input */}
          {state === "input" && (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button onClick={handleCheck} disabled={!queueNumber.trim()}>
                Cek Status →
              </Button>
            </>
          )}
          {/* Footer untuk state setelah pencarian */}
          {(state === "result" ||
            state === "not-found" ||
            state === "error") && (
            <>
              <Button variant="ghost" onClick={resetToInput}>
                ← Cek Lain
              </Button>
              <Button onClick={() => onOpenChange(false)}>Tutup</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Sub-komponen untuk menampilkan hasil pencarian antrian.
 * Terdiri dari mini callup display dan grid detail 4 sel.
 *
 * Token: --gold-3 (#f4d27a) dipakai untuk gradient nomor antrian besar.
 *
 * @param result - Data hasil pencarian yang sudah dinormalisasi
 */
function ResultDisplay({ result }: { result: ResultData }) {
  const statusInfo =
    STATUS_LABEL[result.status] ?? {
      label: result.status,
      color: "bg-muted-foreground",
    }
  // Tampilkan "Berikutnya" jika posisi 0, selain itu tampilkan posisi + label
  const posLabel =
    result.position === 0 ? "Berikutnya" : `${result.position} antrian lagi`

  return (
    <div className="space-y-4">
      {/* Mini callup display — gradient gelap dengan ambient glow gold */}
      <div className="relative overflow-hidden p-6 rounded-[var(--radius-xl)] text-white bg-gradient-to-br from-[#062f17] via-[var(--primary-3)] to-[var(--primary)]">
        {/* Ambient glow gold di sisi kiri */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 0% 50%, rgba(212,160,23,.30), transparent 60%)",
          }}
        />
        <div className="relative z-10 flex flex-col gap-2">
          {/* Badge status */}
          <span className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-accent/15 border border-accent/40 text-orange-300 font-mono text-[.72rem] uppercase">
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                statusInfo.color,
                // Pulsing hanya untuk yang sedang dipanggil
                result.status === "in_service" && "animate-as-pulse"
              )}
            />
            {statusInfo.label}
          </span>

          {/* Nomor antrian besar — gradient putih ke gold-3 */}
          <div
            className="font-mono font-bold leading-[.9] tracking-[-.04em] mt-1 bg-gradient-to-b from-white to-[var(--gold-3)] bg-clip-text text-transparent"
            style={{ fontSize: "clamp(64px,9vw,120px)" }}
          >
            {result.queueNumber}
          </div>

          {/* Nomor perkara dan jenis perkara */}
          <div className="font-mono text-[.85rem] text-white/65">
            {result.nomorPerkara} · {result.jenis}
          </div>
        </div>
      </div>

      {/* Grid detail 4 sel: posisi, estimasi, ruang, agenda */}
      <div className="grid grid-cols-1 sm:grid-cols-2 bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
        <DetailCell
          label="Posisi"
          value={posLabel}
          borderBottom
          borderRight
        />
        <DetailCell
          label="Estimasi Panggilan"
          value={`±${result.estimatedMinutes} menit lagi`}
          borderBottom
        />
        <DetailCell label="Ruang Sidang" value={result.ruang} borderRight />
        <DetailCell label="Agenda" value={result.agenda} />
      </div>
    </div>
  )
}

/**
 * Sub-komponen sel detail dalam grid hasil pencarian.
 * Mendukung border bottom dan border right untuk membentuk grid.
 */
function DetailCell({
  label,
  value,
  borderBottom,
  borderRight,
}: {
  label: string
  value: string
  borderBottom?: boolean
  borderRight?: boolean
}) {
  return (
    <div
      className={cn(
        "px-4 py-3.5 flex flex-col gap-0.5",
        borderBottom && "border-b border-border",
        borderRight && "sm:border-r border-border"
      )}
    >
      <span className="text-[.72rem] font-medium text-muted-foreground">
        {label}
      </span>
      <span className="text-[.92rem] font-medium text-foreground">{value}</span>
    </div>
  )
}
