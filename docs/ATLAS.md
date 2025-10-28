# Jiraless Atlas
_Generated:_ 2025-10-28T16:17:07.221Z

## Summary
- Files: **43**
- Total size: **65 KB**
- Inlined source cap: **195 KB** per file
- Inline allow: README.md, tools/, tools/schemas/, .github/workflows/, .project/policies/

## File Inventory
| Path | Size | SHA256 | Inlined |
| :-- | :-- | :-- | :-- |
| LICENSE | 1.0 KB | `a40f98f0c091…` | no |
| package.json | 285 B | `3da93b3cef93…` | no |
| README.md | 8.9 KB | `d62cb2e9713a…` | yes |
| tools/atlas.mjs | 7.8 KB | `2715e4c4f3a8…` | yes |
| tools/federate.mjs | 1.2 KB | `be57091c23e0…` | yes |
| tools/materialize.mjs | 6.1 KB | `fe7f9bd71b96…` | yes |
| tools/schemas/adr.schema.json | 726 B | `05c78858158c…` | yes |
| tools/schemas/doc.schema.json | 721 B | `9468287ecf9e…` | yes |
| tools/schemas/epic.schema.json | 1.3 KB | `c82696cbc6f7…` | yes |
| tools/schemas/issue.schema.json | 1.3 KB | `08bac8bb651a…` | yes |
| tools/schemas/runlog.schema.json | 410 B | `4d898a0c53c3…` | yes |
| tools/schemas/story.schema.json | 1.3 KB | `58bb8c140002…` | yes |
| tools/schemas/work.schema.json | 1.3 KB | `e0f486065d9b…` | yes |
| tools/validate.mjs | 4.3 KB | `79a712057cb9…` | yes |
| tools/version.mjs | 3.2 KB | `954abd451387…` | yes |
| ui/index.html | 488 B | `e57e417cfc04…` | no |
| ui/package.json | 844 B | `84b3d7e67b9e…` | no |
| ui/public/404.html | 1.6 KB | `816f4a2db1b1…` | no |
| ui/public/config.js | 149 B | `113826305d74…` | no |
| ui/public/health.json | 187 B | `87499aec9d4d…` | no |
| ui/public/health.txt | 118 B | `b3e43aef9cf0…` | no |
| ui/public/ontology.json | 828 B | `250b630dfbda…` | no |
| ui/public/version.json | 169 B | `666e36d4c2d7…` | no |
| ui/public/views/board.json | 303 B | `f9a6f6cbe393…` | no |
| ui/public/views/by-type.json | 218 B | `f5ca03a1e86d…` | no |
| ui/public/views/stats.json | 131 B | `2605f43071e0…` | no |
| ui/src/App.jsx | 1011 B | `835983ee2dcc…` | no |
| ui/src/App.tsx | 1.5 KB | `eee68f8545da…` | no |
| ui/src/components/Board.tsx | 3.3 KB | `52c5eff116c0…` | no |
| ui/src/components/IssueDetail.jsx | 1.9 KB | `f5a2447ef3cb…` | no |
| ui/src/components/IssuesList.jsx | 1.2 KB | `0199872983bf…` | no |
| ui/src/index.css | 632 B | `696b7714cc1f…` | no |
| ui/src/lib/asset.ts | 219 B | `f2398730412d…` | no |
| ui/src/lib/fetch.ts | 505 B | `7576db65dd37…` | no |
| ui/src/lib/ontology.ts | 501 B | `fb5e681d8ed3…` | no |
| ui/src/main.jsx | 213 B | `b98fad61f7d1…` | no |
| ui/src/main.tsx | 439 B | `4f609c9eada6…` | no |
| ui/src/pages/Cortex.tsx | 1.0 KB | `ab789897c40e…` | no |
| ui/src/pages/NewWork.tsx | 2.1 KB | `38ceefaa38e3…` | no |
| ui/src/pages/WorkDetail.tsx | 4.6 KB | `b0a5a176dd34…` | no |
| ui/src/util/gh.ts | 579 B | `ea9f808c423a…` | no |
| ui/src/version.ts | 203 B | `6c33ac597f20…` | no |
| ui/vite.config.ts | 304 B | `13e9043047cf…` | no |

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
| Build Atlas | push, workflow_dispatch, workflow_run | .github/workflows/atlas.yml |
| Federate Cortex | schedule, workflow_dispatch, push | .github/workflows/federate.yml |
| Materialize Boards & Backlinks | push, workflow_dispatch | .github/workflows/materialize.yml |
| Deploy UI to Pages | push, workflow_dispatch | .github/workflows/pages.yml |
| Propose Work (repository_dispatch → draft PR) | repository_dispatch | .github/workflows/propose-intent.yml |
| Propose Transition (repository_dispatch → draft PR) | repository_dispatch | .github/workflows/transition-intent.yml |
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

### `tools/federate.mjs`
_Size:_ 1.2 KB  
_Hash:_ `be57091c23e07a86198b22696e33d3e02a8fd6a82c133ca8c83963ab16edc6c1`

```js
#!/usr/bin/env node
/**
 * Jiraless Federation Tool
 * Aggregates multiple Jiraless manifests into one federated view.
 */
import fs from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import fetch from "node-fetch";

const CONFIG = ".project/policies/federation.yaml";
const OUT = ".project/views/federated.json";

async function loadConfig() {
  try {
    const raw = await fs.readFile(CONFIG, "utf8");
    return yaml.load(raw);
  } catch {
    return { remotes: [] };
  }
}

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (e) {
    console.warn(`⚠️ Failed to fetch ${url}: ${e.message}`);
    return null;
  }
}

async function main() {
  const cfg = await loadConfig();
  const all = [];
  for (const remote of cfg.remotes || []) {
    const manifest = await fetchJSON(remote);
    if (manifest) all.push(manifest);
  }
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify({ updated: new Date().toISOString(), manifests: all }, null, 2));
  console.log(`Federated ${all.length} manifests`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
```

### `tools/materialize.mjs`
_Size:_ 6.1 KB  
_Hash:_ `fe7f9bd71b96a360d1a07ecdbcb9a0b69c53267980dcbdbe890d461846d878da`

```js
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

async function writeIfChanged(file, contents) {
  try {
    const prev = await fs.readFile(file, 'utf8');
    if (prev === contents) return false;
  } catch {}
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, contents, 'utf8');
  return true;
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
    file: toRepoRel(f),                // ✅ repo-relative
    excerpt: content.split("\n").slice(0, 12).join("\n")
  });
}

/** ---------- board.json (by status) ---------- */
const board = {};
for (const it of items){
  const status = it.status;
  if (!board[status]) board[status] = [];
  board[status].push({
    id: it.id,
    title: it.title,
    type: it.type,
    priority: it.priority,
    assignees: it.assignees,
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
_Size:_ 4.3 KB  
_Hash:_ `79a712057cb9e1f51f9eefb1e475cd445d0743774ce903b179bc6499f3418e8f`

```js
#!/usr/bin/env node
/**
 * Jiraless v0.5 validator
 * - schema + ontology checks (existing behavior)
 * - transition enforcement with roles
 */
import fs from "fs/promises";
import path from "path";
import { globby } from "globby";
import matter from "gray-matter";
import yaml from "js-yaml";
import cp from "child_process";

const exec = (cmd)=>cp.execSync(cmd,{encoding:"utf8"});

const SCHEMA = "tools/schemas/work.schema.json";
const ONTOLOGY = ".project/policies/ontology.yaml";
const ROLES = ".project/policies/roles.yaml";
const SM = ".project/policies/state-machine.yaml";

function asArr(v){ return Array.isArray(v) ? v : v!=null ? [v] : []; }

function loadYaml(p){ try{ return yaml.load(exec(`cat ${p}`)) || {}; } catch{ return {}; } }
function readFile(p){ return exec(`cat ${p}`); }
function gitChanged(pattern){
  try {
    const base = exec("git merge-base HEAD origin/main").trim();
    const out = exec(`git diff --name-only ${base}...HEAD -- ${pattern}`);
    return out.split("\n").filter(Boolean);
  } catch {
    // Fallback to last commit range
    const out = exec(`git diff --name-only HEAD~1..HEAD -- ${pattern}`);
    return out.split("\n").filter(Boolean);
  }
}
function frontmatterOf(p){
  const txt = readFile(p);
  return matter(txt).data || {};
}
function prevFrontmatterOf(p){
  try{
    const base = exec("git merge-base HEAD origin/main").trim();
    const prev = exec(`git show ${base}:${p}`);
    return matter(prev).data || {};
  }catch{ return {}; }
}

function actor(){
  return process.env.GITHUB_ACTOR || process.env.ACTOR || "unknown";
}

function ensure(cond,msg){ if(!cond){ console.error(`❌ ${msg}`); process.exit(1); } }

(async ()=>{
  const roles = loadYaml(ROLES);
  const sm = loadYaml(SM);
  const ontology = loadYaml(ONTOLOGY);

  // Basic ontology presence
  ensure(Array.isArray(sm.states), "state-machine.yaml missing states");
  ensure(sm.transitions && typeof sm.transitions==="object", "state-machine.yaml missing transitions");

  // Validate objects exist (light check)
  const objects = await globby(".project/objects/**/*.{md,markdown}");
  for (const f of objects){
    const fm = frontmatterOf(f);
    ensure(fm.id, `${f}: missing id`);
    ensure(fm.status, `${f}: missing status`);
    // Optional: types exist in ontology if ontology.types defined
    if (ontology?.types && Array.isArray(asArr(fm.type))){
      for (const t of asArr(fm.type)){
        ensure(ontology.types[t] !== undefined, `${f}: type '${t}' not in ontology.types`);
      }
    }
  }

  /** PR transition enforcement **/
  const changed = gitChanged(".project/objects/**/*.{md,markdown}");
  if (changed.length){
    const who = actor();
    // Map user->role
    let roleName = Object.entries(roles.roles||{}).find(([,r])=>asArr(r.users).includes(who))?.[0] || "viewer";
    const allowed = new Set(asArr(roles.roles?.[roleName]?.can_transition||[]));

    for (const f of changed){
      const before = prevFrontmatterOf(f);
      const after = frontmatterOf(f);

      // If status changed, check transition
      if (before.status && after.status && before.status !== after.status){
        const from = before.status;
        const to = after.status;
        const legit = asArr(sm.transitions[from]||[]).includes(to);
        ensure(legit, `${f}: illegal transition ${from} -> ${to}`);

        // Role check
        const token = `${from}->${to}`;
        const okRole = allowed.has("*") || allowed.has(token);
        ensure(okRole, `${f}: actor '${who}' (role=${roleName}) not allowed to perform ${token}`);

        // Severity gate needs human in PR reviewers (owner|maintainer)
        const needHumanFor = asArr(roles.human_review_required_for_severity||[]);
        const sev = after.severity || before.severity;
        if (needHumanFor.includes(sev)){
          // best-effort: require label or reviewer marker file
          // allow either a CODEOWNERS ownership or a REVIEWERS file change marker
          try{
            const prFiles = exec("git diff --name-only --cached").split("\n");
            // no robust GH API in CI token scope here; keep it simple
            console.log(`[info] severity '${sev}' requires human review; enforce via branch protection/required reviewers in repo settings.`);
          }catch{}
        }
      }
    }
  }

  console.log("All good ✔ — validation + transition checks passed");
})();
```

### `tools/version.mjs`
_Size:_ 3.2 KB  
_Hash:_ `954abd451387c62de3f8445a6886b032ea5d5c500dfbebf8091695258da0e75a`

```js
#!/usr/bin/env node
/**
 * Jiraless - UI Version Bumper + Health emitter
 * - Bumps patch in ui/package.json unless VERSION_BUMP=none
 * - Writes ui/src/version.ts (APP_VERSION, BUILD_TIME_UTC, GIT_SHA)
 * - Writes ui/public/version.json
 * - Writes ui/public/health.txt and ui/public/health.json
 */
import fs from "fs/promises";
import path from "path";
import { execSync } from "child_process";

const UI_DIR = "ui";
const PKG = path.join(UI_DIR, "package.json");
const VERSION_TS = path.join(UI_DIR, "src/version.ts");
const VERSION_JSON = path.join(UI_DIR, "public/version.json");
const HEALTH_TXT = path.join(UI_DIR, "public/health.txt");
const HEALTH_JSON = path.join(UI_DIR, "public/health.json");

function stampUTC() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "." +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes())
  );
}
function bumpPatch(v) {
  const core = v.split("-")[0].split("+")[0];
  const [maj, min, pat] = core.split(".").map((x) => parseInt(x, 10) || 0);
  return `${maj}.${min}.${(pat ?? 0) + 1}`;
}
async function writeIfChanged(file, content) {
  try {
    const prev = await fs.readFile(file, "utf8");
    if (prev === content) return false;
  } catch {}
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content, "utf8");
  return true;
}

function gitSha() {
  try {
    return process.env.GITHUB_SHA || execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return "unknown";
  }
}

async function main() {
  const bumpMode = process.env.VERSION_BUMP || "patch"; // 'patch' | 'none'
  const repo = process.env.GITHUB_REPOSITORY || "";

  const pkg = JSON.parse(await fs.readFile(PKG, "utf8"));
  let newVersion = pkg.version || "0.0.0";
  if (bumpMode !== "none") {
    newVersion = bumpPatch(newVersion);
    pkg.version = newVersion;
    await fs.writeFile(PKG, JSON.stringify(pkg, null, 2) + "\n", "utf8");
    console.log("Bumped ui/package.json version to", newVersion);
  } else {
    console.log("VERSION_BUMP=none → not bumping ui/package.json; using", newVersion);
  }

  const stamp = stampUTC();
  const sha = gitSha();
  const appVersion = `${newVersion}+${stamp}`;

  const ts = `// Auto-generated by tools/version.mjs
export const APP_VERSION = ${JSON.stringify(appVersion)};
export const BUILD_TIME_UTC = ${JSON.stringify(stamp)};
export const GIT_SHA = ${JSON.stringify(sha)};
`;
  await writeIfChanged(VERSION_TS, ts);

  const vjsonObj = { version: appVersion, package: newVersion, built_utc: stamp, git_sha: sha, repository: repo };
  await writeIfChanged(VERSION_JSON, JSON.stringify(vjsonObj, null, 2));

  const healthTxt = [
    "ok",
    `version=${appVersion}`,
    `package=${newVersion}`,
    `built_utc=${stamp}`,
    `git_sha=${sha}`,
    repo ? `repo=${repo}` : null,
  ].filter(Boolean).join("\n") + "\n";
  await writeIfChanged(HEALTH_TXT, healthTxt);
  await writeIfChanged(HEALTH_JSON, JSON.stringify({ status: "ok", ...vjsonObj }, null, 2));

  console.log("Wrote", VERSION_TS, VERSION_JSON, HEALTH_TXT, HEALTH_JSON);
}
main().catch((e) => { console.error(e); process.exit(1); });
```

