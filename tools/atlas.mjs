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