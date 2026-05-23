"use client"

import { useState } from "react"
import Link from "next/link"
import { Scale, Menu, X, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useAppSettings } from "@/contexts/app-settings-context"
import { FloatingActionButton } from "@/components/features/floating-action-button"

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/jadwal", label: "Jadwal Sidang" },
  { href: "/kontak", label: "Kontak" },
]

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { settings } = useAppSettings()

  const institutionName = settings?.institution.name ?? "Pengadilan Agama Penajam"

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground">
        <div className="container mx-auto flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Scale className="h-6 w-6" />
            <span className="font-bold text-lg">{institutionName}</span>
          </Link>

          {/* Desktop nav + theme toggle */}
          <div className="hidden items-center gap-4 sm:flex">
            <nav className="flex items-center gap-4" aria-label="Navigasi utama">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-md p-1.5 hover:bg-primary-foreground/10 transition-colors"
              aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-md p-1.5 hover:bg-primary-foreground/10 transition-colors"
              aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <button
              className="flex items-center"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isMobileMenuOpen && (
          <nav
            className="border-t bg-primary px-4 pb-4 sm:hidden"
            aria-label="Navigasi mobile"
          >
            <ul className="flex flex-col gap-2 pt-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded px-2 py-2 text-sm font-medium hover:bg-primary-foreground/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      <FloatingActionButton />
    </>
  )
}
