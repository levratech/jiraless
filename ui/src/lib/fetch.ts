import { fromBase, BASE } from "./asset";

export async function fetchJson(pathFromBase: string) {
  const url = fromBase(pathFromBase) + (pathFromBase.includes("?") ? "" : `?_=${Date.now()}`);
  if (url.includes("/work/")) {
    console.error("[jiraless] BAD URL (contains /work/):", url, "BASE=", BASE, "path=", pathFromBase);
  } else {
    console.info("[jiraless] fetch:", url);
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch ${res.status}: ${url}`);
  return res.json();
}