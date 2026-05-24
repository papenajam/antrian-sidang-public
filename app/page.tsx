import { HeroSection } from "@/components/features/hero-section"
import { QueueStatus } from "@/components/features/queue-status"
import { ScheduleTable } from "@/components/features/schedule-table"
import { PanduanSection } from "@/components/features/panduan-section"
import { FooterCta } from "@/components/features/footer-cta"
import { BookingModal } from "@/components/features/booking-modal"

/**
 * Halaman utama — menyusun seluruh section secara vertikal.
 * Menggunakan container `as-pad` untuk padding konsisten.
 */
export default function Home() {
  return (
    <>
      <div className="as-pad relative z-10 flex flex-col gap-5 pb-12 pt-4">
        {/* 1. Hero: Bigbox + Feature Cards + Stats */}
        <HeroSection />

        {/* 2. Status Antrian: Callup panel gelap */}
        <QueueStatus />

        {/* 3. Jadwal Sidang: Tabel + Search + Filter */}
        <ScheduleTable />

        {/* 4. Panduan: 4 langkah pendaftaran */}
        <PanduanSection />

        {/* 5. Footer CTA */}
        <FooterCta />
      </div>

      {/* Modal Booking Wizard */}
      <BookingModal />
    </>
  )
}
