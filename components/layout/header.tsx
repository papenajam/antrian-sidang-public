// components/layout/header.tsx
import Link from "next/link"
import { Scale } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Scale className="h-6 w-6" />
          <span className="font-bold text-lg">Pengadilan Agama</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium hover:underline">
            Beranda
          </Link>
          <Link href="/jadwal" className="text-sm font-medium hover:underline">
            Jadwal Sidang
          </Link>
          <Link href="/kontak" className="text-sm font-medium hover:underline">
            Kontak
          </Link>
        </nav>
      </div>
    </header>
  )
}
