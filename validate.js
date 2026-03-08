#!/usr/bin/env node
// Run: node validate.js
// Validates all scent files against known roles, families, and notes.

const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, 'data');

const VALID_FAMILIES = new Set([
  'woody','floral','amber','citrus','green','chypre','leather','oud','gourmand','resin'
]);

const index    = JSON.parse(fs.readFileSync(path.join(DATA, 'scents-index.json'), 'utf8'));
const notes    = JSON.parse(fs.readFileSync(path.join(DATA, 'notes.json'), 'utf8'));
const roles    = JSON.parse(fs.readFileSync(path.join(DATA, 'roles.json'), 'utf8'));

const VALID_ROLES = new Set(roles.map(r => r.id));
const KNOWN_NOTES = new Set(notes.map(n => n.name.toLowerCase()));

let errors = 0;
let warnings = 0;
const ids = new Set();

index.brands.forEach(brand => {
  const file = path.join(DATA, 'scents', `${brand}.json`);
  if (!fs.existsSync(file)) {
    console.error(`ERROR: Missing file data/scents/${brand}.json`);
    errors++;
    return;
  }

  let frags;
  try {
    frags = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`ERROR: Invalid JSON in data/scents/${brand}.json — ${e.message}`);
    errors++;
    return;
  }

  if (!Array.isArray(frags)) {
    console.error(`ERROR: data/scents/${brand}.json must be a JSON array`);
    errors++;
    return;
  }

  frags.forEach((f, i) => {
    const ref = `${brand}[${i}] (${f.id || '?'})`;

    // Required fields
    ['id','brand','name','family','description'].forEach(field => {
      if (!f[field]) { console.error(`ERROR: ${ref}: missing required field "${field}"`); errors++; }
    });
    if (!Array.isArray(f.top) || !Array.isArray(f.mid) || !Array.isArray(f.base)) {
      console.error(`ERROR: ${ref}: top/mid/base must be arrays`); errors++;
    }
    if (!Array.isArray(f.roles) || f.roles.length === 0) {
      console.error(`ERROR: ${ref}: roles must be a non-empty array`); errors++;
    }
    if (typeof f.sillage !== 'number' || typeof f.layering !== 'number') {
      console.error(`ERROR: ${ref}: sillage and layering must be numbers`); errors++;
    }

    // Duplicate IDs
    if (f.id) {
      if (ids.has(f.id)) { console.error(`ERROR: ${ref}: duplicate id "${f.id}"`); errors++; }
      else ids.add(f.id);
    }

    // Valid family
    if (f.family && !VALID_FAMILIES.has(f.family)) {
      console.error(`ERROR: ${ref}: invalid family "${f.family}" — valid: ${[...VALID_FAMILIES].join(', ')}`);
      errors++;
    }

    // Valid roles
    if (Array.isArray(f.roles)) {
      f.roles.forEach(r => {
        if (!VALID_ROLES.has(r)) {
          console.error(`ERROR: ${ref}: invalid role "${r}" — valid: ${[...VALID_ROLES].join(', ')}`);
          errors++;
        }
      });
    }

    // Unknown notes (warn only — notes.json may not be exhaustive)
    if (Array.isArray(f.top) && Array.isArray(f.mid) && Array.isArray(f.base)) {
      [...f.top, ...f.mid, ...f.base].forEach(n => {
        if (!KNOWN_NOTES.has(n.toLowerCase())) {
          console.warn(`  WARN: ${ref}: unknown note "${n}" (not in notes.json)`);
          warnings++;
        }
      });
    }
  });

  console.log(`  ✓ ${brand}.json — ${frags.length} fragrances`);
});

console.log('');
if (errors) {
  console.error(`✗ ${errors} error(s)${warnings ? `, ${warnings} warning(s)` : ''} — fix before deploying`);
  process.exit(1);
} else {
  console.log(`✓ All valid${warnings ? ` (${warnings} warning(s) — review unknown notes)` : ''}`);
}
