import React, { useState } from 'react'
import { ghDispatch } from '../util/gh'

export function NewWork(){
  const [title, setTitle] = useState('')
  const [type, setType] = useState('feature')
  const [status, setStatus] = useState('backlog')
  const [priority, setPriority] = useState('p3')
  const [assignees, setAssignees] = useState('')
  const [labels, setLabels] = useState('')
  const [severity, setSeverity] = useState('')
  const [body, setBody] = useState('## Context\n\n## Plan\n- [ ]\n\n## Acceptance\n- [ ]')
  const [pat, setPat] = useState(localStorage.getItem('JIRALESS_PAT') || '')
  const [out, setOut] = useState('')
  const [prUrl, setPrUrl] = useState('')

  async function submit(e:React.FormEvent){
    e.preventDefault()
    if(!pat){ setOut('Provide a GitHub PAT with repo access.'); return }
    localStorage.setItem('JIRALESS_PAT', pat)
    const payload = {
      title, status, priority, body, intent: 'create_work',
      type: type ? type.split(',').map(s=>s.trim()).filter(Boolean) : [],
      assignees: assignees ? assignees.split(',').map(s=>s.trim()).filter(Boolean) : [],
      labels: labels ? labels.split(',').map(s=>s.trim()).filter(Boolean) : [],
      severity: severity || undefined
    }
    const r = await ghDispatch('jiraless.propose_work', payload, pat)
    if(r.ok){
      setOut('Proposed: draft PR opened.')
      // Try to find the PR URL from the response or construct it
      // For now, just link to PRs tab
      setPrUrl(`https://github.com/${(window as any).__JIRALESS__?.owner || 'levratech'}/${(window as any).__JIRALESS__?.repo || 'jiraless'}/pulls`)
    } else {
      setOut(`Error: ${r.status} ${r.text}`)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>New Work</h2>
      <form onSubmit={submit} style={{ display:'grid', gap:15 }}>
        <label>
          Title
          <input value={title} onChange={e=>setTitle(e.target.value)} required style={{ width:'100%', padding:8, border:'1px solid #ccc', borderRadius:4 }}/>
        </label>
        <label>
          Type (comma-separated)
          <input value={type} onChange={e=>setType(e.target.value)} placeholder="feature,bug,experiment" style={{ width:'100%', padding:8, border:'1px solid #ccc', borderRadius:4 }}/>
        </label>
        <label>
          Priority
          <select value={priority} onChange={e=>setPriority(e.target.value)} style={{ width:'100%', padding:8, border:'1px solid #ccc', borderRadius:4 }}>
            <option value="p1">P1 - Critical</option>
            <option value="p2">P2 - High</option>
            <option value="p3">P3 - Medium</option>
            <option value="p4">P4 - Low</option>
          </select>
        </label>
        <label>
          Assignees (comma-separated)
          <input value={assignees} onChange={e=>setAssignees(e.target.value)} placeholder="username1,username2" style={{ width:'100%', padding:8, border:'1px solid #ccc', borderRadius:4 }}/>
        </label>
        <label>
          Labels (optional, comma-separated)
          <input value={labels} onChange={e=>setLabels(e.target.value)} placeholder="enhancement,needs-review" style={{ width:'100%', padding:8, border:'1px solid #ccc', borderRadius:4 }}/>
        </label>
        <label>
          Severity (optional)
          <select value={severity} onChange={e=>setSeverity(e.target.value)} style={{ width:'100%', padding:8, border:'1px solid #ccc', borderRadius:4 }}>
            <option value="">None</option>
            <option value="blocker">Blocker</option>
            <option value="critical">Critical</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
        </label>
        <label>
          Description (Markdown)
          <textarea value={body} onChange={e=>setBody(e.target.value)} rows={8} style={{ width:'100%', padding:8, border:'1px solid #ccc', borderRadius:4, fontFamily:'monospace' }}/>
        </label>
        <label>
          GitHub PAT (repo scope)
          <input value={pat} onChange={e=>setPat(e.target.value)} type="password" required style={{ width:'100%', padding:8, border:'1px solid #ccc', borderRadius:4 }}/>
        </label>
        <button type="submit" style={{ padding:'10px 20px', background:'#007acc', color:'white', border:'none', borderRadius:4, cursor:'pointer' }}>Create Draft PR</button>
        {out && <div style={{ color: prUrl ? '#28a745' : '#dc3545', marginTop:10 }}>{out}</div>}
        {prUrl && <div style={{ marginTop:10 }}><a href={prUrl} target="_blank" rel="noopener noreferrer">View Pull Requests →</a></div>}
      </form>
    </div>
  )
}