"use client"

import { motion } from "framer-motion"

interface BlurFadeProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function BlurFade({ children, className, delay = 0 }: BlurFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
