"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface BookingModalContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const BookingModalContext = createContext<BookingModalContextType | undefined>(
  undefined
)

export function BookingModalProvider({
  children,
}: {
  children: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <BookingModalContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </BookingModalContext.Provider>
  )
}

export function useBookingModal() {
  const context = useContext(BookingModalContext)
  if (context === undefined) {
    throw new Error("useBookingModal must be used within a BookingModalProvider")
  }
  return context
}
