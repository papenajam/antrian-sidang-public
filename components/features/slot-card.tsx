"use client"

import { cn } from "@/lib/utils"
import type { SlotInfo } from "@/lib/api-types"

interface SlotCardProps {
  slot: SlotInfo
  selected: boolean
  onSelect: (time: string) => void
  disabled?: boolean
}

export function SlotCard({ slot, selected, onSelect, disabled = false }: SlotCardProps) {
  const isFull = slot.available === 0
  const isDisabled = isFull || disabled

  // Hitung jam akhir (1 jam setelah jam mulai)
  const startHour = parseInt(slot.time.split(':')[0], 10)
  const endHour = startHour + 1
  const endTime = `${endHour.toString().padStart(2, '0')}:00`

  return (
    <button
      type="button"
      role="button"
      disabled={isDisabled}
      onClick={() => !isDisabled && onSelect(slot.time)}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all duration-200",
        "min-w-[120px] min-h-[100px]",
        isDisabled && "cursor-not-allowed opacity-50 bg-muted border-muted",
        !isDisabled && !selected && "cursor-pointer hover:border-primary/50 hover:bg-primary/5 border-border",
        selected && "border-primary bg-primary/10 shadow-md"
      )}
    >
      <div className="text-lg font-bold">
        {slot.time}
      </div>
      <div className="text-sm text-muted-foreground">
        {endTime}
      </div>
      <div className="mt-2 text-sm font-medium">
        {isFull ? (
          <span className="text-destructive">PENUH</span>
        ) : (
          <span className={selected ? "text-primary" : "text-muted-foreground"}>
            {slot.available}/{slot.capacity} tersedia
          </span>
        )}
      </div>
    </button>
  )
}
