import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 512;

  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 50 * scale, 160 * scale, 80 * scale, 0, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.roundRect(cx - 150 * scale, cy - 20 * scale, 300 * scale, 30 * scale, 15 * scale);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${80 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🍔', cx, cy + 40 * scale);

  const buffer = canvas.toBuffer('image/png');
  const outPath = path.join(__dirname, '..', 'public', 'icons', `icon-${size}.png`);
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated icon-${size}.png`);
}

generateIcon(192);
generateIcon(512);
console.log('Icons generated');
