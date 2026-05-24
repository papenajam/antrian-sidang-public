"use client"

/**
 * Section panduan pendaftaran antrian: 4 langkah visual cards.
 * Mengikuti design reference Panduan.jsx
 */

const STEPS = [
  {
    num: "01",
    title: "Verifikasi Data",
    desc: "Masukkan NIK dan Nomor Perkara — data langsung divalidasi dengan sistem SIPP Mahkamah Agung.",
  },
  {
    num: "02",
    title: "Pilih Slot Waktu",
    desc: "Pilih slot antrian 30 menit yang tersedia — kapasitas maksimal 8 orang per slot.",
  },
  {
    num: "03",
    title: "Konfirmasi Booking",
    desc: "Periksa kembali data pendaftaran dan konfirmasi booking antrian sidang Anda.",
  },
  {
    num: "04",
    title: "Cetak E-Tiket",
    desc: "Dapatkan tiket digital lengkap QR Code sebagai bukti pendaftaran antrian sidang.",
  },
]

export function PanduanSection() {
  return (
    <section
      id="sec-panduan"
      className="rounded-[var(--radius-2xl)] border border-border bg-card p-6 shadow-[var(--sh-sm)] md:p-8"
    >
      <h2 className="!text-xl font-bold tracking-tight text-foreground">
        Panduan Pendaftaran
      </h2>
      <p className="mt-2 max-w-lg text-[.88rem] text-muted-foreground">
        Empat langkah mudah untuk mendaftar antrian sidang secara online tanpa harus datang ke pengadilan.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="group relative flex flex-col gap-3 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card p-6 shadow-[var(--sh-sm)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[var(--sh-md)]"
          >
            {/* Nomor langkah */}
            <span className="font-mono text-[2.5rem] font-bold leading-none tracking-[-0.06em] text-primary/15 dark:text-primary/20">
              {step.num}
            </span>
            <span className="text-base font-semibold tracking-[-.01em] text-foreground leading-[1.35]">
              {step.title}
            </span>
            <span className="text-[.82rem] leading-[1.5] text-muted-foreground">
              {step.desc}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
