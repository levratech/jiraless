// Jiraless v0.3 Materializer
// Reads .project/objects/**/*.md and emits canonical JSON views:
//  - .project/views/board.json         (grouped by status)
//  - .project/views/by-type.json       (grouped by type facet(s))
//  - .project/views/stats.json         (counts + facet tallies)
// Also exports the ontology to JSON for the UI:
//  - ui/public/ontology.json           (derived from .project/policies/ontology.yaml)
// Optionally mirrors the views to ui/public/views/* for Pages to serve.
//
// Env:
//  TARGET_PUBLIC=ui/public   (optional; if present, views are mirrored there)

import fs from "fs/promises";
import path from "path";
import { globby } from "globby";
import matter from "gray-matter";
import yaml from "js-yaml";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OBJ_GLOB = path.join(__dirname, "../.project/objects/**/*.{md,markdown}");
const VIEWS_DIR = path.join(__dirname, "../.project/views");
const ONTOLOGY_YAML = path.join(__dirname, "../.project/policies/ontology.yaml");

const TARGET_PUBLIC = process.env.TARGET_PUBLIC || "";        // e.g. "ui/public"
const PUBLIC_VIEWS_DIR = TARGET_PUBLIC ? path.join(TARGET_PUBLIC, "views") : "";

/** ---------- helpers ---------- */
async function ensureDir(p){ await fs.mkdir(p, { recursive: true }).catch(()=>{}); }
function asArray(v){ return Array.isArray(v) ? v : v != null ? [v] : []; }

async function writeJson(p, obj){
  await ensureDir(path.dirname(p));
  const json = JSON.stringify(obj, null, 2);
  await fs.writeFile(p, json, "utf8");
  return json.length;
}

async function mirrorToPublic(relName){
  if (!TARGET_PUBLIC) return;
  const src = path.join(VIEWS_DIR, relName);
  const dst = path.join(PUBLIC_VIEWS_DIR, relName);
  await ensureDir(path.dirname(dst));
  await fs.copyFile(src, dst);
  console.log(`mirrored -> ${dst}`);
}

/** ---------- load ---------- */
const files = await globby(OBJ_GLOB);
const items = [];
for (const f of files){
  const raw = await fs.readFile(f, "utf8");
  const { data, content } = matter(raw);
  const id = data.id || path.basename(f).replace(/\.[^.]+$/, "");
  const type = data.type ?? "work";
  items.push({
    id,
    title: data.title || id,
    status: data.status || "backlog",
    type: asArray(type),
    priority: data.priority || null,
    severity: data.severity || null,
    size: data.size || null,
    intent: data.intent || null,
    scope: data.scope || null,
    assignees: data.assignees || [],
    labels: data.labels || [],
    created: data.created || null,
    updated: data.updated || null,
    links: data.links || [],
    file: f,
    excerpt: content.split("\n").slice(0, 12).join("\n")
  });
}

/** ---------- board.json (by status) ---------- */
const board = {};
for (const it of items){
  if (!board[it.status]) board[it.status] = [];
  board[it.status].push({ id: it.id, title: it.title, type: it.type, priority: it.priority, assignees: it.assignees, file: it.file });
}
for (const col of Object.keys(board)){
  board[col].sort((a,b)=>a.id.localeCompare(b.id));
}

/** ---------- by-type.json ---------- */
const byType = {};
for (const it of items){
  for (const t of it.type){
    if (!byType[t]) byType[t] = [];
    byType[t].push({ id: it.id, title: it.title, status: it.status, file: it.file });
  }
}
for (const t of Object.keys(byType)){
  byType[t].sort((a,b)=>a.id.localeCompare(b.id));
}

/** ---------- stats.json ---------- */
const stats = { count: items.length, byStatus: {}, byType: {}, byAssignee: {} };
for (const it of items){
  stats.byStatus[it.status] = (stats.byStatus[it.status]||0)+1;
  for (const t of it.type) stats.byType[t] = (stats.byType[t]||0)+1;
  for (const a of it.assignees) stats.byAssignee[a] = (stats.byAssignee[a]||0)+1;
}

/** ---------- ontology.json for UI ---------- */
let ontology = { types: {}, facets: {} };
try { ontology = yaml.load(await fs.readFile(ONTOLOGY_YAML, "utf8")) || ontology; }
catch { console.warn(`[warn] ontology not found at ${ONTOLOGY_YAML}`); }

/** ---------- write ---------- */
await ensureDir(VIEWS_DIR);
await writeJson(path.join(VIEWS_DIR, "board.json"), board);
await writeJson(path.join(VIEWS_DIR, "by-type.json"), byType);
await writeJson(path.join(VIEWS_DIR, "stats.json"), stats);

if (TARGET_PUBLIC){
  await ensureDir(PUBLIC_VIEWS_DIR);
  await mirrorToPublic("board.json");
  await mirrorToPublic("by-type.json");
  await mirrorToPublic("stats.json");
  // also emit ontology.json next to views for convenience
  await writeJson(path.join(TARGET_PUBLIC, "ontology.json"), ontology);
}

console.log(`materialized: ${items.length} items -> board.json, by-type.json, stats.json`);