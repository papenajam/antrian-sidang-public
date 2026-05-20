"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/magic/blur-fade"
import { CheckCircle, ArrowLeft, Loader2, AlertTriangle } from "lucide-react"
import { bookQueueWizard } from "@/lib/queue-service"
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

  const endHour = parseInt(slot.time.split(':')[0], 10) + 1
  const endTime = `${endHour.toString().padStart(2, '0')}:00`

  const formatTanggal = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
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
    } catch (error) {
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
          {/* Ringkasan */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nomor Perkara</span>
              <span className="font-medium">{nomorPerkara}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pihak</span>
              <span className="font-medium">{namaPihak}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal Sidang</span>
              <span className="font-medium">{formatTanggal(tanggal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jam Sidang</span>
              <span className="font-medium">{slot.time} - {endTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ruangan</span>
              <span className="font-medium">{ruangan}</span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 rounded-lg bg-yellow-50 p-4 text-yellow-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p className="text-sm">
              <strong>Perhatian:</strong> Booking yang sudah dikonfirmasi tidak dapat dibatalkan.
              Pastikan data di atas sudah benar sebelum melanjutkan.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting}>
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
