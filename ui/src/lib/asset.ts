// ui/src/lib/asset.ts
// Resolve any repo-published asset against the site base (vite base).
export const BASE = (import.meta.env.BASE_URL || "/");

export function asset(p: string): string {
  // Normalise: drop leading slash, never resolve relative to route
  if (!p) return BASE;
  if (p.startsWith("/")) p = p.slice(1);
  // Ensure BASE ends with slash (Vite provides e.g. "/jiraless/")
  return new URL(p, BASE).toString();
}