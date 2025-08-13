#!/usr/bin/env node
// naive checker that fails if FEATURE.md lacks 'RLS' section
import fs from 'node:fs';
const dir = 'FEATURES';
const walk = (p) => fs.readdirSync(p, { withFileTypes: true }).flatMap(d => {
  const full = `${p}/${d.name}`;
  return d.isDirectory() ? walk(full) : [full];
});
const features = (fs.existsSync(dir) ? walk(dir) : []).filter(f=>/FEATURE\.md$/.test(f));
let ok = true;
for(const f of features){
  const txt = fs.readFileSync(f,'utf-8');
  if(!/RLS/.test(txt)){ console.error(`Missing RLS section in ${f}`); ok = false; }
}
process.exit(ok ? 0 : 1);
