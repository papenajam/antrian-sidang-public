"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface NumberTickerProps {
  value: number
  className?: string
  duration?: number
  suffix?: string
  prefix?: string
  /**
   * Jika true, tampilkan dash (-) untuk nilai 0
   * Default: false (tampilkan 0)
   */
  showDashForZero?: boolean
}

export function NumberTicker({ 
  value, 
  className, 
  duration = 1, 
  suffix, 
  prefix,
  showDashForZero = false,
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now()

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / (duration * 1000), 1)
      // Fungsi easing cubic ease-out untuk animasi yang natural
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(easeOut * value))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  // Handle zero case - tampilkan dash jika showDashForZero
  if (showDashForZero && displayValue === 0) {
    return (
      <motion.span
        className={className}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        —
      </motion.span>
    )
  }

  // Format angka: tidak ada padding berlebihan
  // Angka 0-9: tampilkan 1 digit
  // Angka 10-99: tampilkan 2 digit
  // Angka >= 100: tampilkan sesuai jumlah digit
  const formattedValue = displayValue < 10 
    ? displayValue.toString() 
    : displayValue < 100
    ? displayValue.toString().padStart(2, "0")
    : displayValue.toString()

  return (
    <motion.span
      className={className}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{formattedValue}{suffix}
    </motion.span>
  )
}
