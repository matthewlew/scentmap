const fs = require('fs');
const path = require('path');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');

const FONT_PATH = path.join(
  path.dirname(require.resolve('@vercel/og/package.json')),
  'dist', 'noto-sans-v27-latin-regular.ttf'
);
const fontData = fs.readFileSync(FONT_PATH);

async function renderPng(node, outPath) {
  const svg = await satori(node, {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Noto Sans', data: fontData, weight: 400, style: 'normal' }],
  });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const png = resvg.render().asPng();
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, png);
  console.log(`Wrote ${outPath}`);
}

module.exports = { renderPng };
