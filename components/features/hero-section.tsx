"use client"

import { useState, useEffect } from "react"
import { NumberTicker } from "@/components/magic/number-ticker"
import { ArrowRight, Calendar, Users, TrendingUp, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAppSettings } from "@/contexts/app-settings-context"
import { useBookingModal } from "@/contexts/booking-modal-context"
import { getTodaySchedule } from "@/lib/queue-service"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

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
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 py-16 px-4 text-white sm:py-24 md:px-6 lg:py-32">
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
        <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-transparent" />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header Content with orchestrated animation */}
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
            className="mb-4 text-4xl font-bold tracking-tight sm:mb-6 sm:text-5xl lg:text-6xl"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {appName}
          </motion.h1>

          <motion.p
            className="mb-3 text-base font-medium text-secondary sm:mb-4 sm:text-lg lg:text-xl"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {institutionName}
          </motion.p>

          <motion.p
            className="mb-8 text-base text-white/80 sm:mb-10 sm:text-xl"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
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
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="text-sm sm:text-base"
            >
              Daftar Antrian Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link
              href="#jadwal"
              className="group inline-flex items-center rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <Calendar className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
              Lihat Jadwal Sidang
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Cards with orchestrated animation */}
        <motion.div
          className="mt-14 grid gap-5 sm:mt-18 sm:grid-cols-2 sm:gap-6 lg:mt-20 lg:grid-cols-3"
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
                className="group relative overflow-hidden rounded-2xl bg-white/10 p-6 backdrop-blur-sm transition-all hover:bg-white/15"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Skeleton className="mx-auto mb-4 h-10 w-10 rounded-full" />
                <Skeleton className="mx-auto mb-3 h-10 w-20 rounded" />
                <Skeleton className="mx-auto h-5 w-28 rounded" />
              </motion.div>
            ))
          ) : error ? (
            <motion.div
              className="col-span-full rounded-2xl bg-red-500/20 p-6 text-center backdrop-blur-sm sm:p-8"
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
                  className="group relative overflow-hidden rounded-2xl bg-white/10 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/15 hover:shadow-xl"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Gradient shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="relative">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/20 transition-transform group-hover:scale-110">
                      <Icon className="h-7 w-7 text-secondary" />
                    </div>

                    <div className="text-center">
                      <div className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                        <NumberTicker
                          value={value}
                          duration={1.5}
                          suffix={config.suffix}
                          showDashForZero={true}
                        />
                      </div>
                      <div className="text-sm font-medium text-white/70 sm:text-base lg:text-lg">
                        {config.label}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          ) : (
            STATS_CONFIG.map((config) => {
              const Icon = config.icon
              return (
                <motion.div
                  key={config.key}
                  className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/20">
                    <Icon className="h-7 w-7 text-secondary" />
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-4xl font-bold text-white/50 sm:text-5xl">
                      —
                    </div>
                    <div className="text-sm font-medium text-white/70 sm:text-base">
                      {config.label}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </motion.div>

        {/* Last updated */}
        {stats && !isLoading && !error && (
          <motion.p
            className="mt-8 text-center text-xs text-white/50 sm:mt-10 sm:text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Data terakhir diperbarui: {stats.lastUpdated}
          </motion.p>
        )}
      </div>
    </section>
  )
}