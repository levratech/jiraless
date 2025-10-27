import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { marked } from 'marked'

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

export function WorkDetail(){
  const { id } = useParams<{ id:string }>()
  const location = useLocation()
  const q = qsToObj(location.search)
  const [html, setHtml] = useState<string>('Loading…')
  const [blobUrl, setBlobUrl] = useState<string>('')

  useEffect(()=> {
    if(!id) return
    const { owner, repo, branch } = cfg()

    async function resolveRel(): Promise<string> {
      // 1) explicit ?file
      if (q.file) return toRepoRel(q.file)
      // 2) lookup from board.json
      try {
        const res = await fetch('./views/board.json', { cache:'no-store' })
        if (res.ok) {
          const board = await res.json() as Record<string, {id:string, file?:string}[]>
          for (const col of Object.values(board)) {
            const hit = col.find(x => x.id === id && x.file)
            if (hit?.file) return toRepoRel(hit.file)
          }
        }
      } catch {}
      // 3) default guess
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
      const content = text.replace(/^---[\s\S]*?---\s*/, '')
      setHtml(marked.parse(content) as string)
    })()
  }, [id, location.search])

  return (
    <div>
      <div style={{ marginBottom:12 }}>
        <a href={blobUrl} target="_blank" rel="noreferrer">Open in GitHub ↗</a>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}