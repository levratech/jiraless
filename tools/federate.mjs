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