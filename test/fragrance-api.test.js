/**
 * Server-side tests for /api/fragrance handler.
 * Run: node test/fragrance-api.test.js
 * No dependencies — uses built-in assert.
 */
const assert = require('assert');
const handler = require('../api/fragrance');
const SCENTS = require('../data/scents-flat.json');
const fs = require('fs');

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

function mockReqRes(pathname) {
  const req = {
    url: pathname,
    headers: { host: 'scentmap.co' },
  };
  let _status = 200;
  let _headers = {};
  let _body = '';
  const res = {
    get statusCode() { return _status; },
    set statusCode(v) { _status = v; },
    setHeader(k, v) { _headers[k] = v; },
    end(body) { _body = body || ''; },
    getBody() { return _body; },
    getStatus() { return _status; },
    getHeaders() { return _headers; },
  };
  return { req, res };
}

// ── Valid fragrance ID ──────────────────────────────────────
console.log('\nSuite: Valid fragrance page');

const { req: r1, res: s1 } = mockReqRes('/fragrance/gypsy-water');
handler(r1, s1);

test('returns 200 with HTML content type', () => {
  assert.strictEqual(s1.getHeaders()['Content-Type'], 'text/html; charset=utf-8');
});

test('HTML contains correct <title>', () => {
  assert.ok(s1.getBody().includes('<title>Gypsy Water by Byredo'));
});

test('HTML contains canonical URL', () => {
  assert.ok(s1.getBody().includes('href="https://scentmap.co/fragrance/gypsy-water"'));
});

test('HTML contains JSON-LD Product schema', () => {
  const match = s1.getBody().match(/<script type="application\/ld\+json">(.*?)<\/script>/g);
  assert.ok(match && match.length >= 2, 'Expected at least 2 JSON-LD blocks');
  const productLd = JSON.parse(match[0].replace(/<\/?script[^>]*>/g, ''));
  assert.strictEqual(productLd['@type'], 'Product');
  assert.strictEqual(productLd.name, 'Gypsy Water');
  assert.strictEqual(productLd.brand.name, 'Byredo');
});

test('HTML contains FAQ JSON-LD with gift questions', () => {
  const match = s1.getBody().match(/<script type="application\/ld\+json">(.*?)<\/script>/g);
  const faqLd = JSON.parse(match[1].replace(/<\/?script[^>]*>/g, ''));
  assert.strictEqual(faqLd['@type'], 'FAQPage');
  const questions = faqLd.mainEntity.map(q => q.name);
  assert.ok(questions.some(q => q.includes('smell like')), 'Missing "smell like" question');
  assert.ok(questions.some(q => q.includes('similar')), 'Missing "similar" question');
  assert.ok(questions.some(q => q.includes('good gift')), 'Missing "good gift" question');
  assert.ok(questions.some(q => q.includes('What to get')), 'Missing "what to get" question');
});

test('HTML contains noscript fallback with notes', () => {
  const body = s1.getBody();
  assert.ok(body.includes('<noscript>'));
  assert.ok(body.includes('Juniper'));
  assert.ok(body.includes('Sandalwood'));
  assert.ok(body.includes('Gift This Fragrance'));
});

test('HTML contains OG meta tags', () => {
  const body = s1.getBody();
  assert.ok(body.includes('og:title'));
  assert.ok(body.includes('og:description'));
  assert.ok(body.includes('og:url'));
});

test('sets cache headers', () => {
  assert.ok(s1.getHeaders()['Cache-Control'].includes('s-maxage=86400'));
});

test('noscript contains Gift Intelligence quiz link', () => {
  assert.ok(s1.getBody().includes('/quiz/gift-intelligence'));
});

// ── Invalid fragrance ID ────────────────────────────────────
console.log('\nSuite: Invalid fragrance ID');

const { req: r2, res: s2 } = mockReqRes('/fragrance/nonexistent-perfume-xyz');
handler(r2, s2);

test('unknown ID returns app.html fallback (not 404)', () => {
  assert.ok(s2.getBody().includes('<html'), 'Expected HTML response');
  assert.strictEqual(s2.getStatus(), 200);
});

// ── Bad path ────────────────────────────────────────────────
console.log('\nSuite: Bad paths');

const { req: r3, res: s3 } = mockReqRes('/fragrance/');
handler(r3, s3);
test('no ID segment returns 404', () => {
  assert.strictEqual(s3.getStatus(), 404);
});

const { req: r4, res: s4 } = mockReqRes('/other/path');
handler(r4, s4);
test('wrong prefix returns 404', () => {
  assert.strictEqual(s4.getStatus(), 404);
});

// ── XSS prevention ─────────────────────────────────────────
console.log('\nSuite: XSS prevention');

const { req: r5, res: s5 } = mockReqRes('/fragrance/<script>alert(1)</script>');
handler(r5, s5);
test('XSS in ID does not inject script tags', () => {
  assert.ok(!s5.getBody().includes('<script>alert'));
});

// ── All fragrances produce valid output ─────────────────────
console.log('\nSuite: All 213 fragrances');

const ids = Object.keys(SCENTS);
let allValid = true;
let errorId = '';
ids.forEach(id => {
  const { req, res } = mockReqRes(`/fragrance/${id}`);
  try {
    handler(req, res);
    const body = res.getBody();
    if (!body.includes('<title>') || !body.includes('ld+json') || !body.includes('<noscript>')) {
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

// ── Sitemap integrity ───────────────────────────────────────
console.log('\nSuite: Sitemap coverage');

const sitemap = fs.readFileSync(require('path').join(__dirname, '..', 'sitemap.xml'), 'utf8');

test('every fragrance ID has a sitemap entry', () => {
  const missing = ids.filter(id => !sitemap.includes(`/fragrance/${id}`));
  assert.strictEqual(missing.length, 0, `Missing from sitemap: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`);
});

test('sitemap fragrance URLs use correct format', () => {
  const fragUrls = sitemap.match(/scentmap\.co\/fragrance\/[a-z0-9-]+/g) || [];
  assert.strictEqual(fragUrls.length, ids.length, `Expected ${ids.length} fragrance URLs, found ${fragUrls.length}`);
});

// ── Summary ─────────────────────────────────────────────────
console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
