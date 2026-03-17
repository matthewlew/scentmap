#!/usr/bin/env node
/**
 * Generates data/scents-flat.json — a flat lookup of all fragrances keyed by ID.
 * Used by Vercel Edge Middleware to inject SEO meta tags without loading per-brand files.
 *
 * Run: node scripts/build-flat-scents.js
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const index = JSON.parse(fs.readFileSync(path.join(dataDir, 'scents-index.json'), 'utf8'));
const flat = {};

for (const brand of index.brands) {
  const file = path.join(dataDir, 'scents', brand + '.json');
  const scents = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const s of scents) {
    flat[s.id] = {
      name: s.name,
      brand: s.brand,
      family: s.family,
      description: s.description || '',
      sillage: s.sillage,
      layering: s.layering,
      top: Array.isArray(s.top) ? s.top : s.top.split(',').map(n => n.trim()),
      mid: Array.isArray(s.mid) ? s.mid : s.mid.split(',').map(n => n.trim()),
      base: Array.isArray(s.base) ? s.base : s.base.split(',').map(n => n.trim()),
      roles: s.roles || []
    };
  }
}

const outPath = path.join(dataDir, 'scents-flat.json');
fs.writeFileSync(outPath, JSON.stringify(flat));
console.log(`Wrote ${Object.keys(flat).length} fragrances to ${outPath}`);
