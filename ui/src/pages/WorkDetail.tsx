import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { marked } from 'marked'
import { ghDispatch } from '../util/gh'
import { asset } from '../lib/asset'

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
        const res = await fetch(asset('views/board.json') + '?_=' + Date.now())
        if (res.ok) {
          const board = await res.json() as Record<string, {id:string, file?:string}[]>
          for (const col of Object.values(board)) {
            const hit = col.find(x => x.id === id && x.file)
            if (hit?.file) return toRepoRel(hit.file)
          }
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
      const smRes = await fetch(asset('state-machine.json') + '?_=' + Date.now()).catch(()=>null)
      if (smRes && smRes.ok) {
        const sm = await smRes.json()
        const options = (sm.transitions?.[fm.status] || []) as string[]
        if (options.length) setNext(options[0])
      } else {
        // fallback: manual nextStates
        const fallbackOptions = ['review', 'done', 'in_progress', 'discarded']
        setNext(fallbackOptions[0])
      }
    })()
  }, [id, location.search])

  async function proposeTransition(){
    if(!id || !next){ setMsg('Select a next state.'); return }
    if(!pat){ setMsg('Provide a GitHub PAT.'); return }
    const ok = await ghDispatch('jiraless.transition', { id, nextStatus: next }, pat)
    setMsg(ok.ok ? 'Draft PR opened.' : `Error ${ok.status}: ${ok.text}`)
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <a href={blobUrl} target="_blank" rel="noreferrer">Open in GitHub ↗</a>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span>current: <b>{currentStatus || 'unknown'}</b></span>
          <select value={next} onChange={e=>setNext(e.target.value)}>
            <option value="">— choose next —</option>
            <option value="backlog">backlog</option>
            <option value="in_progress">in_progress</option>
            <option value="review">review</option>
            <option value="done">done</option>
            <option value="discarded">discarded</option>
          </select>
          <button onClick={proposeTransition}>Propose Transition</button>
        </div>
      </div>

      <div dangerouslySetInnerHTML={{ __html: html }} />

      <div style={{ marginTop:12 }}>
        <label>GitHub PAT <input type="password" value={pat} onChange={e=>setPat(e.target.value)} /></label>
        <div>{msg}</div>
      </div>
    </div>
  )
}