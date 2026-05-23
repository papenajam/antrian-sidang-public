"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/magic/blur-fade"
import { motion } from "framer-motion"
import { CheckCircle, Search, Plus, Clock, MapPin, FileText, User, Calendar, Copy, Printer, Ticket, Sparkles } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import type { QueueTicket } from "@/lib/api-types"

interface StepTicketProps {
  ticket: QueueTicket & { slot_time: string; tanggal?: string }
  onCheckStatus: () => void
  onBookAgain: () => void
}

/**
 * Format tanggal ke format Indonesia yang mudah dibaca.
 */
function formatTanggal(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Salin teks ke clipboard dengan toast notification.
 */
function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success(`${label} berhasil disalin!`)
  }).catch(() => {
    toast.error("Gagal menyalin. Silakan salin manual.")
  })
}

/**
 * Handle print ticket.
 */
function handlePrint() {
  window.print()
}

export function StepTicket({ ticket, onCheckStatus, onBookAgain }: StepTicketProps) {
  const endHour = parseInt(ticket.slot_time.split(":")[0], 10) + 1
  const endTime = `${endHour.toString().padStart(2, "0")}:00`

  const qrData = `antrian-sidang:${ticket.queue_number}:${ticket.nomor_perkara}`

  return (
    <>
      {/* Print-optimized styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          .ticket-print-area,
          .ticket-print-area * {
            visibility: visible;
          }

          .ticket-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
          }

          .ticket-print-area .no-print {
            display: none !important;
          }

          .ticket-print-area .print-only {
            display: block !important;
          }

          .ticket-print-area .bg-gradient-to-r {
            background: #16a34a !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .ticket-print-area .bg-amber-50 {
            background: #fefce8 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .ticket-print-area .text-primary {
            color: #16a34a !important;
          }

          .ticket-print-area svg {
            display: block !important;
          }
        }

        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

      <BlurFade>
        <Card className="ticket-print-area overflow-hidden shadow-xl ring-1 ring-foreground/5">
          {/* Success header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary to-primary-hover p-6 text-white sm:p-8">
            {/* Decorative elements */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-10 h-32 w-32 rounded-full bg-white/5" />

            <CardHeader className="relative z-10 p-0">
              <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                >
                  <Sparkles className="h-6 w-6" />
                </motion.div>
                <span>Booking Berhasil!</span>
              </CardTitle>
            </CardHeader>

            <p className="relative z-10 mt-2 text-sm text-white/80">
              Simpan tiket ini dan tunjukkan saat tiba di pengadilan
            </p>
          </div>

          <CardContent className="space-y-6 p-6 sm:p-8">
            {/* QR Code Section with enhanced visuals */}
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            >
              {/* Success icon */}
              <motion.div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-success/20 to-success/10 shadow-lg dark:from-success/20 dark:to-success/10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              >
                <CheckCircle className="h-10 w-10 text-primary" />
              </motion.div>

              {/* QR Code dengan enhanced styling */}
              <div className="mx-auto mb-4 inline-block rounded-2xl border-4 border-dashed border-primary/20 bg-white p-5 shadow-xl ring-2 ring-primary/10">
                <QRCodeSVG
                  value={qrData}
                  size={150}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#16a34a"
                />
              </div>

              <p className="mb-5 text-sm text-muted-foreground">
                Scan QR code ini saat datang ke pengadilan
              </p>

              {/* Nomor Antrian - Hero element */}
              <div className="mx-auto mb-2 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 ring-1 ring-primary/20">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Nomor Antrian Anda
                  </div>
                  <div className="text-5xl font-bold tracking-tight text-primary sm:text-6xl">
                    {ticket.queue_number}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(ticket.queue_number, "Nomor antrian")}
                  aria-label="Salin nomor antrian"
                  className="flex-shrink-0 rounded-xl border-2 no-print hover:-translate-y-0.5 hover:shadow-md focus-ring"
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            {/* Detail Tiket dengan enhanced visual hierarchy */}
            <motion.div
              className="overflow-hidden rounded-2xl border shadow-lg ring-1 ring-foreground/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Header: Tanggal & Ruangan - Prioritas Tertinggi */}
              {ticket.tanggal && (
                <div className="bg-gradient-to-r from-primary to-primary/80 p-5 text-white">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-xs font-medium uppercase tracking-wider text-white/70">
                          Tanggal Sidang
                        </div>
                        <div className="text-base font-bold sm:text-lg">{formatTanggal(ticket.tanggal)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-xs font-medium uppercase tracking-wider text-white/70">
                          Ruangan
                        </div>
                        <div className="text-base font-bold sm:text-lg">{ticket.ruang_sidang}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Body: Detail Lainnya */}
              <div className="space-y-4 p-5">
                {/* Waktu */}
                <div className="flex items-center gap-4 rounded-xl bg-muted/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-muted-foreground sm:text-sm">Jam Sidang</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold sm:text-2xl">{ticket.slot_time}</span>
                      <span className="text-muted-foreground">—</span>
                      <span className="text-xl font-bold sm:text-2xl">{endTime}</span>
                    </div>
                  </div>
                </div>

                {/* Nomor Perkara */}
                <div className="flex items-center gap-4 rounded-xl bg-muted/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                    <FileText className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-muted-foreground sm:text-sm">Nomor Perkara</div>
                    <div className="text-base font-semibold sm:text-lg">{ticket.nomor_perkara}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(ticket.nomor_perkara, "Nomor perkara")}
                    aria-label="Salin nomor perkara"
                    className="flex-shrink-0 rounded-lg no-print hover:bg-muted focus-ring"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {/* Nama Pihak */}
                <div className="flex items-center gap-4 rounded-xl bg-muted/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <User className="h-5 w-5 text-accent-hover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-muted-foreground sm:text-sm">Nama Pihak</div>
                    <div className="text-base font-semibold sm:text-lg">{ticket.pihak_nama}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Status Indicator - Enhanced */}
            <motion.div
              className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 p-5 ring-1 ring-amber-200/50 dark:from-amber-950/30 dark:to-yellow-950/30"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                  <Ticket className="h-4 w-4 text-amber-600" />
                </div>
                <span className="absolute -right-1 -top-1 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500" />
                </span>
              </div>
              <div>
                <div className="font-semibold text-amber-800 dark:text-amber-200">Status: Menunggu</div>
                <div className="text-xs text-amber-600/70 dark:text-amber-400/70">
                  Harap hadir 15 menit sebelum jadwal sidang
                </div>
              </div>
            </motion.div>

            {/* Actions - Enhanced buttons */}
            <motion.div
              className="flex flex-col gap-3 sm:flex-row no-print"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={onCheckStatus}
                className="flex-1 gap-2 rounded-xl py-5 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl focus-ring"
              >
                <Search className="h-5 w-5" />
                Cek Status Antrian
              </Button>
              <Button
                variant="outline"
                onClick={onBookAgain}
                className="flex-1 gap-2 rounded-xl border-2 py-5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-ring"
              >
                <Plus className="h-5 w-5" />
                Booking Lagi
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex-1 gap-2 rounded-xl border-2 py-5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-ring"
              >
                <Printer className="h-5 w-5" />
                Cetak Tiket
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </BlurFade>
    </>
  )
}