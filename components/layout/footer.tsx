// components/layout/footer.tsx
"use client"

import { useAppSettings } from "@/contexts/app-settings-context"
import { Phone, Mail, MapPin } from "lucide-react"

// Tahun saat ini untuk copyright bar
const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  const { settings } = useAppSettings()
  const institution = settings?.institution

  return (
    <footer className="mt-20">
      {/* COMPACT ROW — 4-column (design-parity Opsi C) */}
      <div
        className="bg-card border border-border rounded-[var(--radius-xl)] shadow-[var(--sh-sm)] overflow-hidden
                   grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"
      >
        <FooterCell
          label="Instansi"
          value={institution?.name ?? "Pengadilan Agama Penajam"}
        />
        <FooterCell
          label="Jam Operasional"
          value="Sen — Jum · 08:00 — 16:00 WITA"
        />
        <FooterCell
          label="Sistem"
          value="v0.1.0 · MVP · Live"
        />
        <FooterCell
          label="Kontak"
          value={institution?.phone ?? "-"}
          isLast
        />
      </div>

      {/* DETAIL ROW — 3-kolom (dipertahankan dari versi sebelumnya) */}
      <div className="mt-6 pt-6 border-t border-border/40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
          {/* Kolom 1: Logo + deskripsi institusi */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {/* Badge logo instansi menggunakan gradient primary */}
              <div
                className="w-10 h-10 rounded-[10px] grid place-items-center font-mono font-bold text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-3, var(--primary)) 0%, var(--primary) 100%)",
                  color: "var(--gold-3, var(--gold, #f4d27a))",
                }}
              >
                PA
              </div>
              <div>
                <div className="text-[.65rem] text-muted-foreground uppercase tracking-[.12em] font-mono">
                  Pengadilan Agama
                </div>
                <div className="text-[.92rem] font-semibold">
                  {institution?.short_name ?? "Penajam Paser Utara"}
                </div>
              </div>
            </div>
            <p className="text-[.82rem] text-muted-foreground leading-[1.5]">
              Layanan antrian sidang digital untuk masyarakat — daftar online, pantau jadwal real-time.
            </p>
          </div>

          {/* Kolom 2: Kontak detail dengan ikon Lucide */}
          <div>
            <h4 className="text-[.7rem] uppercase tracking-[.08em] font-mono text-muted-foreground mb-3">
              Kontak Instansi
            </h4>
            <ul className="space-y-2 text-[.85rem]">
              {institution?.phone && (
                <li className="flex items-start gap-2">
                  <Phone className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                  <span>{institution.phone}</span>
                </li>
              )}
              {institution?.email && (
                <li className="flex items-start gap-2">
                  <Mail className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                  <span className="break-all">{institution.email}</span>
                </li>
              )}
              {institution?.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                  <span className="leading-relaxed">{institution.address}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Kolom 3: Jam layanan per hari */}
          <div>
            <h4 className="text-[.7rem] uppercase tracking-[.08em] font-mono text-muted-foreground mb-3">
              Jam Layanan
            </h4>
            <ul className="space-y-1 text-[.85rem]">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Sen — Kam</span>
                <span className="font-mono">08:00 — 16:30</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Jumat</span>
                <span className="font-mono">08:00 — 17:00</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Sab — Min</span>
                <span className="font-mono text-muted-foreground">Tutup</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* COPYRIGHT BAR — bagian paling bawah */}
      <div className="mt-6 pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[.78rem] text-muted-foreground px-2">
        <span>
          &copy; {CURRENT_YEAR}{" "}
          {institution?.name ?? "Pengadilan Agama"}. Hak cipta dilindungi.
        </span>
        <span className="font-mono">v0.1.0 MVP</span>
      </div>
    </footer>
  )
}

/**
 * Komponen cell untuk compact row footer.
 * Menampilkan label kecil di atas dan nilai utama di bawah.
 *
 * @param label - Label kecil di atas (uppercase)
 * @param value - Nilai utama yang ditampilkan
 * @param isLast - Apakah cell terakhir (tidak perlu border kanan)
 */
function FooterCell({
  label,
  value,
  isLast = false,
}: {
  label: string
  value: string
  isLast?: boolean
}) {
  return (
    <div
      className={[
        "px-6 py-5",
        // Border bawah untuk mobile, border kanan untuk desktop (kecuali cell terakhir)
        !isLast ? "border-b lg:border-b-0 lg:border-r border-border" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Label uppercase kecil sebagai keterangan cell */}
      <span className="block text-[.68rem] uppercase tracking-[.04em] font-medium text-muted-foreground mb-1">
        {label}
      </span>
      {/* Nilai utama cell */}
      <span className="text-[.88rem] font-medium text-foreground">
        {value}
      </span>
    </div>
  )
}
