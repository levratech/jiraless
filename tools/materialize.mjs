import { globby } from 'globby';
import matter from 'gray-matter';
import fs from 'fs/promises';
import path from 'path';

const files = await globby('.project/objects/**/*.{md,markdown}');
const nodes = [];
const edges = [];

function addEdge(from, to, type='relates') { edges.push({ from, to, type }); }

for (const f of files) {
  const raw = await fs.readFile(f, 'utf8');
  const { data: fm, content } = matter(raw);
  nodes.push({ id: fm.id, type: fm.type, status: fm.status, labels: fm.labels || [] });
  // naive backlink parse: [[ID]]
  const matches = content.match(/\[\[([A-Z]+-\d+)\]\]/g) || [];
  matches.forEach(m => addEdge(fm.id, m.slice(2,-2), 'mentions'));
  (fm.links || []).forEach(l => addEdge(fm.id, l.target, l.type || 'links'));
}

// write simple derived board: all in_progress issues
const board = nodes.filter(n => n.type === 'issue' && n.status === 'in_progress');
await fs.mkdir('.project/views', { recursive: true });
await fs.writeFile('.project/views/board.in_progress.json', JSON.stringify(board, null, 2));

// backlinks index
const back = {};
edges.forEach(e => { back[e.to] ||= []; back[e.to].push({ from: e.from, type: e.type }); });
await fs.writeFile('.project/views/backlinks.json', JSON.stringify(back, null, 2));
console.log('Materialized views.');