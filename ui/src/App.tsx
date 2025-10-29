import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Board } from './components/Board'
import { WorkDetail } from './pages/WorkDetail'
import { NewWork } from './pages/NewWork'
import { About } from './pages/About'
import Cortex from './pages/Cortex'
import { APP_VERSION, PRODUCT_VERSION } from "./version";

export function App() {
  const display = PRODUCT_VERSION ? `v${PRODUCT_VERSION}` : `v${APP_VERSION}`;
  
  return (
    <div style={{ fontFamily: 'system-ui, Segoe UI, Inter, sans-serif', padding: 16 }}>
      <header className="px-4 py-3">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="text-2xl font-bold">Jiraless</h1>
            <div className="text-xs text-gray-500">Repo-native board ({display})</div>
          </div>
          <Link to="/about" style={{
            textDecoration:'none', color:'#6b7280',
            padding:'4px 8px', borderRadius:4, fontSize: '14px'
          }}>About</Link>
        </div>
      </header>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div>
          {/* moved to header */}
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
        <Route path="/about" element={<About />} />
        <Route path="/cortex" element={<Cortex />} />
      </Routes>
    </div>
  )
}