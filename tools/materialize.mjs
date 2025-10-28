#!/usr/bin/env node
/**
 * Jiraless v0.4.2 Materializer
 * - Emits repo-relative POSIX paths in views (never absolute runner paths)
 * - Outputs: .project/views/{board.json,by-type.json,stats.json}
 * - Optionally mirrors to ui/public/views and emits ui/public/ontology.json
 */

import fs from "fs/promises";
import path from "path";
import { globby } from "globby";
import matter from "gray-matter";
import yaml from "js-yaml";

const REPO_ROOT = process.cwd();
const POSIX_ROOT = REPO_ROOT.replace(/\\/g, "/");

const OBJ_GLOB = ".project/objects/**/*.{md,markdown}";
const VIEWS_DIR = ".project/views";
const ONTOLOGY_YAML = ".project/policies/ontology.yaml";
const SM_YAML = ".project/policies/state-machine.yaml";
const TARGET_PUBLIC = process.env.TARGET_PUBLIC || ""; // e.g. "ui/public"
const PUBLIC_VIEWS_DIR = TARGET_PUBLIC ? path.join(TARGET_PUBLIC, "views") : "";

/** ---------- helpers ---------- */
async function ensureDir(p){ await fs.mkdir(p, { recursive: true }).catch(()=>{}); }
function asArray(v){ return Array.isArray(v) ? v : v != null ? [v] : []; }

// Normalize ANY path to a repo-relative POSIX path, e.g. ".project/objects/x.md"
function toRepoRel(pth){
  if (!pth) return "";
  // decode percent-encoding just in case caller passed a URL param
  try { pth = decodeURIComponent(pth); } catch {}
  // normalize slashes
  let s = pth.replace(/\\/g, "/");

  // If it's absolute and contains the runner checkout prefix, strip it.
  // Common prefixes:
  //   /home/runner/work/<repo>/<repo>/
  //   <REPO_ROOT> (local)
  if (s.startsWith(POSIX_ROOT + "/")) s = s.slice(POSIX_ROOT.length + 1);

  // strip common CI prefix pattern (/home/runner/work/<repo>/<repo>/...)
  const parts = s.split("/");
  const ix = parts.indexOf(".project");
  if (ix >= 0) {
    s = parts.slice(ix).join("/");
  }

  // remove leading "./"
  if (s.startsWith("./")) s = s.slice(2);
  // ensure we never escape repo
  if (s.startsWith("/")) s = s.replace(/^\/+/, "");
  return s;
}

// Strip markdown formatting for plain text search
function stripMarkdown(text) {
  return text
    .replace(/#{1,6}\s+/g, '') // headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1') // italic
    .replace(/`(.*?)`/g, '$1') // inline code
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // links
    .replace(/^\s*[-*+]\s+/gm, '') // list items
    .replace(/^\s*\d+\.\s+/gm, '') // numbered lists
    .replace(/\n+/g, ' ') // multiple newlines to space
    .trim();
}

async function writeIfChanged(file, contents) {
  try {
    const prev = await fs.readFile(file, 'utf8');
    if (prev === contents) return false;
  } catch {}
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, contents, 'utf8');
  return true;
}

async function writeJson(file, obj) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(obj, null, 2), 'utf8');
}

async function mirrorToPublic(relName){
  if (!TARGET_PUBLIC) return;
  const src = path.join(VIEWS_DIR, relName);
  const dst = path.join(PUBLIC_VIEWS_DIR, relName);
  await ensureDir(path.dirname(dst));
  await fs.copyFile(src, dst);
  console.log(`mirrored -> ${dst}`);
}

/** ---------- load objects ---------- */
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
    content: content,                    // store full content for search
    file: toRepoRel(f),                // ✅ repo-relative
    excerpt: content.split("\n").slice(0, 12).join("\n")
  });
}

/** ---------- board.json (by status) ---------- */
const board = {};
for (const it of items){
  const status = it.status;
  if (!board[status]) board[status] = [];
  const plainContent = stripMarkdown(it.title + ' ' + it.content);
  const searchBlob = plainContent.slice(0, 200);
  board[status].push({
    id: it.id,
    title: it.title,
    type: it.type,
    priority: it.priority,
    assignees: it.assignees,
    labels: it.labels,
    search_blob: searchBlob,
    file: toRepoRel(it.file)           // ✅ enforce repo-relative again
  });
}
for (const col of Object.keys(board)){
  board[col].sort((a,b)=>a.id.localeCompare(b.id));
}

/** ---------- by-type.json ---------- */
const byType = {};
for (const it of items){
  for (const t of it.type){
    if (!byType[t]) byType[t] = [];
    byType[t].push({ id: it.id, title: it.title, status: it.status, file: toRepoRel(it.file) });
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

let sm = {};
try { sm = yaml.load(await fs.readFile(SM_YAML, "utf8")) || {}; }
catch { console.warn(`[warn] state-machine not found at ${SM_YAML}`); }

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
  await writeJson(path.join(TARGET_PUBLIC, "ontology.json"), ontology);
  await writeJson(path.join(TARGET_PUBLIC, "state-machine.json"), sm);
}

const MANIFEST = {
  repo: process.env.GITHUB_REPOSITORY || "local/jiraless",
  url: `https://${process.env.GITHUB_REPOSITORY?.split('/')[0]}.github.io/${process.env.GITHUB_REPOSITORY?.split('/')[1]}/`,
  views: {
    board: "views/board.json",
    ontology: "ontology.json",
    state_machine: "state-machine.json"
  },
  updated: new Date().toISOString()
};

await writeIfChanged(".project/views/manifest.json", JSON.stringify(MANIFEST, null, 2));
await writeIfChanged("ui/public/manifest.json", JSON.stringify(MANIFEST, null, 2));
console.log("Wrote manifest.json");

console.log(`materialized: ${items.length} items -> board.json, by-type.json, stats.json (repo-relative paths)`);