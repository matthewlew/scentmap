// ── data.js ──────────────────────────────────────────────────────────────────────────────
// Static reference data: roles, families, compatibility, notes, catalog.
// CAT is seeded inline from data/scents.json — no fetch required.

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
    symLine:"\u2663 signals restraint — respect for shared space you didn't choose.",
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

function parseNotes(str) {
  if (!str) return [];
  if (Array.isArray(str)) return str;
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

// ── Inline seed data (mirrors data/scents.json) ─────────────────────────────────────
const SCENTS_SEED = [
  { id:'gypsy-water',       brand:'Byredo',        name:'Gypsy Water',       family:'woody',    sillage:3, layering:5, top:'Juniper, Bergamot, Lemon',          mid:'Pine, Incense, Pepper',              base:'Sandalwood, Vanilla, Amber',            roles:['casual'],               description:'A smoky, earthy unisex scent with bright citrus opening into a pine-campfire warmth, great for relaxed everyday wear.' },
  { id:'eleventh-hour',     brand:'Byredo',        name:'Eleventh Hour',     family:'amber',    sillage:7, layering:8, top:'Bergamot, Pepper, Plum',             mid:'Rum, Fig, Cedar',                    base:'Tonka, Labdanum, Amber',                roles:['cold','intimate'],       description:'Warm, boozy amber with dried-fruit sweetness and soft woods, ideal for cold evenings and close-to-skin occasions.' },
  { id:'mixed-emotions',    brand:'Byredo',        name:'Mixed Emotions',    family:'woody',    sillage:3, layering:4, top:'Black Currant, Mate, Tea',            mid:'Violet Leaf, Birch',                 base:'Papyrus, Amber',                        roles:['casual','work'],         description:'Dry, inky tea and woods with a subtle fruitiness, wearing like a contemplative, quiet veil perfect for workdays.' },
  { id:'bal-dafrique',      brand:'Byredo',        name:"Bal d'Afrique",     family:'floral',   sillage:6, layering:5, top:'Bergamot, Neroli, Lemon',            mid:'African Violet, Cyclamen',           base:'Musk, Vetiver, Amber',                  roles:['heat','casual'],         description:'A sunlit, slightly sweet floral with sparkling citrus and soft vetiver, great for warm days and joyful casual wear.' },
  { id:'blanche',           brand:'Byredo',        name:'Blanche',           family:'floral',   sillage:4, layering:4, top:'Pink Pepper, Aldehydes',              mid:'Rose, Peony',                        base:'Sandalwood, Musk',                      roles:['casual','work'],         description:'A clean, laundry-fresh floral with soft rose and creamy sandalwood, ideal for office days and low-key settings.' },
  { id:'sunday-cologne',    brand:'Byredo',        name:'Sunday Cologne',    family:'citrus',   sillage:4, layering:3, top:'Bergamot, Grapefruit',               mid:'Violet, Rose',                       base:'Musk, Sandalwood',                      roles:['casual','heat'],         description:'Bright, clean citrus opening with a hint of floral and a soft musky base, perfect for warm-weather casual wear.' },
  { id:'mojave-ghost',      brand:'Byredo',        name:'Mojave Ghost',      family:'woody',    sillage:5, layering:6, top:'Ambrette, Violet, Bergamot',         mid:'Magnolia, Sandalwood, Sapodilla',    base:'Cedarwood, Amber, Musk',                roles:['casual','signature'],    description:'A desert-air blend of magnolia, musk, and sandalwood — ghostly, clean, and quietly intimate. One of the most universally wearable modern scents.' },
  { id:'bibliotheque',      brand:'Byredo',        name:'Biblioth\u00e8que',       family:'woody',    sillage:4, layering:7, top:'Plum, Peach, Violet',                mid:'Orris, Papyrus, Birch',              base:'Sandalwood, Vetiver, Amber',            roles:['creative','work'],       description:'Old books, leather, and dry woods with a ripened-fruit warmth — evokes a well-worn library on a winter afternoon.' },
  { id:'super-cedar',       brand:'Byredo',        name:'Super Cedar',       family:'woody',    sillage:5, layering:4, top:'Apple, Bergamot',                    mid:'Juniper, Rose',                      base:'Cedarwood, Musk, Labdanum',             roles:['casual','work'],         description:'A crisp, aromatic cedar sharpened by juniper and green apple — clean and functional, disappears into the skin.' },
  { id:'seven-veils',       brand:'Byredo',        name:'Seven Veils',       family:'amber',    sillage:7, layering:8, top:'Pink Pepper, Iris',                  mid:'Patchouli, Rose, Ylang Ylang',       base:'Labdanum, Amber, Vanilla, Musk',        roles:['formal','cold'],         description:'A thick, ceremonial amber with heavy patchouli and labdanum layered over rose and spice — dense, rich, and declarative.' },
  { id:'rose-noir',         brand:'Byredo',        name:'Rose Noir',         family:'floral',   sillage:5, layering:6, top:'Bergamot, Incense',                  mid:'Rose, Guaiac Wood',                  base:'Vetiver, Amber, Musk',                  roles:['creative','signature'],  description:'A smoky, incense-draped rose with dry guaiac wood — less romantic than sinister, worn as a statement not a gesture.' },
  { id:'slow-dance',        brand:'Byredo',        name:'Slow Dance',        family:'floral',   sillage:4, layering:5, top:'Blackcurrant Leaf, Orange',           mid:'Violet, Jasmine',                    base:'Sandalwood, Musk',                      roles:['casual','intimate'],     description:'A soft floral haze of violet, jasmine, and tart currant — intimate and unhurried, like a slow evening at home.' },
  { id:'eau-capitale',      brand:'Byredo',        name:'Eau Capitale',      family:'floral',   sillage:5, layering:5, top:'Black Currant, Bergamot',            mid:'Rose, Patchouli',                    base:'Musk, Sandalwood',                      roles:['signature','formal'],    description:'A city rose — bold currant and rich patchouli give classic rose a modern, urban edge without sweetness.' },
  { id:'la-tulipe',         brand:'Byredo',        name:'La Tulipe',         family:'floral',   sillage:4, layering:4, top:'Lily of the Valley, Aldehydes',       mid:'Tulip, Peony, Rose',                 base:'Musk, Sandalwood',                      roles:['casual','heat'],         description:'A precise, dewy floral centred on tulip — clean and quietly feminine, worn without occasion.' },
  { id:'vetyverio-byredo',  brand:'Byredo',        name:'Vetyverio',         family:'woody',    sillage:5, layering:5, top:'Grapefruit, Black Pepper',           mid:'Vetiver, Orris',                     base:'Vetiver, Cedarwood, Musk',              roles:['heat','casual'],         description:'Sparkling grapefruit cut by black pepper opens into a cool, earthy vetiver — linear, unisex, and all-season.' },
  { id:'pulp',              brand:'Byredo',        name:'Pulp',              family:'chypre',   sillage:6, layering:7, top:'Blood Orange, Fig, Blackcurrant Leaf', mid:'Rose, Geranium',                     base:'Patchouli, Labdanum, Sandalwood',       roles:['creative','signature'],  description:'Tropical fruit pulp — fig, blood orange, and currant — soured by green notes and grounded in patchouli. Strange, addictive, and difficult to place.' },
  { id:'oud-immortel',      brand:'Byredo',        name:'Oud Immortel',      family:'resin',    sillage:7, layering:8, top:'Bergamot, Clove',                    mid:'Rose, Tobacco',                      base:'Oud, Amber, Sandalwood',                roles:['formal','cold'],         description:'Spiced rose and tobacco build over a dense oud and amber base — a full, ceremonial scent for cold evenings or formal occasions.' },
  { id:'lil-fleur',         brand:'Byredo',        name:'Lil Fleur',         family:'amber',    sillage:4, layering:4, top:'Tangerine, Bergamot',                mid:'Violet, Cashmere',                   base:'Amber, Musk, Sandalwood',               roles:['casual','intimate'],     description:'A soft, slightly powdery amber with warm cashmere and citrus — gentle, comforting, and barely there.' },

  { id:'tierra-del-fuego',  brand:'Fueguia 1833',  name:'Tierra del Fuego',  family:'amber',    sillage:6, layering:7, top:'Pink Pepper',                        mid:'Cypress',                            base:'Amber',                                 roles:['cold','signature'],      description:'A smoky amber with sharp pink pepper and cypress, evoking windswept southern forests and distant fires.' },
  { id:'darwin',            brand:'Fueguia 1833',  name:'Darwin',            family:'green',    sillage:5, layering:6, top:'Grapefruit',                         mid:'Jasmine',                            base:'Vetiver',                               roles:['heat','signature'],      description:'Bright grapefruit and airy jasmine drift into a crisp vetiver base, reminiscent of botanical exploration.' },
  { id:'la-cautiva',        brand:'Fueguia 1833',  name:'La Cautiva',        family:'floral',   sillage:4, layering:6, top:'Black Currant',                      mid:'Tuberose',                           base:'Sandalwood',                            roles:['creative','signature'],  description:'A lush tuberose balanced by dark currant and soft sandalwood, rich but airy.' },
  { id:'ballena-de-la-pampa',brand:'Fueguia 1833', name:'Ballena de la Pampa',family:'amber',   sillage:5, layering:6, top:'Sea Salt',                           mid:'Orchid',                             base:'Ambergris',                             roles:['creative','signature'],  description:'A salty, musky ambergris scent inspired by whales drifting along the Patagonian coast.' },
  { id:'alerce',            brand:'Fueguia 1833',  name:'Alerce',            family:'woody',    sillage:4, layering:6, top:'Bergamot, Pink Pepper',              mid:'Cedar, Cypress, Juniper',            base:'Vetiver, Patchouli, Moss',              roles:['casual','signature'],    description:'Named after the ancient Patagonian larch — dense, resinous wood with cool juniper and earthy vetiver. Timeless and unhurried.' },
  { id:'patagonia-fueguia', brand:'Fueguia 1833',  name:'Patagonia',         family:'green',    sillage:4, layering:5, top:'Grapefruit, Bergamot',               mid:'Geranium, Green Leaves',             base:'Cedarwood, Vetiver, Musk',              roles:['heat','casual'],         description:'The open air of the Patagonian steppe — bright citrus, wild herbs, and dry grassy vetiver. Clean, spare, and expansive.' },
  { id:'buenos-aires',      brand:'Fueguia 1833',  name:'Buenos Aires',      family:'citrus',   sillage:5, layering:4, top:'Bergamot, Lemon, Petitgrain',        mid:'Rose, Jasmine',                      base:'Musk, Sandalwood',                      roles:['casual','heat'],         description:'A sun-warmed Argentine citrus that blooms into soft florals before fading into clean skin musk — elegant and urbane.' },

  { id:'oronardo',          brand:'Xin\u00fa',          name:'OroNardo',          family:'floral',   sillage:6, layering:7, top:'Neroli',                             mid:'Tuberose',                           base:'Sandalwood',                            roles:['formal','signature'],    description:'Radiant tuberose wrapped in creamy sandalwood and citrus blossom, rich yet elegant.' },
  { id:'copala',            brand:'Xin\u00fa',          name:'C\u00f3pala',               family:'resin',    sillage:7, layering:8, top:'Incense',                            mid:'Copal Resin',                        base:'Amber',                                 roles:['formal','cold'],         description:'Sacred copal resin smoke with glowing amber warmth, reminiscent of ceremonial incense.' },
  { id:'aguamadera',        brand:'Xin\u00fa',          name:'Aguamadera',        family:'woody',    sillage:4, layering:6, top:'Grapefruit',                         mid:'Guaiac Wood',                        base:'Cedar',                                 roles:['heat','casual'],         description:'A transparent citrus-wood scent with smooth guaiac and cedar warmth.' },
  { id:'montecristo',       brand:'Xin\u00fa',          name:'Montecisto',        family:'green',    sillage:5, layering:6, top:'Herbs',                              mid:'Fig Leaf',                           base:'Moss',                                  roles:['creative','signature'],  description:'Green fig leaves and herbs over soft moss, evoking tropical gardens.' },
  { id:'numero-uno',        brand:'Xin\u00fa',          name:'N\u00famero Uno',          family:'citrus',   sillage:5, layering:4, top:'Bergamot, Lime, Petitgrain',         mid:'Jasmine, Neroli',                    base:'Vetiver, Sandalwood, Musk',             roles:['casual','heat'],         description:'A clean, sparkling Mexican citrus anchored in vetiver and sandalwood — effortless to wear in any warm setting.' },
  { id:'tulipe-xinu',       brand:'Xin\u00fa',          name:'Tulipe',            family:'floral',   sillage:4, layering:5, top:'Pink Pepper, Bergamot',              mid:'Tulip, Iris',                        base:'Sandalwood, Musk',                      roles:['casual','creative'],     description:'A delicate floral that captures the papery quality of a tulip petal — cool, slightly spicy, and architecturally precise.' },
  { id:'ore-xinu',          brand:'Xin\u00fa',          name:'Ore',               family:'resin',    sillage:6, layering:7, top:'Elemi',                              mid:'Copal Resin, Frankincense',          base:'Amber, Sandalwood',                     roles:['formal','cold'],         description:'A blend of pre-Columbian resins — elemi, copal, and frankincense — slow-burning and ceremonial.' },

  { id:'tam-dao',           brand:'Diptyque',      name:'Tam Dao',           family:'woody',    sillage:5, layering:6, top:'Cypress',                            mid:'Sandalwood',                         base:'Amberwood',                             roles:['signature','work'],      description:'Creamy sandalwood and cypress recalling sacred forests in Vietnam.' },
  { id:'philosykos',        brand:'Diptyque',      name:'Philosykos',        family:'green',    sillage:4, layering:5, top:'Fig Leaf',                           mid:'Fig Milk',                           base:'Cedar',                                 roles:['heat','casual'],         description:'Green fig leaves and creamy fig milk over dry woods, fresh and Mediterranean.' },
  { id:'do-son',            brand:'Diptyque',      name:'Do Son',            family:'floral',   sillage:6, layering:6, top:'Orange Blossom',                     mid:'Tuberose',                           base:'Musk',                                  roles:['signature','formal'],    description:'Airy tuberose with orange blossom and soft musk inspired by seaside gardens.' },
  { id:'eau-duelle',        brand:'Diptyque',      name:'Eau Duelle',        family:'gourmand', sillage:5, layering:7, top:'Pink Pepper',                        mid:'Vanilla',                            base:'Amber',                                 roles:['cold','intimate'],       description:'Spicy vanilla wrapped in incense and amber warmth.' },
  { id:'lombre-dans-leau',  brand:'Diptyque',      name:"L'Ombre Dans L'Eau",family:'chypre',  sillage:5, layering:6, top:'Blackcurrant Leaf',                  mid:'Rose',                               base:'Moss',                                  roles:['creative','signature'],  description:'Green currant leaves and romantic rose with earthy moss.' },
  { id:'oyedo',             brand:'Diptyque',      name:'Oyedo',             family:'citrus',   sillage:5, layering:3, top:'Mandarin, Yuzu, Thyme',               mid:'Orange Blossom',                     base:'Musk',                                  roles:['heat','casual'],         description:'A sharply bright Japanese citrus — yuzu, mandarin, and thyme — with almost no transition. Fast-drying, vivid, and outdoorsy.' },
  { id:'eau-de-lierre',     brand:'Diptyque',      name:'Eau de Lierre',     family:'green',    sillage:3, layering:4, top:'Ivy Leaf, Bergamot',                  mid:'Rose, Violet',                       base:'Cedarwood, Musk',                       roles:['casual','work'],         description:'Crushed ivy leaf and cool violet — fresh, slightly sappy, and garden-damp. Unobtrusive and easy to wear.' },
  { id:'eau-rose',          brand:'Diptyque',      name:'Eau Rose',          family:'floral',   sillage:4, layering:4, top:'Lemon, Grapefruit',                   mid:'Rose, Lychee',                       base:'Musk, Cedarwood',                       roles:['casual','heat'],         description:'A clean, dewy rose brightened with citrus and soft lychee — transparent, modern, and universally easy to wear.' },
  { id:'vetyverio-diptyque',brand:'Diptyque',      name:'Vetyverio',         family:'woody',    sillage:5, layering:5, top:'Black Pepper, Bergamot',             mid:'Vetiver, Sage',                      base:'Vetiver, Cedarwood',                    roles:['casual','signature'],    description:'A clean, slightly smoky vetiver with pepper and sage — dry and structural, works in any season.' },
  { id:'florabellio',       brand:'Diptyque',      name:'Florabellio',       family:'floral',   sillage:5, layering:5, top:'Apple, Aldehydes',                    mid:'Freesia, White Flowers',             base:'Driftwood, Musk',                       roles:['heat','casual'],         description:'A crisp apple-and-flowers opening that softens into driftwood musk — aquatic, airy, and easy on a summer day.' },

  { id:'i-dont-know-what',  brand:'D.S. & Durga',  name:"I Don't Know What", family:'woody',    sillage:3, layering:10,top:'Bergamot',                            mid:'Iso E Super',                        base:'Vetiver',                               roles:['signature','casual'],    description:'A transparent woody enhancer built around Iso E Super — it amplifies other fragrances and skin chemistry rather than standing alone.' },
  { id:'debaser',           brand:'D.S. & Durga',  name:'Debaser',           family:'green',    sillage:5, layering:6, top:'Bergamot',                            mid:'Fig',                                base:'Coconut Milk',                          roles:['heat','casual'],         description:'Milky fig and green leaves with creamy coconut warmth.' },
  { id:'burning-barbershop',brand:'D.S. & Durga',  name:'Burning Barbershop',family:'amber',    sillage:6, layering:7, top:'Mint',                               mid:'Lavender',                           base:'Vanilla',                               roles:['creative','cold'],       description:'A smoky barbershop scent blending mint, lavender, and caramelized vanilla.' },
  { id:'bowmakers',         brand:'D.S. & Durga',  name:'Bowmakers',         family:'woody',    sillage:5, layering:6, top:'Mahogany',                           mid:'Maple',                              base:'Resin',                                 roles:['creative','formal'],     description:'Resinous woods evoking violin workshops and polished instruments.' },
  { id:'radio-bombay',      brand:'D.S. & Durga',  name:'Radio Bombay',      family:'woody',    sillage:6, layering:7, top:'Bergamot, Cardamom',                 mid:'Jasmine, Sandalwood',                base:'Vetiver, Incense, Smoke',               roles:['creative','signature'],  description:'Spiced sandalwood and cardamom drifting through jasmine smoke — a cinematic, Bollywood-radio scent that lodges itself in memory.' },
  { id:'mississippi-medicine',brand:'D.S. & Durga',name:'Mississippi Medicine',family:'green',  sillage:5, layering:6, top:'Ginger, Galbanum',                   mid:'Bayou Grass, Basil',                 base:'Tobacco, Vetiver, Moss',                roles:['creative','signature'],  description:'Swampy medicinal herbs over tobacco and earthy moss — the American South distilled into a bottle. Unusual and unmistakable.' },
  { id:'sundazed',          brand:'D.S. & Durga',  name:'Sundazed',          family:'citrus',   sillage:5, layering:4, top:'Grapefruit, Bergamot',               mid:'Coconut Water, Marine',              base:'Musk, Driftwood',                       roles:['heat','casual'],         description:'A bright, hazy citrus with a coconut-water softness — feels like lying in the sun with your eyes closed.' },
  { id:'big-sur-after-rain',brand:'D.S. & Durga',  name:'Big Sur After Rain', family:'green',   sillage:4, layering:5, top:'Eucalyptus, Wild Grass',             mid:'Sage, Petrichor',                    base:'Cedarwood, Sandalwood',                 roles:['casual','creative'],     description:'The California coastline after rainfall — eucalyptus and sage over wet stone and cedar. Meditative and singular.' },

  { id:'santal-33',         brand:'Le Labo',       name:'Santal 33',         family:'woody',    sillage:7, layering:6, top:'Cardamom, Violet Leaf',              mid:'Iris, Papyrus, Leather',             base:'Sandalwood, Cedarwood, Amber',          roles:['signature','creative'],  description:'A smoky sandalwood and leather scent softened by iris and violet, iconic and instantly recognizable.' },
  { id:'bergamote-22',      brand:'Le Labo',       name:'Bergamote 22',      family:'citrus',   sillage:5, layering:5, top:'Bergamot, Grapefruit, Petitgrain',   mid:'Orange Blossom, Neroli',             base:'Vetiver, Cedarwood, Musk',              roles:['heat','casual'],         description:'Bright bergamot and grapefruit balanced with soft woods and musk, sparkling yet refined.' },
  { id:'another-13',        brand:'Le Labo',       name:'Another 13',        family:'woody',    sillage:5, layering:9, top:'Pear, Apple',                        mid:'Ambrette, Iso E Super',              base:'Musk, Moss, Amber',                     roles:['signature','intimate'],  description:'A clean, musky skin scent with subtle fruit and soft amber, minimal and addictive.' },
  { id:'the-noir-29',       brand:'Le Labo',       name:'Th\u00e9 Noir 29',          family:'woody',    sillage:6, layering:6, top:'Fig, Bergamot, Bay Leaf',            mid:'Black Tea, Cedar',                   base:'Vetiver, Musk, Tobacco',                roles:['creative','work'],       description:'Dark tea and fig layered over tobacco and woods, moody and slightly sweet.' },
  { id:'rose-31',           brand:'Le Labo',       name:'Rose 31',           family:'floral',   sillage:6, layering:7, top:'Rose, Cumin',                         mid:'Cedarwood, Vetiver',                 base:'Musk, Amber, Guaiac Wood',              roles:['formal','signature'],    description:'A spicy rose with cumin and woods that transforms the floral into something smoky and unisex.' },
  { id:'vetiver-46',        brand:'Le Labo',       name:'Vetiver 46',        family:'woody',    sillage:7, layering:6, top:'Pepper, Bergamot',                   mid:'Vetiver, Incense',                   base:'Guaiac Wood, Cedar, Musk',              roles:['formal','cold'],         description:'Dark, smoky vetiver with incense and woods, powerful and brooding.' },
  { id:'tonka-25',          brand:'Le Labo',       name:'Tonka 25',          family:'amber',    sillage:6, layering:7, top:'Orange Blossom, Aldehydes',           mid:'Tonka Bean, Vanilla',                base:'Amber, Musk, Sandalwood',               roles:['cold','intimate'],       description:'Soft tonka and vanilla wrapped in amber warmth, cozy and slightly powdery.' },
  { id:'lys-41',            brand:'Le Labo',       name:'Lys 41',            family:'floral',   sillage:7, layering:5, top:'Jasmine, Tuberose',                   mid:'Lily, Gardenia',                     base:'Vanilla, Musk',                         roles:['formal','signature'],    description:'A lush white floral bouquet with creamy vanilla warmth.' },
  { id:'labdanum-18',       brand:'Le Labo',       name:'Labdanum 18',       family:'amber',    sillage:7, layering:8, top:'Bergamot, Clary Sage',               mid:'Labdanum, Rose',                     base:'Amber, Sandalwood, Musk',               roles:['cold','formal'],         description:'A dense, resinous amber built on labdanum — dark, animalic, and rich. Intense projection that opens into warm sandalwood.' },
  { id:'geranium-30',       brand:'Le Labo',       name:'G\u00e9ranium 30',          family:'floral',   sillage:5, layering:6, top:'Geranium, Mandarin',                 mid:'Rose, Lavender',                     base:'Sandalwood, Cedarwood, Musk',           roles:['casual','work'],         description:'A rosy, slightly minty geranium with lavender and warm wood — clean and professional without being anonymous.' },
  { id:'fleur-doranger-27', brand:'Le Labo',       name:"Fleur d'Oranger 27",family:'floral',  sillage:6, layering:6, top:'Orange Blossom, Neroli',              mid:'Jasmine, Tuberose',                  base:'Musk, Amber, Sandalwood',               roles:['signature','heat'],      description:'Billowing orange blossom with jasmine and tuberose — warm, heady, and slightly narcotic. A solar floral for evenings.' },
  { id:'patchouli-24',      brand:'Le Labo',       name:'Patchouli 24',      family:'amber',    sillage:7, layering:7, top:'Birch, Aldehydes',                    mid:'Patchouli, Styrax',                  base:'Labdanum, Amber, Vanilla',              roles:['creative','cold'],       description:'Smoky birch tar and thick patchouli over resinous amber — abrasive, masculine, and polarising. Unmistakable.' },

  { id:'hwyl',              brand:'Aesop',         name:'Hwyl',              family:'woody',    sillage:5, layering:6, top:'Thyme, Pink Pepper',                  mid:'Cypress, Frankincense',              base:'Vetiver, Cedarwood, Moss',              roles:['creative','signature'],  description:'A smoky forest scent inspired by Japanese hinoki woods and temple incense.' },
  { id:'tacit',             brand:'Aesop',         name:'Tacit',             family:'citrus',   sillage:4, layering:5, top:'Yuzu, Basil, Bergamot',               mid:'Rosemary, Mint',                     base:'Vetiver, Cedar',                        roles:['heat','casual','work'],  description:'A crisp citrus-herbal scent with basil and yuzu over clean woods.' },
  { id:'marrakech-intense', brand:'Aesop',         name:'Marrakech Intense', family:'amber',    sillage:6, layering:6, top:'Clove, Cardamom, Bergamot',           mid:'Jasmine, Neroli, Rose',              base:'Sandalwood, Cedar, Patchouli',          roles:['creative','cold'],       description:'Warm spices and florals over sandalwood and patchouli, inspired by Moroccan markets.' },
  { id:'karst',             brand:'Aesop',         name:'Karst',             family:'green',    sillage:4, layering:5, top:'Juniper, Pink Pepper, Bergamot',      mid:'Rosemary, Sage',                     base:'Vetiver, Sandalwood, Cumin',            roles:['heat','signature'],      description:'Mineral, herbaceous freshness with crisp juniper and dry woods.' },
  { id:'eremia',            brand:'Aesop',         name:'Eremia',            family:'green',    sillage:4, layering:6, top:'Yuzu, Bergamot',                      mid:'Green Tea, Mimosa',                  base:'Musk, Cedarwood',                       roles:['casual','signature'],    description:'Soft green tea and citrus over musky woods, evoking quiet urban nature.' },
  { id:'rozu',              brand:'Aesop',         name:'R\u014dzu',                 family:'floral',   sillage:5, layering:6, top:'Rose, Shiso, Pink Pepper',           mid:'Guaiac Wood, Jasmine',               base:'Vetiver, Patchouli, Myrrh',             roles:['creative','formal'],     description:'A woody rose accented by shiso and spices, elegant and architectural.' },
  { id:'gloam',             brand:'Aesop',         name:'Gloam',             family:'floral',   sillage:6, layering:6, top:'Saffron, Pink Pepper',                mid:'Jasmine, Iris, Mimosa',              base:'Patchouli, Cocoa, Musk',                roles:['intimate','cold'],       description:'A dusky floral with powdery iris and warm cocoa undertones.' },
  { id:'miraceti',          brand:'Aesop',         name:'Miraceti',          family:'amber',    sillage:6, layering:7, top:'Black Pepper, Elemi',                 mid:'Labdanum, Styrax',                   base:'Myrrh, Musk, Amber',                    roles:['formal','cold'],         description:'A deep resinous amber inspired by maritime trade and spice routes.' },
  { id:'eidesis',           brand:'Aesop',         name:'Eidesis',           family:'woody',    sillage:4, layering:5, top:'Geranium, Bergamot',                  mid:'Cypress, Sandalwood',                base:'Vetiver, Amber, Musk',                  roles:['casual','signature'],    description:'A calm, grounding blend of geranium, cypress, and vetiver — quietly confident and easy across all occasions.' },
  { id:'olous',             brand:'Aesop',         name:'Olous',             family:'floral',   sillage:4, layering:5, top:'Neroli, Bergamot',                    mid:'Orris, Jasmine',                     base:'Sandalwood, Musk',                      roles:['casual','heat'],         description:'A bright neroli and iris softened with jasmine and sandalwood — Mediterranean-clean, quietly elegant.' },
];

// Parse notes and build CAT synchronously at module load time
const _parsed = SCENTS_SEED.map(f => ({
  ...f,
  top:  parseNotes(f.top),
  mid:  parseNotes(f.mid),
  base: parseNotes(f.base),
}));

export const CAT = _parsed;
export const CAT_MAP = Object.fromEntries(_parsed.map(f => [f.id, f]));

// initData is now a no-op — kept so main.js doesn't need changing
export async function initData() {}

// Note index — static
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

export const SW = ['','Skin','Skin','Subtle','Subtle','Moderate','Moderate','Strong','Strong','Enveloping','Enormous'];
export const LW = ['','Linear','Linear','Simple','Simple','Balanced','Balanced','Layered','Layered','Complex','Deep'];
