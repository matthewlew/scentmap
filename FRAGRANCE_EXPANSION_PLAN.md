# Fragrance Expansion Plan — Tier 1 + Tier 2

## Goal
Add ~55 new fragrances across 10 brands in two tiers:
- **Tier 1** (~31 frags): Mainstream brands people already own and will search for
- **Tier 2** (~24 frags): Well-documented craft niche brands with solid Fragrantica coverage

The catalog currently has 220 fragrances across 18 brands. Target: ~275 frags, 28 brands.

**Removed from original plan:** Nishane (Turkish brand, sparse English-language note data) and obscure entries from Penhaligon's and L'Artisan Parfumeur where Fragrantica coverage is thin.

---

## Process Doc
See `FRAGRANCE_EXPANSION_PLAN.md` alongside `data/scents.json` for schema reference.
Full process: each entry needs 13 fields — `id`, `brand`, `name`, `family`, `sillage`, `layering`, `top`, `mid`, `base`, `roles`, `description`, `story`, `url`.

**Quick schema reminder:**
- `id`: kebab-case from name only (not brand), unique, `/^[a-z0-9-]+$/`
- `family`: one of `citrus green floral woody amber chypre aquatic leather gourmand oud`
- `sillage` / `layering`: integer 0–10, default **5** if uncertain
- `roles`: 1–2 from `casual signature intimate creative work heat formal cold`
- `description`: 1–2 sentences, 80–200 chars, sensory + use case, no brand mention, no markdown
- `story`: `""` unless you have a real brand quote
- `url`: `""` unless you have the real product URL

---

## Batch Generation Prompt

Use this prompt with Claude (one brand at a time) to generate all JSON entries:

```
Generate fragrance database entries for [BRAND] for this list of fragrances:
[LIST NAMES]

Return a JSON array. Each entry must have exactly these 13 fields:
{
  "id": "<kebab-case from name only, not brand>",
  "brand": "<exact brand name>",
  "name": "<exact fragrance name>",
  "family": "<one of: citrus|green|floral|woody|amber|chypre|aquatic|leather|gourmand|oud>",
  "sillage": <integer 0-10>,
  "layering": <integer 0-10>,
  "top": ["<Note>", "<Note>"],
  "mid": ["<Note>", "<Note>"],
  "base": ["<Note>", "<Note>"],
  "roles": ["<1-2 of: casual|signature|intimate|creative|work|heat|formal|cold>"],
  "description": "<1-2 sentences, 80-200 chars, sensory + use case, no brand mention>",
  "story": "",
  "url": ""
}

Rules:
- sillage/layering default to 5 if uncertain
- top/mid/base: 2-4 notes each, each note capitalized (e.g. "Pink Pepper" not "pink pepper")
- roles: max 2, pick the strongest fit
- description: start with a sensory descriptor, end with use case or audience
- No markdown in description
- Return only valid JSON array, no commentary
```

---

## Tier 1 — Mainstream / High-Ownership Brands

### YSL — 5 fragrances
```
Brand: Yves Saint Laurent
Fragrances:
- Black Opium
- Libre
- Mon Paris
- Opium
- Y
```

### Jo Malone — 6 fragrances
```
Brand: Jo Malone London
Fragrances:
- Wood Sage & Sea Salt
- Lime Basil & Mandarin
- Peony & Blush Suede
- English Pear & Freesia
- Velvet Rose & Oud
- Myrrh & Tonka
```

### Gucci — 5 fragrances
```
Brand: Gucci
Fragrances:
- Bloom
- Guilty Pour Femme
- Mémoire d'une Odeur
- Flora Gorgeous Gardenia
- Guilty Pour Homme
```

### Paco Rabanne — 4 fragrances
```
Brand: Paco Rabanne
Fragrances:
- 1 Million
- Olympéa
- Invictus
- Pure XS
```

### Lancôme — 4 fragrances
```
Brand: Lancôme
Fragrances:
- La Vie Est Belle
- Idôle
- Trésor
- La Nuit Trésor
```

### Marc Jacobs — 4 fragrances
```
Brand: Marc Jacobs
Fragrances:
- Daisy
- Dot
- Lola
- Honey
```

### Viktor&Rolf — 3 fragrances (expand from existing Spicebomb)
```
Brand: Viktor&Rolf
Fragrances:
- Flowerbomb
- Bonbon
- Flowerbomb Nectar
```

---

## Tier 2 — Craft Niche Brands

### Frederic Malle — 8 fragrances
```
Brand: Frederic Malle
Fragrances:
- Portrait of a Lady
- Carnal Flower
- Musc Ravageur
- Noir Epices
- En Passant
- Lipstick Rose
- Geranium pour Monsieur
- Eau de Magnolia
```

### Serge Lutens — 8 fragrances (expand from existing entry)
```
Brand: Serge Lutens
Fragrances:
- Ambre Sultan
- Chergui
- Feminité du Bois
- Borneo 1834
- Fleurs d'Oranger
- Sa Majesté la Rose
- Fumerie Turque
- Santal Majuscule
```

### Penhaligon's — 3 fragrances
Well-documented entries only. Halfeti is the cult breakout; Endymion and Lord George have solid Fragrantica coverage.
```
Brand: Penhaligon's
Fragrances:
- Halfeti
- Endymion
- The Tragedy of Lord George
```

### L'Artisan Parfumeur — 4 fragrances (expand from existing entry)
Classic-era frags only — all have deep Fragrantica entries and community documentation.
```
Brand: L'Artisan Parfumeur
Fragrances:
- Mûre et Musc
- Premier Figuier
- Timbuktu
- Dzing!
```

---

## Execution Steps

### Step 1 — Generate JSON (per brand, one at a time)
Use the batch prompt above with Claude. Generate one brand at a time. Copy each result into a staging area.

### Step 2 — ID collision check
Before adding to `data/scents.json`, confirm no ID conflicts:
```bash
node -e "
const s = require('./data/scents.json');
const ids = s.map(f => f.id);
const newIds = [/* paste new IDs here */];
const dupes = newIds.filter(id => ids.includes(id));
console.log('Duplicates:', dupes);
"
```

### Step 3 — Add to scents.json
Append all new entries to the array in `data/scents.json`. Maintain valid JSON (no trailing commas).


### Step 4 — Run tests
```bash
node test/fragrance-api.test.js
```
All 16 assertions must pass. Fix any failures before proceeding.

### Step 5 — Sync and verify in browser
```bash
cp /Users/matthewlewair/Documents/scentmap/data/scents.json /tmp/scentmap-copy/data/scents.json
```
Then cache-bust: `http://localhost:3001/?v=<timestamp>`

Spot-check:
- Search "Black Opium" → appears in catalog
- Search "Portrait of a Lady" → appears in catalog
- Open detail panel → all fields render correctly
- Compare two new frags → similarity score works

### Step 6 — Update CHANGELOG.md
```markdown
## YYYY-MM-DD

### Added
- Tier 1 brands: Yves Saint Laurent (5), Jo Malone London (6), Gucci (5), Paco Rabanne (4), Lancôme (4), Marc Jacobs (4), Viktor&Rolf +3
- Tier 2 brands: Frederic Malle (8), Serge Lutens +8, Penhaligon's (3), L'Artisan Parfumeur +4
- Total: ~55 new fragrances, catalog grows from 220 → ~275
```

### Step 7 — Commit
```bash
git add data/scents.json data/scents-flat.json CHANGELOG.md
git commit -m "feat: add 55 fragrances across 10 brands (tier-1 mainstream + tier-2 craft niche)"
```

---

## IDs to watch for conflicts

These names are common and may collide with existing entries:
- `bloom` — check if used
- `opium` — check if used
- `daisy` — check if used
- `noir` (multiple frags across brands contain "noir") — use full name: `black-opium`, `la-nuit-tresor`
- `libre` — check if used

Naming rule: use the fragrance name only (not brand) in kebab-case, stripped of accents.
Examples:
- "Black Opium" → `black-opium`
- "La Vie Est Belle" → `la-vie-est-belle`
- "Mémoire d'une Odeur" → `memoire-dune-odeur`
- "Mûre et Musc" → `mure-et-musc`
- "Halfeti" → `halfeti`
- "Portrait of a Lady" → `portrait-of-a-lady`
- "1 Million" → `1-million`
- "Feminité du Bois" → `feminite-du-bois`
