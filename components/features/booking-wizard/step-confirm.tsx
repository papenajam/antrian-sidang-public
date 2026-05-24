"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/magic/blur-fade"
import { CheckCircle, ArrowLeft, Loader2, AlertTriangle, RefreshCw, AlertOctagon } from "lucide-react"
import { bookQueueWizard, getAvailableSlots } from "@/lib/queue-service"
import { cn, formatDate } from "@/lib/utils"
import type { SlotInfo, QueueTicket } from "@/lib/api-types"

interface StepConfirmProps {
  perkaraId: number
  nik: string
  namaPihak: string
  nomorPerkara: string
  /** Jenis perkara dari data validasi (opsional) */
  jenisPerkara?: string
  /** Nama pemohon dari data personal — fallback ke namaPihak */
  nama?: string
  /** Nomor telepon untuk notifikasi WhatsApp (opsional) */
  telepon?: string
  tanggal: string
  slot: SlotInfo
  ruangan: string
  onNext: (ticket: QueueTicket) => void
  onBack: () => void
  onError: (message: string) => void
}

/**
 * Format NIK 16 digit dengan spasi setiap 4 digit.
 * Contoh: "3201234567890001" → "3201 2345 6789 0001"
 */
function formatNIK(nik: string): string {
  return nik.replace(/(\d{4})(?=\d)/g, "$1 ")
}

interface ConfirmCellProps {
  label: string
  value: string
  /** Apakah sel ini memiliki border bawah (untuk baris yang bukan terakhir) */
  borderBottom?: boolean
  /** Apakah sel ini memiliki border kanan di layar sm ke atas (untuk kolom kiri) */
  borderRight?: boolean
}

/**
 * Sel individual dalam grid review konfirmasi.
 * Menampilkan label kecil di atas dan nilai yang menonjol di bawah.
 */
function ConfirmCell({ label, value, borderBottom, borderRight }: ConfirmCellProps) {
  return (
    <div
      className={cn(
        "p-4 flex flex-col gap-0.5",
        borderBottom && "border-b border-border",
        borderRight && "sm:border-r border-border"
      )}
    >
      <span className="text-[.7rem] uppercase tracking-[.04em] font-medium text-muted-foreground">
        {label}
      </span>
      <span className="text-[.9rem] font-medium text-foreground break-words">
        {value}
      </span>
    </div>
  )
}

export function StepConfirm({
  perkaraId,
  nik,
  namaPihak,
  nomorPerkara,
  jenisPerkara,
  nama,
  telepon,
  tanggal,
  slot,
  ruangan,
  onNext,
  onBack,
  onError,
}: StepConfirmProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Race condition handling - state ketersediaan slot
  const [slotStatus, setSlotStatus] = useState<{
    isAvailable: boolean
    lastChecked: Date | null
    isChecking: boolean
  }>({ isAvailable: true, lastChecked: null, isChecking: false })

  // Cek ketersediaan slot setiap 30 detik untuk menghindari race condition
  useEffect(() => {
    async function checkSlotAvailability() {
      setSlotStatus((prev) => ({ ...prev, isChecking: true }))
      try {
        const response = await getAvailableSlots(perkaraId, tanggal)
        const currentSlot = response.data.slots.find((s: SlotInfo) => s.time === slot.time)
        const isAvailable = currentSlot ? currentSlot.available > 0 : false
        setSlotStatus({
          isAvailable,
          lastChecked: new Date(),
          isChecking: false,
        })
      } catch {
        setSlotStatus((prev) => ({ ...prev, isChecking: false }))
      }
    }

    // Pengecekan awal saat komponen mount
    checkSlotAvailability()

    // Refresh berkala setiap 30 detik
    const interval = setInterval(checkSlotAvailability, 30000)
    return () => clearInterval(interval)
  }, [perkaraId, tanggal, slot.time])


  const handleConfirm = async () => {
    setIsSubmitting(true)

    try {
      const response = await bookQueueWizard({
        perkara_id: perkaraId,
        nik,
        slot_time: slot.time,
      })

      onNext(response.data)
    } catch {
      onError("Terjadi kesalahan saat booking. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Hitung posisi estimasi antrian (booked + 1 = posisi berikutnya)
  const posisiAntrian = slot.booked + 1

  return (
    <BlurFade>
      <Card>
        <CardHeader>
          {/* Kicker pill langkah */}
          <div className="mb-1">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[.7rem] font-medium text-primary uppercase tracking-[.04em]">
              Langkah 3 dari 4 · Tinjau &amp; Konfirmasi
            </span>
          </div>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Konfirmasi Booking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grid review 2 kolom dengan 8 field */}
          <div className="rounded-xl border border-border overflow-hidden">
            {/* Header lokasi dan ruangan */}
            <div className="bg-primary/5 border-b border-border px-4 py-2.5 flex items-center gap-2">
              <span className="text-xs font-semibold text-primary">{ruangan}</span>
            </div>

            {/* Grid 2-kolom untuk 8 field review */}
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Baris 1: Nomor Perkara | Jenis Perkara */}
              <ConfirmCell
                label="Nomor Perkara"
                value={nomorPerkara}
                borderBottom
                borderRight
              />
              <ConfirmCell
                label="Jenis Perkara"
                value={jenisPerkara || "—"}
                borderBottom
              />

              {/* Baris 2: Nama Pemohon | NIK */}
              <ConfirmCell
                label="Nama Pemohon"
                value={nama || namaPihak}
                borderBottom
                borderRight
              />
              <ConfirmCell
                label="NIK"
                value={formatNIK(nik)}
                borderBottom
              />

              {/* Baris 3: Waktu Kedatangan | Estimasi Antrian */}
              <ConfirmCell
                label="Waktu Kedatangan"
                value={`${slot.time} WITA`}
                borderBottom
                borderRight
              />
              <ConfirmCell
                label="Estimasi Antrian"
                value={`Posisi ke-${posisiAntrian} dari ${slot.capacity}`}
                borderBottom
              />

              {/* Baris 4: Notifikasi | Tanggal Sidang */}
              <ConfirmCell
                label="Notifikasi"
                value={telepon || "—"}
                borderRight
              />
              <ConfirmCell
                label="Tanggal Sidang"
                value={formatDate(tanggal)}
              />
            </div>
          </div>

          {/* Race condition handling - pengecekan ketersediaan slot */}
          {slotStatus.isChecking ? (
            <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 sm:p-4">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600 sm:h-5 sm:w-5" />
              <p className="text-xs text-blue-800 sm:text-sm">Memeriksa ketersediaan slot...</p>
            </div>
          ) : !slotStatus.isAvailable ? (
            <div className="flex items-start gap-2 rounded-xl border-2 border-red-200 bg-red-50 p-3 sm:gap-3 sm:p-4">
              <AlertOctagon className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 sm:h-5 sm:w-5" />
              <div className="text-xs text-red-800 sm:text-sm">
                <p className="font-semibold sm:font-semibold">⚠️ Maaf, slot ini sudah terisi!</p>
                <p className="mt-0.5 sm:mt-1">Slot yang Anda pilih sudah tidak tersedia. Silakan pilih jam lain.</p>
              </div>
            </div>
          ) : slotStatus.lastChecked && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground sm:text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse sm:h-2 sm:w-2" />
              <span>
                Slot tersedia — terakhir dicek{" "}
                {slotStatus.lastChecked.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          {/* Peringatan penting sebelum konfirmasi */}
          <div className="flex items-start gap-2 rounded-xl border-2 border-yellow-200 bg-yellow-50 p-3 sm:gap-3 sm:p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 sm:h-5 sm:w-5" />
            <div className="text-xs text-yellow-800 sm:text-sm">
              <p className="font-semibold mb-0.5 sm:mb-1">⚠️ Perhatian Penting:</p>
              <ul className="list-disc list-inside space-y-0.5 sm:space-y-1">
                <li>Booking yang sudah dikonfirmasi <strong>tidak dapat dibatalkan</strong></li>
                <li>Pastikan data di atas sudah benar sebelum melanjutkan</li>
                <li>Harap datang 15 menit sebelum jam sidang</li>
              </ul>
            </div>
          </div>

          {/* Navigasi wizard */}
          <div className="flex justify-between pt-3 border-t sm:pt-4">
            <Button variant="outline" onClick={onBack} disabled={isSubmitting} size="sm" className="text-xs sm:text-sm sm:size-default">
              <ArrowLeft className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
              Kembali
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting || !slotStatus.isAvailable} size="sm" className="text-xs sm:text-sm sm:size-default">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin sm:mr-2 sm:h-4 sm:w-4" />
                  Memproses...
                </>
              ) : (
                <>
                  Konfirmasi Booking
                  <CheckCircle className="ml-1 h-3 w-3 sm:ml-2 sm:h-4 sm:w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
