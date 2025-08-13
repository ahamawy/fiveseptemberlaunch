#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const [,, code, slug] = process.argv;
if(!code || !slug){
  console.error('Usage: node SCRIPTS/generate-feature.mjs <feature-code> <feature-slug>');
  process.exit(1);
}
const dir = path.join('FEATURES', `${code}-${slug}`);
fs.mkdirSync(dir, { recursive: true });

const tmpl = fs.readFileSync('TEMPLATES/FEATURE_ATTRIBUTES_TEMPLATE.md', 'utf-8')
  .replaceAll('<feature-code>', code).replaceAll('<feature-slug>', slug);
fs.writeFileSync(path.join(dir, 'FEATURE.md'), tmpl, 'utf-8');

const claude = fs.readFileSync('TEMPLATES/CLAUDE_FEATURE_PROMPT_TEMPLATE.md', 'utf-8')
  .replaceAll('<feature-code>', code).replaceAll('<feature-slug>', slug);
fs.writeFileSync(path.join(dir, 'claude.md'), claude, 'utf-8');

const unit = fs.readFileSync('TEMPLATES/VITEST_SPEC_TEMPLATE.ts', 'utf-8')
  .replaceAll('<feature-code>', code).replaceAll('<feature-slug>', slug);
fs.mkdirSync(path.join(dir, 'tests'), { recursive: true });
fs.writeFileSync(path.join(dir, 'tests', 'unit.spec.ts'), unit, 'utf-8');

const e2e = fs.readFileSync('TEMPLATES/PLAYWRIGHT_SPEC_TEMPLATE.ts', 'utf-8')
  .replaceAll('<feature-code>', code).replaceAll('<feature-slug>', slug);
fs.writeFileSync(path.join(dir, 'tests', 'e2e.spec.ts'), e2e, 'utf-8');

console.log(`Scaffolded ${dir}`);
