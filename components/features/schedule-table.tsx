"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { BlurFade } from "@/components/magic/blur-fade"
import { Calendar, Clock, User } from "lucide-react"
import { getTodaySchedule } from "@/lib/queue-service"
import type { JadwalSidang } from "@/lib/api-types"
import { toast } from "sonner"

interface Schedule {
  id: string
  perkaraId: number
  caseNumber: string
  partyName: string
  time: string
  room: string
  agenda: string
  status: "scheduled" | "in_progress" | "completed" | "postponed"
}

export function ScheduleTable() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getTodaySchedule()
        
        if (response.error) {
          toast.error(response.error)
          setSchedules([])
        } else {
          // Transform API response ke format component
          const transformed: Schedule[] = response.data.map(
            (jadwal: JadwalSidang) => ({
              id: jadwal.perkara_id.toString(),
              perkaraId: jadwal.perkara_id,
              caseNumber: jadwal.nomor_perkara,
              partyName: jadwal.pihak_nama,
              time: jadwal.waktu,
              room: jadwal.ruangan,
              agenda: jadwal.agenda,
              status: "scheduled" as const,
            })
          )
          setSchedules(transformed)
        }
      } catch (error) {
        toast.error("Gagal memuat jadwal sidang")
        console.error("Error fetching schedule:", error)
        setSchedules([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    
    // Refresh data setiap 60 detik
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: Schedule["status"]) => {
    const statusConfig = {
      scheduled: { label: "Terjadwal", variant: "secondary" as const },
      in_progress: { label: "Sedang Berlangsung", variant: "default" as const },
      completed: { label: "Selesai", variant: "outline" as const },
      postponed: { label: "Ditunda", variant: "destructive" as const },
    }
    return statusConfig[status]
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jadwal Sidang Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <BlurFade delay={0.2}>
      <Card id="jadwal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Jadwal Sidang Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedules.map((schedule, index) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {schedule.time.split(":")[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{schedule.caseNumber}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{schedule.partyName}</span>
                    </div>
                    {schedule.agenda && (
                      <div className="mt-1 text-xs text-muted-foreground truncate">
                        Agenda: {schedule.agenda}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex flex-shrink-0 flex-wrap items-center justify-end gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {schedule.time}
                  </div>
                  <div className="font-medium">{schedule.room}</div>
                  <Badge variant={getStatusBadge(schedule.status).variant}>
                    {getStatusBadge(schedule.status).label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
