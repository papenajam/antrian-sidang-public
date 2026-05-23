"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { X } from "lucide-react"
import { useBookingModal } from "@/contexts/booking-modal-context"
import { BookingWizard } from "./booking-wizard/booking-wizard"

export function BookingModal() {
  const { isOpen, setIsOpen } = useBookingModal()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader className="sr-only">
          <DialogTitle>Daftar Antrian Baru</DialogTitle>
          <DialogDescription>
            Isi formulir untuk mendaftar antrian sidang
          </DialogDescription>
        </DialogHeader>

        {/* Close button - positioned top right */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Booking Wizard */}
        <BookingWizard />
      </DialogContent>
    </Dialog>
  )
}
