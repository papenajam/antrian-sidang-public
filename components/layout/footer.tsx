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
    <footer className="border-t bg-muted">
      <div className="container mx-auto py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-5 w-5 text-primary" />
              <span className="font-bold">{institutionName}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Melayani masyarakat dengan profesional, transparan, dan akuntabel.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Kontak</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {institutionPhone}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {institutionEmail}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {institutionAddress}
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Jam Operasional</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Senin - Jumat: 08:00 - 16:00</li>
              <li>Sabtu: 08:00 - 12:00</li>
              <li>Minggu: Tutup</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {CURRENT_YEAR} {institutionName}. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  )
}
