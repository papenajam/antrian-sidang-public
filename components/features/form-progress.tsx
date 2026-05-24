"use client"

import { cn } from "@/lib/utils"

/**
 * Props untuk komponen FormProgress.
 * currentStep adalah 1-based (nilai 1 sampai steps.length).
 */
interface FormProgressProps {
  steps: { id: number; label: string }[]
  currentStep: number
}

/**
 * Komponen pill stepper untuk menampilkan progress pendaftaran antrian sidang.
 * Menampilkan setiap langkah sebagai pill horizontal dengan state: done, active, pending.
 */
export function FormProgress({ steps, currentStep }: FormProgressProps) {
  return (
    <nav
      role="navigation"
      aria-label="Progress pendaftaran"
      className="mb-6 w-full"
    >
      {/* Daftar pill langkah — horizontal di sm+, hanya pill aktif yang menampilkan label di mobile */}
      <ol className="flex items-stretch gap-1.5 sm:gap-2">
        {steps.map((step) => {
          // Tentukan state setiap langkah berdasarkan currentStep (1-based)
          const isDone = step.id < currentStep
          const isActive = step.id === currentStep
          const isPending = step.id > currentStep

          return (
            <li
              key={step.id}
              className={cn(
                // Di mobile pill aktif lebih lebar (flex-[3]) sementara pill lain hanya
                // menampilkan lingkaran nomor (flex-shrink-0). Di sm+ semua sama lebar.
                "flex sm:flex-1",
                isActive && "flex-[3]"
              )}
              aria-current={isActive ? "step" : undefined}
            >
              {/* Pill container — tampilan berbeda per state */}
              <div
                className={cn(
                  "flex w-full min-w-0 items-center gap-2 rounded-full border px-2.5 py-2 text-xs font-semibold transition-all sm:px-3",
                  // State: selesai — background accent, teks accent-foreground
                  isDone && "border-accent bg-accent text-accent-foreground",
                  // State: aktif — background card dengan shadow, teks primary
                  isActive && "border-border bg-card text-primary shadow shadow-primary/10",
                  // State: menunggu — background muted transparan, teks muted
                  isPending && "border-border/40 bg-muted/30 text-muted-foreground"
                )}
              >
                {/* Lingkaran nomor atau centang */}
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    // State selesai: lingkaran accent gelap
                    isDone && "bg-accent-foreground text-accent",
                    // State aktif: lingkaran primary
                    isActive && "bg-primary text-primary-foreground",
                    // State pending: lingkaran muted
                    isPending && "bg-muted-foreground/20 text-muted-foreground"
                  )}
                >
                  {/* Tampilkan tanda centang untuk langkah selesai, nomor untuk lainnya */}
                  {isDone ? "✓" : step.id}
                </span>

                {/* Label langkah — format "Langkah N — Nama" di sm+ */}
                <span className="hidden truncate sm:inline">
                  Langkah {step.id} — {step.label}
                </span>

                {/* Versi mobile: hanya tampilkan label untuk pill aktif (hemat ruang) */}
                {isActive && (
                  <span className="inline truncate sm:hidden">
                    {step.label}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
