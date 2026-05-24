/**
 * Parse string para pihak (penggugat vs tergugat) dari SIPP.
 * Mendukung beberapa format separator: "vs", "vs.", "melawan", em-dash "—".
 *
 * @param input - String para pihak dari SIPP, bisa berisi HTML
 * @returns Objek dengan pihak pertama dan lawan (null jika tidak ada separator)
 */
export function parseParaPihak(input: string | null): {
  pihak: string;
  lawan: string | null;
} {
  if (!input) return { pihak: "-", lawan: null };

  // Bersihkan HTML tags dan normalisasi whitespace
  const clean = input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return { pihak: "-", lawan: null };

  // Coba split berdasarkan separator umum
  const patterns = [
    /^(.+?)\s+(?:vs\.?|melawan)\s+(.+)$/i,
    /^(.+?)\s+—\s+(.+)$/, // em-dash
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match) {
      return { pihak: match[1].trim(), lawan: match[2].trim() };
    }
  }

  return { pihak: clean, lawan: null };
}
