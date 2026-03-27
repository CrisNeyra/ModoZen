/**
 * Script para generar el icono de la app Modo Zen
 * Genera una chica meditando con la frase "Modo Zen"
 * en todas las resoluciones necesarias para Android.
 *
 * Uso: node scripts/generate-icon.js
 * Requiere: npm install canvas
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Tamaños de iconos para Android mipmap
const SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size / 192; // Factor de escala basado en xxxhdpi

  // === Fondo degradado oscuro ===
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#1A1A2E');
  grad.addColorStop(0.5, '#16213E');
  grad.addColorStop(1, '#0F3460');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // === Círculo decorativo de fondo (luz suave) ===
  const gradCircle = ctx.createRadialGradient(
    size * 0.5, size * 0.42, size * 0.05,
    size * 0.5, size * 0.42, size * 0.38
  );
  gradCircle.addColorStop(0, 'rgba(147, 51, 234, 0.35)');
  gradCircle.addColorStop(0.6, 'rgba(147, 51, 234, 0.12)');
  gradCircle.addColorStop(1, 'rgba(147, 51, 234, 0)');
  ctx.fillStyle = gradCircle;
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.42, size * 0.38, 0, Math.PI * 2);
  ctx.fill();

  // === Dibujar silueta de chica meditando ===
  const cx = size * 0.5;
  const cy = size * 0.38;

  ctx.fillStyle = '#9333EA';
  ctx.strokeStyle = '#9333EA';
  ctx.lineWidth = Math.max(1, 2 * s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Cabeza
  ctx.beginPath();
  ctx.arc(cx, cy - 18 * s, 12 * s, 0, Math.PI * 2);
  ctx.fill();

  // Cabello (arco superior)
  ctx.beginPath();
  ctx.arc(cx, cy - 20 * s, 13 * s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.lineWidth = Math.max(1, 3.5 * s);
  ctx.stroke();

  // Moño del cabello
  ctx.beginPath();
  ctx.arc(cx, cy - 34 * s, 5 * s, 0, Math.PI * 2);
  ctx.fill();

  // Cuello
  ctx.lineWidth = Math.max(1, 2.5 * s);
  ctx.beginPath();
  ctx.moveTo(cx, cy - 6 * s);
  ctx.lineTo(cx, cy + 2 * s);
  ctx.stroke();

  // Cuerpo (torso en posición de loto)
  ctx.beginPath();
  ctx.moveTo(cx, cy + 2 * s);
  ctx.quadraticCurveTo(cx - 18 * s, cy + 10 * s, cx - 22 * s, cy + 28 * s);
  ctx.lineTo(cx + 22 * s, cy + 28 * s);
  ctx.quadraticCurveTo(cx + 18 * s, cy + 10 * s, cx, cy + 2 * s);
  ctx.fill();

  // Piernas cruzadas (posición de loto)
  ctx.beginPath();
  ctx.moveTo(cx - 22 * s, cy + 28 * s);
  ctx.quadraticCurveTo(cx - 30 * s, cy + 34 * s, cx - 26 * s, cy + 40 * s);
  ctx.quadraticCurveTo(cx - 10 * s, cy + 42 * s, cx, cy + 36 * s);
  ctx.quadraticCurveTo(cx + 10 * s, cy + 42 * s, cx + 26 * s, cy + 40 * s);
  ctx.quadraticCurveTo(cx + 30 * s, cy + 34 * s, cx + 22 * s, cy + 28 * s);
  ctx.fill();

  // Brazos (en posición de meditación, manos sobre rodillas)
  ctx.lineWidth = Math.max(1, 2.5 * s);
  // Brazo izquierdo
  ctx.beginPath();
  ctx.moveTo(cx - 14 * s, cy + 10 * s);
  ctx.quadraticCurveTo(cx - 28 * s, cy + 18 * s, cx - 24 * s, cy + 32 * s);
  ctx.stroke();
  // Brazo derecho
  ctx.beginPath();
  ctx.moveTo(cx + 14 * s, cy + 10 * s);
  ctx.quadraticCurveTo(cx + 28 * s, cy + 18 * s, cx + 24 * s, cy + 32 * s);
  ctx.stroke();

  // Puntos de energía/chakra (pequeños destellos)
  ctx.fillStyle = '#C084FC';
  const destellos = [
    [cx - 32 * s, cy - 8 * s, 2 * s],
    [cx + 32 * s, cy - 8 * s, 2 * s],
    [cx - 28 * s, cy - 22 * s, 1.5 * s],
    [cx + 28 * s, cy - 22 * s, 1.5 * s],
    [cx, cy - 40 * s, 2.5 * s],
    [cx - 18 * s, cy - 36 * s, 1.5 * s],
    [cx + 18 * s, cy - 36 * s, 1.5 * s],
  ];
  for (const [dx, dy, r] of destellos) {
    ctx.beginPath();
    ctx.arc(dx, dy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // === Texto "Modo Zen" ===
  const textY = size * 0.82;
  const fontSize = Math.max(8, Math.round(20 * s));

  // Sombra del texto
  ctx.shadowColor = 'rgba(147, 51, 234, 0.6)';
  ctx.shadowBlur = 8 * s;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Modo Zen', cx, textY);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Línea decorativa bajo el texto
  ctx.strokeStyle = '#9333EA';
  ctx.lineWidth = Math.max(1, 1.5 * s);
  ctx.beginPath();
  const lineW = 40 * s;
  ctx.moveTo(cx - lineW / 2, textY + fontSize * 0.6);
  ctx.lineTo(cx + lineW / 2, textY + fontSize * 0.6);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

// Genera iconos en todas las resoluciones
const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

for (const [folder, size] of Object.entries(SIZES)) {
  const dirPath = path.join(resDir, folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const buffer = drawIcon(size);

  // ic_launcher.png
  fs.writeFileSync(path.join(dirPath, 'ic_launcher.png'), buffer);
  console.log(`✓ ${folder}/ic_launcher.png (${size}x${size})`);

  // ic_launcher_round.png (mismo diseño, es redondo por el fondo circular)
  fs.writeFileSync(path.join(dirPath, 'ic_launcher_round.png'), buffer);
  console.log(`✓ ${folder}/ic_launcher_round.png (${size}x${size})`);
}

console.log('\n🎉 Iconos generados exitosamente!');
console.log('Los iconos muestran una chica meditando con la frase "Modo Zen"');

// Genera logo.png para la app (480x480)
const logoBuffer = drawIcon(480);
const logoPath = path.join(__dirname, '..', 'src', 'assets', 'logo.png');
fs.writeFileSync(logoPath, logoBuffer);
console.log(`✓ src/assets/logo.png (480x480)`);
