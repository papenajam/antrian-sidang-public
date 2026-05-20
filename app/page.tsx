import { HeroSection } from "@/components/features/hero-section"
import { QueueStatus } from "@/components/features/queue-status"
import { ScheduleTable } from "@/components/features/schedule-table"
import { BookingWizard } from "@/components/features/booking-wizard/booking-wizard"

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <div className="container mx-auto py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <QueueStatus />
          <ScheduleTable />
        </div>
        <div className="mt-12">
          <BookingWizard />
        </div>
      </div>
    </div>
  )
}
