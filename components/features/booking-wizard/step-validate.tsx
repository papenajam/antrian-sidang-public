"use client"

import { useState, type SubmitEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BlurFade } from "@/components/magic/blur-fade"
import { Loader2, Search, Info, Lightbulb, AlertCircle } from "lucide-react"
import { validatePerkara } from "@/lib/queue-service"
import type { ValidateResponse } from "@/lib/api-types"

interface StepValidateProps {
  onNext: (data: NonNullable<ValidateResponse['data']>) => void
  onMultiPihak: (data: NonNullable<ValidateResponse['data']>) => void
  onError: (message: string) => void
}

// Note: onExistingQueue prop is kept for future multi-party handling expansion
export function StepValidate({ onNext, onMultiPihak, onError }: StepValidateProps) {
  const [nomorPerkara, setNomorPerkara] = useState("")
  const [nik, setNik] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ nomorPerkara?: string; nik?: string; api?: string }>({})
  const [touched, setTouched] = useState({ nomorPerkara: false, nik: false })

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

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    setTouched({ nomorPerkara: true, nik: true })

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const response = await validatePerkara({
        nomor_perkara: nomorPerkara.trim(),
        nik: nik.trim(),
      })

      if (response.valid && response.data) {
        if (response.data.existing_queue) {
          onMultiPihak(response.data)
        } else {
          onNext(response.data)
        }
      } else {
        // Tangani error API dengan pesan yang lebih spesifik
        const errorMessage = response.message || "Validasi gagal"
        if (
          errorMessage.toLowerCase().includes("tidak ditemukan") ||
          errorMessage.toLowerCase().includes("not found") ||
          errorMessage.toLowerCase().includes("tidak ada")
        ) {
          setErrors({ api: `Nomor perkara "${nomorPerkara}" tidak ditemukan dalam sistem. Pastikan nomor perkara sesuai dengan surat panggilan.` })
        } else if (
          errorMessage.toLowerCase().includes("nik") ||
          errorMessage.toLowerCase().includes("ktp")
        ) {
          setErrors({ api: `NIK "${nik}" tidak cocok dengan data perkara. Pastikan NIK sesuai dengan KTP.` })
        } else {
          setErrors({ api: errorMessage })
        }
        onError(errorMessage)
      }
    } catch {
      setErrors({ api: "Terjadi kesalahan saat validasi. Silakan coba lagi dalam beberapa saat." })
      onError("Terjadi kesalahan saat validasi. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler untuk membersihkan error saat input berubah
  const handleNomorPerkaraChange = (value: string) => {
    setNomorPerkara(value)
    if (touched.nomorPerkara && errors.nomorPerkara) {
      setErrors((prev) => ({ ...prev, nomorPerkara: undefined }))
    }
    if (errors.api) {
      setErrors((prev) => ({ ...prev, api: undefined }))
    }
  }

  const handleNikChange = (value: string) => {
    // Filter hanya angka
    const numericValue = value.replace(/\D/g, "").slice(0, 16)
    setNik(numericValue)
    if (touched.nik && errors.nik) {
      setErrors((prev) => ({ ...prev, nik: undefined }))
    }
    if (errors.api) {
      setErrors((prev) => ({ ...prev, api: undefined }))
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
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tips Help Box */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">💡 Tips Memasukkan Data:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <strong>Nomor perkara</strong> ada di surat panggilan sidang — format:{" "}
                      <code className="rounded bg-blue-100 px-1">123/Pdt.G/2024/PA.Pps</code>
                    </li>
                    <li>
                      <strong>NIK</strong> adalah 16 digit nomor di KTP Anda
                    </li>
                    <li>Pastikan tidak ada spasi atau karakter khusus</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error dari API */}
            {errors.api && (
              <div className="flex items-start gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <p className="text-sm text-red-800">{errors.api}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nomorPerkara">
                Nomor Perkara <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nomorPerkara"
                placeholder="Contoh: 123/Pdt.G/2024/PA.Pps"
                value={nomorPerkara}
                onChange={(e) => handleNomorPerkaraChange(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, nomorPerkara: true }))}
                aria-invalid={!!errors.nomorPerkara}
                className={errors.nomorPerkara ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.nomorPerkara && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.nomorPerkara}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nik">
                NIK (Nomor Induk Kependudukan) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nik"
                placeholder="16 digit NIK sesuai KTP"
                value={nik}
                onChange={(e) => handleNikChange(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, nik: true }))}
                maxLength={16}
                aria-invalid={!!errors.nik}
                className={errors.nik ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <div className="flex items-center justify-between">
                {errors.nik ? (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.nik}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {nik.length}/16 digit
                  </p>
                )}
              </div>
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
