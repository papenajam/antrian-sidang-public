# Important Project Information

## Project Type
Web application untuk sistem antrian sidang publik

## Entry Points
- **Development**: `pnpm dev` - Starts Next.js dev server on port 3000
- **Production**: `pnpm build` then `pnpm start`
- **Main Page**: `app/page.tsx` - Home page dengan RegistrationForm, QueueStatus, ScheduleTable

## Key Features
1. **Registration Form** (`components/features/registration-form.tsx`)
   - Multi-step form wizard (3 steps: Data Diri, Data Perkara, Konfirmasi)
   - Menggunakan @tanstack/react-form untuk form management
   - Validasi dengan Zod v4 schema
   - Animasi dengan framer-motion
   - Toast notifications dengan sonner

2. **Queue Status** (`components/features/queue-status.tsx`)
   - Menampilkan status antrian saat ini

3. **Schedule Table** (`components/features/schedule-table.tsx`)
   - Menampilkan jadwal sidang yang tersedia

4. **Hero Section** (`components/features/hero-section.tsx`)
   - Landing page hero component

## Known Issues & Challenges

### Zod v4 Compatibility
- Project menggunakan Zod v4 (^4.3.6) yang memiliki breaking changes dari v3
- API changes:
  - `z.string().email()` → `z.email()` (standalone schema)
  - `z.string().min()` dan `.max()` masih ada tapi behavior mungkin berbeda
  - `.refine()` behavior berubah
  - Error structure berbeda (tidak ada `.message` property)

### TanStack Form v1
- @tanstack/react-form v1.29.0 memiliki API yang berbeda dari versi sebelumnya
- Method `form.getField()` tidak ada di v1
- Validasi programmatis perlu approach berbeda
- Field validation melalui field component

### Form Wizard Issues (Current)
- Validasi per step tidak berfungsi dengan benar
- Error message display perlu adjustment untuk Zod v4
- Custom validator perlu ditambahkan untuk boolean validation

## Configuration Files
- `next.config.ts` - Next.js configuration (minimal config)
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration (strict mode)
- `components.json` - shadcn/ui configuration
- `eslint.config.mjs` - ESLint configuration

## UI Component Library
- shadcn/ui dengan style "radix-vega"
- Components: Button, Input, Card, Select, Checkbox, Label, Badge, Skeleton, Separator
- Animasi: framer-motion dengan custom components di `/components/magic/`
- Toast: sonner

## Development Notes
- Menggunakan React 19 dengan Server Components by default
- Client components perlu "use client" directive
- Path aliases: `@/*` maps to project root
- CSS variables untuk theming (light/dark mode via next-themes)