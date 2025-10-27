import React from 'react'
import { Board } from './components/Board'

export function App() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif', padding: '16px' }}>
      <h1 style={{ marginBottom: 8 }}>Jiraless</h1>
      <p style={{ color: '#666', marginTop: 0 }}>Repo-native board (v0.3)</p>
      <Board />
    </div>
  )
}