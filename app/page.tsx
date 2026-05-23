import { HeroSection } from "@/components/features/hero-section"
import { QueueStatus } from "@/components/features/queue-status"
import { ScheduleTable } from "@/components/features/schedule-table"
import { BookingModal } from "@/components/features/booking-modal"

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />

      <main className="container mx-auto px-4 py-10 sm:px-6 sm:py-14 md:px-8 lg:py-16">
        {/* Section: Status Antrian - Full width */}
        <section className="mb-10 sm:mb-16">
          <h2 className="mb-6 text-2xl font-bold tracking-tight sm:mb-8 sm:text-3xl lg:text-4xl">
            Status Antrian
          </h2>
          <QueueStatus />
        </section>

        {/* Section: Jadwal Sidang - Full width */}
        <section id="jadwal" className="mb-10 sm:mb-16">
          <h2 className="mb-6 text-2xl font-bold tracking-tight sm:mb-8 sm:text-3xl lg:text-4xl">
            Jadwal Sidang Hari Ini
          </h2>
          <ScheduleTable />
        </section>
      </main>

      {/* Booking Modal - rendered at page level */}
      <BookingModal />
    </div>
  )
}
