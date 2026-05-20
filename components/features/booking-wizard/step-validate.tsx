"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BlurFade } from "@/components/magic/blur-fade"
import { Loader2, Search } from "lucide-react"
import { validatePerkara } from "@/lib/queue-service"
import type { ValidateResponse } from "@/lib/api-types"

interface StepValidateProps {
  onNext: (data: NonNullable<ValidateResponse['data']>) => void
  onError: (message: string) => void
}

export function StepValidate({ onNext, onError }: StepValidateProps) {
  const [nomorPerkara, setNomorPerkara] = useState("")
  const [nik, setNik] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ nomorPerkara?: string; nik?: string }>({})

  const validate = (): boolean => {
    const newErrors: { nomorPerkara?: string; nik?: string } = {}

    if (!nomorPerkara.trim()) {
      newErrors.nomorPerkara = "Nomor perkara wajib diisi"
    }

    if (!nik.trim()) {
      newErrors.nik = "NIK wajib diisi"
    } else if (!/^\d{16}$/.test(nik)) {
      newErrors.nik = "NIK harus 16 digit angka"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const response = await validatePerkara({
        nomor_perkara: nomorPerkara.trim(),
        nik: nik.trim(),
      })

      if (response.valid && response.data) {
        onNext(response.data)
      } else {
        onError(response.message || "Validasi gagal")
      }
    } catch (error) {
      onError("Terjadi kesalahan saat validasi. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BlurFade>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Validasi Data Perkara
          </CardTitle>
          <CardDescription>
            Masukkan nomor perkara dan NIK Anda untuk memverifikasi jadwal sidang dan ketersediaan slot booking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomorPerkara">Nomor Perkara *</Label>
              <Input
                id="nomorPerkara"
                placeholder="Contoh: 123/Pdt.G/2024/PA.Pps"
                value={nomorPerkara}
                onChange={(e) => setNomorPerkara(e.target.value)}
                aria-invalid={!!errors.nomorPerkara}
              />
              {errors.nomorPerkara && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.nomorPerkara}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nik">NIK (Nomor Induk Kependudukan) *</Label>
              <Input
                id="nik"
                placeholder="16 digit NIK sesuai KTP"
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, "").slice(0, 16))}
                maxLength={16}
                aria-invalid={!!errors.nik}
              />
              {errors.nik && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.nik}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memvalidasi...
                </>
              ) : (
                <>
                  Cek Jadwal & Lanjutkan
                  <Search className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
