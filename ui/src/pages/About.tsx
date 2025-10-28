import React from 'react'
import { APP_VERSION, BUILD_TIME_UTC, GIT_SHA } from '../version'

export function About() {
  const repo = 'levratech/jiraless' // Could be made dynamic if needed
  const commitUrl = `https://github.com/${repo}/commit/${GIT_SHA}`

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 20 }}>
      <h1>About Jiraless</h1>

      <div style={{ marginTop: 20, marginBottom: 30 }}>
        <h2>Build Information</h2>
        <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '8px 16px', alignItems: 'baseline' }}>
          <dt>Version:</dt>
          <dd>{APP_VERSION}</dd>

          <dt>Build Time:</dt>
          <dd>{new Date(BUILD_TIME_UTC).toLocaleString()}</dd>

          <dt>Git SHA:</dt>
          <dd>
            <a href={commitUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0366d6' }}>
              {GIT_SHA.slice(0, 8)}
            </a>
          </dd>

          <dt>Repository:</dt>
          <dd>
            <a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0366d6' }}>
              {repo}
            </a>
          </dd>
        </dl>
      </div>

      <div style={{ marginBottom: 30 }}>
        <h2>Health Endpoints</h2>
        <ul>
          <li><a href="/version.json" target="_blank" rel="noopener noreferrer">/version.json</a></li>
          <li><a href="/health.txt" target="_blank" rel="noopener noreferrer">/health.txt</a></li>
          <li><a href="/health.json" target="_blank" rel="noopener noreferrer">/health.json</a></li>
          <li><a href="/health-lite.json" target="_blank" rel="noopener noreferrer">/health-lite.json</a></li>
        </ul>
      </div>

      <div>
        <h2>Data Endpoints</h2>
        <ul>
          <li><a href="/views/board.json" target="_blank" rel="noopener noreferrer">/views/board.json</a></li>
          <li><a href="/ontology.json" target="_blank" rel="noopener noreferrer">/ontology.json</a></li>
          <li><a href="/state-machine.json" target="_blank" rel="noopener noreferrer">/state-machine.json</a></li>
        </ul>
      </div>
    </div>
  )
}