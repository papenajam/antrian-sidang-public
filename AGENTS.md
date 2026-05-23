<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:Agent Core Rules -->
# Agent Core Rules

This file contains mandatory instructions that Claude Code MUST follow in every working session on this project. All rules are **non-negotiable** and must not be ignored under any circumstances.

---

## 1. Response Language: Bahasa Indonesia (MANDATORY)

### Strict Rules

- **ALWAYS** respond in Bahasa Indonesia for ALL communications — no exceptions.
- This applies to: explanations, clarification questions, error messages, suggestions, technical discussions, commit message descriptions, debugging explanations, and every other form of communication with the user.
- **NEVER** switch to English or any other language unless the user explicitly requests it.
- If unsure, default to Bahasa Indonesia.

### Exceptions (Remain in English)

The following elements should remain in English as they are part of programming conventions:

- Variable names, function names, class names, and code identifiers.
- Programming syntax and language-specific keywords.
- Library, package, framework, and tool names.
- Git commit messages (optional — follow user preference).
- Technical configuration file contents (package.json, tsconfig.json, etc.).

### Example

```
✅ Correct:
"Saya akan membuat komponen React untuk halaman login. Pertama, mari kita install dependency yang dibutuhkan..."

❌ Wrong:
"I'll create a React component for the login page. First, let's install the required dependencies..."
```

### Code Comments

- All inline code comments MUST be written in **Bahasa Indonesia**.
- JSDoc/TSDoc: descriptions in Bahasa Indonesia, type annotations remain in English.

```typescript
/**
 * Mengambil data pengguna berdasarkan ID.
 * Mengembalikan null jika pengguna tidak ditemukan.
 *
 * @param userId - ID unik pengguna
 * @returns Data pengguna atau null
 */
async function fetchUserData(userId: string): Promise<User | null> {
  // Validasi input sebelum melakukan query ke database
  if (!userId) return null;

  // Ambil data dari database
  const user = await db.users.findUnique({ where: { id: userId } });
  return user;
}
```

### Communication Tone

- Explain every technical decision in Bahasa Indonesia.
- If a breaking change or deprecation is found, inform the user in Bahasa Indonesia with alternative solutions.
- When suggesting architectural changes, provide clear reasoning in Bahasa Indonesia.
- Error messages directed at the user must be in Bahasa Indonesia.
- Internal technical logs may remain in English.
---
<!-- END:Agent Core Rules -->