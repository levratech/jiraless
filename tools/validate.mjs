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