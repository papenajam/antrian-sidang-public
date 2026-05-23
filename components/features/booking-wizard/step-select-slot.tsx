"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/magic/blur-fade"
import { SlotCard } from "@/components/features/slot-card"
import { Calendar, Clock, ArrowLeft, ArrowRight, Loader2, MapPin, AlertCircle } from "lucide-react"
import { getAvailableSlots } from "@/lib/queue-service"
import type { SlotInfo } from "@/lib/api-types"

interface StepSelectSlotProps {
  perkaraId: number
  tanggal: string
  ruangan?: string // Tambahan: ruangan dari jadwal
  onNext: (slot: SlotInfo) => void
  onBack: () => void
  currentSlot?: string // Untuk reschedule, slot yang sedang aktif
}

export function StepSelectSlot({ perkaraId, tanggal, ruangan, onNext, onBack, currentSlot }: StepSelectSlotProps) {
  const [slots, setSlots] = useState<SlotInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    async function fetchSlots() {
      try {
        const response = await getAvailableSlots(perkaraId, tanggal)
        setSlots(response.data.slots)
        setLastRefresh(new Date())
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
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatJam = () => {
    return lastRefresh.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
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
          {/* INFO JADWAL - DITONJOLKAN dengan gradient header */}
          <div className="rounded-xl border-2 border-primary/20 overflow-hidden shadow-sm">
            {/* Header: Tanggal & Ruangan - Prioritas Tertinggi */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-white/70">
                      Tanggal Sidang
                    </div>
                    <div className="text-base font-bold text-white">{formatTanggal(tanggal)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-white/70">
                      Ruangan
                    </div>
                    <div className="text-base font-bold text-white">
                      {ruangan || "Akan ditentukan"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slot saat ini (untuk reschedule) */}
            {currentSlot && (
              <div className="border-t border-white/10 bg-yellow-50 px-5 py-3">
                <div className="flex items-center gap-2 text-sm text-yellow-800">
                  <Clock className="h-4 w-4" />
                  <span>
                    <strong>Slot saat ini:</strong> {currentSlot} — silakan pilih jam baru jika ingin
                    ganti jadwal
                  </span>
                </div>
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
            <>
              {/* Header Slot Selection */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Pilih waktu yang tersedia:
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Diperbarui {formatJam()}</span>
                </div>
              </div>

              {/* Slot Grid */}
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

              {/* Empty State */}
              {slots.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 text-center">
                  <AlertCircle className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-medium">Tidak ada slot tersedia</p>
                  <p className="text-sm text-muted-foreground">
                    Silakan coba jadwal lain atau hubungi pengadilan
                  </p>
                </div>
              )}
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
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
