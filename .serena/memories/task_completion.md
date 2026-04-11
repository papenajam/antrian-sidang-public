# Task Completion Checklist

## Before Committing Code

### 1. Build Verification
```bash
pnpm build
```
- Pastikan tidak ada TypeScript errors
- Pastikan tidak ada compilation errors
- Fix semua type errors sebelum commit

### 2. Linting
```bash
pnpm lint
# atau
npx eslint .
```
- Fix semua linting errors
- Run `npx eslint --fix` untuk auto-fix
- Pastikan tidak ada critical warnings

### 3. Manual Testing (Development)
```bash
pnpm dev
```
- Test di browser http://localhost:3000
- Verify semua fitur berfungsi
- Cek console untuk errors/warnings
- Test responsive design (mobile/desktop)

### 4. Code Quality Checks
- [ ] TypeScript strict mode passes
- [ ] No ESLint errors
- [ ] Build succeeds
- [ ] Components render correctly
- [ ] Form validation works (jika applicable)
- [ ] Error handling implemented
- [ ] Loading states implemented

### 5. Documentation
- Update README jika ada perubahan signifikan
- Update docs/ jika ada perubahan API
- Add comments untuk complex logic

## Common Tasks Workflow

### Adding New Feature
1. Create branch: `git checkout -b feature/name`
2. Implement dengan "use client" jika perlu interactivity
3. Test: `pnpm dev` dan check di browser
4. Build: `pnpm build` untuk verify
5. Lint: `pnpm lint`
6. Commit dan push

### Fixing Bug
1. Reproduce bug di development
2. Fix bug
3. Verify fix di browser
4. Build: `pnpm build`
5. Lint: `pnpm lint`
6. Commit dengan descriptive message

### Refactoring
1. Ensure tests pass before refactor
2. Make small, incremental changes
3. Build after each significant change: `pnpm build`
4. Lint: `pnpm lint`
5. Verify functionality di browser

## Important Reminders
- Next.js 16 menggunakan Turbopack (bukan Webpack)
- Zod v4 API berbeda dari v3 - check documentation
- @tanstack/react-form v1 API berbeda - check documentation
- Selalu gunakan `pnpm` bukan `npm` untuk consistency
- Commit message dalam Bahasa Indonesia atau English (consistency)
- Test di production build sebelum deploy: `pnpm build && pnpm start`