"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BlurFade } from "@/components/magic/blur-fade"
import { NumberTicker } from "@/components/magic/number-ticker"
import { motion } from "framer-motion"
import { Users, Clock, CheckCircle, ArrowLeftRight, Info } from "lucide-react"
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
      <Card>
        <CardHeader>
          <CardTitle>Status Antrian Saat Ini</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <BlurFade>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Status Antrian Saat Ini</span>
            {data?.lastUpdated && data.lastUpdated !== "-" && (
              <span className="text-sm font-normal text-muted-foreground">
                Update: {data.lastUpdated}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nomor antrian yang sedang dipanggil */}
          <motion.div
            className="rounded-lg bg-gradient-to-r from-primary to-primary/80 p-6 text-center text-white"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-sm font-medium opacity-80">Nomor Antrian Sekarang</div>
            <div className="text-6xl font-bold">
              {!hasData && data?.currentNumber === 0 ? (
                <span>—</span>
              ) : (
                <NumberTicker 
                  value={data?.currentNumber || 0} 
                  duration={1.5} 
                  showDashForZero={true}
                />
              )}
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-green-400 motion-safe:animate-pulse" />
              Sedang Dipanggil
            </div>
          </motion.div>

          {/* Statistik antrian */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-yellow-100 p-2">
                  <Users className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
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
                  <div className="text-sm text-muted-foreground">Menunggu</div>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
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
                  <div className="text-sm text-muted-foreground">Selesai Hari Ini</div>
                </div>
              </div>
            </div>
          </div>

          {/* Informasi estimasi waktu - hanya tampil jika ada data */}
          {hasData && (
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Estimasi waktu tunggu: <strong>15-20 menit</strong> per nomor
              </span>
            </div>
          )}

          {/* Info jika belum ada data antrian */}
          {!hasData && (
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Belum ada data antrian untuk hari ini</span>
            </div>
          )}

          {/* Tombol aksi */}
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={handleCheckStatus}
              className="flex-1"
            >
              <Info className="mr-2 h-4 w-4" />
              Cek Status
            </Button>
            <Button
              variant={hasActiveBooking ? "outline" : "ghost"}
              onClick={handleReschedule}
              disabled={!hasActiveBooking}
              className="flex-1"
              title={!hasActiveBooking ? "Fitur ganti jadwal tersedia setelah booking" : ""}
            >
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Ganti Jadwal
            </Button>
          </div>
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
