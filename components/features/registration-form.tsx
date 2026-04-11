"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShimmerButton } from "@/components/magic/shimmer-button"
import { BlurFade } from "@/components/magic/blur-fade"
import { motion } from "framer-motion"
import { CheckCircle, Loader2 } from "lucide-react"

const formSchema = z.object({
  jadwalSidang: z.string().min(1, { message: "Pilih jadwal sidang" }),
  namaPihak: z.string().min(3, { message: "Nama minimal 3 karakter" }).max(255),
  nomorTelepon: z.string().max(30),
})

type FormData = z.infer<typeof formSchema>

// Dummy jadwal sidang untuk demo
const JADWAL_SIDANG = [
  { id: "1", nomorPerkara: "123/Pdt.G/2024/PA.Pps", pihakNama: "Ahmad vs Siti", ruangan: "Ruang Sidang 1", waktu: "09:00 WITA" },
  { id: "2", nomorPerkara: "456/Pdt.P/2024/PA.Pps", pihakNama: "Budi vs Dewi", ruangan: "Ruang Sidang 2", waktu: "10:00 WITA" },
  { id: "3", nomorPerkara: "789/Pdt.G/2024/PA.Pps", pihakNama: "Eko vs Rina", ruangan: "Ruang Sidang 1", waktu: "11:00 WITA" },
  { id: "4", nomorPerkara: "321/Pdt.W/2024/PA.Pps", pihakNama: "Warisan Hartono", ruangan: "Ruang Sidang 3", waktu: "13:00 WITA" },
]

export function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [ticketData, setTicketData] = useState<{ nomorAntrian: string; ruangan: string } | null>(null)

  const form = useForm({
    defaultValues: {
      jadwalSidang: "",
      namaPihak: "",
      nomorTelepon: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate nomor antrian dummy (format: S-001, S-002, dst)
      const nomorAntrian = `S-${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`
      const jadwal = JADWAL_SIDANG.find(j => j.id === value.jadwalSidang)
      
      setTicketData({
        nomorAntrian,
        ruangan: jadwal?.ruangan || "Ruang Sidang 1",
      })
      
      setIsSubmitting(false)
      setIsSuccess(true)
      
      toast.success("Pendaftaran Berhasil!", {
        description: `Nomor antrian Anda: ${nomorAntrian}`,
      })
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
            <form.Field name="jadwalSidang">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="jadwalSidang">Pilih Jadwal Sidang *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger aria-invalid={field.state.meta.errors.length > 0}>
                      <SelectValue placeholder="Pilih jadwal sidang" />
                    </SelectTrigger>
                    <SelectContent>
                      {JADWAL_SIDANG.map((jadwal) => (
                        <SelectItem key={jadwal.id} value={jadwal.id}>
                          {jadwal.nomorPerkara} - {jadwal.pihakNama} ({jadwal.ruangan}, {jadwal.waktu})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {String(field.state.meta.errors[0])}
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
                    <p className="text-sm text-destructive">
                      {String(field.state.meta.errors[0])}
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
                    <p className="text-sm text-destructive">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Nomor ini akan digunakan untuk notifikasi antrian via WhatsApp
                  </p>
                </div>
              )}
            </form.Field>

            {/* Submit Button */}
            <div className="pt-4">
              <ShimmerButton type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Ambil Antrian"
                )}
              </ShimmerButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
