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
import type { SlotInfo, QueueTicket, ValidateResponse, ExistingQueue } from "@/lib/api-types"

type Step = 1 | 2 | 3 | 4 | 'existing-queue' | 'multi-pihak'

interface BookingData {
  perkaraId: number
  nik: string
  namaPihak: string
  nomorPerkara: string
  tanggal: string
  ruangan: string
  selectedSlot: SlotInfo | null
}

const WIZARD_STEPS = [
  { id: "validate", title: "Validasi" },
  { id: "select-slot", title: "Pilih Jam" },
  { id: "confirm", title: "Konfirmasi" },
  { id: "ticket", title: "Tiket" },
]

/**
 * Mendapatkan indeks progress bar berdasarkan langkah saat ini.
 */
function getProgressStep(step: Step): number {
  switch (step) {
    case 1:
      return 0
    case 2:
      return 1
    case 3:
      return 2
    case 4:
      return 3
    case 'existing-queue':
      return 1 // Existing queue dianggap setelah validasi
    default:
      return 0
  }
}

const INITIAL_BOOKING_DATA: BookingData = {
  perkaraId: 0,
  nik: "",
  namaPihak: "",
  nomorPerkara: "",
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
    tanggal: data.jadwal.waktu,
    ruangan: data.jadwal.ruangan,
  }
}

export function BookingWizard() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [bookingData, setBookingData] = useState<BookingData>(INITIAL_BOOKING_DATA)
  const [ticket, setTicket] = useState<(QueueTicket & { slot_time: string }) | null>(null)
  const [existingQueue, setExistingQueue] = useState<ExistingQueue | null>(null)

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
    <div className="mx-auto max-w-2xl">
      {/* Progress Bar */}
      <div role="progressbar" aria-valuenow={progressStep + 1} aria-valuemin={1} aria-valuemax={4}>
        <FormProgress steps={WIZARD_STEPS} currentStep={progressStep} />
      </div>

      {/* Langkah 1: Validasi */}
      {currentStep === 1 && (
        <BlurFade>
          <StepValidate
            onNext={handleValidateNext}
            onMultiPihak={handleMultiPihak}
            onError={handleValidateError}
          />
        </BlurFade>
      )}

      {/* Existing Queue Card */}
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

      {/* Langkah 2: Pilih Slot */}
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

      {/* Langkah 3: Konfirmasi */}
      {currentStep === 3 && bookingData.selectedSlot && (
        <BlurFade>
          <StepConfirm
            perkaraId={bookingData.perkaraId}
            nik={bookingData.nik}
            namaPihak={bookingData.namaPihak}
            nomorPerkara={bookingData.nomorPerkara}
            tanggal={bookingData.tanggal}
            slot={bookingData.selectedSlot}
            ruangan={bookingData.ruangan}
            onNext={handleConfirmNext}
            onBack={() => setCurrentStep(2)}
            onError={handleConfirmError}
          />
        </BlurFade>
      )}

      {/* Langkah 4: Tiket */}
      {currentStep === 4 && ticket && (
        <BlurFade>
          <StepTicket
            ticket={{
              ...ticket,
              // Ekstrak date portion dari timestamp untuk ditampilkan di tiket
              tanggal: bookingData.tanggal ? bookingData.tanggal.split("T")[0] : undefined,
            }}
            onCheckStatus={handleCheckStatus}
            onBookAgain={handleBookAgain}
          />
        </BlurFade>
      )}
    </div>
  )
}
