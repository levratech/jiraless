import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Board } from './components/Board'
import { WorkDetail } from './pages/WorkDetail'
import { NewWork } from './pages/NewWork'

export function App() {
  return (
    <div style={{ fontFamily: 'system-ui, Segoe UI, Inter, sans-serif', padding: 16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div>
          <h1 style={{ margin:0 }}>Jiraless</h1>
          <div style={{ color:'#666' }}>Repo-native board not v0.4)</div>
        </div>
        <Link to="/new" style={{
          textDecoration:'none', background:'#111827', color:'white',
          padding:'8px 12px', borderRadius:8, fontWeight:600
        }}>＋ New Work</Link>
      </div>

      <Routes>
        <Route path="/" element={<Board />} />
        <Route path="/work/:id" element={<WorkDetail />} />
        <Route path="/new" element={<NewWork />} />
      </Routes>
    </div>
  )
}