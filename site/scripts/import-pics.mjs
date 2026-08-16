// Importiert bilder aus ../pics collection/ nach public/art/<jahr>/:
// - <slug>.webp       (max 1800px, für lightbox/vollansicht)
// - <slug>_thumb.webp (640px, für grids/feeds)
// Zuordnung nummer→werk kommt aus src/data/works.json ("source"-feld).
// Erneut ausführbar, wenn neue originale dazukommen.
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, '..', 'pics collection');
const works = JSON.parse(readFileSync(join(root, 'src/data/works.json'), 'utf8'));

for (const w of works) {
  if (!w.source) continue;
  // pfade mit "/" sind relativ zum repo-root, sonst "pics collection"
  const src = w.source.includes('/') ? join(root, '..', w.source) : join(srcDir, w.source);
  if (!existsSync(src)) {
    console.warn(`fehlt: ${src}`);
    continue;
  }
  const dir = join(root, 'public/art', String(w.year));
  mkdirSync(dir, { recursive: true });
  await sharp(src)
    .resize(1800, 1800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(join(dir, `${w.slug}.webp`));
  await sharp(src)
    .resize(640, 640, { fit: 'inside' })
    .webp({ quality: 78 })
    .toFile(join(dir, `${w.slug}_thumb.webp`));
  console.log(`${w.source} -> art/${w.year}/${w.slug}.webp (+thumb)`);
}

// animationen (gifs) aus src/data/animations.json — quelle liegt im repo-root.
// werden zu animiertem webp (deutlich kleiner als gif) + statischem thumb.
const animations = JSON.parse(readFileSync(join(root, 'src/data/animations.json'), 'utf8'));
const animDir = join(root, 'public/art/animations');
for (const a of animations) {
  const src = join(root, '..', a.source);
  if (!existsSync(src)) {
    console.warn(`fehlt: ${src}`);
    continue;
  }
  mkdirSync(animDir, { recursive: true });
  await sharp(src, { animated: true })
    .resize(900, 900, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 72, effort: 4 })
    .toFile(join(animDir, `${a.slug}.webp`));
  await sharp(src)
    .resize(640, 640, { fit: 'inside' })
    .webp({ quality: 78 })
    .toFile(join(animDir, `${a.slug}_thumb.webp`));
  console.log(`${a.source} -> art/animations/${a.slug}.webp (animiert, +thumb)`);
}
