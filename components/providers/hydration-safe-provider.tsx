"use client"

import { useState, useEffect, type ReactNode } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

interface HydrationSafeProviderProps {
  children: ReactNode
}

/**
 * Wrapper around ThemeProvider that prevents hydration mismatch.
 *
 * Problem: next-themes reads from localStorage on client but server doesn't have access,
 * causing class attribute mismatch (e.g., dark mode classes).
 *
 * Solution: Delay rendering children until after client hydration is complete.
 */
export function HydrationSafeProvider({ children }: HydrationSafeProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {/* Delay children until client is hydrated to prevent mismatch */}
      {isHydrated ? children : null}
    </NextThemesProvider>
  )
}