"use client"

import { cn } from "@/lib/utils"

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerSize?: string
  shimmerDuration?: string
  background?: string
}

export function ShimmerButton({
  className,
  shimmerColor = "#ffffff",
  shimmerSize = "0.05em",
  shimmerDuration = "2s",
  background = "var(--primary)",
  children,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "group relative z-0 overflow-hidden rounded-lg px-6 py-3 font-semibold text-white",
        "transition-all duration-300 hover:scale-105",
        className
      )}
      style={{
        background,
      }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 -z-10 animate-shimmer"
        style={{
          background: `linear-gradient(
            90deg,
            transparent,
            ${shimmerColor}${Math.round(parseFloat(shimmerSize) * 255)
              .toString(16)
              .padStart(2, "0")},
            transparent
          )`,
          animationDuration: shimmerDuration,
        }}
      />
    </button>
  )
}
