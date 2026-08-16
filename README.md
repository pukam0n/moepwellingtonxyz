# moepwellington.xyz

portfolio-website für **moe p. wellington** — *art in the age of artificial reproduction*, 2022–2026.
brutalist/terminal-ästhetik nach [`moe-p-wellington-website-konzept (2).md`](./moe-p-wellington-website-konzept%20(2).md), gebaut mit [Astro](https://astro.build) (statisch, minimal JS).

## entwickeln

```sh
cd site
npm install
npm run dev        # http://localhost:4321
npm run build      # statischer export nach site/dist/
npm run preview
```

## werke pflegen

alle werke leben in **`site/src/data/works.json`** — kein code nötig:

```json
{
  "slug": "mein-neues-werk",
  "title": "mein neues werk",
  "year": 2026,
  "note": "optionale kurznotiz",
  "featured": true
}
```

- **originale liegen NICHT im repo** (bewusst — volle auflösung soll nicht öffentlich abgreifbar sein, prints!). workflow für neue werke: original lokal in einen ordner legen (pfad wie in `works.json` unter `"source"`), `npm run import-pics` (in `site/`) ausführen — erzeugt web-optimierte webp-versionen (1800px voll + 640px thumbnail) unter `site/public/art/<jahr>/` — und **nur die webps committen**. fehlende source-dateien meldet das script als "fehlt" und überspringt sie (die bestehenden webps bleiben unberührt).
- `featured: true` → erscheint auf der startseite und unter `/selected-works/`.
- neues jahr in `works.json` → jahres-seite und ordnerbaum-eintrag entstehen automatisch beim build.
- **titel und jahre der 16 importierten werke sind platzhalter** („untitled 01–16", gleichmäßig auf 2022–2026 verteilt) — in `works.json` durch echte titel/jahre ersetzen.

## canvas view (startseite `/`)

node-graph-ansicht im stil von "ai artist 208" / comfyui — **seit v2 die startseite** (die brutaliste ansicht lebt unter `/classic/` weiter). blauer canvas mit punktraster, gelbe + graue fenster, blaue kabel mit durchhang, klassische graue os-topbar mit `?`-hilfe. pan (hintergrund ziehen), zoom (mausrad / buttons unten rechts), fenster verschiebbar an der titelleiste.

- das **root-fenster** ist die schaltzentrale: jahres-fenster (2026 zuoberst, standardmäßig nur 2026 offen) und der character-creator lassen sich dort per klick an-/abschalten (zustand in localStorage).
- der **viewer** zeigt 1–4 werke (slider), hat einen `rnd ⚂`-zufallsbutton und ist am eck-grip **resizable** — bilder skalieren mit. das about-fenster ebenso.
- im `settings.cfg`-fenster sind **canvas-, fenster- und kabelfarbe einzeln** einstellbar (inkl. mixed-kabel-sets).
- unter 1100px breite: gestapelte fenster ohne kabel. quelle des designs: `ai_artist__208 (13).html` im repo-root.

## besucherzähler (archive activity node)

das "archive activity"-fenster im canvas zeigt einen 14-tage-balkengraph + "N visitors / last 7 days". ohne konfiguration läuft es im **demo-modus** (deterministisches fake-signal, klar gelabelt, kein tracking). live schalten:

1. kostenloses konto auf [goatcounter.com](https://www.goatcounter.com) anlegen (cookielos, open source, DSGVO-freundlich)
2. in den goatcounter-einstellungen **"allow adding visitor counts on your website"** aktivieren
3. den code (z. b. `moepwellington` für `moepwellington.goatcounter.com`) in `site/src/data/site.js` bei `GOATCOUNTER` eintragen
4. den vorbereiteten goatcounter-absatz in `site/src/pages/info/datenschutz.astro` freischalten (TODO-markierung entfernen)

damit wird auf allen seiten cookielos gezählt und die node zeigt echte zahlen (heutiger balken rot, aktualisiert sich minütlich).

## character creator (`/character-creator/`)

eigene seite im canvas-look mit subtilem morrowind-einschlag: name, sprite-reroll (266 sprites unter `site/public/sprites/`, unendlich rerolls), 10 verteilbare platzhalter-attribute (literacy/intention/memory/noise/patience), klasse wird aus dem dominanten attribut bestimmt (the exegete, the archivist, the static shepherd, …). "CREATE CHARACTER" speichert in localStorage; auf dem canvas erscheint dann oben links ein **gelocktes fenster** mit avatar, name, klasse und sprite-nummer (fixed, kamera-unabhängig; klick führt zurück in den creator). texte/klassen/attribute sind bewusst platzhalter zum kuratieren — alles in `site/src/pages/character-creator/index.astro`.

## avatar registry (unikate charaktere, `workers/avatar-registry/`)

cloudflare worker + durable object als zentrales "standesamt": jeder sprite pro **generation** nur 1x vergebbar, jeder **name global** 1x, besitz ohne anmeldung über ein geheimes **recovery-token** (steht in der herunterladbaren `character.txt`). sind alle 266 sprites einer generation vergeben, startet die nächste — gen 2 gespiegelt, gen 3 invertiert, gen 4 beides, dann zyklus.

**deployen (einmalig, ~10 min):**
1. in `workers/avatar-registry/`: `npx wrangler deploy` (loggt dich beim ersten mal bei cloudflare ein) — alternativ `src/index.ts` + `wrangler.jsonc` in dein lokal gescaffoldetes worker-projekt kopieren und von dort deployen
2. die ausgegebene url (z. b. `https://avatar-registry.xyz.workers.dev`) in `site/src/data/site.js` bei `REGISTRY` eintragen
3. datenschutzerklärung: absatz ergänzen, dass beim charakter-erstellen ein frei gewählter name + zeitpunkt auf cloudflare gespeichert wird (rechtsgrundlage art. 6 abs. 1 lit. a/f DSGVO); keine ip-speicherung durch unseren code

ohne konfigurierte `REGISTRY` läuft der creator im **lokalen modus** (klar gelabelt, keine unikate, kein server).

## vor dem launch (TODOs im code markiert)

1. **impressum** ausfüllen: `site/src/pages/info/impressum.astro` (bürgerlicher name, anschrift, e-mail)
2. **datenschutz** vervollständigen: `site/src/pages/info/datenschutz.astro` (hoster, serverstandort, log-dauer, datum)
3. **social links** eintragen: `site/src/data/site.js` (`socials`)
4. **about-text** ersetzen: `site/src/pages/about/index.astro`
5. **titel/jahre** der werke in `site/src/data/works.json` korrigieren

## deployment

**github pages (eingerichtet):** bei jedem push/merge auf `main` baut `.github/workflows/deploy.yml` die seite und deployt sie automatisch nach
**https://pukam0n.github.io/moepwellingtonxyz/** — nach dem merge dauert das ~1–2 minuten (fortschritt unter dem "actions"-tab).

einmalig prüfen: repo → settings → pages → source muss auf **"github actions"** stehen (der workflow versucht das selbst zu aktivieren; falls der erste lauf mit einem pages-fehler abbricht, dort einmal umstellen und den workflow unter actions erneut starten).

eigene domain später: in den pages-settings custom domain eintragen — der workflow passt base-pfad und url dann automatisch an.

alternativ läuft der statische output (`site/dist/`, build: `npm run build` in `site/`) auch auf vercel/netlify/jedem webserver.

keine cookies, kein tracking, fonts (jetbrains mono) self-hosted — datenschutzerklärung bleibt entsprechend kurz.

## store

das store-fenster im canvas (an-/abschaltbar im root-fenster) rendert seine produkte aus **`site/src/data/store.json`**:

```json
{
  "id": "print-untitled-13",
  "title": "untitled 13 — print",
  "detail": "A2 giclée · edition of 10 · signed",
  "price": 120,
  "status": "soon",
  "link": "",
  "work": "untitled-13"
}
```

- `status`: `"soon"` (grauer platzhalter), `"available"` (roter buy-button, braucht `link`), `"sold_out"`
- `link`: **stripe payment link** — im stripe-dashboard pro produkt anlegen (products → payment links), url hier eintragen, `status` auf `"available"` → fertig, kein code nötig
- `work`: optionaler werk-slug für das thumbnail

**vor dem ersten echten verkauf klären (rechtlich, DE):** widerrufsbelehrung + agb + versandkosten/lieferzeiten-angaben, impressum ggf. um umsatzsteuer-status erweitern (kleinunternehmerregelung §19 UStG angeben falls zutreffend). stripe übernimmt zahlungsdaten-compliance, aber nicht das fernabsatzrecht.
