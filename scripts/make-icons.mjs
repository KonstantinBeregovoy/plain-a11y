// Генерирует иконки расширения из scripts/icon.svg в src/public/icon.
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = await readFile(join(root, 'scripts', 'icon.svg'));
const outDir = join(root, 'src', 'public', 'icon');
await mkdir(outDir, { recursive: true });

for (const size of [16, 48, 128]) {
  // Большая плотность, чтобы мелкие размеры получались чёткими.
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(join(outDir, `${size}.png`));
  console.log(`icon/${size}.png`);
}
