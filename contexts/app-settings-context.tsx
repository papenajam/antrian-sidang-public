"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { AppSettings } from "@/lib/api-types"
import { getAppSettings } from "@/lib/queue-service"

interface AppSettingsContextType {
  settings: AppSettings | null
  isLoading: boolean
  error: string | null
  refreshSettings: () => Promise<void>
}

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: null,
  isLoading: true,
  error: null,
  refreshSettings: async () => {},
})

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getAppSettings()
      setSettings(response.data)
    } catch (err) {
      console.error("Error fetching app settings:", err)
      setError("Gagal memuat pengaturan aplikasi")
      // Gunakan default settings jika gagal
      setSettings({
        app: {
          name: "Antrian Sidang",
          short_name: "AS",
          description: "Sistem antrian sidang yang modern dan interaktif",
        },
        institution: {
          name: "Pengadilan Agama Penajam",
          short_name: "PAP",
          address: null,
          phone: null,
          email: null,
          logo: null,
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        isLoading,
        error,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  )
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext)
  if (context === undefined) {
    throw new Error("useAppSettings must be used within an AppSettingsProvider")
  }
  return context
}
