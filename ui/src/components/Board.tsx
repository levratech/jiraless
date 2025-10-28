import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchJson, assertBasePath } from '../lib/fetch'
import { getTypeMeta } from '../lib/ontology'

type CardT = { id:string; title:string; type:string[]; priority?:string; assignees?:string[]; file?:string }
type BoardData = Record<string, CardT[]>

function norm(p?: string){
  if(!p) return undefined
  let s = decodeURIComponent(p).replace(/\\/g, '/')
  // strip any absolute CI prefix to be safe
  const ix = s.indexOf('.project/')
  if (ix >= 0) s = s.slice(ix)
  if (s.startsWith('./')) s = s.slice(2)
  if (s.startsWith('/')) s = s.replace(/^\/+/, '')
  return s
}

export function Board() {
  const [board, setBoard] = useState<BoardData | null>(null)
  const [statuses, setStatuses] = useState<string[]>([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      assertBasePath("views/board.json");
      const data = await fetchJson("views/board.json")
      if (!alive) return
      // sanitize any legacy absolute paths
      for (const col of Object.keys(data)) {
        data[col] = data[col].map(c => ({ ...c, file: norm(c.file) }))
      }
      setBoard(data)
      setStatuses(Object.keys(data).sort())
    })()
    return () => { alive = false }
  }, [])

  if (!board) return <div>Loading board…</div>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(statuses.length,1)}, minmax(280px, 1fr))`, gap: 16 }}>
      {statuses.map((status) => (
        <div key={status} style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{status}</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {board[status]?.map(card => <Card key={card.id} {...card} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function Card({ id, title, type, priority, assignees, file }: CardT) {
  const rel = norm(file)
  const qs = rel ? `?file=${encodeURIComponent(rel)}` : ''
  return (
    <Link to={`/work/${encodeURIComponent(id)}${qs}`} style={{ textDecoration:'none', color:'inherit' }}>
      <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:10, padding:10, boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize:12, color:'#6b7280', marginBottom:4 }}>{id}</div>
        <div style={{ fontWeight:600, marginBottom:6 }}>{title}</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {type.map(t => {
            const meta = getTypeMeta(t)
            return (
              <span key={t}
                style={{ fontSize:11, padding:'2px 6px', borderRadius:999,
                  background:`${meta?.color || '#e5e7eb'}22`,
                  border:`1px solid ${meta?.color || '#e5e7eb'}`,
                  color: meta?.color || '#374151' }}>
                {meta?.icon ? `${meta.icon} ` : ''}{t}
              </span>
            )
          })}
          {priority && <span style={{ fontSize:11, padding:'2px 6px', borderRadius:999, background:'#eef2ff', border:'1px solid #c7d2fe', color:'#4338ca' }}>{priority}</span>}
          {assignees?.length ? <span style={{ fontSize:11, padding:'2px 6px', borderRadius:999, background:'#f1f5f9', border:'1px solid #e2e8f0', color:'#0f172a' }}>{assignees.join(', ')}</span> : null}
        </div>
      </div>
    </Link>
  )
}