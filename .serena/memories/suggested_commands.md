# Suggested Commands

## Development
- `pnpm dev` atau `npm run dev` - Menjalankan development server dengan Turbopack
- `pnpm build` atau `npm run build` - Build production
- `pnpm start` atau `npm run start` - Menjalankan production server
- `pnpm lint` atau `npm run lint` - Run ESLint untuk code quality

## Code Quality
- `npx eslint .` - Linting semua file
- `npx eslint --fix` - Auto-fix linting issues
- `npx tsc --noEmit` - Type checking tanpa build (opsional, Next.js sudah include)

## Package Management
- `pnpm install` - Install dependencies
- `pnpm add <package>` - Menambah dependency baru
- `pnpm add -D <package>` - Menambah dev dependency
- `pnpm remove <package>` - Menghapus dependency

## Git Commands
- `git status` - Cek status repository
- `git add .` - Stage semua perubahan
- `git commit -m "message"` - Commit perubahan
- `git push` - Push ke remote
- `git pull` - Pull dari remote
- `git branch` - List branches
- `git checkout -b <branch>` - Buat dan pindah ke branch baru

## File Operations
- `ls -la` - List semua files termasuk hidden
- `find . -name "*.tsx"` - Cari file dengan pattern
- `grep -r "pattern" .` - Cari text di semua files
- `cat <file>` - Lihat isi file

## System Utilities
- `clear` - Bersihkan terminal
- `pwd` - Cek current directory
- `cd <path>` - Pindah directory
- `mkdir -p <path>` - Buat directory baru

## Important Notes
- Gunakan `pnpm` sebagai package manager utama (lebih cepat dari npm/yarn)
- Next.js 16 menggunakan Turbopack secara default untuk development
- TypeScript strict mode enabled, pastikan type annotations benar
- Run `pnpm build` sebelum commit untuk memastikan tidak ada type errors