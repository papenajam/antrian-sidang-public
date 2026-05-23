"use client"

import { Plus } from "lucide-react"
import { useBookingModal } from "@/contexts/booking-modal-context"
import { motion } from "framer-motion"
import { toast } from "sonner"

export function FloatingActionButton() {
  const { setIsOpen } = useBookingModal()

  const handleClick = () => {
    setIsOpen(true)
    toast.info("Membuka formulir pendaftaran antrian")
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-offset-background transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label="Daftar Antrian Baru"
      title="Daftar Antrian Baru"
    >
      <Plus className="h-6 w-6" />
    </motion.button>
  )
}
