"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/magic/blur-fade"
import { Clock, FileText, Search, ArrowLeftRight, Plus, Info } from "lucide-react"
import type { ExistingQueue } from "@/lib/api-types"

interface ExistingQueueCardProps {
  queue: ExistingQueue
  onViewStatus: () => void
  onReschedule: () => void
  onBookAgain: () => void
}

export function ExistingQueueCard({
  queue,
  onViewStatus,
  onReschedule,
  onBookAgain,
}: ExistingQueueCardProps) {
  const endHour = queue.slot_time ? parseInt(queue.slot_time.split(':')[0], 10) + 1 : 0
  const endTime = queue.slot_time ? `${endHour.toString().padStart(2, '0')}:00` : "-"

  const statusLabels: Record<string, string> = {
    waiting: 'Menunggu',
    in_service: 'Sedang Dilayani',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    skipped: 'Dilewati',
    no_show: 'Tidak Hadir',
  }

  return (
    <BlurFade>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Booking Sudah Ada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info message */}
          <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-blue-800">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p className="text-sm">
              Perkara ini sudah memiliki booking. Anda akan mendapatkan nomor antrian yang sama.
            </p>
          </div>

          {/* Queue info */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nomor Antrian</span>
              <span className="text-2xl font-bold text-primary">{queue.queue_number}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Jam Sidang</div>
                <div className="font-medium">{queue.slot_time || "-"} - {endTime}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="font-medium">{statusLabels[queue.status] || queue.status}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={onViewStatus} className="flex-1">
              <Search className="mr-2 h-4 w-4" />
              Lihat Status
            </Button>
            <Button variant="outline" onClick={onReschedule} className="flex-1">
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Ganti Jadwal
            </Button>
            <Button variant="outline" onClick={onBookAgain} className="flex-1">
              <Plus className="mr-2 h-4 w-4" />
              Booking Baru
            </Button>
          </div>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
