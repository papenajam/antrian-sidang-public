"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Scale, Menu, X, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useAppSettings } from "@/contexts/app-settings-context"
import { FloatingActionButton } from "@/components/features/floating-action-button"

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "#jadwal", label: "Jadwal Sidang" },
  { href: "/kontak", label: "Kontak" },
]

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const { settings } = useAppSettings()

  const institutionName = settings?.institution.name ?? "Pengadilan Agama Penajam"

  // Efek listener scroll untuk mendeteksi posisi scroll window
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled 
            ? "bg-primary/90 backdrop-blur-md shadow-premium border-b border-white/10 py-3" 
            : "bg-primary border-b border-transparent py-4"
        } text-primary-foreground`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo dengan transisi scale & hover color */}
          <Link href="/" className="flex items-center gap-2 group transition-transform duration-200 hover:scale-[1.02]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors group-hover:bg-white/20 border border-white/10">
              <Scale className="h-5 w-5 text-secondary group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="font-heading font-bold text-lg tracking-tight select-none group-hover:text-amber-200 transition-colors">
              {institutionName}
            </span>
          </Link>

          {/* Desktop nav + theme toggle */}
          <div className="hidden items-center gap-6 sm:flex">
            <nav className="flex items-center gap-5" aria-label="Navigasi utama">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-sm font-medium text-white/80 hover:text-amber-200 transition-colors py-1 group/link"
                >
                  {link.label}
                  {/* Underline emas yang melebar saat di-hover */}
                  <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-secondary transition-all duration-300 group-hover/link:w-full" />
                </Link>
              ))}
            </nav>
            <div className="h-4 w-px bg-white/20" />
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl p-2 hover:bg-white/10 text-white/85 hover:text-white transition-all border border-transparent hover:border-white/10"
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
              className="rounded-xl p-2 hover:bg-white/10 text-white/85 hover:text-white transition-colors"
              aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <button
              className="flex items-center rounded-xl p-2 hover:bg-white/10 text-white/85 hover:text-white transition-colors"
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

        {/* Mobile dropdown menu dengan glass effect */}
        {isMobileMenuOpen && (
          <nav
            className="border-t border-white/10 bg-primary px-4 pb-4 sm:hidden animate-slide-up"
            aria-label="Navigasi mobile"
          >
            <ul className="flex flex-col gap-2 pt-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-white/10 hover:text-amber-200 transition-all"
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
