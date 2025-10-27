type Ontology = { types?: Record<string, { icon?: string; color?: string }>}
let cache: Ontology | null = null

export function getTypeMeta(t: string){
  return (cache?.types && cache.types[t]) || null
}

export async function loadOntology(){
  if (cache) return cache
  try {
    const res = await fetch('./ontology.json', { cache: 'no-store' })
    if (res.ok) cache = await res.json()
  } catch { /* noop */ }
  return cache
}

// eager load on app start (non-blocking)
loadOntology().catch(()=>{})