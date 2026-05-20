"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/magic/blur-fade"
import { motion } from "framer-motion"
import { CheckCircle, Search, Plus, Clock, MapPin, FileText, User } from "lucide-react"
import type { QueueTicket } from "@/lib/api-types"

interface StepTicketProps {
  ticket: QueueTicket & { slot_time: string }
  onCheckStatus: () => void
  onBookAgain: () => void
}

export function StepTicket({ ticket, onCheckStatus, onBookAgain }: StepTicketProps) {
  const endHour = parseInt(ticket.slot_time.split(':')[0], 10) + 1
  const endTime = `${endHour.toString().padStart(2, '0')}:00`

  return (
    <BlurFade>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Booking Berhasil!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nomor Antrian */}
          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <p className="mb-2 text-sm text-muted-foreground">Nomor Antrian Anda</p>
            <div className="text-5xl font-bold text-primary">{ticket.queue_number}</div>
          </motion.div>

          {/* Detail Tiket */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Jam Sidang</div>
                <div className="font-medium">{ticket.slot_time} - {endTime}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Ruangan</div>
                <div className="font-medium">{ticket.ruang_sidang}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Perkara</div>
                <div className="font-medium">{ticket.nomor_perkara}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Pihak</div>
                <div className="font-medium">{ticket.pihak_nama}</div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted p-3">
            <div className="h-3 w-3 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-sm font-medium">Status: Menunggu</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={onCheckStatus} className="flex-1">
              <Search className="mr-2 h-4 w-4" />
              Cek Status Antrian
            </Button>
            <Button variant="outline" onClick={onBookAgain} className="flex-1">
              <Plus className="mr-2 h-4 w-4" />
              Booking Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
