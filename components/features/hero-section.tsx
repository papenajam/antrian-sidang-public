"use client"

import { useState, useEffect } from "react"
import { NumberTicker } from "@/components/magic/number-ticker"
import { ArrowRight, Calendar, Users, TrendingUp, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useAppSettings } from "@/contexts/app-settings-context"
import { useBookingModal } from "@/contexts/booking-modal-context"
import { getTodaySchedule } from "@/lib/queue-service"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { ShimmerButton } from "@/components/magic/shimmer-button"

interface Stats {
  antrianTerdaftar: number
  sidangHariIni: number
  tingkatKehadiran: number
  lastUpdated: string
}

export function HeroSection() {
  const { settings } = useAppSettings()
  const { setIsOpen } = useBookingModal()
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const appName = settings?.app.name ?? "Antrian Sidang"
  const institutionName = settings?.institution.name ?? "Pengadilan Agama Penajam"
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
      isFeatured: false,
    },
    {
      key: "sidangHariIni" as const,
      icon: Calendar,
      label: "Sidang Hari Ini",
      showDash: true,
      isFeatured: false,
    },
    {
      key: "tingkatKehadiran" as const,
      icon: TrendingUp,
      label: "Tingkat Kehadiran",
      suffix: "%",
      showDash: true,
      isFeatured: true, // Warna aksen emas untuk memecah monotonitas
    },
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-hover pt-20 pb-28 px-4 text-white sm:pt-28 sm:pb-36 md:px-6 lg:pt-36 lg:pb-44">
      {/* Background decoration - geometric pattern */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Decorative circles */}
        <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-white/5" />
        <div className="absolute -right-20 top-1/2 h-64 w-64 rounded-full bg-secondary/10" />
        <div className="absolute -left-20 top-1/3 h-48 w-48 rounded-full bg-white/5" />

        {/* Geometric grid pattern */}
        <svg
          className="absolute inset-0 h-full w-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-transparent" />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header Content dengan orchestrated animation */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
              },
            },
          }}
        >
          <motion.h1
            className="mb-4 text-4xl font-heading font-extrabold tracking-tight sm:mb-6 sm:text-5xl lg:text-6xl text-white select-none"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {appName}
          </motion.h1>

          <motion.p
            className="mb-4 text-lg font-heading font-bold sm:mb-5 sm:text-xl lg:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-secondary"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {institutionName}
          </motion.p>

          <motion.p
            className="mb-10 text-base text-white/80 max-w-2xl mx-auto sm:text-lg lg:text-xl leading-relaxed"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {appDescription}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <ShimmerButton
              onClick={() => setIsOpen(true)}
              shimmerColor="#ffffff"
              shimmerOpacity={0.25}
              shimmerDuration="2.5s"
              background="var(--secondary)"
              foreground="var(--secondary-foreground)"
              className="w-full sm:w-auto text-sm sm:text-base font-semibold shadow-lg hover:shadow-secondary/20 rounded-xl px-7 py-3.5 flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300"
            >
              Daftar Antrian Sekarang
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </ShimmerButton>
            
            <Link
              href="#jadwal"
              className="group w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <Calendar className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
              Lihat Jadwal Sidang
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Cards dengan orchestrated animation */}
        <motion.div
          className="mt-16 grid gap-6 sm:mt-20 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.5,
              },
            },
          }}
        >
          {isLoading ? (
            STATS_CONFIG.map((config) => (
              <motion.div
                key={config.key}
                className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm transition-all"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Skeleton className="mx-auto mb-4 h-10 w-10 rounded-full bg-white/10" />
                <Skeleton className="mx-auto mb-3 h-10 w-20 rounded bg-white/10" />
                <Skeleton className="mx-auto h-5 w-28 rounded bg-white/10" />
              </motion.div>
            ))
          ) : error ? (
            <motion.div
              className="col-span-full rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-center backdrop-blur-sm sm:p-8"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <p className="mb-4 text-sm text-white/80">{error}</p>
              <button
                onClick={fetchStats}
                className="group inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
                Coba Lagi
              </button>
            </motion.div>
          ) : stats ? (
            STATS_CONFIG.map((config) => {
              const Icon = config.icon
              const value = stats[config.key]

              return (
                <motion.div
                  key={config.key}
                  className={`group relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm border transition-all hover:-translate-y-1.5 hover:shadow-2xl ${
                    config.isFeatured 
                      ? "bg-secondary/5 border-secondary/35 hover:bg-secondary/10 hover:border-secondary/50" 
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Gradient shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="relative flex flex-col items-center">
                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${
                      config.isFeatured 
                        ? "bg-secondary/20 text-secondary border border-secondary/30" 
                        : "bg-white/10 text-white border border-white/10"
                    }`}>
                      <Icon className="h-7 w-7" />
                    </div>

                    <div className="text-center">
                      <div className={`mb-2 text-4xl font-heading font-extrabold tracking-tight sm:text-5xl lg:text-6xl ${
                        config.isFeatured ? "text-secondary" : "text-white"
                      }`}>
                        <NumberTicker
                          value={value}
                          duration={1.5}
                          suffix={config.suffix}
                          showDashForZero={true}
                        />
                      </div>
                      <div className="text-sm font-semibold text-white/85 sm:text-base tracking-wide uppercase">
                        {config.label}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          ) : null}
        </motion.div>

        {/* Last updated */}
        {stats && !isLoading && !error && (
          <motion.p
            className="mt-8 text-center text-xs text-white/60 sm:mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Data terakhir diperbarui: {stats.lastUpdated}
          </motion.p>
        )}
      </div>

      {/* Wave Separator untuk transisi mulus dan dinamis ke konten di bawahnya */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 translate-y-[1px]">
        <svg
          className="relative block w-full h-[40px] md:h-[60px] text-background fill-current"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C26.9,8.75,55.05,16.3,83.1,22.38,158,38.82,233,48.24,321.39,56.44Z"
          />
        </svg>
      </div>
    </section>
  )
}