"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface NumberTickerProps {
  value: number
  className?: string
  duration?: number
  suffix?: string
  prefix?: string
}

export function NumberTicker({ value, className, duration = 1, suffix, prefix }: NumberTickerProps) {
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

  // Tentukan padding berdasarkan nilai
  // Angka kecil perlu padding 3 digit (001-099)
  // Angka >= 100 tidak perlu padding
  const paddedValue = displayValue >= 100 
    ? displayValue.toString() 
    : displayValue.toString().padStart(3, "0")

  return (
    <motion.span
      className={className}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{paddedValue}{suffix}
    </motion.span>
  )
}
