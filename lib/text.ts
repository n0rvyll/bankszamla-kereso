// Simple text helpers

/**
 * Derive/clean a bank name from a branch-like string.
 * - Cuts at the first dot or dash (including en dash)
 * - Falls back to comma split, then original trimmed string
 */
export function deriveBankName(branch?: string | null): string | null {
  if (!branch) return null;
  const s = String(branch).trim();
  // Cut at first dot or dash (., -, –)
  const cut = s.split(/[.–-]/)[0]?.trim();
  if (cut && cut.length >= 3) return cut;
  // If no dot/dash helped, try until comma
  const comma = s.split(",")[0]?.trim();
  return comma && comma.length >= 3 ? comma : s;
}

// lib/text.ts
export const normalize = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // ékezetek le
    .replace(/\s+/g, " ")
    .trim();
