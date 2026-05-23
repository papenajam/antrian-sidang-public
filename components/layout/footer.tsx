// components/layout/footer.tsx
"use client"

import { Scale, Phone, Mail, MapPin } from "lucide-react"
import { useAppSettings } from "@/contexts/app-settings-context"

const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  const { settings } = useAppSettings()

  const institutionName = settings?.institution.name ?? "Pengadilan Agama Penajam"
  const institutionAddress = settings?.institution.address ?? "Jl. Pengadilan No. 1, Jakarta"
  const institutionPhone = settings?.institution.phone ?? "(021) 1234567"
  const institutionEmail = settings?.institution.email ?? "info@pengadilan-agama.go.id"

  return (
    <footer className="border-t border-secondary/35 bg-footer text-footer-foreground">
      <div className="container mx-auto py-12 px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Scale className="h-6 w-6 text-secondary" />
              <span className="font-heading font-bold text-base tracking-wide text-footer-foreground">{institutionName}</span>
            </div>
            <p className="text-sm text-footer-muted leading-relaxed max-w-sm">
              Melayani masyarakat dengan profesional, transparan, dan akuntabel demi terwujudnya keadilan yang agung.
            </p>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-secondary mb-4">Kontak Instansi</h3>
            <ul className="space-y-3.5 text-sm text-footer-foreground">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4.5 w-4.5 text-secondary flex-shrink-0 mt-0.5" />
                <span>{institutionPhone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4.5 w-4.5 text-secondary flex-shrink-0 mt-0.5" />
                <span className="break-all">{institutionEmail}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-secondary flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{institutionAddress}</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-secondary mb-4">Jam Layanan</h3>
            <ul className="space-y-2 text-sm text-footer-foreground">
              <li className="flex justify-between border-b border-footer-foreground/10 pb-2">
                <span>Senin - Kamis</span>
                <span className="font-semibold text-footer-foreground">08:00 - 16:30</span>
              </li>
              <li className="flex justify-between border-b border-footer-foreground/10 pb-2">
                <span>Jumat</span>
                <span className="font-semibold text-footer-foreground">08:00 - 17:00</span>
              </li>
              <li className="flex justify-between pb-1">
                <span>Sabtu - Minggu</span>
                <span className="text-footer-muted font-medium">Tutup Layanan</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-footer-foreground/10 text-center text-xs text-footer-muted tracking-wider">
          &copy; {CURRENT_YEAR} <span className="text-footer-foreground font-semibold">{institutionName}</span>. Hak cipta dilindungi undang-undang.
        </div>
      </div>
    </footer>
  )
}
