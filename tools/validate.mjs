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