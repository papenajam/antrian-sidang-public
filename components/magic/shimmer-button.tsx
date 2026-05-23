"use client"

import { cn } from "@/lib/utils"

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  /** Opacity shimmer 0–1. Default 0.2 (20%) */
  shimmerOpacity?: number
  shimmerDuration?: string
  background?: string
  /** Warna teks tombol. Default "white". Gunakan warna gelap untuk background terang (misal gold). */
  foreground?: string
}

export function ShimmerButton({
  className,
  shimmerColor = "#ffffff",
  shimmerOpacity = 0.2,
  shimmerDuration = "2s",
  background = "var(--primary)",
  foreground = "white",
  children,
  style,
  ...props
}: ShimmerButtonProps) {
  // Konversi opacity (0–1) ke dua karakter hex
  const opacityHex = Math.round(shimmerOpacity * 255)
    .toString(16)
    .padStart(2, "0")

  return (
    <button
      className={cn(
        "group relative z-0 overflow-hidden rounded-lg px-6 py-3 font-semibold",
        "transition-all duration-300 hover:scale-105",
        className
      )}
      style={{ background, color: foreground, ...style }}
      {...props}
    >
      <span className="relative z-10 flex items-center">{children}</span>
      <span
        className="absolute inset-0 -z-10 animate-shimmer"
        style={{
          background: `linear-gradient(
            90deg,
            transparent,
            ${shimmerColor}${opacityHex},
            transparent
          )`,
          animationDuration: shimmerDuration,
        }}
      />
    </button>
  )
}
