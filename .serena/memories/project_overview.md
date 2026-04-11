# Project Overview: Antrian Sidang Public

## Purpose
Aplikasi web publik untuk sistem antrian sidang. Aplikasi ini memungkinkan pengguna untuk:
- Mendaftarkan antrian sidang secara online melalui form registrasi
- Melihat status antrian saat ini
- Melihat jadwal sidang yang tersedia

## Tech Stack
- **Framework**: Next.js 16.2.3 (App Router)
- **React**: 19.2.4
- **TypeScript**: ^5 (strict mode enabled)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (radix-vega style)
- **Form Management**: @tanstack/react-form ^1.29.0
- **Validation**: Zod ^4.3.6
- **Animations**: framer-motion ^12.38.0
- **Icons**: lucide-react ^1.8.0
- **Toast Notifications**: sonner ^2.0.7
- **Package Manager**: pnpm ^10.33.0
- **Linting**: ESLint 9 dengan eslint-config-next

## Key Dependencies
- `@tanstack/react-form`: Form management dengan React Server Components support
- `zod`: Schema validation (v4 dengan breaking changes dari v3)
- `class-variance-authority`: Component variants
- `next-themes`: Theme switching (light/dark)
- `tailwind-merge`: Utility untuk merge Tailwind classes

## Project Structure
```
antrian-sidang-public/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/
│   ├── features/            # Feature-specific components
│   │   ├── registration-form.tsx
│   │   ├── form-progress.tsx
│   │   ├── hero-section.tsx
│   │   ├── queue-status.tsx
│   │   └── schedule-table.tsx
│   ├── layout/              # Layout components
│   ├── magic/               # Animation components (framer-motion)
│   └── ui/                  # shadcn/ui components
├── lib/
│   └── utils.ts             # Utility functions (cn helper)
├── public/                  # Static assets
└── docs/                    # Documentation
```

## Important Notes
- Menggunakan Next.js 16 dengan Turbopack untuk development
- Zod v4 memiliki breaking changes dari v3 (API validation berbeda)
- @tanstack/react-form v1 memiliki API yang berbeda dari versi sebelumnya
- shadcn/ui menggunakan style "radix-vega" dengan CSS variables
- Path alias: `@/*` mapped to project root