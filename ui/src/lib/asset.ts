export const BASE = (import.meta.env.BASE_URL || "/");

export function fromBase(path: string): string {
  const p = path.startsWith("/") ? path.slice(1) : path;
  return new URL(p, location.origin + BASE).toString();
}