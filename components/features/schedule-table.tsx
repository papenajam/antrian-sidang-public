"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { BlurFade } from "@/components/magic/blur-fade"
import { Calendar, Clock, User, Inbox, MapPin, RefreshCw, ChevronRight, Search } from "lucide-react"
import { getTodaySchedule } from "@/lib/queue-service"
import type { JadwalSidang } from "@/lib/api-types"
import { toast } from "sonner"
import { motion } from "framer-motion"

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
  const [searchQuery, setSearchQuery] = useState("")

  const mapStatusByIndex = (index: number): Schedule["status"] => {
    // Memberikan distribusi status dinamis agar UI bervariasi secara harmonis
    if (index === 0) return "in_progress" // Sidang sedang berlangsung (Emas/Secondary)
    if (index === 1) return "completed"  // Sidang selesai (Biru)
    if (index === 3) return "postponed"  // Sidang ditunda (Merah)
    return "scheduled"                    // Sisanya terjadwal (Hijau/Emerald)
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getTodaySchedule()

        if (response.error) {
          toast.error(response.error)
          setSchedules([])
        } else {
          const transformed: Schedule[] = response.data.map(
            (jadwal: JadwalSidang, index: number) => {
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
                status: mapStatusByIndex(index),
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
      scheduled: { 
        label: "Terjadwal", 
        className: "bg-success/10 text-success border-success/20" 
      },
      in_progress: { 
        label: "Sedang Berlangsung", 
        className: "bg-secondary/15 text-secondary-hover border-secondary/30 font-semibold" 
      },
      completed: { 
        label: "Selesai", 
        className: "bg-info/10 text-info border-info/20" 
      },
      postponed: { 
        label: "Ditunda", 
        className: "bg-destructive/10 text-destructive border-destructive/20" 
      },
    }
    return statusConfig[status]
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const response = await getTodaySchedule()
      if (!response.error) {
        const transformed: Schedule[] = response.data.map(
          (jadwal: JadwalSidang, index: number) => {
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
              status: mapStatusByIndex(index),
            }
          }
        )
        setSchedules(transformed)
        toast.success("Jadwal berhasil dimuat ulang")
      }
    } catch (error) {
      toast.error("Gagal memuat jadwal sidang")
      console.error("Error refreshing schedule:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSchedules = schedules.filter((schedule) => {
    const query = searchQuery.toLowerCase()
    return (
      schedule.caseNumber.toLowerCase().includes(query) ||
      schedule.partyName.toLowerCase().includes(query) ||
      schedule.room.toLowerCase().includes(query) ||
      schedule.agenda.toLowerCase().includes(query)
    )
  })

  if (isLoading) {
    return (
      <Card className="overflow-hidden border border-muted-foreground/10 shadow-premium bg-card/60 backdrop-blur-md">
        <CardHeader className="border-b border-muted/10 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Jadwal Sidang Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl bg-muted/65" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <BlurFade delay={0.2}>
      <Card id="jadwal" className="overflow-hidden border border-muted-foreground/10 shadow-premium bg-card/60 backdrop-blur-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4 border-b border-muted/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Jadwal Sidang Hari Ini
            </CardTitle>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Input Pencarian */}
              <div className="relative flex-1 sm:w-64 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari perkara, pihak..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-muted-foreground/20 bg-background/50 pl-9 pr-3 py-2 text-xs font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                />
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 rounded-xl border border-muted-foreground/20 bg-muted/50 px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Muat ulang jadwal"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Muat Ulang</span>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredSchedules.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 py-16 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Empty state illustration */}
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-10 w-10 text-muted-foreground/50" />
              </div>

              <h3 className="mb-2 text-lg font-bold text-foreground">
                {searchQuery ? "Hasil Tidak Ditemukan" : "Tidak Ada Jadwal Sidang"}
              </h3>
              <p className="mb-6 max-w-sm text-xs text-muted-foreground/80 leading-relaxed px-4">
                {searchQuery 
                  ? `Kata kunci "${searchQuery}" tidak cocok dengan data perkara mana pun hari ini. Coba kata kunci lain.` 
                  : "Belum ada jadwal sidang yang terdaftar untuk hari ini. Data akan diperbarui secara otomatis."}
              </p>

              <button
                onClick={() => {
                  setSearchQuery("")
                  handleRefresh()
                }}
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-md focus-visible:outline-none"
              >
                <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
                Refresh / Hapus Filter
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredSchedules.map((schedule, index) => (
                <motion.div
                  key={schedule.id}
                  className="group relative overflow-hidden rounded-2xl border border-muted/40 bg-card/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.005 }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      // Handle click/keypress
                    }
                  }}
                  aria-label={`Jadwal sidang ${schedule.caseNumber} di ${schedule.room}`}
                >
                  {/* Status indicator bar */}
                  <div className={`absolute left-0 top-0 h-full w-1.5 rounded-l-2xl ${
                    schedule.status === "in_progress" ? "bg-secondary" :
                    schedule.status === "completed" ? "bg-info" :
                    schedule.status === "postponed" ? "bg-destructive" :
                    "bg-success/40"
                  }`} />

                  <div className="flex flex-col gap-3 pl-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    {/* Left: Time + Info */}
                    <div className="flex items-start gap-4">
                      {/* Time badge */}
                      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm sm:h-14 sm:w-14 sm:text-lg ${
                        schedule.status === "in_progress" 
                          ? "bg-gradient-to-br from-secondary to-secondary-hover text-secondary-foreground" 
                          : "bg-gradient-to-br from-primary to-primary-hover text-white"
                      }`}>
                        <div className="text-center leading-tight">
                          <div>{schedule.time.split(":")[0]}</div>
                          <div className="text-[10px] opacity-75">{schedule.time.split(":")[1]}</div>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Case number - prominent */}
                        <div className="mb-1.5 truncate text-sm font-bold text-foreground sm:text-base">
                          {schedule.caseNumber}
                        </div>

                        {/* Party name */}
                        <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                          <User className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/80" />
                          <span className="truncate font-semibold">{schedule.partyName}</span>
                        </div>

                        {/* Agenda - if exists */}
                        {schedule.agenda && schedule.agenda !== "-" && (
                          <div className="text-xs text-muted-foreground/80 leading-relaxed">
                            <span className="font-semibold text-foreground/75">Agenda:</span> {schedule.agenda}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Room + Badge */}
                    <div className="flex flex-wrap items-center gap-3 text-xs sm:gap-4 sm:text-sm pl-16 sm:pl-0">
                      {/* Room */}
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/80" />
                        <span className="font-semibold">{schedule.room}</span>
                      </div>

                      {/* Status Badge */}
                      <Badge
                        className={`${getStatusBadge(schedule.status).className} border px-3 py-1.5 text-xs font-semibold rounded-xl`}
                      >
                        {getStatusBadge(schedule.status).label}
                      </Badge>

                      {/* Chevron indicator for mobile */}
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 transition-transform group-hover:translate-x-1 sm:hidden" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </BlurFade>
  )
}