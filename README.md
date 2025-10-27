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
