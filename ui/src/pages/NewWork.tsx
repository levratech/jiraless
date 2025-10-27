import React, { useState } from 'react'
import { ghDispatch } from '../util/gh'

export function NewWork(){
  const [title, setTitle] = useState('')
  const [type, setType] = useState('feature')
  const [status, setStatus] = useState('backlog')
  const [priority, setPriority] = useState('p3')
  const [assignees, setAssignees] = useState('')
  const [body, setBody] = useState('## Context\\n\\n## Plan\\n- [ ]\\n\\n## Acceptance\\n- [ ]')
  const [pat, setPat] = useState(localStorage.getItem('JIRALESS_PAT') || '')
  const [out, setOut] = useState('')

  async function submit(e:React.FormEvent){
    e.preventDefault()
    if(!pat){ setOut('Provide a GitHub PAT with repo access.'); return }
    localStorage.setItem('JIRALESS_PAT', pat)
    const payload = {
      title, status, priority, body,
      type, assignees: assignees ? assignees.split(',').map(s=>s.trim()).filter(Boolean) : []
    }
    const r = await ghDispatch('jiraless.propose_work', payload, pat)
    setOut(r.ok ? 'Proposed: draft PR opened (check Actions/PRs).' : `Error: ${r.status} ${r.text}`)
  }

  return (
    <form onSubmit={submit} style={{ display:'grid', gap:10, maxWidth:640 }}>
      <h2>New Work</h2>
      <label>Title <input value={title} onChange={e=>setTitle(e.target.value)} required style={{ width:'100%' }}/></label>
      <label>Type <input value={type} onChange={e=>setType(e.target.value)} placeholder="feature|bug|experiment|..." /></label>
      <label>Status <input value={status} onChange={e=>setStatus(e.target.value)} placeholder="backlog|in_progress|..." /></label>
      <label>Priority <input value={priority} onChange={e=>setPriority(e.target.value)} placeholder="p1|p2|p3" /></label>
      <label>Assignees (comma-separated) <input value={assignees} onChange={e=>setAssignees(e.target.value)} /></label>
      <label>Body <textarea value={body} onChange={e=>setBody(e.target.value)} rows={8} /></label>
      <label>GitHub PAT (repo scope) <input value={pat} onChange={e=>setPat(e.target.value)} type="password" /></label>
      <button type="submit" style={{ width:180, padding:'8px 12px' }}>Create Draft PR</button>
      <div style={{ color:'#444' }}>{out}</div>
    </form>
  )
}