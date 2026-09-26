import fs from 'node:fs/promises';
import sharp from 'sharp';

const sage = '#7F8F7A', cream = '#F8F6EF', charcoal = '#1A1D1B';
const paths = (left, right, stroke = 2) => `<path fill="${left}" d="M0 0h50l73 115-26 39Z"/><path fill="${right}" d="M104 0h50l71 115-27 39Z"/><path fill="none" stroke="${right}" stroke-width="${stroke}" d="m224 115 80-115"/>`;
const svg = (body, viewBox, width, height) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">${body}</svg>`;
await fs.mkdir('public/brand', { recursive: true });
for (const [name, color] of [['dark', cream], ['light', charcoal]]) {
  await fs.writeFile(`public/brand/logo-mark-${name}.svg`, svg(paths(sage, color), '-2 -2 310 160', 310, 160));
  await fs.writeFile(`public/brand/logo-mark-monochrome-${name}.svg`, svg(paths(color, color), '-2 -2 310 160', 310, 160));
  await fs.writeFile(`public/brand/logo-lockup-${name}.svg`, svg(`<g transform="translate(153 10)">${paths(sage, color)}</g><text x="306" y="224" fill="${color}" text-anchor="middle" font-family="Arial,sans-serif" font-size="21" letter-spacing="6">BRIAN WENDOT KORINGO</text>`, '0 0 612 250', 612, 250));
}
const icon = svg(`<style>.ground{fill:${cream}}.primary{fill:${charcoal}}@media(prefers-color-scheme:dark){.ground{fill:${charcoal}}.primary{fill:${cream}}}</style><rect class="ground" width="64" height="64" rx="13"/><g transform="translate(9 20) scale(.15)"><path fill="${sage}" d="M0 0h50l73 115-26 39Z"/><path class="primary" d="M104 0h50l71 115-27 39Z"/></g>`, '0 0 64 64', 64, 64);
await fs.writeFile('public/favicon.svg', icon);
const fixedIcon = svg(`<rect width="256" height="256" rx="52" fill="${charcoal}"/><g transform="translate(36 80) scale(.60)">${paths(sage, cream, 4)}</g>`, '0 0 256 256', 256, 256);
const buffers = [];
for (const size of [16, 32, 180]) {
  const buffer = await sharp(Buffer.from(fixedIcon)).resize(size).png().toBuffer();
  await fs.writeFile(size === 180 ? 'public/apple-touch-icon.png' : `public/favicon-${size}x${size}.png`, buffer);
  if (size !== 180) buffers.push({ size, buffer });
}
const header = Buffer.alloc(6 + 16 * buffers.length); header.writeUInt16LE(1, 2); header.writeUInt16LE(buffers.length, 4);
let offset = header.length;
buffers.forEach(({ size, buffer }, index) => { const i = 6 + 16 * index; header[i] = size; header[i + 1] = size; header.writeUInt16LE(1, i + 4); header.writeUInt16LE(32, i + 6); header.writeUInt32LE(buffer.length, i + 8); header.writeUInt32LE(offset, i + 12); offset += buffer.length; });
await fs.writeFile('public/favicon.ico', Buffer.concat([header, ...buffers.map((item) => item.buffer)]));
const social = svg(`<rect width="1200" height="630" fill="${cream}"/><g transform="translate(94 124) scale(.52)">${paths(sage, charcoal)}</g><text x="94" y="338" fill="${charcoal}" font-family="Georgia,serif" font-size="64">Brian Wendot Koringo</text><path stroke="${sage}" d="M94 394h94" stroke-width="3"/><text x="94" y="460" fill="${charcoal}" font-family="Arial,sans-serif" font-size="25">Projects, ideas, and things worth sharing.</text>`, '0 0 1200 630', 1200, 630);
await fs.writeFile('public/brand/social-preview.svg', social);
await sharp(Buffer.from(social)).png().toFile('public/brand/social-preview.png');
console.log('Generated SVG marks, lockups, favicon assets, and social preview.');
