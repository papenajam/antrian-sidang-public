"use client"

import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/magic/blur-fade"
import { motion } from "framer-motion"
import { Search, Plus, Copy, Printer, MessageCircle } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import { useAppSettings } from "@/contexts/app-settings-context"
import type { QueueTicket } from "@/lib/api-types"

interface StepTicketProps {
  ticket: QueueTicket & { slot_time: string; tanggal?: string }
  /** Nomor telepon pihak — untuk footer notifikasi WhatsApp */
  telepon?: string
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

/**
 * Baris data tiket: label di atas, nilai di bawah.
 */
function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
        {label}
      </span>
      <span className="text-sm font-semibold leading-snug text-white/90">
        {value}
      </span>
    </div>
  )
}

export function StepTicket({ ticket, telepon, onCheckStatus, onBookAgain }: StepTicketProps) {
  const { settings } = useAppSettings()

  // Nama institusi dengan fallback
  const institutionName = settings?.institution?.name ?? "Pengadilan Agama"
  const appName = settings?.app?.name ?? "Antrian Sidang"

  // Data QR code untuk validasi
  const qrData = `antrian-sidang:${ticket.queue_number}:${ticket.nomor_perkara}`

  return (
    <>
      {/* Gaya cetak — hanya area ticket-print-area yang tercetak */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .ticket-print-area,
          .ticket-print-area * { visibility: visible; }
          .ticket-print-area {
            position: absolute;
            left: 0; top: 0;
            width: 100%;
            padding: 20mm;
          }
          .ticket-print-area .no-print { display: none !important; }
          .ticket-print-area .print-only { display: block !important; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>

      <BlurFade>
        {/* ---- Banner sukses di atas tiket ---- */}
        <motion.div
          className="mb-4 flex items-center gap-3 rounded-xl bg-success/10 px-5 py-3 ring-1 ring-success/20"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-success/20">
            <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-success">Booking Berhasil!</p>
            <p className="text-xs text-muted-foreground">Simpan tiket ini dan tunjukkan saat tiba di pengadilan</p>
          </div>
        </motion.div>

        {/* ---- Tiket perforated ---- */}
        <div className="ticket-print-area overflow-hidden rounded-2xl shadow-xl ring-1 ring-foreground/10">

          {/* === Grid dua kolom: main (kiri) + side QR (kanan) === */}
          <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr]">

            {/* -------------------------------------------------- */}
            {/* Kolom Kiri — background hijau gelap + nomor antrian */}
            {/* -------------------------------------------------- */}
            <div
              className="relative flex flex-col justify-between gap-6 overflow-hidden p-6 sm:p-8"
              style={{
                background: "linear-gradient(135deg, #062f17 0%, var(--primary-3, #0f5f2e) 50%, var(--primary, #15803d) 100%)",
              }}
            >
              {/* Lingkaran dekoratif latar */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
              <div className="pointer-events-none absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-white/5" />

              {/* -- Kicker -- */}
              <p className="relative z-10 text-[11px] font-semibold uppercase tracking-widest text-white/60">
                {appName} · {institutionName}
              </p>

              {/* -- Nomor antrian raksasa -- */}
              <motion.div
                className="relative z-10 flex items-end gap-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
              >
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/50">
                    Nomor Antrian
                  </p>
                  {/* Angka besar dengan gradient gold */}
                  <span
                    className="block bg-clip-text text-transparent font-extrabold leading-none tracking-tight"
                    style={{
                      fontSize: "clamp(80px, 12vw, 140px)",
                      backgroundImage: "linear-gradient(180deg, #ffffff 0%, var(--gold-3, #f4d27a) 100%)",
                    }}
                  >
                    {ticket.queue_number}
                  </span>
                </div>
                {/* Tombol salin nomor antrian */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(ticket.queue_number, "Nomor antrian")}
                  aria-label="Salin nomor antrian"
                  className="no-print mb-3 flex-shrink-0 rounded-xl text-white/60 hover:bg-white/10 hover:text-white focus-ring"
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </motion.div>

              {/* -- Detail tiket (TicketRow) -- */}
              <motion.div
                className="relative z-10 grid grid-cols-2 gap-x-4 gap-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <TicketRow label="Atas Nama" value={ticket.pihak_nama} />
                <TicketRow label="Nomor Perkara" value={ticket.nomor_perkara} />
                {ticket.tanggal && (
                  <TicketRow label="Tanggal Sidang" value={formatTanggal(ticket.tanggal)} />
                )}
                <TicketRow label="Waktu" value={ticket.slot_time} />
                <TicketRow label="Ruangan" value={ticket.ruang_sidang} />
              </motion.div>

              {/* -- Footer note WhatsApp (bila telepon tersedia) -- */}
              {telepon && (
                <motion.div
                  className="relative z-10 flex items-center gap-2 rounded-lg bg-white/8 p-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <MessageCircle className="h-4 w-4 flex-shrink-0 text-white/60" />
                  <p className="text-[11px] leading-snug text-white/70">
                    Notifikasi WhatsApp akan dikirim ke{" "}
                    <span className="font-semibold text-white/90">{telepon}</span>
                  </p>
                </motion.div>
              )}
            </div>

            {/* -------------------------------------------------- */}
            {/* Kolom Kanan — area QR code dengan efek perforated   */}
            {/* -------------------------------------------------- */}
            <div
              className="relative flex flex-col items-center justify-center gap-5 p-6 sm:p-8"
              style={{ background: "var(--gold-soft, #fbf3df)" }}
            >
              {/* -- Cutout perforated — lingkaran kiri atas -- */}
              <div
                className="absolute -left-2 top-8 h-4 w-4 rounded-full bg-background ring-1 ring-foreground/5"
                aria-hidden="true"
              />
              {/* -- Cutout perforated — lingkaran kiri bawah -- */}
              <div
                className="absolute -left-2 bottom-8 h-4 w-4 rounded-full bg-background ring-1 ring-foreground/5"
                aria-hidden="true"
              />
              {/* -- Garis putus-putus pemisah (hanya desktop) -- */}
              <div
                className="absolute left-0 top-0 hidden h-full border-l border-dashed border-foreground/15 sm:block"
                aria-hidden="true"
              />

              {/* -- QR Code -- */}
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.15 }}
              >
                {/* Container QR dengan background primary */}
                <div
                  className="flex aspect-square items-center justify-center rounded-2xl p-4"
                  style={{ background: "var(--primary-3, #0f5f2e)" }}
                >
                  <QRCodeSVG
                    value={qrData}
                    size={140}
                    level="M"
                    bgColor="transparent"
                    fgColor="#ffffff"
                  />
                </div>

                {/* Caption mono di bawah QR */}
                <p className="font-mono text-[10px] font-medium tracking-widest text-foreground/50">
                  Scan untuk validasi
                </p>
              </motion.div>

              {/* -- Label institusi di bawah QR -- */}
              <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
                {institutionName}
              </p>
            </div>
          </div>

          {/* -------------------------------------------------- */}
          {/* Baris tombol aksi — di luar grid dua kolom          */}
          {/* -------------------------------------------------- */}
          <motion.div
            className="no-print flex flex-col gap-3 bg-card p-5 sm:flex-row sm:p-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={onCheckStatus}
              className="flex-1 gap-2 rounded-xl py-5 text-sm font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg focus-ring"
            >
              <Search className="h-4 w-4" />
              Cek Status Antrian
            </Button>
            <Button
              variant="outline"
              onClick={onBookAgain}
              className="flex-1 gap-2 rounded-xl border-2 py-5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-ring"
            >
              <Plus className="h-4 w-4" />
              Booking Lagi
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex-1 gap-2 rounded-xl border-2 py-5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-ring"
            >
              <Printer className="h-4 w-4" />
              Cetak Tiket
            </Button>
          </motion.div>
        </div>
      </BlurFade>
    </>
  )
}
