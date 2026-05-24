"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/magic/blur-fade"
import { SlotCard } from "@/components/features/slot-card"
import { Calendar, Clock, ArrowLeft, ArrowRight, Loader2, MapPin, AlertCircle, Info } from "lucide-react"
import { getAvailableSlots } from "@/lib/queue-service"
import { formatDate } from "@/lib/utils"
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
            <div className="bg-gradient-to-r from-primary to-primary/80 p-3 sm:p-5">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-10 sm:w-10">
                    <Calendar className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-medium uppercase tracking-wider text-white/70 sm:text-xs">
                      Tanggal Sidang
                    </div>
                    <div className="truncate text-xs font-bold text-white sm:text-base">
                      {formatDate(tanggal)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-10 sm:w-10">
                    <MapPin className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-medium uppercase tracking-wider text-white/70 sm:text-xs">
                      Ruangan
                    </div>
                    <div className="truncate text-xs font-bold text-white sm:text-base">
                      {ruangan || "Akan ditentukan"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slot saat ini (untuk reschedule) */}
            {currentSlot && (
              <div className="border-t border-white/10 bg-yellow-50 px-3 py-2 sm:px-5 sm:py-3">
                <div className="flex items-center gap-1.5 text-[10px] text-yellow-800 sm:text-sm">
                  <Clock className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                  <span className="truncate sm:whitespace-normal">
                    <strong>Slot saat ini:</strong> {currentSlot} — silakan pilih jam baru jika ingin
                    ganti jadwal
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Slot Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary sm:h-6 sm:w-6" />
                  <span className="ml-2 text-sm">Memuat slot...</span>
                </div>
              ) : (
                <>
                  {/* Alert info kapasitas slot */}
                  <div className="bg-primary/5 border border-primary/15 rounded-md p-3 flex items-start gap-2">
                    <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Tiap slot menampung <strong>8 antrian</strong>
                    </p>
                  </div>

                  {/* Date kicker mono uppercase bracket */}
                  <p className="font-mono text-[.72rem] uppercase tracking-[.06em] text-muted-foreground mb-3">
                    [ Slot tersedia · {formatDate(tanggal)} ]
                  </p>

                  {/* Header Slot Selection */}
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-xs font-medium text-muted-foreground sm:text-sm">
                      Pilih waktu yang tersedia:
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground sm:text-xs">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse sm:h-2 sm:w-2" />
                      <span>Diperbarui {formatJam()}</span>
                    </div>
                  </div>

                  {/* Slot Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-4">
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
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-6 text-center sm:py-8">
                      <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground sm:mb-3 sm:h-10 sm:w-10" />
                      <p className="text-sm font-medium">Tidak ada slot tersedia</p>
                      <p className="text-xs text-muted-foreground">
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
