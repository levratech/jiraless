import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Board } from './components/Board'
import { WorkDetail } from './pages/WorkDetail'
import { NewWork } from './pages/NewWork'
import Cortex from './pages/Cortex'

export function App() {
  return (
    <div style={{ fontFamily: 'system-ui, Segoe UI, Inter, sans-serif', padding: 16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div>
          <h1 style={{ margin:0 }}>Jiraless</h1>
          <div style={{ color:'#666' }}>Repo-native board (v0.6)</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Link to="/cortex" style={{
            textDecoration:'none', background:'#f3f4f6', color:'#111827',
            padding:'8px 12px', borderRadius:8, fontWeight:600
          }}>Cortex Board</Link>
          <Link to="/new" style={{
            textDecoration:'none', background:'#111827', color:'white',
            padding:'8px 12px', borderRadius:8, fontWeight:600
          }}>＋ New Work</Link>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Board />} />
        <Route path="/work/:id" element={<WorkDetail />} />
        <Route path="/new" element={<NewWork />} />
        <Route path="/cortex" element={<Cortex />} />
      </Routes>
    </div>
  )
}