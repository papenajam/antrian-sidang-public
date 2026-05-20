"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BlurFade } from "@/components/magic/blur-fade"
import { NumberTicker } from "@/components/magic/number-ticker"
import { motion } from "framer-motion"
import { Users, Clock, CheckCircle, ArrowLeftRight } from "lucide-react"
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

export function QueueStatus() {
  const [data, setData] = useState<QueueData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showReschedule, setShowReschedule] = useState(false)

  // Fungsi fetch data dipisah agar bisa dipanggil ulang dari onSuccess
  const fetchData = async () => {
    try {
      // Fetch jadwal hari ini
      const scheduleResponse = await getTodaySchedule()

      if (scheduleResponse.error) {
        toast.error(scheduleResponse.error)
        return
      }

      // Hitung statistik dari data jadwal
      // Karena API tidak mengembalikan data tiket secara langsung,
      // kita gunakan data jadwal sebagai acuan
      const statistics = calculateQueueStatistics(
        scheduleResponse.data,
        [] // TODO: Perlu endpoint untuk fetch semua tiket hari ini
      )

      setData({
        currentNumber: statistics.currentNumber,
        waitingCount: statistics.waitingCount,
        processedToday: statistics.processedToday,
        lastUpdated: statistics.lastUpdated,
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

    // Refresh data setiap 30 detik
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

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
            <span className="text-sm font-normal text-muted-foreground">
              Update: {data?.lastUpdated}
            </span>
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
              <NumberTicker value={data?.currentNumber || 0} duration={1.5} />
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 text-sm">
              <div
                className="h-3 w-3 rounded-full bg-green-400 motion-safe:animate-pulse"
              />
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
                  <div className="text-2xl font-bold">{data?.waitingCount}</div>
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
                  <div className="text-2xl font-bold">{data?.processedToday}</div>
                  <div className="text-sm text-muted-foreground">Selesai Hari Ini</div>
                </div>
              </div>
            </div>
          </div>

          {/* Informasi estimasi waktu */}
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Estimasi waktu tunggu: <strong>15-20 menit</strong> per nomor
            </span>
          </div>

          {/* Tombol ganti jadwal */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowReschedule(true)}
              className="mt-4"
            >
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Ganti Jadwal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog ganti jadwal */}
      <RescheduleDialog
        open={showReschedule}
        onOpenChange={setShowReschedule}
        queueNumber="A-003" // TODO: Ambil dari state booking
        perkaraId={123} // TODO: Ambil dari state booking
        currentSlot="09:00" // TODO: Ambil dari state booking
        tanggal={new Date().toISOString().split('T')[0]}
        onSuccess={() => {
          fetchData()
        }}
      />
    </BlurFade>
  )
}
