"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { BlurFade } from "@/components/magic/blur-fade"
import { Calendar, Clock, User, Inbox, MapPin } from "lucide-react"
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
          const transformed: Schedule[] = response.data.map(
            (jadwal: JadwalSidang) => {
              const extractPartyName = (paraPihak: string | null): string => {
                if (!paraPihak) return "-"
                const cleanText = paraPihak.replace(/<[^>]*>/g, " ").trim()
                const firstParty = cleanText.split("  ")[0] || cleanText
                return firstParty || "-"
              }

              return {
                id: jadwal.perkara_id.toString(),
                perkaraId: jadwal.perkara_id,
                caseNumber: jadwal.perkara?.nomor_perkara || "-",
                partyName: extractPartyName(jadwal.perkara?.para_pihak || null),
                time: jadwal.jam_sidang ? jadwal.jam_sidang.substring(0, 5) : "00:00",
                room: jadwal.ruangan || "-",
                agenda: jadwal.agenda || "-",
                status: "scheduled" as const,
              }
            }
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
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: Schedule["status"]) => {
    const statusConfig = {
      scheduled: { label: "Terjadwal", variant: "secondary" as const },
      in_progress: { label: "Sedang", variant: "default" as const },
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
              <Skeleton key={i} className="h-20 w-full" />
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
          {schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
              <Inbox className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-medium">Tidak ada jadwal sidang hari ini</h3>
              <p className="text-sm text-muted-foreground">
                Belum ada jadwal sidang yang terdaftar untuk hari ini. Data akan diperbarui secara otomatis.
              </p>
              <button
                onClick={async () => {
                  setIsLoading(true)
                  try {
                    const response = await getTodaySchedule()
                    if (!response.error) {
                      const transformed: Schedule[] = response.data.map(
                        (jadwal: JadwalSidang) => {
                          const extractPartyName = (paraPihak: string | null): string => {
                            if (!paraPihak) return "-"
                            const cleanText = paraPihak.replace(/<[^>]*>/g, " ").trim()
                            const firstParty = cleanText.split("  ")[0] || cleanText
                            return firstParty || "-"
                          }

                          return {
                            id: jadwal.perkara_id.toString(),
                            perkaraId: jadwal.perkara_id,
                            caseNumber: jadwal.perkara?.nomor_perkara || "-",
                            partyName: extractPartyName(jadwal.perkara?.para_pihak || null),
                            time: jadwal.jam_sidang ? jadwal.jam_sidang.substring(0, 5) : "00:00",
                            room: jadwal.ruangan || "-",
                            agenda: jadwal.agenda || "-",
                            status: "scheduled" as const,
                          }
                        }
                      )
                      setSchedules(transformed)
                    }
                  } catch (error) {
                    toast.error("Gagal memuat jadwal sidang")
                    console.error("Error refreshing schedule:", error)
                  } finally {
                    setIsLoading(false)
                  }
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Calendar className="h-4 w-4" />
                Muat Ulang Jadwal
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule, index) => (
                <div
                  key={schedule.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  {/* Left: Time + Info */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                      {schedule.time.split(":")[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-sm sm:text-base">
                        {schedule.caseNumber}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                        <User className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{schedule.partyName}</span>
                      </div>
                      {schedule.agenda && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {schedule.agenda}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Time + Room + Badge */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{schedule.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{schedule.room}</span>
                    </div>
                    <Badge variant={getStatusBadge(schedule.status).variant} className="text-xs">
                      {getStatusBadge(schedule.status).label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </BlurFade>
  )
}
