"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sun, Moon } from "lucide-react"
import { useAppSettings } from "@/contexts/app-settings-context"

/**
 * Daftar navigasi utama.
 * Setiap item merujuk ke section di halaman yang sama (scroll ke anchor).
 */
const NAV_LINKS = [
  { id: "home", label: "Beranda" },
  { id: "jadwal", label: "Jadwal" },
  { id: "status", label: "Cek Status" },
  { id: "panduan", label: "Panduan" },
]

export function Header() {
  const [activeNav, setActiveNav] = useState("home")
  const [isDark, setIsDark] = useState(false)
  const { settings } = useAppSettings()

  const institutionName =
    settings?.institution.name ?? "Pengadilan Agama Penajam"
  const shortName = settings?.institution.short_name ?? "PA"

  // Deteksi tema awal dari localStorage
  useEffect(() => {
    const theme = localStorage.getItem("theme")
    setIsDark(theme === "dark")
  }, [])

  // Toggle dark mode
  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  /**
   * Scroll ke section berdasarkan ID navigasi.
   * Offset 80px agar header glass tidak menutupi konten.
   */
  const scrollTo = (id: string) => {
    setActiveNav(id)
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    const el = document.getElementById(`sec-${id}`)
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 80,
        behavior: "smooth",
      })
    }
  }

  return (
    <header
      className="as-pad sticky top-4 z-50"
      role="banner"
    >
      <div
        className="flex items-center gap-2 glass rounded-full border border-border px-4 py-2.5 shadow-[var(--sh-sm)]"
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault()
            scrollTo("home")
          }}
          className="mr-auto flex items-center gap-2.5 no-underline"
        >
          {/* Logo mark — kotak hijau tua dengan inisial */}
          <div
            className="grid h-[38px] w-[38px] place-items-center rounded-[10px] font-mono text-[.95rem] font-bold"
            style={{
              background:
                "linear-gradient(135deg, var(--primary) 0%, #0f5f2e 100%)",
              color: "var(--gold, #f4d27a)",
              boxShadow:
                "0 4px 10px -2px var(--ring), inset 0 1px 0 rgba(255,255,255,.15), inset 0 0 0 1px var(--gold, #b8860b)",
            }}
          >
            {shortName}
          </div>
          <div className="leading-[1.1]">
            <small className="block text-[.65rem] font-mono font-medium tracking-[.12em] uppercase text-muted-foreground">
              Pengadilan Agama
            </small>
            <strong className="block text-[.92rem] font-semibold tracking-[-.005em] text-foreground">
              {institutionName.replace("Pengadilan Agama ", "").toUpperCase()}
            </strong>
          </div>
        </Link>

        {/* Navigasi — hidden di mobile kecil */}
        <nav className="hidden items-center gap-0.5 sm:flex" aria-label="Navigasi utama">
          {NAV_LINKS.map((n) => (
            <button
              key={n.id}
              onClick={() => scrollTo(n.id)}
              className={`rounded-full border-0 px-4 py-2 text-[.88rem] font-medium tracking-[-.005em] whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeNav === n.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="ml-1 grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  )
}
