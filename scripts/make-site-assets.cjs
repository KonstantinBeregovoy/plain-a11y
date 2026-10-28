// Prepares the images of the website from the store screenshots and the extension
// icon: WebP in two widths, plus the SVG logo. The website lives in its own
// repository, so the output folder is the assets folder of that repository:
//   npm run site-assets -- ../plain-a11y-site/assets
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(ROOT, 'store', 'screenshots');
const OUT = path.resolve(process.argv[2] ?? path.join(ROOT, '..', 'plain-a11y-site', 'assets'));

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const file of fs.readdirSync(SHOTS).filter((name) => name.endsWith('.png'))) {
    const base = file.slice(0, 2); // 01 ... 08
    for (const width of [640, 1280]) {
      const target = path.join(OUT, `shot-${base}-${width}.webp`);
      await sharp(path.join(SHOTS, file)).resize({ width }).webp({ quality: 82 }).toFile(target);
      console.log(target, `${Math.round(fs.statSync(target).size / 1024)} KB`);
    }
  }
  fs.copyFileSync(path.join(ROOT, 'scripts', 'icon.svg'), path.join(OUT, 'icon.svg'));
  console.log(path.join(OUT, 'icon.svg'));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
