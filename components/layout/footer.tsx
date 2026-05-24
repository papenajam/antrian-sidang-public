// components/layout/footer.tsx
"use client"

import { useAppSettings } from "@/contexts/app-settings-context"

const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  const { settings } = useAppSettings()

  const institutionName = settings?.institution.name ?? "Pengadilan Agama Penajam"
  const institutionAddress = settings?.institution.address ?? "Jl. Propinsi KM. 10, Kelurahan Penajam, Kec. Penajam, Kab. Penajam Paser Utara, Kaltim 76141"
  const institutionPhone = settings?.institution.phone ?? "(0543) 21045"
  const institutionEmail = settings?.institution.email ?? "pa.penajam@gmail.com"

  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="as-pad py-12">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Informasi instansi */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="grid h-[32px] w-[32px] place-items-center rounded-[8px] font-mono text-[.75rem] font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary) 0%, #0f5f2e 100%)",
                  color: "var(--gold, #f4d27a)",
                }}
              >
                PA
              </div>
              <span className="text-[.88rem] font-semibold tracking-tight text-foreground">
                {institutionName}
              </span>
            </div>
            <p className="text-[.82rem] text-muted-foreground leading-relaxed max-w-sm">
              Melayani masyarakat dengan profesional, transparan, dan akuntabel demi terwujudnya keadilan yang agung.
            </p>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="text-[.72rem] font-mono font-medium uppercase tracking-[.12em] text-muted-foreground mb-4">
              Kontak Instansi
            </h3>
            <ul className="space-y-3 text-[.82rem] text-foreground">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-muted-foreground">📞</span>
                <span>{institutionPhone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-muted-foreground">📧</span>
                <span className="break-all">{institutionEmail}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-muted-foreground">📍</span>
                <span className="leading-relaxed">{institutionAddress}</span>
              </li>
            </ul>
          </div>

          {/* Jam layanan */}
          <div>
            <h3 className="text-[.72rem] font-mono font-medium uppercase tracking-[.12em] text-muted-foreground mb-4">
              Jam Layanan
            </h3>
            <ul className="space-y-2 text-[.82rem] text-foreground">
              <li className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Senin – Kamis</span>
                <span className="font-semibold">08:00 – 16:30</span>
              </li>
              <li className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Jumat</span>
                <span className="font-semibold">08:00 – 17:00</span>
              </li>
              <li className="flex justify-between pb-1">
                <span className="text-muted-foreground">Sabtu – Minggu</span>
                <span className="font-medium text-muted-foreground">Tutup Layanan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border text-center text-[.72rem] font-mono text-muted-foreground tracking-wider">
          &copy; {CURRENT_YEAR}{" "}
          <span className="text-foreground font-medium">
            {institutionName}
          </span>
          . Hak cipta dilindungi undang-undang.
        </div>
      </div>
    </footer>
  )
}
