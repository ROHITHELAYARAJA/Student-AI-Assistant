const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '../frontend/public');
const logoPath = path.join(publicDir, 'blast-logo.png');
const pngBuffer = fs.readFileSync(logoPath);

console.log('PNG size:', pngBuffer.length);

// 1. Create valid favicon.ico
const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // icon type (ICO)
icoHeader.writeUInt16LE(1, 4); // 1 image
icoHeader.writeUInt8(0, 6); // 256px width
icoHeader.writeUInt8(0, 7); // 256px height
icoHeader.writeUInt8(0, 8); // 0 colors
icoHeader.writeUInt8(0, 9); // reserved
icoHeader.writeUInt16LE(1, 10); // color planes
icoHeader.writeUInt16LE(32, 12); // 32 bpp
icoHeader.writeUInt32LE(pngBuffer.length, 14); // data size
icoHeader.writeUInt32LE(22, 18); // offset

const icoBuffer = Buffer.concat([icoHeader, pngBuffer]);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
console.log('Created favicon.ico');

// 2. Overwrite blast-emblem.png
fs.copyFileSync(logoPath, path.join(publicDir, 'blast-emblem.png'));
console.log('Updated blast-emblem.png');

// 3. Create favicon.svg with mascot
const base64Png = pngBuffer.toString('base64');
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <image href="data:image/png;base64,${base64Png}" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet" />
</svg>
`;
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');
console.log('Updated favicon.svg');
