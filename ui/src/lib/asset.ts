export function asset(p: string) {
  if (!p.startsWith("/")) p = "/" + p;
  return p; // subdomain mode: absolute from root
}