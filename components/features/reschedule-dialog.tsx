"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SlotCard } from "./slot-card"
import { Loader2, ArrowLeftRight } from "lucide-react"
import { getAvailableSlots, rescheduleQueue } from "@/lib/queue-service"
import { toast } from "sonner"
import type { SlotInfo } from "@/lib/api-types"

interface RescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  queueNumber: string
  perkaraId: number
  currentSlot: string
  tanggal: string
  onSuccess: () => void
}

export function RescheduleDialog({
  open,
  onOpenChange,
  queueNumber,
  perkaraId,
  currentSlot,
  tanggal,
  onSuccess,
}: RescheduleDialogProps) {
  const [slots, setSlots] = useState<SlotInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    async function fetchSlots() {
      setIsLoading(true)
      try {
        const response = await getAvailableSlots(perkaraId, tanggal)
        setSlots(response.data.slots)
      } catch (error) {
        console.error("Error fetching slots:", error)
        toast.error("Gagal memuat slot tersedia")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlots()
  }, [open, perkaraId, tanggal])

  const handleConfirm = async () => {
    if (!selectedSlot) return

    setIsSubmitting(true)

    try {
      await rescheduleQueue({
        queue_number: queueNumber,
        perkara_id: perkaraId,
        new_slot_time: selectedSlot,
      })

      toast.success("Jadwal berhasil diubah!", {
        description: `Slot baru: ${selectedSlot}`,
      })

      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error("Gagal mengubah jadwal. Slot mungkin sudah penuh.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Hitung jam akhir slot saat ini (1 jam setelah jam mulai)
  const endHour = parseInt(currentSlot.split(':')[0], 10) + 1
  const endTime = `${endHour.toString().padStart(2, '0')}:00`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            Ganti Jadwal
          </DialogTitle>
          <DialogDescription>
            Pilih slot baru untuk mengganti jadwal Anda saat ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Slot Saat Ini */}
          <div className="rounded-lg bg-muted p-3 text-sm">
            <span className="text-muted-foreground">Slot saat ini: </span>
            <strong>{currentSlot} - {endTime}</strong>
          </div>

          {/* Slot Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Memuat slot...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {slots.map((slot) => (
                <SlotCard
                  key={slot.time}
                  slot={slot}
                  selected={selectedSlot === slot.time}
                  onSelect={setSelectedSlot}
                  disabled={slot.time === currentSlot}
                />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedSlot || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Konfirmasi Ganti Jadwal"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
