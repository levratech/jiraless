import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { marked } from 'marked'
import { ghDispatch } from '../util/gh'
import { fetchJson, fetchJsonRoot } from '../lib/fetch'

function cfg(){ return (window as any).__JIRALESS__ || { owner:'', repo:'', branch:'main' } }
function qsToObj(s:string){ const p=new URLSearchParams(s); return Object.fromEntries(p.entries()) as Record<string,string> }

function toRepoRel(p?: string){
  if(!p) return ''
  let s = decodeURIComponent(p).replace(/\\/g,'/')
  const ix = s.indexOf('.project/')
  if (ix >= 0) s = s.slice(ix)
  if (s.startsWith('./')) s = s.slice(2)
  if (s.startsWith('/')) s = s.replace(/^\/+/, '')
  return s
}

function parseFrontmatter(text:string){
  const m = text.match(/^---([\s\S]*?)---/)
  if(!m) return {}
  // ultra-simple YAML parse: just scan lines
  const o:any = {}
  m[1].split('\n').map(l=>l.trim()).filter(Boolean).forEach(l=>{
    const i=l.indexOf(':')
    if(i>0){ const k=l.slice(0,i).trim(); const v=l.slice(i+1).trim(); o[k]=v.replace(/^"|"$/g,'') }
  })
  return o
}

export function WorkDetail(){
  /* existing state */
  const { id } = useParams<{ id:string }>()
  const location = useLocation()
  const q = qsToObj(location.search)

  const [html, setHtml] = useState<string>('Loading…')
  const [blobUrl, setBlobUrl] = useState<string>('')
  const [currentStatus, setCurrentStatus] = useState<string>('')
  const [next, setNext] = useState<string>('')
  const [pat, setPat] = useState<string>(localStorage.getItem('JIRALESS_PAT') || '')
  const [msg, setMsg] = useState<string>('')

  useEffect(()=>{ localStorage.setItem('JIRALESS_PAT', pat) }, [pat])

  useEffect(()=> {
    if(!id) return
    const { owner, repo, branch } = cfg()

    async function resolveRel(): Promise<string> {
      if (q.file) return toRepoRel(q.file)
      try {
        const board = await fetchJson("views/board.json")
        for (const col of Object.values(board as any)) {
          const hit = col.find((x: any) => x.id === id && x.file)
          if (hit?.file) return toRepoRel(hit.file)
        }
      } catch {}
      return `.project/objects/${id}.md`
    }

    (async ()=>{
      const rel = await resolveRel()
      const raw = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${rel}`
      const blob = `https://github.com/${owner}/${repo}/blob/${branch}/${rel}`
      setBlobUrl(blob)

      const res = await fetch(raw, { cache:'no-store' })
      if(!res.ok){ setHtml(`<p>Not found: ${rel}</p>`); return }
      const text = await res.text()
      const fm = parseFrontmatter(text)
      if(fm.status) setCurrentStatus(String(fm.status))
      const content = text.replace(/^---[\s\S]*?---\s*/, '')
      setHtml(marked.parse(content) as string)

      // fetch state machine to compute allowed next states
      let nexts: string[] = [];
      try {
        const sm = await fetchJsonRoot("/state-machine.json");
        // derive next options from sm if schema matches; else fallback
        nexts = Array.isArray(sm?.states) ? sm.states : [];
      } catch (e) {
        console.warn("state-machine.json missing; using fallback", e);
        nexts = ["review","done","in_progress","discarded"];
      }

      // Use first available next state
      if (nexts.length) setNext(nexts[0])
    })()
  }, [id, location.search])

  async function proposeTransition(){
    if(!id || !next){ setMsg('Select a next state.'); return }
    if(!pat){ setMsg('Provide a GitHub PAT.'); return }
    const ok = await ghDispatch('jiraless.transition', { id, nextStatus: next }, pat)
    setMsg(ok.ok ? 'Draft PR opened.' : `Error ${ok.status}: ${ok.text}`)
  }

  const [fm, setFm] = useState<any>({})

  const copyLink = () => {
    const url = `${window.location.origin}/work/${encodeURIComponent(id || '')}${location.search}`
    navigator.clipboard.writeText(url)
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{id}</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>Status:</span>
            <span style={{ padding: '4px 12px', background: '#e5e7eb', borderRadius: 16, fontSize: 14, fontWeight: 500 }}>{currentStatus || 'unknown'}</span>
            {fm.priority && <PriorityBadge priority={fm.priority} />}
            {fm.assignees && fm.assignees.length > 0 && (
              <span style={{ fontSize: 14, color: '#6b7280' }}>
                👥 {Array.isArray(fm.assignees) ? fm.assignees.join(', ') : fm.assignees}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={copyLink} style={{ padding: '8px 12px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>
            🔗 Copy Link
          </button>
          <a href={blobUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 12px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, textDecoration: 'none', color: '#374151' }}>
            Open in GitHub ↗
          </a>
        </div>
      </div>

      {/* Transition Controls */}
      <div style={{ marginBottom: 20, padding: 16, background: '#fefefe', borderRadius: 8, border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontWeight: 500 }}>Transition to:</span>
          <select value={next} onChange={e=>setNext(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 4 }}>
            <option value="">— choose next —</option>
            <option value="backlog">backlog</option>
            <option value="in_progress">in_progress</option>
            <option value="review">review</option>
            <option value="done">done</option>
            <option value="discarded">discarded</option>
          </select>
          <button onClick={proposeTransition} style={{ padding: '6px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Propose Transition
          </button>
          {msg && <span style={{ color: msg.includes('Error') ? '#dc2626' : '#059669' }}>{msg}</span>}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 20, background: 'white', borderRadius: 8, border: '1px solid #e5e7eb' }}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {/* PAT Input */}
      <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          GitHub PAT (for transitions)
          <input
            type="password"
            value={pat}
            onChange={e=>setPat(e.target.value)}
            style={{ display: 'block', width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4, marginTop: 4 }}
          />
        </label>
      </div>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors = {
    p1: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
    p2: { bg: '#fef3c7', border: '#fde68a', text: '#d97706' },
    p3: { bg: '#ecfdf5', border: '#a7f3d0', text: '#059669' },
    p4: { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' }
  }
  const color = colors[priority as keyof typeof colors] || colors.p4
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: 12,
      background: color.bg,
      border: `1px solid ${color.border}`,
      color: color.text,
      fontSize: 12,
      fontWeight: 500
    }}>
      {priority.toUpperCase()}
    </span>
  )
}