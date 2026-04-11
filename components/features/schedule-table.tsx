"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { BlurFade } from "@/components/magic/blur-fade"
import { Calendar, Clock, User } from "lucide-react"

interface Schedule {
  id: string
  caseNumber: string
  partyName: string
  time: string
  room: string
  status: "scheduled" | "in_progress" | "completed" | "postponed"
}

export function ScheduleTable() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulasi API call — akan diganti dengan API sungguhan nanti
    const timer = setTimeout(() => {
      setSchedules([
        {
          id: "1",
          caseNumber: "001/Pdt.G/2026/PA.Jkt",
          partyName: "Ahmad Susanto vs. Siti Aminah",
          time: "09:00",
          room: "Ruang 1",
          status: "in_progress",
        },
        {
          id: "2",
          caseNumber: "002/Pdt.G/2026/PA.Jkt",
          partyName: "Budi Santoso vs. Dewi Lestari",
          time: "10:00",
          room: "Ruang 2",
          status: "scheduled",
        },
        {
          id: "3",
          caseNumber: "003/Pdt.G/2026/PA.Jkt",
          partyName: "Candra Wijaya vs. Rina Marlina",
          time: "11:00",
          room: "Ruang 1",
          status: "scheduled",
        },
        {
          id: "4",
          caseNumber: "004/Pdt.G/2026/PA.Jkt",
          partyName: "Dian Purnama vs. Eko Prasetyo",
          time: "13:00",
          room: "Ruang 3",
          status: "postponed",
        },
        {
          id: "5",
          caseNumber: "005/Pdt.G/2026/PA.Jkt",
          partyName: "Fajar Nugroho vs. Gita Permani",
          time: "14:00",
          room: "Ruang 2",
          status: "scheduled",
        },
      ])
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
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
