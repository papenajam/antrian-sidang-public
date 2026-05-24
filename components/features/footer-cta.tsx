"use client"

import { useBookingModal } from "@/contexts/booking-modal-context"

/**
 * Footer CTA — panggilan aksi akhir sebelum footer utama.
 * Warna mengikuti callup panel (emerald gradient).
 */
export function FooterCta() {
  const { setIsOpen } = useBookingModal()

  return (
    <section className="footer-cta-gradient relative overflow-hidden rounded-[var(--radius-2xl)] p-8 text-center md:p-12">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 50% -20%, rgba(212,160,23,.2), transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <h2 className="!text-2xl font-bold tracking-tight text-white md:!text-3xl">
          Siap daftar antrian sidang online?
        </h2>
        <p className="mt-3 mx-auto max-w-lg text-[.92rem] leading-relaxed text-white/60">
          Hemat waktu, hindari antrean panjang, dan kelola jadwal sidang dari mana saja.
        </p>

        <button
          onClick={() => setIsOpen(true)}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-[12px] border border-accent px-6 py-3.5 text-base font-medium text-white shadow-[0_1px_0_0_rgba(255,255,255,.18)_inset,var(--sh)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_1px_0_0_rgba(255,255,255,.18)_inset,var(--sh-md),0_0_0_4px_rgba(234,88,12,.35)] cursor-pointer"
          style={{
            background:
              "linear-gradient(180deg, var(--accent) 0%, #c2410c 100%)",
          }}
        >
          Daftar Antrian Sekarang
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  )
}
