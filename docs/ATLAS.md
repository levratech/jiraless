# Jiraless Atlas
_Generated:_ 2025-10-27T17:46:53.625Z

## Summary
- Files: **22**
- Total size: **38 KB**
- Inlined source cap: **195 KB** per file
- Inline allow: README.md, tools/, tools/schemas/, .github/workflows/, .project/policies/

## File Inventory
| Path | Size | SHA256 | Inlined |
| :-- | :-- | :-- | :-- |
| LICENSE | 1.0 KB | `a40f98f0c091…` | no |
| package.json | 288 B | `07f791639fa4…` | no |
| README.md | 8.9 KB | `d62cb2e9713a…` | yes |
| tools/atlas.mjs | 7.8 KB | `2715e4c4f3a8…` | yes |
| tools/materialize.mjs | 1.3 KB | `4fbfd03f71ce…` | yes |
| tools/schemas/adr.schema.json | 726 B | `05c78858158c…` | yes |
| tools/schemas/doc.schema.json | 721 B | `9468287ecf9e…` | yes |
| tools/schemas/epic.schema.json | 1.3 KB | `c82696cbc6f7…` | yes |
| tools/schemas/issue.schema.json | 1.3 KB | `08bac8bb651a…` | yes |
| tools/schemas/runlog.schema.json | 410 B | `4d898a0c53c3…` | yes |
| tools/schemas/story.schema.json | 1.3 KB | `58bb8c140002…` | yes |
| tools/schemas/work.schema.json | 1.3 KB | `e0f486065d9b…` | yes |
| tools/validate.mjs | 4.2 KB | `1e514a2a1022…` | yes |
| ui/index.html | 356 B | `34b42789489b…` | no |
| ui/package.json | 843 B | `cdf3015ef965…` | no |
| ui/public/404.html | 1.6 KB | `816f4a2db1b1…` | no |
| ui/src/App.jsx | 622 B | `49cac7635e59…` | no |
| ui/src/components/IssueDetail.jsx | 1.9 KB | `f5a2447ef3cb…` | no |
| ui/src/components/IssuesList.jsx | 1.2 KB | `0199872983bf…` | no |
| ui/src/index.css | 632 B | `696b7714cc1f…` | no |
| ui/src/main.jsx | 234 B | `dfe7f7d0a5d8…` | no |
| ui/vite.config.js | 154 B | `14cbdd502354…` | no |

## .project Object Stats
### By Type
| Type | Count |
| :-- | :-- |
| feature | 1 |

### By Status
| Status | Count |
| :-- | :-- |
| in_progress | 1 |

### Objects
| ID | Type | Status | Title | File |
| :-- | :-- | :-- | :-- | :-- |
| WK-0001 | feature | in_progress | Implement ontology-driven work objects | .project/objects/issues/ISS-0001.sample.md |

## GitHub Workflows
| Workflow | Triggers | File |
| :-- | :-- | :-- |
| Build Atlas | push, workflow_dispatch | .github/workflows/atlas.yml |
| Materialize Boards & Backlinks | push, workflow_dispatch | .github/workflows/materialize.yml |
| Deploy UI to Pages | push, workflow_dispatch | .github/workflows/pages.yml |
| Validate Jiraless Objects | pull_request, push | .github/workflows/validate.yml |

## Inline Source (key files)
### `README.md`
_Size:_ 8.9 KB  
_Hash:_ `d62cb2e9713a17c9115f4aef5bd390455fdc6f034fd865a9f736d4a38fa2d315`

```markdown
# Jiraless

**Jira, but without the Jira.**  
Markdown-native work objects in Git. GitHub Pages as the UI. GitHub Actions as the backend. GitHub RBAC as auth. Zero server bill.

## Why
I wanted Jira’s structure without its gravity—and the things Jira won’t give me:
- Text-first work (Markdown + YAML front-matter)
- Repo-as-database with perfect audit (PRs)
- Static UI (Pages), no servers to run
- Policy enforcement in CI (Actions)
- Agent-native by design (PR proposals)

## How it works
- **Data**: `.project/objects/**.md` hold issues, epics, stories, docs, ADRs.
- **UI**: `/ui` builds to GitHub Pages; reads repo files via GitHub API.
- **Logic**: `validate.yml` checks schemas + links; `materialize.yml` builds boards/backlinks and commits to `.project/views/`.
- **Auth/RBAC**: Your GitHub repo’s permissions + optional policy guards in `.project/policies/`.

## Repository layout

.project/
objects/
issues/ISS-0001.fix-imports.md
epics/EPC-0001.tradebot-ingest.md
stories/STR-0001.detect-ota-zones.md
docs/DOC-ARCH-0001.conductor-topology.md
decisions/ADR-0001-nats-vs-kafka.md
policies/
roles.yaml
state-machine.yaml
agent-policies.yaml
views/                # generated (boards, roadmap, backlink index)
runs/                 # append-only logs (comments, agent actions)

## Front-matter schema (issue)
```yaml
---
id: ISS-0001
type: issue            # issue|epic|story|doc|decision
title: "Fix import graph for conductor"
status: in_progress    # state machine in policies/state-machine.yaml
priority: p2
assignees: [adam]
labels: [build, conductor]
created: 2025-10-26T20:00:00Z
updated: 2025-10-26T20:05:00Z
links:
  - { type: blocks, target: "STR-0001" }
acceptance:
  - "PR builds green in CI"
  - "Imports are acyclic in /src/conductor/*"
code:
  refs:
    - { path: "src/conductor/index.ts", lines: "1-80" }
---
## Context
One paragraph of why this exists.

## Plan
1. Short, agent-friendly steps.

## Notes
- Bullets. Keep it tight.

Policies (minimal)

./.project/policies/state-machine.yaml

states: [backlog, selected, in_progress, in_review, done, archived, blocked, on_hold, failed]
transitions:
  backlog: [selected]
  selected: [in_progress, on_hold]
  in_progress: [in_review, blocked, failed]
  in_review: [done, in_progress]
  done: [archived]
guards:
  - rule: "close.p1.requires(human: maintainer|owner)"

./.project/policies/roles.yaml

roles:
  owner:       { members: ["github:repo:admins"], permissions: ["*"] }
  maintainer:  { members: ["github:team:platform"], permissions: ["issue.*","transition.*","policy.*"] }
  contributor: { members: ["github:repo:writers"],  permissions: ["issue.create","comment.create","transition.to:in_review"] }
  reporter:    { members: ["github:repo:triagers"], permissions: ["comment.create","link.create"] }
  agent:       { members: ["bot:jiraless[bot]"],    permissions: ["proposal.create","runlog.write"] }

Quickstart
	1.	Clone/fork this repo.
	2.	Enable GitHub Pages (build from /ui → dist on main or /docs—your choice).
	3.	Create your first issue: copy the sample, adjust front-matter, commit.
	4.	Open a PR; validate.yml will check schema/links.
	5.	On merge, materialize.yml will update .project/views/* for the UI.

Development (UI)

cd ui
pnpm i
pnpm dev

The UI reads files via GitHub API. For private repos, use a GitHub App/device flow to obtain a short-lived token (TODO: add minimal helper Action or Worker for prod).

Roadmap
	•	v0.1: schemas + validator + board materializer + read-only UI.
	•	v0.2: UI “create issue/transition” → draft PR flow.
	•	v0.3: policy guardrails; role mapping; agent proposals.
	•	v1.0: multi-repo indexing (Cortex/Conduit).

License

MIT (or Apache-2.0). Your call.

---

# ⚙️ Workflows (drop-in stubs)

**`.github/workflows/validate.yml`**
```yaml
name: Validate Jiraless Objects
on:
  pull_request:
    paths:
      - ".project/**"
  push:
    paths:
      - ".project/**"
jobs:
  validate:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm i gray-matter js-yaml ajv ajv-formats globby
      - run: node tools/validate.mjs

.github/workflows/materialize.yml

name: Materialize Boards & Backlinks
on:
  push:
    branches: [ main ]
    paths:
      - ".project/**"
  workflow_dispatch:
jobs:
  build_views:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm i gray-matter js-yaml globby marked
      - run: node tools/materialize.mjs
      - name: Commit view updates
        run: |
          git config user.name "jiraless-bot"
          git config user.email "bot@users.noreply.github.com"
          git add .project/views
          git diff --cached --quiet || git commit -m "materialize: boards/backlinks"
          git push


⸻

🧪 Minimal tool scripts (entry points)

tools/validate.mjs (skeleton)

import { globby } from 'globby';
import matter from 'gray-matter';
import fs from 'fs/promises';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
addFormats(ajv);
const schemas = ['issue','epic','story','doc','adr','runlog'];

const loadSchema = async (name) =>
  JSON.parse(await fs.readFile(`tools/schemas/${name}.schema.json`, 'utf8'));

const schemaMap = Object.fromEntries(
  await Promise.all(schemas.map(async s => [s, await loadSchema(s)]))
);
Object.entries(schemaMap).forEach(([k,v]) => ajv.addSchema(v, k));

const files = await globby('.project/objects/**/*.{md,markdown}');
let errors = 0;

for (const f of files) {
  const raw = await fs.readFile(f, 'utf8');
  const fm = matter(raw).data;
  const type = fm.type;
  const validate = ajv.getSchema(type);
  if (!validate) { console.log(`No schema for type '${type}' in ${f}`); errors++; continue; }
  const ok = validate(fm);
  if (!ok) {
    console.log(`❌ ${f}`);
    console.log(validate.errors);
    errors++;
  } else {
    console.log(`✅ ${f}`);
  }
}

if (errors) {
  console.error(`Validation failed: ${errors} file(s).`);
  process.exit(1);
} else {
  console.log('All good.');
}

tools/materialize.mjs (skeleton)

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


⸻

🧰 Example schema: tools/schemas/issue.schema.json

{
  "$id": "issue",
  "type": "object",
  "required": ["id","type","title","status","created","updated"],
  "properties": {
    "id": { "type": "string", "pattern": "^ISS-\\d{4,}$" },
    "type": { "const": "issue" },
    "title": { "type": "string", "minLength": 3 },
    "status": { "type": "string" },
    "priority": { "type": "string", "enum": ["p0","p1","p2","p3"] },
    "assignees": { "type": "array", "items": { "type": "string" } },
    "labels": { "type": "array", "items": { "type": "string" } },
    "created": { "type": "string", "format": "date-time" },
    "updated": { "type": "string", "format": "date-time" },
    "links": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["target"],
        "properties": {
          "type": { "type": "string" },
          "target": { "type": "string" }
        }
      }
    },
    "acceptance": { "type": "array", "items": { "type": "string" } },
    "code": {
      "type": "object",
      "properties": {
        "refs": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "path": { "type": "string" },
              "lines": { "type": "string" }
            },
            "required": ["path"]
          }
        }
      }
    }
  },
  "additionalProperties": true
}

```

### `tools/atlas.mjs`
_Size:_ 7.8 KB  
_Hash:_ `2715e4c4f3a8681020b7e733d8b6a26113cd8c38f5ba3bf5f84f19f96efd7071`

```js
#!/usr/bin/env node
/**
 * Jiraless Atlas
 * Produces docs/ATLAS.md: a single-file snapshot of repo state:
 * - File inventory (size, sha256)
 * - .project object stats (by type/status)
 * - Workflows summary (name, triggers)
 * - Inline source (whitelisted dirs only) with size cap
 *
 * Env:
 *  ATLAS_OUT=docs/ATLAS.md
 *  ATLAS_MAX_INLINE=200000
 *  ATLAS_DEBUG_IGNORE=1
 */

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { globby } from "globby";
import matter from "gray-matter";
import yaml from "js-yaml";
import ignore from "ignore";

const OUT = process.env.ATLAS_OUT || "docs/ATLAS.md";
const MAX_INLINE_BYTES = Number(process.env.ATLAS_MAX_INLINE || 200_000);
const DEBUG_IGNORE = !!process.env.ATLAS_DEBUG_IGNORE;

// Only inline from these locations (keeps Atlas tight)
const INLINE_ALLOW_DIRS = [
  "tools/",
  "tools/schemas/",
  ".github/workflows/",
  ".project/policies/",
];
const INLINE_ALLOW_FILES = new Set(["README.md"]); // single files allowed anywhere

const INLINE_EXTS = new Set([
  ".md", ".markdown", ".yml", ".yaml", ".json",
  ".mjs", ".cjs", ".js", ".ts", ".tsx", ".jsx",
  ".css", ".html"
]);

// ---- ignore handling (gitignore-style) ----
const DEFAULT_IGNORES = [
  "**/node_modules/**",
  "**/dist/**",
  ".git/**",
  ".next/**",
  "coverage/**",
  "**/.DS_Store",
  OUT,                 // never include the atlas itself
  `**/${path.basename(OUT)}`,
  ".project/views/**", // generated; usually noisy
  "ui/dist/**",        // build output
];

function normalizeAtlasIgnoreLines(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .flatMap((p) => {
      const hasSlash = p.includes("/");
      const hasGlob = /[*?[\]{}()!]/.test(p);
      if (!hasSlash && !hasGlob) return [p, `**/${p}`];
      return [p];
    });
}

let userIgnores = [];
try {
  const raw = await fs.readFile(".atlasignore", "utf8");
  userIgnores = normalizeAtlasIgnoreLines(raw);
  console.log(`Loaded ${userIgnores.length} patterns from .atlasignore`);
} catch {
  console.log("No .atlasignore found; using defaults only.");
}

const ig = ignore().add([...DEFAULT_IGNORES, ...userIgnores]);

// helpers
const ext = (p) => path.extname(p).toLowerCase();
const sha256 = (b) => crypto.createHash("sha256").update(b).digest("hex");
const prettyBytes = (n) => {
  const u = ["B", "KB", "MB", "GB"]; let i = 0; let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
};

async function readSafe(p) { try { return await fs.readFile(p); } catch { return null; } }

function codeFenceForExt(e) {
  if (e === ".md" || e === ".markdown") return "markdown";
  if (e === ".yml" || e === ".yaml") return "yaml";
  if (e === ".json") return "json";
  if (e === ".ts" || e === ".tsx") return "ts";
  if (e === ".js" || e === ".mjs" || e === ".cjs") return "js";
  if (e === ".css") return "css";
  if (e === ".html") return "html";
  return "";
}

function table(headers, rows) {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => ":--").join(" | ")} |`;
  const body = rows.map((r) => `| ${r.map((v) => v ?? "").join(" | ")} |`).join("\n");
  return `${head}\n${sep}\n${body}`;
}

function debugIgnored(allFiles, keptFiles) {
  if (!DEBUG_IGNORE) return;
  const kept = new Set(keptFiles);
  const ignored = allFiles.filter((f) => !kept.has(f));
  console.log("\n[atlas] Debug ignore:");
  console.log(`  Input files: ${allFiles.length}`);
  console.log(`  Kept files : ${keptFiles.length}`);
  console.log(`  Ignored    : ${ignored.length}`);
  if (ignored.length) {
    console.log(ignored.slice(0, 200).map((f) => `   - ${f}`).join("\n"));
    if (ignored.length > 200) console.log("   ... (truncated)");
  }
}

async function collectFiles() {
  const filesAll = await globby(["**/*"], { gitignore: true });
  const files = ig.filter(filesAll);
  debugIgnored(filesAll, files);

  const entries = [];
  for (const f of files) {
    const stat = await fs.stat(f).catch(() => null);
    if (!stat || stat.isDirectory()) continue;
    const buf = await readSafe(f);
    const size = buf?.length ?? 0;
    entries.push({
      path: f,
      size,
      sha256: buf ? sha256(buf) : "",
      inline: shouldInline(f) && size <= MAX_INLINE_BYTES && INLINE_EXTS.has(ext(f)),
    });
  }
  entries.sort((a, b) => a.path.localeCompare(b.path));
  return entries;
}

function shouldInline(p) {
  if (INLINE_ALLOW_FILES.has(p)) return true;
  return INLINE_ALLOW_DIRS.some((prefix) => p.startsWith(prefix));
}

async function projectStats() {
  const all = await globby([".project/objects/**/*.{md,markdown}"], { gitignore: true });
  const objects = ig.filter(all);
  const byType = new Map(), byStatus = new Map();
  const rows = [];

  for (const p of objects) {
    const raw = await fs.readFile(p, "utf8");
    const fm = matter(raw).data || {};
    const t = (fm.type || "unknown").toString();
    const s = (fm.status || "unknown").toString();
    byType.set(t, (byType.get(t) || 0) + 1);
    byStatus.set(s, (byStatus.get(s) || 0) + 1);
    rows.push({ id: fm.id, type: t, status: s, title: fm.title, file: p });
  }
  return { byType, byStatus, rows };
}

async function workflowsSummary() {
  const all = await globby([".github/workflows/**/*.{yml,yaml}"], { gitignore: true });
  const files = ig.filter(all);
  const flows = [];
  for (const p of files) {
    const raw = await fs.readFile(p, "utf8");
    let y; try { y = yaml.load(raw); } catch { y = null; }
    const name = (y && y.name) || path.basename(p);
    const on = y && y.on
      ? (Array.isArray(y.on) ? y.on : Object.keys(y.on))
      : [];
    flows.push({ file: p, name, triggers: on });
  }
  return flows;
}

async function inlineSections(entries) {
  const chunks = [];
  for (const e of entries) {
    if (!e.inline) continue;
    const raw = await fs.readFile(e.path, "utf8");
    const lang = codeFenceForExt(ext(e.path));
    chunks.push(
      `### \`${e.path}\`\n` +
      `_Size:_ ${prettyBytes(e.size)}  \n_Hash:_ \`${e.sha256}\`\n\n` +
      `\`\`\`${lang}\n${raw}\n\`\`\`\n`
    );
  }
  return chunks.join("\n");
}

async function main() {
  const entries = await collectFiles();

  const totalSize = entries.reduce((s, e) => s + e.size, 0);
  const filesTable = table(
    ["Path", "Size", "SHA256", "Inlined"],
    entries.map((e) => [
      e.path,
      prettyBytes(e.size),
      `\`${e.sha256.slice(0, 12)}…\``,
      e.inline ? "yes" : "no",
    ])
  );

  const { byType, byStatus, rows } = await projectStats();
  const typeRows = [...byType.entries()].map(([k, v]) => [k, String(v)]);
  const statusRows = [...byStatus.entries()].map(([k, v]) => [k, String(v)]);
  const objectTable = table(
    ["ID", "Type", "Status", "Title", "File"],
    rows.map((r) => [r.id || "", r.type, r.status, r.title || "", r.file])
  );

  const flows = await workflowsSummary();
  const flowTable = table(
    ["Workflow", "Triggers", "File"],
    flows.map((f) => [f.name, (f.triggers || []).join(", "), f.file])
  );

  const inlined = await inlineSections(entries);

  const now = new Date().toISOString();
  const md = `# Jiraless Atlas
_Generated:_ ${now}

## Summary
- Files: **${entries.length}**
- Total size: **${prettyBytes(totalSize)}**
- Inlined source cap: **${prettyBytes(MAX_INLINE_BYTES)}** per file
- Inline allow: ${["README.md", ...INLINE_ALLOW_DIRS].join(", ")}

## File Inventory
${filesTable}

## .project Object Stats
### By Type
${table(["Type","Count"], typeRows)}

### By Status
${table(["Status","Count"], statusRows)}

### Objects
${objectTable}

## GitHub Workflows
${flowTable}

## Inline Source (key files)
${inlined || "_(No files eligible under size cap.)_"}
`;

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, md, "utf8");
  console.log(`Wrote ${OUT}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
```

### `tools/materialize.mjs`
_Size:_ 1.3 KB  
_Hash:_ `4fbfd03f71ce3757260dc8cc5ed5ec521f2be52495a07c2469650a06f5e6350e`

```js
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
```

### `tools/schemas/adr.schema.json`
_Size:_ 726 B  
_Hash:_ `05c78858158c1b1f0d230656cce3819e68e02f5cc4e4ce7678b2fbdf315ee1f2`

```json
{
  "$id": "adr",
  "type": "object",
  "required": ["id","type","title","created","updated"],
  "properties": {
    "id": { "type": "string", "pattern": "^ADR-\\d{4,}$" },
    "type": { "const": "decision" },
    "title": { "type": "string", "minLength": 3 },
    "created": { "type": "string", "format": "date-time" },
    "updated": { "type": "string", "format": "date-time" },
    "labels": { "type": "array", "items": { "type": "string" } },
    "links": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["target"],
        "properties": {
          "type": { "type": "string" },
          "target": { "type": "string" }
        }
      }
    }
  },
  "additionalProperties": true
}
```

### `tools/schemas/doc.schema.json`
_Size:_ 721 B  
_Hash:_ `9468287ecf9ef17cc3c4649fa51ed9cf36ac396b52247fdc926167c23de9946f`

```json
{
  "$id": "doc",
  "type": "object",
  "required": ["id","type","title","created","updated"],
  "properties": {
    "id": { "type": "string", "pattern": "^DOC-\\d{4,}$" },
    "type": { "const": "doc" },
    "title": { "type": "string", "minLength": 3 },
    "created": { "type": "string", "format": "date-time" },
    "updated": { "type": "string", "format": "date-time" },
    "labels": { "type": "array", "items": { "type": "string" } },
    "links": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["target"],
        "properties": {
          "type": { "type": "string" },
          "target": { "type": "string" }
        }
      }
    }
  },
  "additionalProperties": true
}
```

### `tools/schemas/epic.schema.json`
_Size:_ 1.3 KB  
_Hash:_ `c82696cbc6f70ecf91f15be43b7d3d645db69af3e21849689e232f33ff22c472`

```json
{
  "$id": "epic",
  "type": "object",
  "required": ["id","type","title","status","created","updated"],
  "properties": {
    "id": { "type": "string", "pattern": "^EPC-\\d{4,}$" },
    "type": { "const": "epic" },
    "title": { "type": "string", "minLength": 3 },
    "status": { "type": "string" },
    "priority": { "type": "string", "enum": ["p0","p1","p2","p3"] },
    "assignees": { "type": "array", "items": { "type": "string" } },
    "labels": { "type": "array", "items": { "type": "string" } },
    "created": { "type": "string", "format": "date-time" },
    "updated": { "type": "string", "format": "date-time" },
    "links": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["target"],
        "properties": {
          "type": { "type": "string" },
          "target": { "type": "string" }
        }
      }
    },
    "acceptance": { "type": "array", "items": { "type": "string" } },
    "code": {
      "type": "object",
      "properties": {
        "refs": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "path": { "type": "string" },
              "lines": { "type": "string" }
            },
            "required": ["path"]
          }
        }
      }
    }
  },
  "additionalProperties": true
}
```

### `tools/schemas/issue.schema.json`
_Size:_ 1.3 KB  
_Hash:_ `08bac8bb651a57930fade401d56d97df1022652d2f7103c582319e19de6aa6b2`

```json
{
  "$id": "issue",
  "type": "object",
  "required": ["id","type","title","status","created","updated"],
  "properties": {
    "id": { "type": "string", "pattern": "^ISS-\\d{4,}$" },
    "type": { "const": "issue" },
    "title": { "type": "string", "minLength": 3 },
    "status": { "type": "string" },
    "priority": { "type": "string", "enum": ["p0","p1","p2","p3"] },
    "assignees": { "type": "array", "items": { "type": "string" } },
    "labels": { "type": "array", "items": { "type": "string" } },
    "created": { "type": "string", "format": "date-time" },
    "updated": { "type": "string", "format": "date-time" },
    "links": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["target"],
        "properties": {
          "type": { "type": "string" },
          "target": { "type": "string" }
        }
      }
    },
    "acceptance": { "type": "array", "items": { "type": "string" } },
    "code": {
      "type": "object",
      "properties": {
        "refs": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "path": { "type": "string" },
              "lines": { "type": "string" }
            },
            "required": ["path"]
          }
        }
      }
    }
  },
  "additionalProperties": true
}
```

### `tools/schemas/runlog.schema.json`
_Size:_ 410 B  
_Hash:_ `4d898a0c53c34c23b3bcaef2c0b8efad45daa321540a6de5d5f4a8dbc3da1bcb`

```json
{
  "$id": "runlog",
  "type": "object",
  "required": ["id","type","action","timestamp"],
  "properties": {
    "id": { "type": "string", "pattern": "^RUN-\\d{4,}$" },
    "type": { "const": "runlog" },
    "action": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "agent": { "type": "string" },
    "details": { "type": "object" }
  },
  "additionalProperties": true
}
```

### `tools/schemas/story.schema.json`
_Size:_ 1.3 KB  
_Hash:_ `58bb8c14000296fb6e02482f470e46553d506a6cd26136fd269f397bdd473dfe`

```json
{
  "$id": "story",
  "type": "object",
  "required": ["id","type","title","status","created","updated"],
  "properties": {
    "id": { "type": "string", "pattern": "^STR-\\d{4,}$" },
    "type": { "const": "story" },
    "title": { "type": "string", "minLength": 3 },
    "status": { "type": "string" },
    "priority": { "type": "string", "enum": ["p0","p1","p2","p3"] },
    "assignees": { "type": "array", "items": { "type": "string" } },
    "labels": { "type": "array", "items": { "type": "string" } },
    "created": { "type": "string", "format": "date-time" },
    "updated": { "type": "string", "format": "date-time" },
    "links": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["target"],
        "properties": {
          "type": { "type": "string" },
          "target": { "type": "string" }
        }
      }
    },
    "acceptance": { "type": "array", "items": { "type": "string" } },
    "code": {
      "type": "object",
      "properties": {
        "refs": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "path": { "type": "string" },
              "lines": { "type": "string" }
            },
            "required": ["path"]
          }
        }
      }
    }
  },
  "additionalProperties": true
}
```

### `tools/schemas/work.schema.json`
_Size:_ 1.3 KB  
_Hash:_ `e0f486065d9be3b0dfcfcf3d0518d6fcde93429c55496d4c2e8ccb67c1e32343`

```json
{
  "$id": "work",
  "type": "object",
  "required": ["id", "type", "title", "status", "created", "updated"],
  "properties": {
    "id": { "type": "string", "pattern": "^WK-\\d{4,}$" },
    "type": {
      "oneOf": [
        { "type": "string", "minLength": 1 },
        {
          "type": "array",
          "items": { "type": "string", "minLength": 1 },
          "minItems": 1
        }
      ],
      "description": "types-as-labels — validated against ontology.types keys by validator"
    },
    "title": { "type": "string", "minLength": 3 },
    "status": { "type": "string" },
    "priority": { "type": "string" },
    "severity": { "type": "string" },
    "size": { "type": "string" },
    "intent": { "type": "string" },
    "scope": { "type": "string" },
    "assignees": { "type": "array", "items": { "type": "string" } },
    "labels": { "type": "array", "items": { "type": "string" } },
    "aliases": { "type": "array", "items": { "type": "string" } },
    "created": { "type": "string" },
    "updated": { "type": "string" },
    "links": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["target"],
        "properties": {
          "type": { "type": "string" },
          "target": { "type": "string" }
        },
        "additionalProperties": false
      }
    }
  },
  "additionalProperties": true
}
```

### `tools/validate.mjs`
_Size:_ 4.2 KB  
_Hash:_ `1e514a2a1022fbc281d0274e3d38078d8b4a2d4f3cfc445b0d86ae8d1b918980`

```js
#!/usr/bin/env node
/**
 * Jiraless v0.2 Validator
 * - Loads ontology & state machine
 * - Validates .project/objects/** front-matter against work.schema.json
 * - Ensures `type` values exist in ontology.types (string or array of strings)
 * - Ensures `status` is a known state
 * - OPTIONAL (best-effort on PRs): checks status transition legality if base file is available
 */

import fs from "fs/promises";
import path from "path";
import { globby } from "globby";
import matter from "gray-matter";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { execSync } from "node:child_process";

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
addFormats(ajv);

const schema = JSON.parse(
  await fs.readFile("tools/schemas/work.schema.json", "utf8")
);
ajv.addSchema(schema, "work");

const ONTOLOGY_PATH = ".project/policies/ontology.yaml";
const STATE_MACHINE_PATH = ".project/policies/state-machine.yaml";

function fail(msg) {
  console.error(msg);
  process.exitCode = 1;
}

const ontology = yaml.load(await fs.readFile(ONTOLOGY_PATH, "utf8"));
const sm = yaml.load(await fs.readFile(STATE_MACHINE_PATH, "utf8"));

const allowedTypes = new Set(Object.keys(ontology?.types || {}));
const facetEnums = ontology?.facets || {};
const states = new Set(sm?.states || []);
const transitions = sm?.transitions || {};

if (!allowedTypes.size) {
  fail(`❌ ontology.types is empty. Define at least one type in ${ONTOLOGY_PATH}`);
}
if (!states.size) {
  fail(`❌ state-machine.states is empty. Define states in ${STATE_MACHINE_PATH}`);
}

const files = await globby(".project/objects/**/*.{md,markdown}");

let errors = 0;
let checked = 0;

function asArray(v) {
  return Array.isArray(v) ? v : v != null ? [v] : [];
}

function getBaseStatusIfAvailable(filePath) {
  // Best-effort: if running in PR context and base branch exists, diff status
  const base = process.env.GITHUB_BASE_REF || "origin/main";
  try {
    execSync("git fetch --no-tags --depth=2 origin +refs/heads/*:refs/remotes/origin/*", { stdio: "ignore" });
    const raw = execSync(`git show ${base}:${filePath}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return fm.status || null;
  } catch {
    return null; // base not available; skip transition check
  }
}

for (const f of files) {
  const raw = await fs.readFile(f, "utf8");
  const parsed = matter(raw);
  let fm = parsed.data || {};
  fm = JSON.parse(JSON.stringify(fm)); // convert Dates to strings
  const validate = ajv.getSchema("work");

  checked++;

  // 1) JSON schema
  const ok = validate(fm);
  if (!ok) {
    console.log(`❌ schema: ${f}`);
    console.log(validate.errors);
    errors++;
    continue;
  }

  // 2) type(s) exist in ontology
  const types = asArray(fm.type);
  const unknown = types.filter((t) => !allowedTypes.has(t));
  if (unknown.length) {
    console.log(`❌ type: ${f} — unknown type(s): ${unknown.join(", ")}. Allowed: ${[...allowedTypes].join(", ")}`);
    errors++;
  }

  // 3) status in state machine
  if (!states.has(fm.status)) {
    console.log(`❌ status: ${f} — '${fm.status}' not in states: ${[...states].join(", ")}`);
    errors++;
  }

  // 4) facet hints (warn-only)
  const hints = [];
  for (const facet of ["intent", "scope", "size", "severity", "priority"]) {
    if (fm[facet] && facetEnums[facet] && !facetEnums[facet].includes(fm[facet])) {
      hints.push(`- ${facet} '${fm[facet]}' not in ontology.facets.${facet}: [${facetEnums[facet].join(", ")}]`);
    }
  }
  if (hints.length) {
    console.log(`⚠︎ facet hints: ${f}\n${hints.join("\n")}`);
  }

  // 5) transition legality (best effort)
  const prev = getBaseStatusIfAvailable(f);
  if (prev && prev !== fm.status) {
    const allowed = new Set(transitions[prev] || []);
    if (!allowed.has(fm.status)) {
      console.log(`❌ transition: ${f} — illegal '${prev}' → '${fm.status}'. Allowed: [${[...allowed].join(", ")}]`);
      errors++;
    }
  }

  if (errors === 0) {
    // noisy per file logs are optional; keep quiet unless debugging
  }
}

if (errors) {
  console.error(`\nValidation failed: ${errors} error(s) across ${checked} file(s).`);
  process.exit(1);
} else {
  console.log(`All good ✔ — ${checked} file(s) validated.`);
}
```

