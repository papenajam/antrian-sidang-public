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
            <div className="bg-gradient-to-r from-primary to-primary/80 p-5 text-white">
              <div className="text-xs font-medium uppercase tracking-wider text-white/70 mb-2">
                Jadwal Sidang Anda
              </div>
              <div className="text-2xl font-bold">{formatTanggal(tanggal)}</div>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1.5">
                  <Clock className="h-4 w-4" />
                  <span className="font-bold">{slot.time} — {endTime}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
                  <MapPin className="h-4 w-4" />
                  <span className="font-bold text-secondary-foreground">{ruangan}</span>
                </div>
              </div>
            </div>

            {/* Body: Detail Perkara */}
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Nomor Perkara
                  </div>
                  <div className="font-semibold">{nomorPerkara}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Nama Pihak
                  </div>
                  <div className="font-semibold">{namaPihak}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Slot Availability Warning - Race Condition Handling */}
          {slotStatus.isChecking ? (
            <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <p className="text-sm text-blue-800">Memeriksa ketersediaan slot...</p>
            </div>
          ) : !slotStatus.isAvailable ? (
            <div className="flex items-start gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4">
              <AlertOctagon className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <div className="text-sm text-red-800">
                <p className="font-semibold">⚠️ Maaf, slot ini sudah terisi!</p>
                <p className="mt-1">Slot yang Anda pilih sudah tidak tersedia. Silakan pilih jam lain.</p>
              </div>
            </div>
          ) : slotStatus.lastChecked && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
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
          <div className="flex items-start gap-3 rounded-xl border-2 border-yellow-200 bg-yellow-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">⚠️ Perhatian Penting:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Booking yang sudah dikonfirmasi <strong>tidak dapat dibatalkan</strong></li>
                <li>Pastikan data di atas sudah benar sebelum melanjutkan</li>
                <li>Harap datang 15 menit sebelum jam sidang</li>
              </ul>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting || !slotStatus.isAvailable}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Konfirmasi Booking
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
