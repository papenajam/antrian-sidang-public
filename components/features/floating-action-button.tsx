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
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="group fixed bottom-6 right-6 z-40 flex h-14 w-14 hover:w-44 items-center justify-start rounded-full bg-primary text-primary-foreground shadow-premium ring-offset-background transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border border-white/10 overflow-hidden"
      aria-label="Daftar Antrian Baru"
      title="Daftar Antrian Baru"
    >
      <div className="flex items-center pl-4 gap-2.5 whitespace-nowrap">
        <Plus className="h-6 w-6 flex-shrink-0" />
        <span className="max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 transition-all duration-200 ease-out overflow-hidden text-sm font-bold tracking-wider">
          Daftar Antrian
        </span>
      </div>
    </motion.button>
  )
}
