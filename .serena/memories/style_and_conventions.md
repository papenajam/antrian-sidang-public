# Style and Conventions

## TypeScript
- **Strict mode**: Enabled (`"strict": true` di tsconfig.json)
- **Target**: ES2017
- **No implicit any**: Harus define type dengan jelas
- **Type hints**: Gunakan untuk function parameters dan return types
- **No docstrings required**: Code should be self-documenting

## Naming Conventions
- **Components**: PascalCase (e.g., `RegistrationForm`, `QueueStatus`)
- **Functions/Variables**: camelCase (e.g., `handleClick`, `userName`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `JENIS_PERKARA_LABELS`)
- **Files**: kebab-case (e.g., `registration-form.tsx`, `queue-status.tsx`)
- **Types/Interfaces**: PascalCase (e.g., `FormData`, `UserType`)

## Component Structure
```tsx
"use client" // Jika perlu client-side interactivity

import { useState } from "react"
// ... imports

export function ComponentName() {
  // Hooks
  // State
  // Handlers
  // Render
  return (...)
}
```

## Styling
- **Tailwind CSS v4**: Primary styling system
- **shadcn/ui components**: Reusable UI primitives
- **cn() utility**: Merge Tailwind classes (from `@/lib/utils`)
- **CSS Variables**: Untuk theming (light/dark mode)
- **Class Variance Authority**: Component variants

## Code Organization
- **Features**: `/components/features/` - Feature-specific components
- **UI Components**: `/components/ui/` - shadcn/ui primitives
- **Layout**: `/components/layout/` - Layout components
- **Magic**: `/components/magic/` - Animation components (framer-motion)
- **Lib**: `/lib/` - Utility functions

## Form Handling (TanStack Form + Zod)
- Gunakan `useForm` dari `@tanstack/react-form`
- Validation dengan Zod v4 schema
- Error messages dalam Bahasa Indonesia
- Custom validators untuk complex validation

## Important Conventions
- Path alias: `@/*` untuk import dari root
- React Server Components by default (kecuali ada "use client")
- Error boundaries dan loading states untuk UX yang baik
- Toast notifications menggunakan `sonner`
- Animasi menggunakan `framer-motion`