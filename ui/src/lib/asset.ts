// ui/src/lib/asset.ts
export const BASE = (import.meta.env.BASE_URL || "/");

export function asset(path: string) {
  // Always resolve from the site base, not the current route
  // Ensures /jiraless/... works even on nested pages
  if (path.startsWith("/")) path = path.slice(1);
  return new URL(path, BASE).toString();
}