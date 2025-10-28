// ui/src/lib/fetch.ts
import { asset } from "./asset";

export async function fetchJson(pathFromBase: string) {
  const url = asset(pathFromBase) + (pathFromBase.includes("?") ? "" : `?_=${Date.now()}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return res.json();
}

// DEV-only assertion to catch wrong paths early
export function assertBasePath(p: string) {
  if (p.startsWith("work/") || p.startsWith("views/") && location.pathname.includes("/work/")) {
    console.warn("[jiraless] suspect route-relative path:", p, " at ", location.pathname);
  }
}