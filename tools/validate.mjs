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