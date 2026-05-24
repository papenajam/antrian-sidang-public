"use client"

import { useBookingModal } from "@/contexts/booking-modal-context";
import { cn } from "@/lib/utils";

/**
 * Section panduan pendaftaran antrian: 4 langkah visual cards.
 *
 * Fitur:
 * - Kicker pill "Empat langkah · ±2 menit"
 * - Heading dua kolom (judul + CTA button)
 * - 4 step cards dengan number badge 42x42, step footer line
 *
 * Token fallback:
 * - --gold-2 tidak ada → fallback --gold
 * - --accent-soft tidak ada → fallback color-mix opacity rendah dari --accent
 */

/** Data setiap langkah pendaftaran */
const STEPS = [
  {
    num: "01",
    title: "Verifikasi Data",
    desc: "Masukkan NIK dan Nomor Perkara — data langsung divalidasi dengan sistem SIPP Mahkamah Agung.",
    /** Kelas badge untuk step 1 (primary green) */
    badgeCls: "text-[var(--primary-3)] bg-[var(--primary-soft)] border-[color-mix(in_oklab,var(--primary)_18%,transparent)]",
    badgeClsDark: "dark:text-[var(--primary-3)] dark:bg-[var(--primary-soft)] dark:border-[color-mix(in_oklab,var(--primary)_22%,transparent)]",
  },
  {
    num: "02",
    title: "Pilih Slot Waktu",
    desc: "Pilih slot antrian 30 menit yang tersedia — kapasitas maksimal 8 orang per slot.",
    /** Kelas badge untuk step 2 (gold amber) — fallback --gold-2 → --gold */
    badgeCls: "text-[#92580a] bg-[var(--gold-soft)] border-[color-mix(in_oklab,var(--gold)_30%,transparent)]",
    badgeClsDark: "dark:text-[var(--gold)] dark:bg-[var(--gold-soft)] dark:border-[color-mix(in_oklab,var(--gold)_30%,transparent)]",
  },
  {
    num: "03",
    title: "Konfirmasi",
    desc: "Periksa kembali data pendaftaran dan konfirmasi booking antrian sidang Anda.",
    /** Kelas badge untuk step 3 (accent orange) — fallback --accent-soft → color-mix opacity */
    badgeCls: "text-[#9a3412] bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] border-[color-mix(in_oklab,var(--accent)_25%,transparent)]",
    badgeClsDark: "dark:text-[var(--accent)] dark:bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] dark:border-[color-mix(in_oklab,var(--accent)_25%,transparent)]",
  },
  {
    num: "04",
    title: "Tiket Digital",
    desc: "Dapatkan tiket digital lengkap QR Code sebagai bukti pendaftaran antrian sidang.",
    /** Kelas badge untuk step 4 (gold variant) — sama dengan step 2 */
    badgeCls: "text-[var(--gold)] bg-[var(--gold-soft)] border-[color-mix(in_oklab,var(--gold)_30%,transparent)]",
    badgeClsDark: "dark:text-[var(--gold)] dark:bg-[var(--gold-soft)] dark:border-[color-mix(in_oklab,var(--gold)_30%,transparent)]",
  },
];

/** Total step — digunakan untuk footer line "Step NN / TOTAL" */
const TOTAL_STEPS = STEPS.length;

export function PanduanSection() {
  const { setIsOpen } = useBookingModal();

  return (
    <section
      id="sec-panduan"
      data-section="panduan"
      className="rounded-[var(--radius-2xl)] border border-border bg-card p-6 shadow-[var(--sh-sm)] md:p-8"
    >
      {/* Header dua kolom: kicker + judul di kiri, CTA di kanan */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Kiri: kicker pill + heading */}
        <div className="flex flex-col gap-2">
          {/* Kicker pill */}
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-[.75rem] font-medium tracking-wide text-muted-foreground">
            Empat langkah · ±2 menit
          </span>

          {/* Heading utama section */}
          <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Cara mendaftar antrian
          </h2>
        </div>

        {/* Kanan: CTA button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 text-[.875rem] font-semibold text-primary-foreground shadow-[var(--sh-sm)] transition-all duration-150 hover:brightness-110 active:scale-[.97] sm:mt-1"
        >
          Mulai Daftar
        </button>
      </div>

      {/* Grid 4 step cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="group relative flex flex-col gap-3 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-[var(--sh-sm)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[var(--sh-md)]"
          >
            {/* Number badge — inline-grid box 42x42 */}
            <span
              className={cn(
                "inline-grid size-[42px] shrink-0 place-items-center rounded-[var(--radius-md)] border font-mono text-[.875rem] font-bold tracking-[-0.04em]",
                step.badgeCls,
                step.badgeClsDark,
              )}
            >
              {step.num}
            </span>

            {/* Judul langkah */}
            <span className="text-[1.05rem] font-semibold tracking-[-.01em] text-foreground leading-[1.35]">
              {step.title}
            </span>

            {/* Deskripsi langkah */}
            <span className="grow text-[.82rem] leading-[1.5] text-muted-foreground">
              {step.desc}
            </span>

            {/* Footer line: "Step NN / TOTAL" */}
            <span className="mt-auto border-t border-border pt-3 text-[.72rem] font-mono font-medium tracking-wide text-muted-foreground/60">
              Step {step.num} / {String(TOTAL_STEPS).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
