import { asset } from './asset'

export async function fetchJson<T = any>(path: string): Promise<T> {
  const url = asset(path) + (/\?/.test(path) ? '&' : '?') + '_=' + Date.now()
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
  return res.json() as Promise<T>
}