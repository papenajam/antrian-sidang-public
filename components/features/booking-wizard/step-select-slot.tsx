"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/magic/blur-fade"
import { SlotCard } from "@/components/features/slot-card"
import { Calendar, Clock, ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { getAvailableSlots } from "@/lib/queue-service"
import type { SlotInfo } from "@/lib/api-types"

interface StepSelectSlotProps {
  perkaraId: number
  tanggal: string
  onNext: (slot: SlotInfo) => void
  onBack: () => void
  currentSlot?: string // Untuk reschedule, slot yang sedang aktif
}

export function StepSelectSlot({ perkaraId, tanggal, onNext, onBack, currentSlot }: StepSelectSlotProps) {
  const [slots, setSlots] = useState<SlotInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSlots() {
      try {
        const response = await getAvailableSlots(perkaraId, tanggal)
        setSlots(response.data.slots)
      } catch (error) {
        console.error("Error fetching slots:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlots()
  }, [perkaraId, tanggal])

  const handleNext = () => {
    if (!selectedSlot) return
    const slot = slots.find((s) => s.time === selectedSlot)
    if (slot) {
      onNext(slot)
    }
  }

  // Format tanggal untuk display
  const formatTanggal = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <BlurFade>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Pilih Jam Sidang
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Jadwal */}
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Jadwal Sidang: <strong>{formatTanggal(tanggal)}</strong></span>
            </div>
            {currentSlot && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Slot saat ini: <strong>{currentSlot}</strong></span>
              </div>
            )}
          </div>

          {/* Slot Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Memuat slot...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {slots.map((slot) => (
                <SlotCard
                  key={slot.time}
                  slot={slot}
                  selected={selectedSlot === slot.time}
                  onSelect={setSelectedSlot}
                />
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
            <Button onClick={handleNext} disabled={!selectedSlot}>
              Lanjutkan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
