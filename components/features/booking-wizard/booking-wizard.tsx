"use client"

import { useState } from "react"
import { BlurFade } from "@/components/magic/blur-fade"
import { FormProgress } from "@/components/features/form-progress"
import { StepValidate } from "./step-validate"
import { StepSelectSlot } from "./step-select-slot"
import { StepConfirm } from "./step-confirm"
import { StepTicket } from "./step-ticket"
import { ExistingQueueCard } from "./existing-queue-card"
import { toast } from "sonner"
import { useBookingModal } from "@/contexts/booking-modal-context"
import type { SlotInfo, QueueTicket, ValidateResponse, ExistingQueue } from "@/lib/api-types"

type Step = 1 | 2 | 3 | 4 | 'existing-queue' | 'multi-pihak'

interface BookingData {
  perkaraId: number
  nik: string
  namaPihak: string
  nomorPerkara: string
  /** Jenis perkara dari data validasi SIPP */
  jenisPerkara: string
  tanggal: string
  ruangan: string
  selectedSlot: SlotInfo | null
}

const WIZARD_STEPS = [
  { id: 1, label: "Validasi" },
  { id: 2, label: "Pilih Jam" },
  { id: 3, label: "Konfirmasi" },
  { id: 4, label: "Tiket" },
]

/**
 * Mendapatkan nomor progress (1-based) berdasarkan langkah wizard saat ini.
 */
function getProgressStep(step: Step): number {
  switch (step) {
    case 1:
      return 1
    case 2:
      return 2
    case 3:
      return 3
    case 4:
      return 4
    case 'existing-queue':
      return 2 // setelah validasi
    default:
      return 1
  }
}

const INITIAL_BOOKING_DATA: BookingData = {
  perkaraId: 0,
  nik: "",
  namaPihak: "",
  nomorPerkara: "",
  jenisPerkara: "",
  tanggal: "",
  ruangan: "",
  selectedSlot: null,
}

/**
 * Mapping data validasi ke bookingData.
 * Digunakan oleh handleValidateNext dan handleMultiPihak.
 */
function mapValidationToBooking(data: NonNullable<ValidateResponse['data']>, prev: BookingData): BookingData {
  return {
    ...prev,
    perkaraId: data.perkara_id,
    namaPihak: data.pihak_nama,
    nomorPerkara: data.jadwal.perkara?.nomor_perkara || prev.nomorPerkara,
    jenisPerkara: data.jadwal.perkara?.jenis_perkara_nama || prev.jenisPerkara,
    tanggal: data.jadwal.waktu,
    ruangan: data.jadwal.ruangan,
  }
}

export function BookingWizard() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [bookingData, setBookingData] = useState<BookingData>(INITIAL_BOOKING_DATA)
  const [ticket, setTicket] = useState<(QueueTicket & { slot_time: string }) | null>(null)
  const [existingQueue, setExistingQueue] = useState<ExistingQueue | null>(null)
  // personalData dipakai oleh StepConfirm dan StepTicket (Task 4.5)
  const [personalData, setPersonalData] = useState<{ nama: string; telepon: string } | null>(null)
  const { setIsOpen } = useBookingModal()

  /**
   * Handler untuk menyimpan data personal dari StepValidate.
   * Akan dipakai oleh StepConfirm (Task 4.4) dan StepTicket (Task 4.5).
   */
  const handlePersonalData = (info: { nama: string; telepon: string }) => {
    setPersonalData(info)
  }

  /**
   * Handler ketika validasi berhasil dan tidak ada existing queue.
   * Langsung menuju langkah pemilihan slot.
   */
  const handleValidateNext = (data: NonNullable<ValidateResponse['data']>) => {
    setBookingData((prev) => mapValidationToBooking(data, prev))
    setCurrentStep(2)
  }

  /**
   * Handler untuk multi-pihak flow.
   * Dipanggil oleh StepValidate ketika existing queue ditemukan.
   * Jika ada existing queue, tampilkan ExistingQueueCard.
   * Jika tidak, lanjutkan ke langkah pemilihan slot.
   */
  const handleMultiPihak = (data: NonNullable<ValidateResponse['data']>) => {
    // Multi-pihak: perkara sudah booking oleh pihak lain
    // Langsung berikan nomor antrian yang sama (skip langkah 2-3)
    setBookingData((prev) => mapValidationToBooking(data, prev))

    if (data.existing_queue) {
      setTicket({
        queue_number: data.existing_queue.queue_number,
        status: data.existing_queue.status,
        slot_time: data.existing_queue.slot_time,
        pihak_nama: data.pihak_nama,
        nomor_perkara: data.jadwal.perkara?.nomor_perkara || "",
        ruang_sidang: data.jadwal.ruangan,
      })
      setCurrentStep(4)
      toast.info("Perkara ini sudah memiliki booking", {
        description: `Anda mendapatkan nomor antrian yang sama: ${data.existing_queue.queue_number}`,
      })
    } else {
      setCurrentStep(2)
    }
  }

  /**
   * Handler ketika validasi gagal.
   * Menampilkan toast error.
   */
  const handleValidateError = (message: string) => {
    toast.error(message)
  }

  /**
   * Handler ketika slot dipilih.
   * Menuju langkah konfirmasi.
   */
  const handleSlotNext = (slot: SlotInfo) => {
    setBookingData((prev) => ({
      ...prev,
      selectedSlot: slot,
    }))
    setCurrentStep(3)
  }

  /**
   * Handler ketika booking berhasil.
   * Menampilkan tiket dan toast sukses.
   */
  const handleConfirmNext = (ticketData: QueueTicket) => {
    setTicket({
      ...ticketData,
      slot_time: bookingData.selectedSlot?.time || "",
    })
    setCurrentStep(4)
    toast.success("Booking berhasil!", {
      description: `Nomor antrian Anda: ${ticketData.queue_number}`,
    })
    // Close modal setelah booking berhasil
    setIsOpen(false)
  }

  /**
   * Handler ketika terjadi error pada langkah konfirmasi.
   * Menampilkan toast error.
   */
  const handleConfirmError = (message: string) => {
    toast.error(message)
  }

  /**
   * Reset semua state dan kembali ke langkah 1.
   */
  const handleBookAgain = () => {
    setCurrentStep(1)
    setBookingData(INITIAL_BOOKING_DATA)
    setTicket(null)
    setExistingQueue(null)
    setPersonalData(null)
    // Close modal agar user bisa buka lagi via FAB atau HeroSection
    setIsOpen(false)
  }

  /**
   * Handler untuk fitur cek status (belum tersedia).
   */
  const handleCheckStatus = () => {
    toast.info("Fitur cek status akan segera tersedia")
  }

  /**
   * Handler untuk reschedule dari ExistingQueueCard.
   * Kembali ke langkah pemilihan slot.
   */
  const handleReschedule = () => {
    setCurrentStep(2)
    setExistingQueue(null)
  }

  const progressStep = getProgressStep(currentStep)

  return (
    <div className="mx-auto">
      {/* Progress Bar */}
      <div 
        role="progressbar" 
        aria-valuenow={progressStep}
        aria-valuemin={1} 
        aria-valuemax={4}
        className="mb-8"
      >
        <FormProgress steps={WIZARD_STEPS} currentStep={progressStep} />
      </div>

      {/* Step Content */}
      <div className="w-full">
        {currentStep === 1 && (
          <BlurFade>
            <StepValidate
              onNext={handleValidateNext}
              onMultiPihak={handleMultiPihak}
              onError={handleValidateError}
              onPersonalDataChange={handlePersonalData}
            />
          </BlurFade>
        )}

        {currentStep === 'existing-queue' && existingQueue && (
          <BlurFade>
            <ExistingQueueCard
              queue={existingQueue}
              onViewStatus={handleCheckStatus}
              onReschedule={handleReschedule}
              onBookAgain={handleBookAgain}
            />
          </BlurFade>
        )}

        {currentStep === 2 && (
          <BlurFade>
            <StepSelectSlot
              perkaraId={bookingData.perkaraId}
              tanggal={bookingData.tanggal}
              ruangan={bookingData.ruangan}
              onNext={handleSlotNext}
              onBack={() => setCurrentStep(1)}
              currentSlot={existingQueue?.slot_time}
            />
          </BlurFade>
        )}

        {currentStep === 3 && bookingData.selectedSlot && (
          <BlurFade>
            <StepConfirm
              perkaraId={bookingData.perkaraId}
              nik={bookingData.nik}
              namaPihak={bookingData.namaPihak}
              nomorPerkara={bookingData.nomorPerkara}
              jenisPerkara={bookingData.jenisPerkara}
              nama={personalData?.nama}
              telepon={personalData?.telepon}
              tanggal={bookingData.tanggal}
              slot={bookingData.selectedSlot}
              ruangan={bookingData.ruangan}
              onNext={handleConfirmNext}
              onBack={() => setCurrentStep(2)}
              onError={handleConfirmError}
            />
          </BlurFade>
        )}

        {currentStep === 4 && ticket && (
          <BlurFade>
            <StepTicket
              ticket={{
                ...ticket,
                tanggal: bookingData.tanggal ? bookingData.tanggal.split("T")[0] : undefined,
              }}
              onCheckStatus={handleCheckStatus}
              onBookAgain={handleBookAgain}
            />
          </BlurFade>
        )}
      </div>
    </div>
  )
}
