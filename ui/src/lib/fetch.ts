import { asset } from "./asset";
export async function fetchJson(path: string) {
  const url = asset(path);
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`fetch ${url} -> ${r.status}`);
  return r.json();
}