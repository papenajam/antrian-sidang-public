import { HeroSection } from "@/components/features/hero-section"
import { QueueStatus } from "@/components/features/queue-status"
import { ScheduleTable } from "@/components/features/schedule-table"
import { BookingWizard } from "@/components/features/booking-wizard/booking-wizard"

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      
      <main className="container mx-auto py-12 px-4 md:px-6">
        {/* Section: Status Antrian & Jadwal */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Status Antrian</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <QueueStatus />
            <ScheduleTable />
          </div>
        </section>
        
        {/* Section: Booking Wizard */}
        <section id="daftar" className="scroll-mt-20">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Daftar Antrian Baru</h2>
          <BookingWizard />
        </section>
      </main>
    </div>
  )
}
