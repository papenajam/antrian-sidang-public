"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/magic/blur-fade"
import { CheckCircle, ArrowLeft, Loader2, AlertTriangle, Calendar, Clock, MapPin, FileText, User, RefreshCw, AlertOctagon } from "lucide-react"
import { bookQueueWizard, getAvailableSlots } from "@/lib/queue-service"
import type { SlotInfo, QueueTicket } from "@/lib/api-types"

interface StepConfirmProps {
  perkaraId: number
  nik: string
  namaPihak: string
  nomorPerkara: string
  tanggal: string
  slot: SlotInfo
  ruangan: string
  onNext: (ticket: QueueTicket) => void
  onBack: () => void
  onError: (message: string) => void
}

export function StepConfirm({
  perkaraId,
  nik,
  namaPihak,
  nomorPerkara,
  tanggal,
  slot,
  ruangan,
  onNext,
  onBack,
  onError,
}: StepConfirmProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Race condition handling - slot availability state
  const [slotStatus, setSlotStatus] = useState<{
    isAvailable: boolean
    lastChecked: Date | null
    isChecking: boolean
  }>({ isAvailable: true, lastChecked: null, isChecking: false })

  // Cek ketersediaan slot setiap 30 detik
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

    // Initial check
    checkSlotAvailability()

    // Refresh setiap 30 detik
    const interval = setInterval(checkSlotAvailability, 30000)
    return () => clearInterval(interval)
  }, [perkaraId, tanggal, slot.time])

  const endHour = parseInt(slot.time.split(":")[0], 10) + 1
  const endTime = `${endHour.toString().padStart(2, "0")}:00`

  const formatTanggal = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

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

  return (
    <BlurFade>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Konfirmasi Booking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* RINGKASAN BOOKING dengan Visual Hierarchy yang Kuat */}
          <div className="rounded-xl border-2 border-primary/20 overflow-hidden">
            {/* Header: Jadwal (Paling Penting) - Gradient Background */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-3 text-white sm:p-5">
              <div className="text-[10px] font-medium uppercase tracking-wider text-white/70 mb-1 sm:text-xs sm:mb-2">
                Jadwal Sidang Anda
              </div>
              <div className="text-lg font-bold sm:text-2xl">{formatTanggal(tanggal)}</div>
              <div className="mt-2 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex items-center gap-1.5 rounded-lg bg-white/20 px-2 py-1 sm:px-3 sm:py-1.5">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs font-bold sm:text-sm">{slot.time} — {endTime}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-2 py-1 sm:px-3 sm:py-1.5">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs font-bold text-secondary-foreground sm:text-sm">{ruangan}</span>
                </div>
              </div>
            </div>

            {/* Body: Detail Perkara */}
            <div className="p-3 space-y-3 sm:p-5 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted sm:h-10 sm:w-10">
                  <FileText className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
                    Nomor Perkara
                  </div>
                  <div className="truncate text-sm font-semibold sm:text-base">{nomorPerkara}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted sm:h-10 sm:w-10">
                  <User className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
                    Nama Pihak
                  </div>
                  <div className="truncate text-sm font-semibold sm:text-base">{namaPihak}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Slot Availability Warning - Race Condition Handling */}
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

          {/* Warning dengan Emphasis */}
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

          {/* Navigation */}
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
