import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/sonner"
import { HydrationSafeProvider } from "@/components/providers/hydration-safe-provider"
import { BookingModalProvider } from "@/contexts/booking-modal-context"
import { AppSettingsProvider } from "@/contexts/app-settings-context"

export const metadata: Metadata = {
  title: {
    default: "Antrian Sidang · Pengadilan Agama Penajam",
    template: "%s | Antrian Sidang",
  },
  description:
    "Layanan digital Pengadilan Agama Penajam — daftar antrian sidang, pantau giliran Anda secara real-time, dan kelola jadwal tanpa harus berdesakan di gedung pengadilan.",
  keywords: [
    "antrian sidang",
    "pengadilan agama",
    "jadwal sidang",
    "sistem antrian",
    "penajam",
  ],
  authors: [{ name: "Pengadilan Agama Penajam" }],
  openGraph: {
    title: "Antrian Sidang · Pengadilan Agama Penajam",
    description:
      "Layanan digital — daftar antrian sidang, pantau giliran secara real-time",
    type: "website",
    locale: "id_ID",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#15803d" },
    { media: "(prefers-color-scheme: dark)", color: "#22c55e" },
  ],
}

/**
 * Script inisialisasi tema — dibaca dari localStorage sebelum React hydrate
 * untuk mencegah flash of wrong theme.
 * Tidak ada input user, aman untuk inline script.
 */
const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
          suppressHydrationWarning
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} dot-grid-bg antialiased`}
        suppressHydrationWarning
      >
        {/* Skip to main content — accessibility */}
        <a href="#main-content" className="skip-link">
          Langsung ke konten utama
        </a>
        <HydrationSafeProvider>
          <BookingModalProvider>
            <AppSettingsProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main id="main-content" className="flex-1" tabIndex={-1}>
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster />
            </AppSettingsProvider>
          </BookingModalProvider>
        </HydrationSafeProvider>
      </body>
    </html>
  )
}
