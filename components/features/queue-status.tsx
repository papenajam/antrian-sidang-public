"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BlurFade } from "@/components/magic/blur-fade"
import { NumberTicker } from "@/components/magic/number-ticker"
import { motion } from "framer-motion"
import { Users, Clock, CheckCircle, ArrowLeftRight, Info, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RescheduleDialog } from "./reschedule-dialog"
import { getTodaySchedule, calculateQueueStatistics } from "@/lib/queue-service"
import { toast } from "sonner"

interface QueueData {
  currentNumber: number
  waitingCount: number
  processedToday: number
  lastUpdated: string
}

interface QueueStatusProps {
  queueNumber?: string
  perkaraId?: number
  currentSlot?: string
  tanggal?: string
  isActive?: boolean
}

export function QueueStatus({
  queueNumber: propQueueNumber,
  perkaraId: propPerkaraId,
  currentSlot: propCurrentSlot,
  tanggal: propTanggal,
  isActive = false,
}: QueueStatusProps) {
  const [data, setData] = useState<QueueData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showReschedule, setShowReschedule] = useState(false)
  const [hasData, setHasData] = useState(false)

  const [bookingState] = useState<{
    queueNumber: string | null
    perkaraId: number | null
    currentSlot: string | null
    tanggal: string | null
  }>({
    queueNumber: propQueueNumber || null,
    perkaraId: propPerkaraId || null,
    currentSlot: propCurrentSlot || null,
    tanggal: propTanggal || null,
  })

  const fetchData = async () => {
    try {
      const scheduleResponse = await getTodaySchedule()

      if (scheduleResponse.error) {
        toast.error(scheduleResponse.error)
        return
      }

      const statistics = calculateQueueStatistics(
        scheduleResponse.data,
        []
      )

      // Check if we have real data
      const hasRealData = statistics.currentNumber > 0 ||
        statistics.waitingCount > 0 ||
        statistics.processedToday > 0 ||
        scheduleResponse.data.length > 0

      setHasData(hasRealData)

      setData({
        currentNumber: statistics.currentNumber,
        waitingCount: statistics.waitingCount,
        processedToday: statistics.processedToday,
        lastUpdated: statistics.lastUpdated || "-",
      })
    } catch (error) {
      toast.error("Gagal memuat status antrian")
      console.error("Error fetching queue status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleCheckStatus = () => {
    if (bookingState.queueNumber) {
      toast.info(`Cek status untuk: ${bookingState.queueNumber}`)
    } else {
      toast.info("Fitur cek status akan segera tersedia.")
    }
  }

  const handleReschedule = () => {
    if (!bookingState.queueNumber || !bookingState.perkaraId || !bookingState.currentSlot || !bookingState.tanggal) {
      toast.warning("Fitur ganti jadwal tersedia setelah Anda melakukan booking")
      return
    }
    setShowReschedule(true)
  }

  const hasActiveBooking = isActive || bookingState.queueNumber !== null

  if (isLoading) {
    return (
      <Card className="overflow-hidden border border-muted-foreground/10 shadow-premium bg-card/60 backdrop-blur-md">
        <CardHeader className="border-b border-muted/10 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
            Status Antrian Saat Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-28 w-full rounded-2xl bg-muted/65" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full rounded-2xl bg-muted/65" />
            <Skeleton className="h-20 w-full rounded-2xl bg-muted/65" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl bg-muted/65" />
        </CardContent>
      </Card>
    )
  }

  return (
    <BlurFade>
      <Card className="overflow-hidden border border-muted-foreground/10 shadow-premium bg-card/60 backdrop-blur-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4 border-b border-muted/10">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-heading text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Status Antrian Saat Ini
            </span>
            {data?.lastUpdated && data.lastUpdated !== "-" && (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                Update: {data.lastUpdated}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Nomor antrian yang sedang dipanggil - Hero section */}
          <motion.div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-hover p-6 text-center text-white shadow-xl border border-white/10 sm:p-8"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0" />

            <div className="relative">
              {/* Pulse indicator */}
              <div className="absolute -right-1 -top-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-white" />
              </div>

              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/85 sm:text-sm">
                Nomor Antrian Sekarang
              </div>
              <div className="text-6xl font-heading font-extrabold tracking-tight sm:text-7xl lg:text-8xl text-white drop-shadow-md">
                {!hasData && data?.currentNumber === 0 ? (
                  <span className="text-white/70">—</span>
                ) : (
                  <NumberTicker
                    value={data?.currentNumber || 0}
                    duration={1.5}
                    showDashForZero={true}
                  />
                )}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 bg-white/10 rounded-full py-1.5 px-4 w-fit mx-auto border border-white/10">
                <div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse sm:h-3 sm:w-3" />
                <span className="text-xs font-semibold text-white/95 sm:text-sm uppercase tracking-wider">
                  Sedang Dipanggil
                </span>
              </div>
            </div>
          </motion.div>

          {/* Statistik antrian - Grid cards */}
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {/* Menunggu */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl border border-muted/40 bg-card/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium hover:border-secondary/40"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute left-0 top-0 h-full w-1.5 bg-secondary" />
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-heading font-bold">
                    {!hasData && data?.waitingCount === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <NumberTicker
                        value={data?.waitingCount || 0}
                        duration={1.5}
                        showDashForZero={true}
                      />
                    )}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Menunggu
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Selesai */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl border border-muted/40 bg-card/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium hover:border-primary/30"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute left-0 top-0 h-full w-1.5 bg-primary" />
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/15">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-heading font-bold">
                    {!hasData && data?.processedToday === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <NumberTicker
                        value={data?.processedToday || 0}
                        duration={1.5}
                        showDashForZero={true}
                      />
                    )}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Selesai Hari Ini
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Informasi estimasi waktu */}
          {hasData && (
            <motion.div
              className="flex items-center gap-4 rounded-2xl bg-muted/40 border border-muted/10 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground">
                  Estimasi Waktu Tunggu
                </div>
                <div className="text-base font-bold text-foreground">
                  15-20 menit per nomor
                </div>
              </div>
            </motion.div>
          )}

          {/* Info jika belum ada data */}
          {!hasData && (
            <motion.div
              className="flex items-center gap-4 rounded-2xl bg-muted/45 border border-muted/10 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">
                  Belum ada data antrian hari ini
                </div>
                <div className="text-xs text-muted-foreground/80">
                  Data akan muncul otomatis setelah ada pendaftaran
                </div>
              </div>
            </motion.div>
          )}

          {/* Tombol aksi */}
          <motion.div
            className="flex flex-col gap-3 sm:flex-row sm:gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="outline"
              onClick={handleCheckStatus}
              className="flex-1 gap-2 rounded-xl border border-muted-foreground/20 hover:border-primary hover:bg-primary/5 hover:text-primary py-5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-premium focus-ring"
            >
              <Info className="h-4 w-4" />
              Cek Status
            </Button>
            <Button
              variant={hasActiveBooking ? "outline" : "ghost"}
              onClick={handleReschedule}
              disabled={!hasActiveBooking}
              className="flex-1 gap-2 rounded-xl border border-muted-foreground/20 hover:border-secondary hover:bg-secondary/5 hover:text-secondary-hover py-5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-premium disabled:cursor-not-allowed disabled:opacity-50 focus-ring"
              title={!hasActiveBooking ? "Fitur ganti jadwal tersedia setelah booking" : ""}
            >
              <ArrowLeftRight className="h-4 w-4" />
              Ganti Jadwal
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      {/* Dialog ganti jadwal */}
      {bookingState.queueNumber && bookingState.perkaraId && bookingState.currentSlot && bookingState.tanggal && (
        <RescheduleDialog
          open={showReschedule}
          onOpenChange={setShowReschedule}
          queueNumber={bookingState.queueNumber}
          perkaraId={bookingState.perkaraId}
          currentSlot={bookingState.currentSlot}
          tanggal={bookingState.tanggal}
          onSuccess={() => {
            fetchData()
            toast.success("Jadwal berhasil diubah!")
          }}
        />
      )}
    </BlurFade>
  )
}