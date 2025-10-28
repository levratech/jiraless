import { asset } from "./asset";
export async function fetchJson(path: string) {
  const url = asset(path);
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`fetch ${url} -> ${r.status}`);
  return r.json();
}

export async function fetchJsonRoot(absPath: string) {
  if (!absPath.startsWith("/")) absPath = "/" + absPath;
  const url = absPath; // root of subdomain
  const res = await fetch(url + "?v=" + Date.now());
  if (!res.ok) throw new Error(`fetch ${url} ${res.status}`);
  return res.json();
}