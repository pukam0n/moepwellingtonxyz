import worksData from './works.json';
import animationsData from './animations.json';

// interne links/asset-pfade immer hierdurch, damit die seite auch in einem
// unterpfad funktioniert (github pages ohne eigene domain)
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');
export const url = (p) => BASE + p;

// goatcounter-code für den besucherzähler (activity node), z. b. 'moepwellington'
// für https://moepwellington.goatcounter.com — leer = demo-modus ohne tracking.
// setup: kostenloses konto auf goatcounter.com, dort "allow adding visitor
// counts on your website" aktivieren, code hier eintragen.
export const GOATCOUNTER = '';

// url des avatar-registry-workers (cloudflare), z. b.
// 'https://avatar-registry.DEIN-SUBDOMAIN.workers.dev' — leer = lokaler modus
// (keine unikate, kein server; charakter existiert nur im eigenen browser).
export const REGISTRY = 'https://moepwellington.workers.dev';

// social-preview-bild (og:image) für geteilte links
export const OG_IMAGE = '/art/2026/untitled-13.webp';

export const SITE = {
  name: 'moe p. wellington',
  series: 'art in the age of artificial reproduction',
  seriesSlug: 'art-in-the-age-of-artificial-reproduction_2022-2026',
  span: '2022–2026',
  description:
    'moe p. wellington — ai art portfolio. art in the age of artificial reproduction, 2022–2026.',
  // TODO: echte profile eintragen (nur links, keine embeds/widgets)
  socials: [
    { label: 'twitter/x', href: 'https://x.com/TODO' },
    { label: 'instagram', href: 'https://instagram.com/TODO' },
    { label: 'objkt', href: 'https://objkt.com/@TODO' },
  ],
};

// stabile sortierung: innerhalb eines jahres bleibt die reihenfolge aus works.json
export const works = worksData
  .slice()
  .sort((a, b) => b.year - a.year)
  .map((w) => ({
    ...w,
    image: url(`/art/${w.year}/${w.slug}.webp`),
    thumb: url(`/art/${w.year}/${w.slug}_thumb.webp`),
    url: url(`/${SITE.seriesSlug}/${w.year}/#${w.slug}`),
  }));

// feste spanne — leere jahre bleiben sichtbar (laden = leerer viewer)
export const years = [2022, 2023, 2024, 2025, 2026];

export const animations = animationsData.map((a) => ({
  ...a,
  image: url(`/art/animations/${a.slug}.webp`),
  thumb: url(`/art/animations/${a.slug}_thumb.webp`),
}));

export const worksByYear = (year) => works.filter((w) => w.year === year);

export const featuredWorks = works.filter((w) => w.featured);
