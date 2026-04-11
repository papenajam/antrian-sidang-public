import { ShimmerButton } from "@/components/magic/shimmer-button"
import { ArrowRight, Calendar, Users } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Sistem Antrian Sidang{" "}
            <span className="text-secondary">Pengadilan Agama</span>
          </h1>
          <p className="mb-8 text-lg text-white/80 sm:text-xl">
            Daftar antrian sidang dengan mudah dan pantau jadwal sidang Anda secara
            real-time. Sistem yang modern, cepat, dan andal.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="#daftar">
              <ShimmerButton className="text-lg">
                Daftar Antrian Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </ShimmerButton>
            </Link>
            <Link
              href="#jadwal"
              className="inline-flex items-center rounded-lg bg-white/10 px-6 py-3 font-medium transition-colors hover:bg-white/20"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Lihat Jadwal Sidang
            </Link>
          </div>
        </div>

        {/* Statistik */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white/10 p-6 text-center backdrop-blur">
            <Users className="mx-auto mb-4 h-8 w-8 text-secondary" />
            <div className="text-3xl font-bold">1,234</div>
            <div className="text-white/70">Antrian Terdaftar</div>
          </div>
          <div className="rounded-lg bg-white/10 p-6 text-center backdrop-blur">
            <Calendar className="mx-auto mb-4 h-8 w-8 text-secondary" />
            <div className="text-3xl font-bold">12</div>
            <div className="text-white/70">Sidang Hari Ini</div>
          </div>
          <div className="rounded-lg bg-white/10 p-6 text-center backdrop-blur sm:col-span-2 lg:col-span-1">
            <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-lg font-bold text-black">
              ✓
            </div>
            <div className="text-3xl font-bold">98%</div>
            <div className="text-white/70">Kepuasan Pengguna</div>
          </div>
        </div>
      </div>

      {/* Dekorasi background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-white/5" />
      </div>
    </section>
  )
}
