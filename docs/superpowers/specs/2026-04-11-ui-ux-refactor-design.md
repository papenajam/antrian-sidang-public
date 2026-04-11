# Desain UI/UX Refactor - Aplikasi Antrian Sidang Pengadilan Agama

## Tanggal: 2026-04-11

## 1. Ringkasan Eksekutif

Refactor UI/UX aplikasi antrian sidang pengadilan agama untuk menciptakan pengalaman yang **professional, modern, dan interaktif** bagi masyarakat umum. Menggunakan **shadcn/ui** dan **magicui** dengan tema warna pengadilan agama (hijau, gold, orange).

## 2. Analisis Kebutuhan

### 2.1 Target Pengguna
- **Masyarakat umum** yang ingin mengambil nomor antrian sidang
- **Staf pengadilan** (opsional, untuk dashboard admin di masa depan)

### 2.2 Kebutuhan Utama
1. **Form Pendaftaran Interaktif** dengan validasi real-time
2. **Status Antrian Live** dengan skeleton loading
3. **Jadwal Sidang Hari Ini** yang informatif
4. **Visual Feedback & Animasi** untuk pengalaman pengguna yang baik
5. **Informatif Guidance** dengan tooltip dan help text

### 2.3 Preferensi Visual
- Card-based Layout
- Corporate Professional
- Minimalis Modern

## 3. Arsitektur Sistem

### 3.1 Struktur Halaman
```
app/
├── layout.tsx          # Layout root dengan header/footer
├── page.tsx            # Halaman utama (hero + form + status)
├── globals.css         # Theme variables dan styling global
└── test/page.tsx       # Halaman testing API
```

### 3.2 Komponen Utama
```
components/
├── ui/                 # Shadcn UI components (sudah ada)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── skeleton.tsx
│   └── toast.tsx
├── layout/             # Layout components
│   ├── header.tsx
│   ├── footer.tsx
│   └── navigation.tsx
├── features/           # Feature components
│   ├── hero-section.tsx
│   ├── queue-status.tsx
│   ├── schedule-table.tsx
│   ├── registration-form.tsx
│   └── form-progress.tsx
└── magic/              # Magic UI components
    ├── animated-card.tsx
    ├── shimmer-button.tsx
    ├── pulse-dot.tsx
    └── number-ticker.tsx
```

## 4. Desain Visual

### 4.1 Sistem Warna (Tema Pengadilan Agama)
```css
:root {
  /* Primary - Hijau Pengadilan */
  --primary-50: #f0fdf4;
  --primary-100: #dcfce7;
  --primary-200: #bbf7d0;
  --primary-300: #86efac;
  --primary-400: #4ade80;
  --primary-500: #22c55e;
  --primary-600: #16a34a;
  --primary-700: #15803d;
  --primary-800: #166534;
  --primary-900: #14532d;

  /* Secondary - Gold */
  --secondary-50: #fffbeb;
  --secondary-100: #fef3c7;
  --secondary-200: #fde68a;
  --secondary-300: #fcd34d;
  --secondary-400: #fbbf24;
  --secondary-500: #f59e0b;
  --secondary-600: #d97706;
  --secondary-700: #b45309;
  --secondary-800: #92400e;
  --secondary-900: #78350f;

  /* Accent - Orange */
  --accent-50: #fff7ed;
  --accent-100: #ffedd5;
  --accent-200: #fed7aa;
  --accent-300: #fdba74;
  --accent-400: #fb923c;
  --accent-500: #f97316;
  --accent-600: #ea580c;
  --accent-700: #c2410c;
  --accent-800: #9a3412;
  --accent-900: #7c2d12;

  /* Neutral */
  --neutral-50: #fafafa;
  --neutral-100: #f5f5f5;
  --neutral-200: #e5e5e5;
  --neutral-300: #d4d4d4;
  --neutral-400: #a3a3a3;
  --neutral-500: #737373;
  --neutral-600: #525252;
  --neutral-700: #404040;
  --neutral-800: #262626;
  --neutral-900: #171717;
}
```

### 4.2 Komponen Visual

#### Header
- Logo Pengadilan Agama (kiri)
- Navigation minimalis (kanan)
- Background: Primary-600 (hijau gelap)
- Text: White

#### Hero Section
- Banner dengan gradient (Primary-600 ke Primary-800)
- Headline besar dengan font bold
- Subheadline deskriptif
- CTA Button: Shimmer button (magicui) dengan warna accent (orange)

#### Status Antrian Live
- Card dengan shadow dan border
- Skeleton loading state
- Number ticker animasi (magicui) untuk nomor antrian
- Pulse dot indikator status

#### Jadwal Sidang Hari Ini
- Tabel/card dengan alternating row colors
- Responsive design
- Badge untuk status sidang

#### Form Pendaftaran
- Multi-step form dengan progress indicator
- Real-time validation dengan visual feedback
- Animated transitions antar step
- Toast notifications untuk error/sukses

## 5. Komponen Shadcn UI yang Digunakan

### 5.1 Komponen Form
| Komponen | Gunakan Untuk |
|----------|--------------|
| `Button` | Tombol aksi (submit, reset, cancel) |
| `Input` | Input teks, nomor antrian, NIK |
| `Select` | Dropdown untuk pilih hari, jam, jenis perkara |
| `Checkbox` | Persetujuan syarat & ketentuan |
| `RadioGroup` | Pilih jenis layanan (sidang pertama, banding, dll) |
| `Textarea` | Kolom catatan/keterangan |
| `Switch` | Toggle notifikasi, konfirmasi kehadiran |
| `Field` + `FieldError` | Wrapper dengan label, deskripsi, dan error message |
| `FieldGroup` + `FieldSet` | Grouping bagian form |

### 5.2 Komponen Layout
| Komponen | Gunakan Untuk |
|----------|--------------|
| `Card` + `CardHeader/Content/Footer` | Card info antrian, detail jadwal |
| `Separator` | Pemisah antar section |
| `Sheet` | Sidebar detail antrian (mobile-friendly) |
| `Dialog` | Modal konfirmasi, popup info |
| `Accordion` | FAQ, detail informasi |

### 5.3 Komponen Feedback
| Komponen | Gunakan Untuk |
|----------|--------------|
| `Toast` (via Sonner) | Notifikasi sukses/error validasi |
| `Skeleton` | Loading state saat fetch data |
| `Alert` | Pesan peringatan/error |
| `Progress` | Progress antrian |
| `Spinner` | Indikator loading |

## 6. Komponen Magic UI yang Digunakan

### 6.1 Animasi Loading & Skeleton
| Komponen | Deskripsi |
|----------|-----------|
| `BlurFade` | Fade in/out dengan blur untuk loading content |
| `Animated Circular Progress Bar` | Progress bar melingkar animasi |
| `Pulsating Button` | Tombol dengan efek pulsating untuk CTA |

### 6.2 Animasi untuk List & Notification
| Komponen | Deskripsi |
|----------|-----------|
| `Animated List` | List item yang muncul berurutan dengan delay |
| `BlurFade` | Animasi blur-fade untuk entrance |

### 6.3 Animasi Button
| Komponen | Deskripsi |
|----------|-----------|
| `Shimmer Button` | Efek cahaya bergerak di sekeliling tombol |
| `Ripple Button` | Efek ripple saat diklik |
| `Rainbow Button` | Tombol dengan animasi rainbow gradient |
| `Pulsating Button` | Tombol dengan efek berdenyut |

### 6.4 Visual Effects
| Komponen | Deskripsi |
|----------|-----------|
| `Animated Gradient Text` | Text dengan gradient animasi |
| `Animated Shiny Text` | Efek shimmer pada text |
| `Aurora Text` | Efek aurora/northern lights pada text |
| `Border Beam` | Beam cahaya animasi di border container |
| `Animated Grid Pattern` | Background grid animasi |
| `Backlight` | Efek backlight untuk gambar/video |

### 6.5 Ringkasan Komponen Berdasarkan Use Case
| Use Case | Shadcn UI | Magic UI |
|----------|-----------|----------|
| Form pendaftaran | `Form`, `Input`, `Select`, `Checkbox`, `Button` | - |
| Card info antrian | `Card`, `Progress`, `Badge` | - |
| Loading states | `Skeleton`, `Progress` | `BlurFade`, `Animated Circular Progress Bar` |
| Notifikasi | `Toast` (Sonner), `Alert` | `Animated List` |
| Button animasi | - | `Shimmer Button`, `Ripple Button`, `Pulsating Button` |
| Text effects | - | `Animated Gradient Text`, `Shiny Text` |
| Visual effects | - | `Border Beam`, `Backlight`, `Aurora Text` |

## 7. Contoh Implementasi

### 7.1 Form Pendaftaran Antrian dengan Validasi Zod
```tsx
"use client"

import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Skema validasi Zod
const formSchema = z.object({
  nik: z.string().length(16, "NIK harus 16 digit"),
  namaLengkap: z.string().min(3, "Nama minimal 3 karakter"),
  jenisPerkara: z.string().min(1, "Pilih jenis perkara"),
  tanggalSidang: z.string().min(1, "Pilih tanggal sidang"),
  agreeTerms: z.boolean().refine(val => val === true, "Anda harus menyetujui syarat")
})

export function FormPendaftaranAntrian() {
  const form = useForm({
    defaultValues: {
      nik: "",
      namaLengkap: "",
      jenisPerkara: "",
      tanggalSidang: "",
      agreeTerms: false
    },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      toast.success("Pendaftaran berhasil!", {
        description: `Nomor antrian Anda: ${generateQueueNumber()}`
      })
    }
  })

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Daftar Antrian Sidang</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="form-antrian" onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
          <FieldGroup>
            {/* NIK Field */}
            <form.Field
              name="nik"
              children={(field) => (
                <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                  <FieldLabel htmlFor="nik">NIK</FieldLabel>
                  <FieldDescription>Masukkan 16 digit NIK</FieldDescription>
                  <Input 
                    id="nik" 
                    value={field.state.value} 
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="3301XXXXXXXXXX"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />
            
            {/* Select Jenis Perkara */}
            <form.Field
              name="jenisPerkara"
              children={(field) => (
                <Field>
                  <FieldLabel>Jenis Perkara</FieldLabel>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger aria-invalid={field.state.meta.isInvalid}>
                      <SelectValue placeholder="Pilih jenis perkara" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cerai">Perceraian</SelectItem>
                      <SelectItem value="waris">Waris</SelectItem>
                      <SelectItem value="nikah">Nikah</SelectItem>
                      <SelectItem value="gugat">Gugatan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="form-antrian">Daftar Antrian</Button>
      </CardFooter>
    </Card>
  )
}
```

### 7.2 Animated List untuk Notifikasi Antrian
```tsx
import { AnimatedList } from "@/components/ui/animated-list"

const notifikasi = [
  { id: 1, message: "Nomor antrian 001 dipanggil", icon: "🔔", time: "Baru saja" },
  { id: 2, message: "Antrian 002 sedang dalam proses", icon: "⚙️", time: "2 menit lalu" },
  { id: 3, message: "Jadwal sidang besok: 10.00", icon: "📅", time: "5 menit lalu" },
]

const NotifikasiItem = ({ message, icon, time }) => (
  <figure className="flex items-center gap-3 p-4 rounded-xl border">
    <span className="text-2xl">{icon}</span>
    <div>
      <figcaption className="font-medium">{message}</figcaption>
      <p className="text-sm text-muted-foreground">{time}</p>
    </div>
  </figure>
)

export function NotifikasiAntrian() {
  return (
    <div className="h-[400px] w-full overflow-hidden rounded-lg border p-6">
      <AnimatedList delay={1500}>
        {notifikasi.map((item) => (
          <NotifikasiItem key={item.id} {...item} />
        ))}
      </AnimatedList>
    </div>
  )
}
```

### 7.3 Shimmer Button untuk CTA
```tsx
import { ShimmerButton } from "@/components/ui/shimmer-button"

export function TombolDaftar() {
  return (
    <ShimmerButton className="shadow-2xl">
      <span className="text-dark">Daftar Antrian Sekarang</span>
    </ShimmerButton>
  )
}
```

### 7.4 BlurFade untuk Loading State
```tsx
import { BlurFade } from "@/components/ui/blur-fade"

export function StatusAntrianSkeleton() {
  return (
    <div className="space-y-4">
      <BlurFade>
        <div className="h-24 rounded-lg bg-muted animate-pulse" />
      </BlurFade>
      <BlurFade delay={0.1}>
        <div className="h-16 rounded-lg bg-muted animate-pulse" />
      </BlurFade>
      <BlurFade delay={0.2}>
        <div className="h-32 rounded-lg bg-muted animate-pulse" />
      </BlurFade>
    </div>
  )
}
```

## 8. Interaktivitas & Animasi

### 8.1 Form Interactions
- **Focus**: Border color change (Primary-500) + ring effect
- **Hover**: Shadow increase pada button dan card
- **Validation**: Real-time feedback dengan icon dan warna
- **Submit**: Loading spinner + disabled state

### 8.2 Data Loading
- **Skeleton**: Untuk status antrian dan jadwal sidang
- **Fade In**: Saat data muncul
- **Number Ticker**: Animasi increment untuk nomor antrian

### 8.3 Navigation
- **Smooth Scroll**: Untuk navigasi section
- **Breadcrumbs**: Dengan animasi hover
- **Page Transitions**: Fade in/out antar halaman
## 9. Responsive Design

### 9.1 Breakpoints
- **Mobile**: < 640px (single column)
- **Tablet**: 640px - 1024px (two columns)
- **Desktop**: > 1024px (full layout)

### 9.2 Mobile-First Approach
- Form tetap mudah diakses di mobile
- Card layout menyesuaikan ukuran layar
- Navigation collapsible di mobile

## 10. Aksesibilitas

### 10.1 WCAG Compliance
- Color contrast minimal 4.5:1
- Focus indicators yang jelas
- Screen reader friendly
- Keyboard navigation support

### 10.2 Inclusive Design
- Font size scalable
- Alt text untuk gambar
- Form labels yang jelas

## 11. Implementasi Fase

### Fase 1: Foundation (Minggu 1)
1. Setup theme dan warna
2. Layout utama (header, footer)
3. Shadcn UI components dasar

### Fase 2: Core Features (Minggu 2)
1. Hero section dengan CTA
2. Status antrian live dengan skeleton
3. Jadwal sidang hari ini

### Fase 3: Form Enhancement (Minggu 3)
1. Multi-step form
2. Real-time validation
3. Animasi dan transisi

### Fase 4: Magic UI Integration (Minggu 4)
1. Animasi dan effects
2. Loading states
3. Polish dan refinements

## 12. Teknologi yang Digunakan

### 12.1 Frontend Stack
- **Next.js 16.2.3** (App Router)
- **React 19.2.4**
- **TypeScript**
- **Tailwind CSS 4**

### 12.2 UI Libraries
- **shadcn/ui**: Komponen dasar
- **magicui**: Animasi dan effects
- **Radix UI**: Primitives
- **Lucide React**: Icons

### 12.3 Utilities
- **class-variance-authority**: Variants
- **clsx**: Class merging
- **tailwind-merge**: Tailwind class conflict resolution
- **framer-motion**: Animations (opsional)

## 13. Success Metrics

### 13.1 UX Metrics
- **Form Completion Rate**: > 90%
- **Time to Complete**: < 2 menit
- **Error Rate**: < 5%
- **User Satisfaction**: > 4/5

### 13.2 Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 14. Catatan dan Rekomendasi

### 14.1 Best Practices
1. Gunakan CSS variables untuk theming
2. Implementasi skeleton loading untuk semua data fetching
3. Validasi form di client-side dan server-side
4. Gunakan optimistic updates untuk better UX
5. Implementasi error boundaries

### 14.2 Potensi Enhancement di Masa Depan
1. **Real-time Updates**: WebSocket untuk update antrian
2. **Push Notifications**: Notifikasi browser
3. **Dark Mode**: Toggle antara light/dark theme
4. **Multi-language**: Dukungan bahasa Indonesia dan Inggris
5. **Analytics**: Tracking penggunaan dan error

### 14.3 Risiko dan Mitigasi
1. **Kompatibilitas Browser**: Test di semua browser utama
2. **Performance**: Lazy loading untuk komponen berat
3. **Aksesibilitas**: Regular audit dengan tools
4. **Maintenance**: Dokumentasi komponen yang baik

---

## Persetujuan

- [ ] Struktur halaman dan komponen utama disetujui
- [ ] Sistem warna (hijau, gold, orange) disetujui
- [ ] Komponen shadcn UI dan magicui disetujui
- [ ] Contoh implementasi disetujui
- [ ] Timeline implementasi disetujui

**Status**: Menunggu persetujuan user untuk melanjutkan ke implementation plan.

---

**Dokumen ini akan diperbarui seiring proses brainstorming berlanjut.**