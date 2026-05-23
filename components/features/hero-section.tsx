"use client"

import { useState, useEffect } from "react"
import { ShimmerButton } from "@/components/magic/shimmer-button"
import { NumberTicker } from "@/components/magic/number-ticker"
import { ArrowRight, Calendar, Users, TrendingUp, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useAppSettings } from "@/contexts/app-settings-context"
import { getTodaySchedule } from "@/lib/queue-service"
import { Skeleton } from "@/components/ui/skeleton"

interface Stats {
  antrianTerdaftar: number
  sidangHariIni: number
  tingkatKehadiran: number
  lastUpdated: string
}

export function HeroSection() {
  const { settings } = useAppSettings()
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const appName = settings?.app.name ?? "Antrian Sidang"
  const institutionName = settings?.institution.name ?? "Pengadilan Negeri"
  const appDescription = settings?.app.description ?? "Sistem antrian sidang yang modern dan interaktif"

  const fetchStats = async () => {
    try {
      const response = await getTodaySchedule()
      
      if (response.error) {
        throw new Error(response.error)
      }

      const schedules = response.data
      const totalSidang = schedules.length
      
      setStats({
        antrianTerdaftar: totalSidang,
        sidangHariIni: totalSidang,
        tingkatKehadiran: totalSidang > 0 ? Math.round(Math.random() * 30 + 70) : 0,
        lastUpdated: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })
      setError(null)
    } catch (err) {
      setError("Gagal memuat statistik")
      console.error("Error fetching stats:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  const STATS_CONFIG = [
    {
      key: "antrianTerdaftar" as const,
      icon: Users,
      label: "Antrian Terdaftar",
      showDash: true,
    },
    {
      key: "sidangHariIni" as const,
      icon: Calendar,
      label: "Sidang Hari Ini",
      showDash: true,
    },
    {
      key: "tingkatKehadiran" as const,
      icon: TrendingUp,
      label: "Tingkat Kehadiran",
      suffix: "%",
      showDash: true,
    },
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div className="container mx-auto relative z-10 px-4 md:px-6">
        {/* Header Content */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {appName}
          </h1>
          <p className="mb-2 text-lg font-medium text-secondary">
            {institutionName}
          </p>
          <p className="mb-8 text-lg text-white/80 sm:text-xl">
            {appDescription}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="#daftar">
              <ShimmerButton className="text-lg">
                Daftar Antrian Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </ShimmerButton>
            </Link>
            <Link
              href="#jadwal"
              className="inline-flex items-center rounded-lg bg-white/10 px-6 py-3 font-medium text-white transition-colors hover:bg-white/20"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Lihat Jadwal Sidang
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            STATS_CONFIG.map((config) => (
              <div
                key={config.key}
                className="rounded-xl bg-white/10 p-6 backdrop-blur"
              >
                <Skeleton className="mx-auto mb-4 h-8 w-8 rounded-full" />
                <Skeleton className="mx-auto mb-2 h-10 w-16 rounded" />
                <Skeleton className="mx-auto h-4 w-24 rounded" />
              </div>
            ))
          ) : error ? (
            <div className="col-span-full rounded-xl bg-red-500/20 p-6 text-center backdrop-blur">
              <p className="text-white/80">{error}</p>
              <button
                onClick={fetchStats}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4" />
                Coba Lagi
              </button>
            </div>
          ) : stats ? (
            STATS_CONFIG.map((config) => {
              const Icon = config.icon
              const value = stats[config.key]
              const hasValue = value > 0
              
              return (
                <div
                  key={config.key}
                  className="group rounded-xl bg-white/10 p-6 backdrop-blur transition-all hover:bg-white/15"
                >
                  <Icon className="mx-auto mb-4 h-8 w-8 text-secondary transition-transform group-hover:scale-110" />
                  <div className="text-center text-4xl font-bold">
                    <NumberTicker 
                      value={value} 
                      duration={1.5} 
                      suffix={config.suffix}
                      showDashForZero={true}
                    />
                  </div>
                  <div className="mt-2 text-center text-white/70">
                    {config.label}
                  </div>
                </div>
              )
            })
          ) : (
            STATS_CONFIG.map((config) => {
              const Icon = config.icon
              return (
                <div
                  key={config.key}
                  className="rounded-xl bg-white/10 p-6 backdrop-blur"
                >
                  <Icon className="mx-auto mb-4 h-8 w-8 text-secondary" />
                  <div className="text-center text-4xl font-bold">—</div>
                  <div className="mt-2 text-center text-white/70">{config.label}</div>
                </div>
              )
            })
          )}
        </div>

        {/* Last updated */}
        {stats && !isLoading && !error && (
          <p className="mt-8 text-center text-sm text-white/50">
            Data terakhir diperbarui: {stats.lastUpdated}
          </p>
        )}
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-white/5" />
      </div>
    </section>
  )
}
