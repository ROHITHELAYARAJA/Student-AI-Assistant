const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('../backend/node_modules/@napi-rs/canvas');

async function createFavicon() {
  const publicDir = path.resolve(__dirname, '../frontend/public');
  const tutorPath = path.join(publicDir, 'mascots/tutor.png');
  const img = await loadImage(tutorPath);
  
  // Create 128x128 rounded icon with sleek dark-purple background
  const size = 128;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background rounded rect
  const r = 24;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = '#1D1A2E';
  ctx.fill();
  
  // Border glow
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#8C66DA';
  ctx.stroke();
  
  // Draw cat mascot centered
  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, 4, 4, size - 8, size - 8);
  ctx.restore();
  
  const pngBuffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), pngBuffer);
  fs.writeFileSync(path.join(publicDir, 'blast-logo.png'), pngBuffer);
  fs.writeFileSync(path.join(publicDir, 'blast-emblem.png'), pngBuffer);
  
  // 1. Create valid favicon.ico
  const icoHeader = Buffer.alloc(22);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(1, 4);
  icoHeader.writeUInt8(size, 6);
  icoHeader.writeUInt8(size, 7);
  icoHeader.writeUInt8(0, 8);
  icoHeader.writeUInt8(0, 9);
  icoHeader.writeUInt16LE(1, 10);
  icoHeader.writeUInt16LE(32, 12);
  icoHeader.writeUInt32LE(pngBuffer.length, 14);
  icoHeader.writeUInt32LE(22, 18);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), Buffer.concat([icoHeader, pngBuffer]));
  
  // 2. Create favicon.svg
  const b64 = pngBuffer.toString('base64');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <image href="data:image/png;base64,${b64}" x="0" y="0" width="128" height="128" />
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svg, 'utf-8');
  
  console.log('Successfully generated favicon.ico, favicon.png, favicon.svg, and blast-logo.png using Blast Cat Mascot!');
}

createFavicon().catch(console.error);
