import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { marked } from 'marked'

function cfg(){ return (window as any).__JIRALESS__ || { owner:'', repo:'', branch:'main' } }

export function WorkDetail(){
  const { id } = useParams<{ id:string }>()
  const [html, setHtml] = useState<string>('Loading…')
  const [fileUrl, setFileUrl] = useState<string>('')

  useEffect(()=> {
    if(!id) return
    const { owner, repo, branch } = cfg()
    // default path if not known in board.json
    const rel = `.project/objects/${id}.md`
    const raw = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${rel}`
    setFileUrl(`https://github.com/${owner}/${repo}/blob/${branch}/${rel}`)
    ;(async ()=>{
      const res = await fetch(raw, { cache:'no-store' })
      if(!res.ok){ setHtml(`<p>Not found: ${rel}</p>`); return }
      const text = await res.text()
      // strip front-matter
      const content = text.replace(/^---[\s\S]*?---\s*/, '')
      setHtml(marked.parse(content) as string)
    })()
  }, [id])

  return (
    <div>
      <div style={{ marginBottom:12 }}>
        <a href={fileUrl} target="_blank" rel="noreferrer">Open in GitHub ↗</a>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}