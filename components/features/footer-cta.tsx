"use client"

import { useBookingModal } from "@/contexts/booking-modal-context"

/**
 * Footer CTA — panggilan aksi akhir sebelum footer utama.
 *
 * Struktur:
 * - Pre-kicker: teks "Siap mendaftar?" dengan titik emerald di kiri
 * - 2-line heading bergradient gold: "Hemat waktu. / Daftar online."
 * - Subtitle singkat
 * - Grup CTA: tombol primary + ghost link ke #sec-panduan
 *
 * Token fallback:
 * - --accent-2: tidak ada di globals.css → fallback #c2410c (orange-700, gelap dari --accent #ea580c)
 * - --accent-ring: tidak ada di globals.css → fallback rgba(234,88,12,.35) (accent dengan alpha 35%)
 * - --primary-ring: tidak ada di globals.css → fallback rgba(34,197,94,.35) (primary dengan alpha 35%)
 */
export function FooterCta() {
  const { setIsOpen } = useBookingModal()

  return (
    <section
      data-section="footer-cta"
      className="relative overflow-hidden rounded-[var(--radius-2xl)] p-8 text-center md:p-12"
      style={{
        // Gradient latar utama: emerald gelap
        background:
          "linear-gradient(135deg, #062f17 0%, var(--primary-3) 50%, #0a4e25 100%)",
      }}
    >
      {/* Ambient gold: cahaya gold dari atas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(244,210,122,.18), transparent 65%)",
        }}
      />

      {/* Accent radial: aksen oranye samar di bawah */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 110%, rgba(234,88,12,.12), transparent 60%)",
        }}
      />

      <div className="relative z-10">
        {/* Pre-kicker dengan titik emerald */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-emerald-400"
          />
          <span className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
            Siap mendaftar?
          </span>
        </div>

        {/* 2-line heading bergradient gold dari putih ke gold-3 */}
        <h2
          className="mx-auto max-w-[480px] text-3xl font-extrabold leading-tight tracking-tight md:text-4xl"
          style={{
            backgroundImage:
              "linear-gradient(180deg, #ffffff 0%, var(--gold-3) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Hemat waktu.
          <br />
          Daftar online.
        </h2>

        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-[540px] text-[.925rem] leading-relaxed text-white/60">
          Hindari antrean panjang dan kelola jadwal sidang dari mana saja —
          cukup beberapa langkah mudah.
        </p>

        {/* Grup CTA */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {/* Tombol primary */}
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-white/10 px-6 py-3.5 text-base font-semibold text-white shadow-[0_1px_0_0_rgba(255,255,255,.18)_inset] transition-all duration-200 hover:-translate-y-px cursor-pointer"
            style={{
              // Gradient dari accent ke accent gelap (fallback --accent-2)
              background:
                "linear-gradient(180deg, var(--accent) 0%, #c2410c 100%)",
            }}
          >
            Daftar Antrian Sekarang
            <span aria-hidden="true">→</span>
          </button>

          {/* Ghost button menuju panduan */}
          <a
            href="#sec-panduan"
            className="inline-flex items-center justify-center gap-1.5 rounded-[12px] border border-white/20 px-6 py-3.5 text-base font-medium text-white/80 backdrop-blur-sm transition-all duration-200 hover:border-white/40 hover:text-white hover:-translate-y-px"
          >
            Pelajari Selengkapnya
          </a>
        </div>
      </div>
    </section>
  )
}
