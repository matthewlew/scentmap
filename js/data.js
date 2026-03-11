// ── data.js ────────────────────────────────────────────────────────────────
// Static reference data: roles, families, compatibility, notes, catalog.
// CAT is loaded from data/scents.json; notes/top/mid/base are parsed
// from comma-delimited strings into arrays here.

export const ROLES = [
  { id:'casual',    sym:'♥', name:'Casual',       desc:'Reach for it without thinking',
    symLine:'♥ signals ease — worn without occasion or deliberation.',
    long:'Worn daily without occasion — the fragrance you put on before leaving without deliberate thought. Its emotional register is low-key comfort: familiar, undemanding, and sociable. Unlike Signature, which projects identity, Casual simply inhabits your skin without asking anything of the room.' },
  { id:'signature', sym:'♠', name:'Signature',    desc:"The one that's unmistakably you",
    symLine:'♠ signals intent — a consistent claim about who you are.',
    long:"The fragrance people associate with your presence — worn consistently enough that it becomes part of how you're remembered. It carries intentionality: this is a considered choice rather than a default. It differs from Casual in that it makes a quiet claim about identity, and from Formal in that it works across contexts." },
  { id:'intimate',  sym:'✿', name:'Intimate',     desc:'For close quarters and quiet moments',
    symLine:'✿ signals proximity — a fragrance meant to be discovered, not announced.',
    long:'Designed for proximity — worn when physical closeness is expected or desired. Sillage is deliberately restrained; the fragrance rewards being near. Emotionally it reads as warmth, invitation, and vulnerability. Distinct from Casual in intentionality, and from Signature in being context-specific rather than all-day.' },
  { id:'creative',  sym:'✦', name:'Creative',     desc:'Conversation-starting, rule-breaking',
    symLine:'✦ signals curiosity — something unusual enough to prompt a question.',
    long:"Worn when the fragrance itself is the point — unusual materials, unexpected progressions, compositions that refuse easy categorisation. The emotional register is curiosity and confidence. Unlike Signature, it isn't worn often; unlike Formal, it doesn't need to be appropriate — it needs to be interesting." },
  { id:'work',      sym:'♣', name:'Professional', desc:'Present but never imposing',
    symLine:"♣ signals restraint — respect for shared space you didn't choose.",
    long:'Calibrated for shared spaces where consent to smell it has not been given. It projects just enough to be noticed as grooming rather than statement. The intention is respect: your fragrance should not enter a meeting before you do. Differs from Casual in restraint, and from Signature in that legibility matters less than courtesy.' },
  { id:'heat',      sym:'♦', name:'Summer',       desc:'Survives warmth, stays fresh',
    symLine:'♦ signals adaptation — chemistry chosen for what heat does to it.',
    long:'Heat amplifies projection dramatically, so this role demands compositions that remain pleasant under pressure. Fresh, aquatic, and citrus profiles are natural fits; heavy amber and oud typically wrong. Emotionally it maps to ease and lightness. Unlike Casual, the choice here is constrained by chemistry, not just mood.' },
  { id:'formal',    sym:'★', name:'Formal',       desc:'Walk into a room wearing it',
    symLine:'★ signals occasion — worn when fragrance is understood as part of dress.',
    long:"Reserved for occasions where fragrance is understood as part of dress — events, dinners, ceremony. Higher sillage is acceptable because the social contract anticipates it. Emotionally it registers as intent and occasion-awareness. Unlike Signature, it isn't worn constantly; unlike Creative, it must read as appropriate before interesting." },
  { id:'cold',      sym:'❄', name:'Winter',       desc:'Heavy, rich, built for cold air',
    symLine:'❄ signals density — materials that need cold air to find their best expression.',
    long:'Cold air suppresses projection, so this role demands density — resins, woods, leather, and oud that need ambient warmth to open fully. Worn in autumn and winter when richer materials find their best expression. The emotional register is gravitas and enclosure. The inverse of Summer: where that role demands restraint, this one rewards depth.' },
];
export const RM = Object.fromEntries(ROLES.map(r => [r.id, r]));

export const FAM = {
  citrus:   { label:'Citrus',   color:'#9A6800', desc:'Bright and fleeting. Pressed from rinds — bergamot, lemon, grapefruit. Often the first thing you smell, and the first to fade. Works in heat; rarely works alone.' },
  green:    { label:'Green',    color:'#1A6030', desc:'Crisp, alive, and vegetal — cut grass, fig leaf, violet leaf. The smell of growing things rather than flowering ones. Fresh but rooted.' },
  floral:   { label:'Floral',   color:'#902050', desc:'Derived from flowers — rose, jasmine, tuberose, iris. The broadest family. Ranges from powdery and romantic to bright and dewy. The backbone of most commercial perfumery.' },
  woody:    { label:'Woody',    color:'#6E3210', desc:'Dry, earthy warmth from woods and roots — cedar, sandalwood, vetiver, patchouli. A broad family spanning cool dry cedar to rich creamy sandalwood.' },
  amber:    { label:'Amber',    color:'#984000', desc:'Warm, resinous, and slightly sweet. Labdanum, benzoin, vanilla, resins. Rich base materials that linger for hours. The classic "oriental" register.' },
  chypre:   { label:'Chypre',   color:'#285438', desc:'A structured accord: bergamot up top, labdanum at the base, oakmoss in the heart. Earthy, sophisticated, mossy. Named after Cyprus; backbone of classic perfumery.' },
  aquatic:  { label:'Aquatic',  color:'#0A4880', desc:'Marine, watery, ozonic. Invented in the 1990s. The smell of imagined sea air — ozone, salt, and calone — rather than actual ocean. Fresh and weightless.' },
  leather:  { label:'Leather',  color:'#42200E', desc:'Reconstructed from birch tar, labdanum, and castoreum. Dry, dark, slightly smoky. Evokes tanned hides, saddles, and worn books. Difficult to wear casually.' },
  gourmand: { label:'Gourmand', color:'#7C4C00', desc:'Edible-smelling notes — vanilla, caramel, tonka, praline. Emerged in the 1990s. Warm, sweet, and comforting. Fragrance as food memory.' },
  oud:      { label:'Oud',      color:'#4A1850', desc:'Dark, animalic resin from infected agarwood. Deep, smoky, and complex. The most prized raw material in Arabian perfumery — priced by weight, not volume. Polarising.' },
  resin:    { label:'Resin',    color:'#5C2E00', desc:'Warm, sweet, and balsamic tree secretions — copal, frankincense, elemi. Adds richness and ceremonial depth.' },
};
export const FAM_ORDER = ['floral','amber','citrus','woody','chypre','gourmand','green','oud','leather','aquatic','resin'];

export const FAM_COMPAT = {
  woody:    { woody:.7, floral:.8, amber:.9, citrus:.6, leather:.8, oud:.9,  green:.6, chypre:.7, gourmand:.5 },
  floral:   { woody:.8, floral:.5, amber:.7, citrus:.7, leather:.5, oud:.6,  green:.8, chypre:.8, gourmand:.5 },
  amber:    { woody:.9, floral:.7, amber:.5, citrus:.4, leather:.8, oud:.9,  green:.4, chypre:.6, gourmand:.8 },
  citrus:   { woody:.6, floral:.7, amber:.4, citrus:.4, leather:.4, oud:.3,  green:.9, chypre:.7, gourmand:.3 },
  leather:  { woody:.8, floral:.5, amber:.8, citrus:.4, leather:.4, oud:.9,  green:.5, chypre:.7, gourmand:.4 },
  oud:      { woody:.9, floral:.6, amber:.9, citrus:.3, leather:.9, oud:.3,  green:.3, chypre:.5, gourmand:.6 },
  green:    { woody:.6, floral:.8, amber:.4, citrus:.9, leather:.5, oud:.3,  green:.4, chypre:.9, gourmand:.3 },
  chypre:   { woody:.7, floral:.8, amber:.6, citrus:.7, leather:.7, oud:.5,  green:.9, chypre:.4, gourmand:.4 },
  gourmand: { woody:.5, floral:.5, amber:.8, citrus:.3, leather:.4, oud:.6,  green:.3, chypre:.4, gourmand:.4 },
  resin:    { woody:.8, floral:.5, amber:.9, citrus:.3, leather:.6, oud:.9,  green:.3, chypre:.5, gourmand:.6 },
};

// Parse a comma-delimited notes string into a trimmed array
function parseNotes(str) {
  if (!str) return [];
  if (Array.isArray(str)) return str;
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

// CAT and CAT_MAP are mutated in place by initData() so that all modules
// that import them as live bindings see the populated data after await.
export const CAT = [];
export const CAT_MAP = {};

export async function initData() {
  const res = await fetch('data/scents.json');
  const raw = await res.json();
  const parsed = raw.map(f => ({
    ...f,
    top:  parseNotes(f.top),
    mid:  parseNotes(f.mid),
    base: parseNotes(f.base),
  }));
  // Mutate in place — never reassign, so imported references stay valid
  CAT.length = 0;
  CAT.push(...parsed);
  Object.keys(CAT_MAP).forEach(k => delete CAT_MAP[k]);
  parsed.forEach(f => { CAT_MAP[f.id] = f; });
}

// Note index — static, not loaded from JSON
export const NI = [
  {name:'African Violet',    family:'floral',  desc:'A soft, powdery violet with a delicate watery quality — warmer and rounder than common violet leaf.'},
  {name:'Aldehydes',         family:'floral',  desc:'Synthetic molecules producing clean, soapy, waxy brightness — powdery and luminous.'},
  {name:'Amber',             family:'amber',   desc:'A warm resinous accord of labdanum, benzoin, and vanilla. Rich, golden, slightly powdery.'},
  {name:'Ambrette',          family:'floral',  desc:'Seed of the musk mallow. Musky, slightly nutty, subtly floral — a natural musk substitute.'},
  {name:'Bergamot',          family:'citrus',  desc:'Cold-pressed from a sour Italian citrus rind. Bright, clean, slightly floral.'},
  {name:'Birch',             family:'woody',   desc:'Smoky, tar-like, and leathery. Used in small doses for a cool forest-smoke effect.'},
  {name:'Black Currant',     family:'chypre',  desc:'Sharp, tart, slightly catty. The leaf is more vegetal — green and sulfurous.'},
  {name:'Blackcurrant Leaf', family:'chypre',  desc:'More vegetal and green than the fruit — sharp, slightly sulfurous, intensely natural.'},
  {name:'Cardamom',          family:'amber',   desc:'Spicy, camphoraceous, slightly eucalyptus-like. Warm without being sweet.'},
  {name:'Cedar',             family:'woody',   desc:'Clean, dry, pencil-shaving woody note. Virginia Cedar lighter; Atlas Cedar creamier.'},
  {name:'Cedar Milk',        family:'woody',   desc:'A creamy, soft cedar variant — milky and smooth rather than dry and sharp.'},
  {name:'Cedarwood',         family:'woody',   desc:'Deeper and warmer than cedar. Slightly sweet, balsamic, and smooth.'},
  {name:'Clove',             family:'amber',   desc:'Spicy, sharp, eugenol-forward. Dense and slightly medicinal.'},
  {name:'Coconut Water',     family:'gourmand',desc:'Light, slightly sweet aquatic note with tropical softness.'},
  {name:'Cyclamen',          family:'floral',  desc:'Delicate, watery floral with a slightly metallic edge.'},
  {name:'Cypress',           family:'woody',   desc:'Resinous, dry, slightly smoky. Austere, cool, bitter-green.'},
  {name:'Driftwood',         family:'woody',   desc:'Sun-bleached, salt-worn wood. Dry, slightly marine.'},
  {name:'Fig Leaf',          family:'green',   desc:'Sharper and more vegetal than fig fruit — green, slightly tart, milky at the edges.'},
  {name:'Fig Milk',          family:'green',   desc:'The milky sap of the fig tree — softly creamy, slightly bitter.'},
  {name:'Fig Wood',          family:'woody',   desc:'Dry, slightly dusty woody note from the inner branches.'},
  {name:'Geranium',          family:'floral',  desc:'Rose-like but sharper — minty, green, slightly metallic.'},
  {name:'Ginger',            family:'amber',   desc:'Sharp, warm, slightly woody spice. Drier than cardamom.'},
  {name:'Grapefruit',        family:'citrus',  desc:'Bright, bitter-sweet citrus with a slightly waxy quality.'},
  {name:'Green Fig',         family:'green',   desc:'Unripe fig — crisp, tart, green. Less creamy than ripe fig.'},
  {name:'Green Tea',         family:'green',   desc:'Dry, slightly tannic, clean with subtle grassiness. Cooling.'},
  {name:'Hinoki',            family:'woody',   desc:'Japanese cypress wood. Warm, slightly lemony, and clean.'},
  {name:'Incense',           family:'oud',     desc:'Smoky, resinous, slightly sweet. From burning resins — meditative and ancient.'},
  {name:'Iris',              family:'floral',  desc:'Powdery, slightly earthy, and cool. From orris root.'},
  {name:'Ivy',               family:'green',   desc:'Crisp, clean, slightly bitter green. Herbaceous and watery.'},
  {name:'Ivy Leaf',          family:'green',   desc:'Cool, slightly metallic green with watery bitterness.'},
  {name:'Jasmine',           family:'floral',  desc:'Rich, indolic white floral. Slightly animalic and dense.'},
  {name:'Juniper',           family:'woody',   desc:'Dry, piney, slightly peppery. Northern forests, cold air.'},
  {name:'Labdanum',          family:'amber',   desc:'A dark, resinous gum from cistus plants. Warm, animalic, amber-like.'},
  {name:'Lavender',          family:'green',   desc:'Herbaceous, slightly camphorous, softly floral.'},
  {name:'Leather',           family:'leather', desc:'A dry, slightly smoky accord evocative of new leather.'},
  {name:'Lemon',             family:'citrus',  desc:'Bright, sharp, clean citrus. One of the most universally used top notes.'},
  {name:'Magnolia',          family:'floral',  desc:'Fresh, lightly spiced white floral with a hint of citrus.'},
  {name:'Mandarin',          family:'citrus',  desc:'Sweeter and softer than orange — gentle citrus with a slightly floral undertone.'},
  {name:'Marigold',          family:'floral',  desc:'Warm, slightly herbal floral with a tart, tomato-leaf edge.'},
  {name:'Mate',              family:'green',   desc:'Dry, slightly smoky, tea-like. From yerba mate.'},
  {name:'Mint',              family:'green',   desc:'Cool, camphoraceous, and sharp. Immediately refreshing.'},
  {name:'Musk',              family:'floral',  desc:'A broad category of skin-like base notes — clean, animalic, or transparent.'},
  {name:'Muslin',            family:'floral',  desc:'A soft, clean textile accord — lightly powdery, slightly soapy.'},
  {name:'Neroli',            family:'floral',  desc:'Orange blossom distillate — clean, slightly honeyed, gently spicy.'},
  {name:'Orange Blossom',    family:'floral',  desc:'White floral, honeyed, slightly indolic. More intense and waxy than neroli.'},
  {name:'Oud',               family:'oud',     desc:'Resinous heartwood of infected agarwood. Smoky, dark, and complex.'},
  {name:'Palisander',        family:'woody',   desc:'Brazilian rosewood. Warm, slightly sweet, and smooth.'},
  {name:'Papyrus',           family:'woody',   desc:'Dry, slightly dusty, reedy — evocative of aged paper and river grasses.'},
  {name:'Patchouli',         family:'chypre',  desc:'Dark, earthy, slightly sweet. Improves with age.'},
  {name:'Peach',             family:'gourmand',desc:'Soft, ripe, slightly velvety. A gentle fruity modifier.'},
  {name:'Pepper',            family:'amber',   desc:'Sharp, dry, slightly smoky. Black pepper adds bite; pink fruitier.'},
  {name:'Petitgrain',        family:'citrus',  desc:'From leaves and twigs of the bitter orange tree. Woody, green, slightly floral.'},
  {name:'Pine',              family:'woody',   desc:'Resinous, fresh, slightly camphoraceous. Cold forests.'},
  {name:'Pink Pepper',       family:'amber',   desc:'Fruity, slightly spicy, and rosy. Less harsh than black pepper.'},
  {name:'Plum',              family:'gourmand',desc:'Dark, jammy, slightly fermented. Adds depth to amber compositions.'},
  {name:'Queen of the Night',family:'floral',  desc:'A rare nocturnal cactus flower — intensely sweet, creamy, intoxicating.'},
  {name:'Resin',             family:'amber',   desc:'Warm, sweet, and balsamic tree secretions. Adds richness and longevity.'},
  {name:'Rose',              family:'floral',  desc:'The most iconic floral. From fresh Turkish to dark Bulgarian absolute.'},
  {name:'Rosewood',          family:'woody',   desc:'Sweet, slightly floral woody note with a rose-cedar character.'},
  {name:'Rum',               family:'gourmand',desc:'Warm, slightly sweet, and alcoholic. Adds boozy character to amber.'},
  {name:'Salted Amber',      family:'amber',   desc:'Amber with a mineral sea-salt accord — golden and resinous.'},
  {name:'Sandalwood',        family:'woody',   desc:'Creamy, warm, slightly milky. Mysore sandalwood is most prized.'},
  {name:'Sapodilla',         family:'gourmand',desc:'A tropical fruit note — sweet, caramel-brown, slightly smoky.'},
  {name:'Tea',               family:'green',   desc:'Dry, slightly tannic, clean. Green tea more vegetal; black tea warmer.'},
  {name:'Tobacco',           family:'leather', desc:'Warm, slightly sweet, hay-like. Dry tobacco austere; flower softer.'},
  {name:'Tonka',             family:'amber',   desc:'Sweet, warm, coumarin-rich. Smells of vanilla, hay, and almond.'},
  {name:'Tuberose',          family:'floral',  desc:'Dense, creamy, intensely indolic white floral. Heady and complex.'},
  {name:'Vanilla',           family:'gourmand',desc:'Sweet, warm, universally appealing. Natural absolute is more complex.'},
  {name:'Vetiver',           family:'chypre',  desc:'Earthy, smoky, and woody root note. One of the most versatile base notes.'},
  {name:'Violet',            family:'floral',  desc:'Powdery, slightly sweet, and delicate. Soft and nostalgic.'},
  {name:'Violet Leaf',       family:'green',   desc:'Green, watery, slightly metallic. Sharper than the flower.'},
  {name:'White Cedar',       family:'woody',   desc:'Lighter and more airy than standard cedar — clean, slightly resinous.'},
  {name:'White Musk',        family:'floral',  desc:'The cleanest of musks — transparent, soapy, skin-like.'},
  {name:'Yellow Oleander',   family:'floral',  desc:'A tropical flowering shrub — warm, honeyed floral, slightly waxy.'},
];
export const NI_MAP = Object.fromEntries(NI.map(n => [n.name.toLowerCase(), n]));

// Sillage / layering label lookup
export const SW = ['','Skin','Skin','Subtle','Subtle','Moderate','Moderate','Strong','Strong','Enveloping','Enormous'];
export const LW = ['','Linear','Linear','Simple','Simple','Balanced','Balanced','Layered','Layered','Complex','Deep'];
