"use client"

import { useState, useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import { ShimmerButton } from "@/components/magic/shimmer-button"
import { BlurFade } from "@/components/magic/blur-fade"
import { motion } from "framer-motion"
import { CheckCircle, Loader2 } from "lucide-react"
import { bookQueue, getTodaySchedule } from "@/lib/queue-service"
import type { JadwalSidang } from "@/lib/api-types"
import { ZodError } from "zod"
import { ApiError } from "@/lib/api"

/**
 * Helper untuk extract error message dari Zod validation error
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? String(error)
  }
  return String(error)
}

const formSchema = z.object({
  perkaraId: z.number().min(1, { message: "Pilih jadwal sidang" }),
  namaPihak: z.string().min(3, { message: "Nama minimal 3 karakter" }).max(255),
  nomorTelepon: z.string().max(30),
})

// Form schema type is defined via z.infer<typeof formSchema> inline in the component

interface JadwalOption {
  perkaraId: number
  label: string
}

export function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [jadwalOptions, setJadwalOptions] = useState<JadwalOption[]>([])
  const [ticketData, setTicketData] = useState<{ 
    nomorAntrian: string
    ruangan: string
    pihakNama: string
    nomorPerkara: string
  } | null>(null)

  // Fetch jadwal sidang saat component mount
  useEffect(() => {
    async function fetchJadwal() {
      try {
        const response = await getTodaySchedule()
        
        if (response.error) {
          toast.error(response.error)
          setJadwalOptions([])
        } else {
          // Helper untuk extract nama pihak dari HTML para_pihak
          const extractPartyName = (paraPihak: string | null | undefined): string => {
            if (!paraPihak) return "—"
            const cleanText = paraPihak.replace(/<[^>]*>/g, " ").trim()
            const firstParty = cleanText.split("  ")[0] || cleanText
            return firstParty || "—"
          }

          // Transform API response ke dropdown options
          const options: JadwalOption[] = response.data.map(
            (jadwal: JadwalSidang) => ({
              perkaraId: jadwal.perkara_id,
              label: `${jadwal.perkara?.nomor_perkara || "—"} - ${extractPartyName(jadwal.perkara?.para_pihak)} (${jadwal.ruangan}, ${jadwal.waktu})`,
            })
          )
          setJadwalOptions(options)
        }
      } catch (error) {
        toast.error("Gagal memuat jadwal sidang")
        console.error("Error fetching jadwal:", error)
        setJadwalOptions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchJadwal()
  }, [])

  const form = useForm({
    defaultValues: {
      perkaraId: 0,
      namaPihak: "",
      nomorTelepon: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)

      try {
        // Submit ke backend API
        const response = await bookQueue({
          perkara_id: value.perkaraId,
          pihak_nama: value.namaPihak,
          pihak_telepon: value.nomorTelepon || undefined,
        })

        setTicketData({
          nomorAntrian: response.data.queue_number,
          ruangan: response.data.ruang_sidang || "Ruang Sidang",
          pihakNama: response.data.pihak_nama,
          nomorPerkara: response.data.nomor_perkara,
        })

        setIsSubmitting(false)
        setIsSuccess(true)

        toast.success("Pendaftaran Berhasil!", {
          description: `Nomor antrian Anda: ${response.data.queue_number}`,
        })
      } catch (error) {
        setIsSubmitting(false)
        
        if (error instanceof ApiError) {
          toast.error(error.message)
        } else {
          toast.error("Terjadi kesalahan saat mendaftarkan antrian")
        }
        console.error("Error submitting registration:", error)
      }
    },
  })

  if (isSuccess && ticketData) {
    return (
      <BlurFade>
        <Card className="mx-auto max-w-2xl">
          <CardContent className="pt-6">
            <motion.div
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-primary">
                Pendaftaran Berhasil!
              </h2>
              <p className="mb-6 text-muted-foreground">
                Nomor antrian Anda telah berhasil dibuat. Silakan simpan nomor antrian
                Anda dan datang sesuai jadwal yang telah ditentukan.
              </p>
              <div className="rounded-lg bg-muted p-6 space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Nomor Antrian</div>
                  <div className="text-4xl font-bold text-primary">
                    {ticketData.nomorAntrian}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Ruangan Sidang</div>
                  <div className="text-lg font-semibold">
                    {ticketData.ruangan}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Perkara</div>
                  <div className="text-sm font-medium">
                    {ticketData.nomorPerkara}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Pihak</div>
                  <div className="text-sm font-medium">
                    {ticketData.pihakNama}
                  </div>
                </div>
              </div>
              <Button
                className="mt-6"
                onClick={() => {
                  setIsSuccess(false)
                  setTicketData(null)
                  form.reset()
                }}
              >
                Ambil Antrian Lagi
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </BlurFade>
    )
  }

  return (
    <BlurFade>
      <Card className="mx-auto max-w-2xl" id="daftar">
        <CardHeader>
          <CardTitle>Ambil Nomor Antrian Sidang Online</CardTitle>
          <CardDescription>
            Pilih jadwal sidang yang tersedia dan lengkapi data Anda untuk mendapatkan nomor antrian.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            {/* Jadwal Sidang */}
            <form.Field name="perkaraId">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="perkaraId">Pilih Jadwal Sidang *</Label>
                  <Combobox
                    items={jadwalOptions}
                    value={
                      field.state.value > 0
                        ? jadwalOptions.find((j) => j.perkaraId === field.state.value) ?? null
                        : null
                    }
                    onValueChange={(selected) => {
                      field.handleChange(selected?.perkaraId ?? 0)
                    }}
                    itemToStringValue={(item) => item?.label ?? ""}
                  >
                    <ComboboxInput
                      placeholder={
                        isLoading
                          ? "Memuat jadwal..."
                          : jadwalOptions.length === 0
                            ? "Tidak ada jadwal tersedia"
                            : "Cari jadwal sidang..."
                      }
                      disabled={isLoading}
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>
                        {jadwalOptions.length === 0
                          ? "Tidak ada jadwal sidang tersedia hari ini"
                          : "Tidak ada jadwal ditemukan"}
                      </ComboboxEmpty>
                      <ComboboxList>
                        {(jadwal) => (
                          <ComboboxItem key={jadwal.perkaraId} value={jadwal}>
                            {jadwal.label}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive" role="alert">
                      {field.state.meta.errors.map((e: unknown) => getErrorMessage(e)).join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Nama Pihak */}
            <form.Field name="namaPihak">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="namaPihak">Nama Lengkap *</Label>
                  <Input
                    id="namaPihak"
                    placeholder="Masukkan nama lengkap sesuai KTP"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive" role="alert">
                      {field.state.meta.errors.map((e: unknown) => getErrorMessage(e)).join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Nomor Telepon */}
            <form.Field name="nomorTelepon">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="nomorTelepon">Nomor Telepon / WhatsApp (Opsional)</Label>
                  <Input
                    id="nomorTelepon"
                    placeholder="08xxxxxxxxxx"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ""))}
                    onBlur={field.handleBlur}
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive" role="alert">
                      {field.state.meta.errors.map((e: unknown) => getErrorMessage(e)).join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Nomor ini akan digunakan untuk notifikasi antrian via WhatsApp
                  </p>
                </div>
              )}
            </form.Field>

            {/* Submit Button */}
            <div className="pt-6">
              <ShimmerButton
                type="submit"
                disabled={isSubmitting}
                className="w-full text-base font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                shimmerColor="#ffffff"
                shimmerOpacity={0.3}
                shimmerDuration="2.5s"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Ambil Antrian
                    <svg
                      className="ml-2 h-5 w-5 transition-transform duration-300 group-hover/button:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </ShimmerButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
