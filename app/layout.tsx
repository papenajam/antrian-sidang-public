import type { Metadata, Viewport } from "next"
import { Outfit, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/sonner"
import { HydrationSafeProvider } from "@/components/providers/hydration-safe-provider"
import { BookingModalProvider } from "@/contexts/booking-modal-context"
import { AppSettingsProvider } from "@/contexts/app-settings-context"

// Font yang distinctive dan modern
// Outfit - untuk headings (geometric, clean, professional)
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

// Plus Jakarta Sans - untuk body (humanist, readable)
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: {
    default: "Antrian Sidang - Pengadilan Agama",
    template: "%s | Antrian Sidang",
  },
  description: "Sistem antrian sidang pengadilan agama yang modern dan interaktif. Daftar antrian, cek status, dan jadwal sidang dengan mudah.",
  keywords: ["antrian sidang", "pengadilan agama", "jadwal sidang", "sistem antrian", "indonesia"],
  authors: [{ name: "Pengadilan Agama" }],
  openGraph: {
    title: "Antrian Sidang - Pengadilan Agama",
    description: "Sistem antrian sidang yang modern dan interaktif",
    type: "website",
    locale: "id_ID",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#22c55e" },
  ],
}

// Static inline script - NO user input, safe for hydration mismatch prevention
// This is the official Next.js pattern for theme initialization
const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('theme');
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
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
        {/* Read theme from localStorage before React hydrates to prevent mismatch */}
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
          suppressHydrationWarning
        />
      </head>
      <body
        className={`${outfit.variable} ${plusJakartaSans.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Skip to main content link untuk accessibility */}
        <a
          href="#main-content"
          className="skip-link"
        >
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
