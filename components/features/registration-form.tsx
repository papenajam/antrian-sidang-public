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
import { Checkbox } from "@/components/ui/checkbox"
import { FormProgress } from "./form-progress"
import { ShimmerButton } from "@/components/magic/shimmer-button"
import { BlurFade } from "@/components/magic/blur-fade"
import { motion } from "framer-motion"
import { User, FileText, CheckCircle, Loader2 } from "lucide-react"

const formSchema = z.object({
  // Step 1: Data Diri
  namaLengkap: z.string().min(3, { message: "Nama minimal 3 karakter" }),
  nik: z.string().length(16, { message: "NIK harus 16 digit" }),
  nomorHP: z.string().min(10, { message: "Nomor HP minimal 10 digit" }).max(14, { message: "Nomor HP maksimal 14 digit" }),
  email: z.union([z.string().email({ message: "Format email tidak valid" }), z.literal("")]),

  // Step 2: Data Perkara
  jenisPerkara: z.string().min(1, { message: "Pilih jenis perkara" }),
  nomorRegister: z.string(),
  tanggalSidang: z.string().min(1, { message: "Pilih tanggal sidang" }),

  // Step 3: Konfirmasi
  agreeTerms: z.boolean().refine(val => val === true, { message: "Anda harus menyetujui syarat dan ketentuan" }),
})

type FormData = z.infer<typeof formSchema>

// Mapping step index ke field names yang perlu divalidasi
const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  0: ["namaLengkap", "nik", "nomorHP", "email"],
  1: ["jenisPerkara", "tanggalSidang"],
  2: ["agreeTerms"],
}

const JENIS_PERKARA_LABELS: Record<string, string> = {
  perceraian: "Perceraian",
  waris: "Waris",
  nikah: "Nikah",
  gugatan: "Gugatan",
  lainnya: "Lainnya",
}

const steps = [
  { id: "data-diri", title: "Data Diri" },
  { id: "data-perkara", title: "Data Perkara" },
  { id: "konfirmasi", title: "Konfirmasi" },
]

export function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [queueNumber] = useState(`AN-${Math.floor(Math.random() * 900) + 100}`)

  const form = useForm({
    defaultValues: {
      namaLengkap: "",
      nik: "",
      nomorHP: "",
      email: "",
      jenisPerkara: "",
      nomorRegister: "",
      tanggalSidang: "",
      agreeTerms: false,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      // Simulasi API call — akan diganti dengan API sungguhan nanti
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsSubmitting(false)
      setIsSuccess(true)
      toast.success("Pendaftaran Berhasil!", {
        description: `Nomor antrian Anda: ${queueNumber}`,
        action: {
          label: "Lihat Detail",
          onClick: () => console.log("Lihat detail"),
        },
      })
    },
  })

  const nextStep = async () => {
    // Trigger validasi untuk semua field di step saat ini
    const fieldsToValidate = STEP_FIELDS[currentStep] ?? []
    const results = await Promise.all(
      fieldsToValidate.map((field) => form.validateField(field, "change"))
    )
    // Jika ada error, jangan advance
    const hasErrors = results.some((r) => r !== undefined && r !== null)
    if (hasErrors) return
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (isSuccess) {
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
              <div className="rounded-lg bg-muted p-6">
                <div className="text-sm text-muted-foreground">Nomor Antrian Anda</div>
                <div className="text-4xl font-bold text-primary">
                  {queueNumber}
                </div>
              </div>
              <Button
                className="mt-6"
                onClick={() => {
                  setIsSuccess(false)
                  setCurrentStep(0)
                  form.reset()
                }}
              >
                Daftar Lagi
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
          <CardTitle>Form Pendaftaran Antrian Sidang</CardTitle>
          <CardDescription>
            Lengkapi formulir berikut untuk mendaftar antrian sidang. Pastikan data yang
            dimasukkan benar dan valid.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProgress steps={steps} currentStep={currentStep} />

          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            {/* Step 1: Data Diri */}
            {currentStep === 0 && (
              <BlurFade>
                <div className="space-y-4">
                  <form.Field name="namaLengkap">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="namaLengkap">Nama Lengkap *</Label>
                        <Input
                          id="namaLengkap"
                          placeholder="Masukkan nama lengkap"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          aria-invalid={field.state.meta.errors.length > 0}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-destructive">
                            {field.state.meta.errors[0]?.message ?? String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="nik">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="nik">NIK *</Label>
                        <Input
                          id="nik"
                          placeholder="16 digit NIK"
                          maxLength={16}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ""))}
                          onBlur={field.handleBlur}
                          aria-invalid={field.state.meta.errors.length > 0}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-destructive">
                            {field.state.meta.errors[0]?.message ?? String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="nomorHP">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="nomorHP">Nomor HP *</Label>
                        <Input
                          id="nomorHP"
                          placeholder="08xxxxxxxxxx"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ""))}
                          onBlur={field.handleBlur}
                          aria-invalid={field.state.meta.errors.length > 0}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-destructive">
                            {field.state.meta.errors[0]?.message ?? String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="email">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="email">Email (Opsional)</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@example.com"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          aria-invalid={field.state.meta.errors.length > 0}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-destructive">
                            {field.state.meta.errors[0]?.message ?? String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>
              </BlurFade>
            )}

            {/* Step 2: Data Perkara */}
            {currentStep === 1 && (
              <BlurFade>
                <div className="space-y-4">
                  <form.Field name="jenisPerkara">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="jenisPerkara">Jenis Perkara *</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger aria-invalid={field.state.meta.errors.length > 0}>
                            <SelectValue placeholder="Pilih jenis perkara" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="perceraian">Perceraian</SelectItem>
                            <SelectItem value="waris">Waris</SelectItem>
                            <SelectItem value="nikah">Nikah</SelectItem>
                            <SelectItem value="gugatan">Gugatan</SelectItem>
                            <SelectItem value="lainnya">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-destructive">
                            {field.state.meta.errors[0]?.message ?? String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="nomorRegister">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="nomorRegister">Nomor Register (Opsional)</Label>
                        <Input
                          id="nomorRegister"
                          placeholder="Nomor register jika sudah ada"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="tanggalSidang">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="tanggalSidang">Tanggal Sidang yang Diinginkan *</Label>
                        <Input
                          id="tanggalSidang"
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          aria-invalid={field.state.meta.errors.length > 0}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-destructive">
                            {field.state.meta.errors[0]?.message ?? String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>
              </BlurFade>
            )}

            {/* Step 3: Konfirmasi */}
            {currentStep === 2 && (
              <BlurFade>
                <div className="space-y-6">
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="mb-4 font-semibold">Ringkasan Data</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nama:</span>
                        <span className="font-medium">{form.getFieldValue("namaLengkap")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NIK:</span>
                        <span className="font-medium">{form.getFieldValue("nik")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jenis Perkara:</span>
                        <span className="font-medium">
                          {JENIS_PERKARA_LABELS[form.getFieldValue("jenisPerkara")] ?? form.getFieldValue("jenisPerkara")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tanggal Sidang:</span>
                        <span className="font-medium">{form.getFieldValue("tanggalSidang")}</span>
                      </div>
                    </div>
                  </div>

                  <form.Field name="agreeTerms">
                    {(field) => (
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="agreeTerms"
                            checked={field.state.value}
                            onCheckedChange={(checked) => field.handleChange(checked as boolean)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor="agreeTerms"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Saya menyetujui syarat dan ketentuan *
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Dengan mencentang kotak ini, saya menyatakan bahwa data yang
                              saya masukkan adalah benar dan saya bersedia mengikuti prosedur
                              yang berlaku.
                            </p>
                          </div>
                        </div>
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-destructive">
                            {field.state.meta.errors[0]?.message ?? String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>
              </BlurFade>
            )}

            {/* Tombol navigasi */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Sebelumnya
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Selanjutnya
                </Button>
              ) : (
                <ShimmerButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Daftar Antrian"
                  )}
                </ShimmerButton>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
