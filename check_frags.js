const fs = require('fs');
const scents = JSON.parse(fs.readFileSync('data/scents.json', 'utf8'));

const targets = [
  "jazz-club", "by-the-fireplace", "santal-33", "philosykos",
  "wonderwood", "2", "hwyl", "marrakech-intense", "gypsy-water",
  "tobacco-vanille", "timbuktu", "chergui", "terre-dhermes", "terre-d-hermes",
  "encre-noire", "spicebomb"
];

const found = scents.map(s => s.id);
const existing = targets.filter(t => found.includes(t));
const missing = targets.filter(t => !found.includes(t));

console.log("Existing:", existing);
console.log("Missing:", missing);
