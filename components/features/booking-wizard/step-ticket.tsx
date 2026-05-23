"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/magic/blur-fade"
import { motion } from "framer-motion"
import { CheckCircle, Search, Plus, Clock, MapPin, FileText, User, Calendar, Copy, QrCode, Printer } from "lucide-react"
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
          /* Hide all elements except the ticket */
          body * {
            visibility: hidden;
          }
          
          /* Only show the ticket card */
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
          
          /* Print-friendly styles */
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
          
          .ticket-print-area .bg-yellow-50 {
            background: #fefce8 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .ticket-print-area .border-primary\/20 {
            border-color: #16a34a33 !important;
          }
          
          .ticket-print-area .text-primary {
            color: #16a34a !important;
          }
          
          /* Ensure QR code is visible */
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
        <Card className="ticket-print-area">
          <CardHeader className="no-print">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Booking Berhasil!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code Section */}
            <motion.div
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              {/* QR Code dengan border mencolok */}
              <div className="mx-auto mb-4 inline-block rounded-2xl border-4 border-dashed border-primary/30 bg-white p-4 shadow-lg">
                <QRCodeSVG
                  value={qrData}
                  size={140}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#16a34a"
                />
              </div>
              <p className="mb-2 text-sm text-muted-foreground">
                Scan QR code ini saat datang ke pengadilan
              </p>
              {/* Nomor Antrian dengan copy button */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="rounded-lg bg-muted px-4 py-2">
                  <div className="text-xs text-muted-foreground">Nomor Antrian Anda</div>
                  <div className="text-4xl font-bold text-primary">{ticket.queue_number}</div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(ticket.queue_number, "Nomor antrian")}
                  aria-label="Salin nomor antrian"
                  className="flex-shrink-0 no-print"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            {/* Detail Tiket dengan Visual Hierarchy yang Kuat */}
            <div className="rounded-xl border-2 border-primary/20 overflow-hidden">
              {/* Header: Tanggal & Ruangan - Prioritas Tertinggi */}
              {ticket.tanggal && (
                <div className="bg-gradient-to-r from-primary to-primary/80 p-5 text-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-6 w-6 text-white/80 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium uppercase tracking-wider text-white/70">
                          Tanggal Sidang
                        </div>
                        <div className="text-lg font-bold">{formatTanggal(ticket.tanggal)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-6 w-6 text-white/80 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium uppercase tracking-wider text-white/70">
                          Ruangan
                        </div>
                        <div className="text-lg font-bold">{ticket.ruang_sidang}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Body: Detail Lainnya */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Jam Sidang</div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{ticket.slot_time}</span>
                      <span className="text-muted-foreground">—</span>
                      <span className="text-lg font-bold">{endTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Nomor Perkara</div>
                    <div className="font-medium">{ticket.nomor_perkara}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(ticket.nomor_perkara, "Nomor perkara")}
                    aria-label="Salin nomor perkara"
                    className="flex-shrink-0 no-print"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Nama Pihak</div>
                    <div className="font-medium">{ticket.pihak_nama}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-center gap-2 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
              <div className="h-3 w-3 rounded-full bg-yellow-400 animate-pulse" />
              <span className="font-medium text-yellow-800">Status: Menunggu</span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row no-print">
              <Button onClick={onCheckStatus} className="flex-1">
                <Search className="mr-2 h-4 w-4" />
                Cek Status Antrian
              </Button>
              <Button variant="outline" onClick={onBookAgain} className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                Booking Lagi
              </Button>
              <Button variant="outline" onClick={handlePrint} className="flex-1">
                <Printer className="mr-2 h-4 w-4" />
                Cetak Tiket
              </Button>
            </div>

            {/* Print Hint - Screen Only */}
            <p className="text-center text-xs text-muted-foreground no-print print-only">
              {/* Hidden on screen, visible on print */}
            </p>
          </CardContent>
        </Card>
      </BlurFade>
    </>
  )
}
