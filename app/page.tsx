import { HeroSection } from "@/components/features/hero-section"
import { QueueStatus } from "@/components/features/queue-status"
import { ScheduleTable } from "@/components/features/schedule-table"
import { RegistrationForm } from "@/components/features/registration-form"

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <div className="container py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <QueueStatus />
          <ScheduleTable />
        </div>
        <div className="mt-12">
          <RegistrationForm />
        </div>
      </div>
    </div>
  )
}
