export async function fetchJson<T = any>(path: string): Promise<T> {
  const url = new URL(path, window.location.href)
  // simple cache-bust on reloads
  if (!/\?/.test(url.toString())) url.searchParams.set('v', String(Date.now()))
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
  return res.json() as Promise<T>
}