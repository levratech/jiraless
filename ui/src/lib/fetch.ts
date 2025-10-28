import { asset } from "./asset";
import { APP_VERSION } from "../version";

export async function fetchJson(path: string) {
  const url = asset(path) + "?v=" + encodeURIComponent(APP_VERSION);
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`fetch ${url} -> ${r.status}`);
  return r.json();
}

export async function fetchJsonRoot(absPath: string) {
  if (!absPath.startsWith("/")) absPath = "/" + absPath;
  const url = absPath + "?v=" + encodeURIComponent(APP_VERSION);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetch ${url} ${res.status}`);
  return res.json();
}