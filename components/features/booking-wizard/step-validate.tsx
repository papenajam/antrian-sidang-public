"use client"

import { useState, type SubmitEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BlurFade } from "@/components/magic/blur-fade"
import { Loader2, Search, Info, AlertCircle } from "lucide-react"
import { validatePerkara } from "@/lib/queue-service"
import type { ValidateResponse } from "@/lib/api-types"

interface StepValidateProps {
  onNext: (data: NonNullable<ValidateResponse['data']>) => void
  onMultiPihak: (data: NonNullable<ValidateResponse['data']>) => void
  onError: (message: string) => void
  /** Callback opsional untuk menyampaikan data personal ke parent wizard */
  onPersonalDataChange?: (info: { nama: string; telepon: string }) => void
}

export function StepValidate({ onNext, onMultiPihak, onError, onPersonalDataChange }: StepValidateProps) {
  const [nomorPerkara, setNomorPerkara] = useState("")
  const [nik, setNik] = useState("")
  const [nama, setNama] = useState("")
  const [telepon, setTelepon] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    nomorPerkara?: string
    nik?: string
    nama?: string
    telepon?: string
    api?: string
  }>({})
  const [touched, setTouched] = useState({
    nomorPerkara: false,
    nik: false,
    nama: false,
    telepon: false,
  })

  const validate = (): boolean => {
    const newErrors: typeof errors = {}

    if (!nomorPerkara.trim()) {
      newErrors.nomorPerkara = "Nomor perkara wajib diisi"
    }

    if (!nik.trim()) {
      newErrors.nik = "Nomor NIK wajib diisi"
    } else if (!/^\d{16}$/.test(nik)) {
      newErrors.nik = "NIK harus 16 digit angka"
    }

    if (!nama.trim()) {
      newErrors.nama = "Nama lengkap wajib diisi"
    }

    // Validasi telepon hanya jika diisi (opsional)
    if (telepon.trim() && !/^08\d{8,12}$/.test(telepon.trim())) {
      newErrors.telepon = "Format nomor tidak valid. Gunakan format 08xxxxxxxx"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    setTouched({ nomorPerkara: true, nik: true, nama: true, telepon: true })

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const response = await validatePerkara({
        nomor_perkara: nomorPerkara.trim(),
        nik: nik.trim(),
      })

      if (response.valid && response.data) {
        // SIPP cross-check: bandingkan nama yang diisi dengan data SIPP
        if (
          response.data.pihak_nama &&
          response.data.pihak_nama.toLowerCase().trim() !== nama.toLowerCase().trim()
        ) {
          const proceed = window.confirm(
            `Nama yang Anda isi berbeda dengan data SIPP: "${response.data.pihak_nama}". Lanjutkan?`
          )
          if (!proceed) {
            setIsSubmitting(false)
            return
          }
        }

        // Sampaikan data personal ke parent wizard
        onPersonalDataChange?.({ nama: nama.trim(), telepon: telepon.trim() })

        if (response.data.existing_queue) {
          onMultiPihak(response.data)
        } else {
          onNext(response.data)
        }
      } else {
        const errorMessage = response.message || "Validasi gagal"
        if (
          errorMessage.toLowerCase().includes("tidak ditemukan") ||
          errorMessage.toLowerCase().includes("not found")
        ) {
          setErrors({ api: `Nomor perkara tidak ditemukan. Pastikan nomor perkara sesuai dengan surat panggilan.` })
        } else if (
          errorMessage.toLowerCase().includes("nik") ||
          errorMessage.toLowerCase().includes("ktp")
        ) {
          setErrors({ api: `NIK tidak cocok dengan data perkara. Pastikan NIK sesuai dengan KTP.` })
        } else {
          setErrors({ api: errorMessage })
        }
        onError(errorMessage)
      }
    } catch {
      setErrors({ api: "Terjadi kesalahan saat validasi. Silakan coba lagi." })
      onError("Terjadi kesalahan saat validasi.")
    } finally {
      setIsSubmitting(false)
    }
  }

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
    const numericValue = value.replace(/\D/g, "").slice(0, 16)
    setNik(numericValue)
    if (touched.nik && errors.nik) {
      setErrors((prev) => ({ ...prev, nik: undefined }))
    }
    if (errors.api) {
      setErrors((prev) => ({ ...prev, api: undefined }))
    }
  }

  const handleNamaChange = (value: string) => {
    setNama(value)
    if (touched.nama && errors.nama) {
      setErrors((prev) => ({ ...prev, nama: undefined }))
    }
  }

  const handleTeleponChange = (value: string) => {
    // Hanya angka yang diperbolehkan
    const numericValue = value.replace(/\D/g, "")
    setTelepon(numericValue)
    if (touched.telepon && errors.telepon) {
      setErrors((prev) => ({ ...prev, telepon: undefined }))
    }
  }

  // Submit disabled bila field required kosong atau sedang submit
  const isDisabled = !nomorPerkara.trim() || !nik.trim() || !nama.trim() || isSubmitting

  return (
    <BlurFade>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Validasi Data Perkara
          </CardTitle>
          <CardDescription>
            Masukkan nomor perkara dan NIK untuk verifikasi jadwal sidang.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Info alert: data hanya untuk verifikasi */}
          <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm text-primary/80">
              Data Anda hanya dipakai untuk verifikasi dan notifikasi WhatsApp. Tidak disimpan permanen.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* API Error Alert */}
            {errors.api && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{errors.api}</p>
              </div>
            )}

            {/* Nomor Perkara Input */}
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
                className={errors.nomorPerkara ? "border-destructive" : ""}
              />
              {errors.nomorPerkara && (
                <p className="text-sm text-destructive">{errors.nomorPerkara}</p>
              )}
            </div>

            {/* NIK Input */}
            <div className="space-y-2">
              <Label htmlFor="nik">
                NIK (Nomor KTP) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nik"
                placeholder="16 digit nomor KTP"
                value={nik}
                onChange={(e) => handleNikChange(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, nik: true }))}
                maxLength={16}
                aria-invalid={!!errors.nik}
                className={errors.nik ? "border-destructive" : ""}
              />
              <div className="flex items-center justify-between">
                {errors.nik ? (
                  <p className="text-sm text-destructive">{errors.nik}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {nik.length}/16 digit
                  </p>
                )}
              </div>
            </div>

            {/* Nama Lengkap Input */}
            <div className="space-y-2">
              <Label htmlFor="namaLengkap">
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                id="namaLengkap"
                placeholder="Sesuai KTP"
                value={nama}
                onChange={(e) => handleNamaChange(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, nama: true }))}
                aria-invalid={!!errors.nama}
                className={errors.nama ? "border-destructive" : ""}
              />
              {errors.nama && (
                <p className="text-sm text-destructive">{errors.nama}</p>
              )}
            </div>

            {/* No. WhatsApp Input */}
            <div className="space-y-2">
              <Label htmlFor="telepon">
                No. WhatsApp
              </Label>
              <Input
                id="telepon"
                placeholder="08xxxxxxxxxx"
                value={telepon}
                onChange={(e) => handleTeleponChange(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, telepon: true }))}
                aria-invalid={!!errors.telepon}
                className={errors.telepon ? "border-destructive" : ""}
              />
              {errors.telepon ? (
                <p className="text-sm text-destructive">{errors.telepon}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Opsional — untuk menerima notifikasi jadwal
                </p>
              )}
            </div>

            {/* Tips - subtle */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
              <span>Nomor perkara ada di surat panggilan. NIK ada di KTP Anda.</span>
            </div>

            <Button type="submit" disabled={isDisabled} className="w-full" size="lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memvalidasi...
                </>
              ) : (
                <>
                  Verifikasi &amp; Lanjut{" "}
                  <span aria-hidden="true">→</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
