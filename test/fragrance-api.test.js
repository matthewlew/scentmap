/**
 * Tests for the static fragrance page build (scripts/lib/fragrance-seo.js +
 * scripts/build-static.js). Replaces the old Vercel-serverless-handler tests
 * now that GitHub Pages serves pre-rendered static HTML instead.
 * Run: node test/fragrance-api.test.js
 * No dependencies — uses built-in assert.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { buildFragranceSEO, SCENTS } = require('../scripts/lib/fragrance-seo');

const SITE = 'https://matthewlew.github.io/scentmap';
const ids = Object.keys(SCENTS);

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (e) {
    failed++;
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    ${e.message}`);
  }
}

// ── Valid fragrance ID ──────────────────────────────────────
console.log('\nSuite: Valid fragrance page');

const seo = buildFragranceSEO('gypsy-water', SITE);

test('returns SEO payload for known ID', () => {
  assert.ok(seo);
});

test('title is correct', () => {
  assert.ok(seo.titleText.startsWith('Gypsy Water by Byredo'));
});

test('canonical URL is correct', () => {
  assert.strictEqual(seo.canonicalUrl, `${SITE}/fragrance/gypsy-water`);
});

test('JSON-LD Product schema is present and correct', () => {
  const productLd = JSON.parse(seo.jsonLd);
  assert.strictEqual(productLd['@type'], 'Product');
  assert.strictEqual(productLd.name, 'Gypsy Water');
  assert.strictEqual(productLd.brand.name, 'Byredo');
});

test('FAQ JSON-LD contains gift questions', () => {
  const faqLd = JSON.parse(seo.faqLd);
  assert.strictEqual(faqLd['@type'], 'FAQPage');
  const questions = faqLd.mainEntity.map(q => q.name);
  assert.ok(questions.some(q => q.includes('smell like')), 'Missing "smell like" question');
  assert.ok(questions.some(q => q.includes('similar')), 'Missing "similar" question');
  assert.ok(questions.some(q => q.includes('good gift')), 'Missing "good gift" question');
  assert.ok(questions.some(q => q.includes('What to get')), 'Missing "what to get" question');
});

test('noscript fallback contains notes', () => {
  assert.ok(seo.noscriptContent.includes('<noscript>'));
  assert.ok(seo.noscriptContent.includes('Juniper'));
  assert.ok(seo.noscriptContent.includes('Sandalwood'));
  assert.ok(seo.noscriptContent.includes('Gift This Fragrance'));
});

test('noscript contains Gift Intelligence quiz link', () => {
  assert.ok(seo.noscriptContent.includes('/quiz/gift-intelligence'));
});

// ── Invalid fragrance ID ────────────────────────────────────
console.log('\nSuite: Invalid fragrance ID');

test('unknown ID returns null (caller falls back to app.html)', () => {
  assert.strictEqual(buildFragranceSEO('nonexistent-perfume-xyz', SITE), null);
});

// ── XSS prevention ─────────────────────────────────────────
console.log('\nSuite: XSS prevention');

test('XSS in ID does not crash and produces no unknown fragrance', () => {
  assert.strictEqual(buildFragranceSEO('<script>alert(1)</script>', SITE), null);
});

// ── All fragrances produce valid output ─────────────────────
console.log('\nSuite: All 213 fragrances');

let allValid = true;
let errorId = '';
ids.forEach(id => {
  try {
    const s = buildFragranceSEO(id, SITE);
    if (!s || !s.titleText || !s.jsonLd || !s.noscriptContent.includes('<noscript>')) {
      allValid = false;
      errorId = id;
    }
  } catch (e) {
    allValid = false;
    errorId = `${id}: ${e.message}`;
  }
});
test(`all ${ids.length} fragrances render without error`, () => {
  assert.ok(allValid, `Failed on: ${errorId}`);
});

// ── Static build output ─────────────────────────────────────
console.log('\nSuite: Static build output (scripts/build-static.js)');

const fragDir = path.join(__dirname, '..', 'fragrance');

test('every fragrance has a pre-rendered static page', () => {
  const missing = ids.filter(id => !fs.existsSync(path.join(fragDir, id, 'index.html')));
  assert.strictEqual(missing.length, 0, `Missing static pages for: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`);
});

test('a fragrance page contains title, JSON-LD, and noscript content', () => {
  const body = fs.readFileSync(path.join(fragDir, 'gypsy-water', 'index.html'), 'utf8');
  assert.ok(body.includes('<title>Gypsy Water by Byredo'));
  assert.ok(body.includes('ld+json'));
  assert.ok(body.includes('<noscript>'));
  assert.ok(body.includes(`href="${SITE}/fragrance/gypsy-water"`));
});

// ── Sitemap integrity ───────────────────────────────────────
console.log('\nSuite: Sitemap coverage');

const sitemap = fs.readFileSync(path.join(__dirname, '..', 'sitemap.xml'), 'utf8');

test('every fragrance ID has a sitemap entry', () => {
  const missing = ids.filter(id => !sitemap.includes(`/fragrance/${id}`));
  assert.strictEqual(missing.length, 0, `Missing from sitemap: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`);
});

test('sitemap fragrance URLs use correct format', () => {
  const fragUrls = sitemap.match(/matthewlew\.github\.io\/scentmap\/fragrance\/[a-z0-9-]+/g) || [];
  assert.strictEqual(fragUrls.length, ids.length, `Expected ${ids.length} fragrance URLs, found ${fragUrls.length}`);
});

// ── Summary ─────────────────────────────────────────────────
console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
