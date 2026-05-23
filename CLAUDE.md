@AGENTS.md

## Quick Start

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server di http://localhost:3000
pnpm build            # Production build
pnpm start            # Jalankan production build
pnpm test             # Jalankan test suite (Vitest)
pnpm test:watch       # Test dalam watch mode
pnpm test:coverage    # Test dengan coverage report
pnpm lint             # Jalankan ESLint
pnpm dlx shadcn@latest add [component]  # Tambah shadcn component
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.3 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | v4 |
| Components | shadcn/ui (radix-vega style) | latest |
| Testing | Vitest + @testing-library | latest |
| Package Manager | pnpm | 10.33.0 |
| Animations | Framer Motion | ^12 |
| Forms | @tanstack/react-form + Zod | latest |
| Icons | Lucide React | ^1.8 |
| Notifications | Sonner | ^2.0 |

## Architecture

```
app/                    # Next.js App Router
  layout.tsx            # Root layout (providers, fonts, metadata)
  page.tsx              # Homepage (HeroSection + QueueStatus + ScheduleTable)
  test/                 # Test/halaman development
components/
  features/             # Feature-specific components
    booking-wizard/     # Booking flow (multi-step wizard: Validate→Slot→Confirm→Ticket)
    __tests__/          # Component tests (co-located)
  layout/               # Layout components (header, footer)
  magic/                # Animated/decorative components (BlurFade, NumberTicker, ShimmerButton)
  providers/            # React context providers (HydrationSafeProvider)
  ui/                   # shadcn/ui base components
contexts/               # React contexts
  booking-modal-context.tsx  # Modal state (useBookingModal hook)
  app-settings-context.tsx   # App settings dari API
lib/                    # Utilities & services
  api.ts                # API client (api.get, api.post, api.put, api.delete)
  api-types.ts          # TypeScript types untuk API responses
  queue-service.ts      # Queue business logic
  utils.ts              # cn() utility untuk Tailwind class merging
  __tests__/            # Lib tests
__tests__/              # Test setup (setup.ts)
docs/                   # Dokumentasi proyek
  superpowers/plans/    # Implementation plans
```

## Environment Setup

Copy `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Required environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000/api` |

**Note**: Backend API harus berjalan terpisah untuk fitur lengkap. Backend menyediakan endpoint untuk:
- Validasi perkara (`/api/validate`)
- Slot ketersediaan (`/api/slots`)
- Booking antrian (`/api/queue/book`)
- Status antrian (`/api/queue/status`)

## Testing

- **Framework**: Vitest dengan jsdom environment
- **Pattern**: Co-located tests (`__tests__/` di setiap feature directory)
- **Setup**: `__tests__/setup.ts` (auto-loaded, mengimport `@testing-library/jest-dom`)
- **Path alias**: `@/` maps ke root directory
- **Run tests**: `pnpm test` atau `pnpm test:watch` untuk development
- **Run single test**: `pnpm test -- path/to/test.tsx`
- **Testing utilities**: `render`, `screen`, `fireEvent` dari `@testing-library/react`
- **Mocking**: `vi.fn()`, `vi.mock()` dari Vitest

```typescript
// Contoh test pattern
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('text')).toBeInTheDocument()
  })
})
```

## Key Patterns

- **Path alias**: `@/` → root directory (configured di tsconfig.json)
- **Component organization**: Feature-based (`components/features/`)
- **State management**: React Context dengan custom hooks (`useBookingModal()`)
- **Form handling**: @tanstack/react-form dengan Zod validation
- **Styling**: Tailwind CSS v4 + `cn()` utility dari `lib/utils.ts`
- **Fonts**: Outfit (headings) + Plus Jakarta Sans (body)
- **API client**: Generic `api` object dengan type-safe methods
- **Error handling**: Custom `ApiError` class dengan status dan data
- **Notifications**: `toast` dari sonner (`toast.success()`, `toast.error()`, `toast.info()`)
- **Animations**: Framer Motion + custom animations (BlurFade, NumberTicker)

## Gotchas

- **Next.js 16**: Versi terbaru dengan breaking changes — cek `node_modules/next/dist/docs/` sebelum menulis kode
- **React 19**: Menggunakan React 19 — beberapa API mungkin berbeda dari React 18
- **Tailwind v4**: Menggunakan Tailwind CSS v4 — syntax berbeda dari v3:
  - Gunakan `@theme inline` bukan `theme.extend` di config
  - Gunakan `@custom-variant dark (&:is(.dark *))` untuk dark mode
  - Import dengan `@import "tailwindcss"` bukan `@tailwind` directives
- **shadcn/ui**: Menggunakan style "radix-vega" — cek `components.json` sebelum install
- **External backend**: API client mengarah ke `localhost:8000` — pastikan backend berjalan untuk testing integrasi
- **Hydration**: Menggunakan `suppressHydrationWarning` untuk theme initialization
- **Client components**: Semua komponen interaktif harus menggunakan `"use client"` directive
- **Testing environment**: Menggunakan jsdom — tidak bisa test SSR langsung
