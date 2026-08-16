# moe p. wellington — website konzept
### "art in the age of artificial reproduction" 2022–2026
Übergabedokument für die Umsetzung mit Claude Code

---

## 1. Vision in einem Satz

Eine minimalistische, ASCII-/Terminal-inspirierte Portfolio-Seite, die wie eine navigierbare Ordnerstruktur aus dem Indie-Internet der 90er/2000er wirkt — ruhige, reduzierte Chrome (Navigation, Typografie, Layout), damit die dichten, collagierten Kunstwerke selbst der lauteste, farbigste Teil der Seite bleiben.

## 2. Ästhetische Referenz — wichtige Klarstellung

Die hochgeladenen Werke (dichte Pseudo-Betriebssystem-Collagen, Windows-95-artige UI-Panels um surreale Kernmotive) dienten nur als **Kontext/Mood**, nicht als 1:1-Vorlage für das Site-Design. Die Website selbst soll bewusst anders wirken: **extrem minimalistisch, roh, retro, aber modern/ästhetisch — selbsterklärend, kein Schnickschnack, bisschen "idgaf"-Attitüde** (unaufgeregt, unangestrengt, keine Effekthascherei). Der Kontrast ist Programm: laute, maximalistische Kunst, präsentiert in einem betont zurückhaltenden, fast schmucklosen Rahmen.

**Referenzpunkt für diesen Stil:** Brutalist-Web-Design-Bewegung (z. B. Seiten wie brutalistwebsites.com als Stimmungsbild) trifft frühe Terminal-/Textfile-Ästhetik — keine Schatten, keine Rundungen, keine Gradients, keine Animationen außer den nötigsten. Struktur und Typografie *sind* das Design.

### Hauptpalette — minimalistisch/roh/modern (Standard)
```
--bg:        #f4f2ec   (rohes Off-White/Papier, kein reines Weiß)
--fg:        #111111   (fast Schwarz, kein reines Schwarz)
--fg-dim:    #8a8a82   (gedämpftes Grau für Meta-Infos, Linien, Breadcrumbs)
--accent:    #ff3d00   (ein einziger roher Akzentton — Signal-Rot/Orange,
                        sehr sparsam: aktive Links, Cursor, Hover-States)
--line:      #111111   (1px Linien, keine grauen Soft-Borders)
```
Dark-Mode-Umkehr optional (bg/fg getauscht) — aber **nur eine** Palette gleichzeitig aktiv, kein Regenbogen.

Prinzipien: keine Rundungen, keine Schatten, harte 1px-Kanten, viel Weißraum, Typografie trägt fast die gesamte visuelle Last. Wirkt wie ein sehr bewusst gestaltetes Text-Interface, nicht wie eine "Vorlage".

### Alternative Palette — Werk-inspiriert (optionaler Theme-Toggle, nicht Standard)
Falls gewünscht als zuschaltbares zweites Theme (z. B. Button „alt view" im Footer), abgeleitet aus den Referenzbildern:
```
--bg-alt2:      #0d1b2e   (Nachtblau)
--fg-alt2:      #e8e2d0   (Creme)
--accent-alt2:  #c23b2e   (Rot)
--accent2-alt2: #d9a441   (Ocker/Gelb)
```
Das ist ein Extra, kein Muss — für den ersten Launch reicht die Hauptpalette allein völlig.

### Typografie
- Ein Monospace-Font als Grundlage (z. B. „JetBrains Mono", „IBM Plex Mono", „Space Mono"), lokal gehostet (nicht via Google Fonts CDN — s. Rechtliches). Monospace liefert den "roh/retro"-Charakter, ohne auf Pixel-Font-Gimmicks angewiesen zu sein.
- Große, selbstbewusste Schriftgrößen für Titel/Headlines, viel Zeilenabstand — die Ruhe kommt aus dem Raum, nicht aus Dekoration.
- Konsequent kleingeschrieben (kein Kapitälchen-Zwang), Satzzeichen wie `/`, `~`, `>`, `#`, `_` als funktionale Struktur-Elemente statt Deko.
- Keine Serifen, keine "schönen" Display-Fonts — die Schrift soll aussehen, als hätte sie niemand extra ausgesucht, obwohl sie es wurde.

## 3. Navigation — ASCII-Ordnerbaum

Sidebar (oder bei mobile: ausklappbares Terminal-Menü), die wie ein Verzeichnisbaum aussieht:

```
~/moe-p-wellington
│
├── art-in-the-age-of-artificial-reproduction_2022-2026/
│   ├── 2022/
│   ├── 2023/
│   ├── 2024/
│   ├── 2025/
│   └── 2026/
│
├── selected-works/         ← scrollbare Auswahl / Feed
├── character-creator/      ← [WIP] Platzhalter
├── about/                  ← Kurztext + Social Links
└── info/                   ← Impressum + Datenschutz
```

Social Links (statt Kontaktformular) sind der einzige "Kontaktweg" der Seite — platziert im Footer (auf jeder Seite sichtbar, klein) und nochmal gebündelt auf `/about/`. Kein Formular, keine Formular-Datenverarbeitung, kein zusätzlicher Datenschutz-Aufwand dafür.

Unter-Collections sind schlicht Jahres-Ordner (2022–2026) — keine thematischen Sammlungsnamen. Jedes Werk bekommt im Datenmodell ein `year`-Feld, daraus generiert sich die Ordnerstruktur automatisch. Neue Jahre lassen sich später einfach ergänzen.

Soll `selected-works` eine reine Kuration sein (von dir händisch gepflegte Liste) oder automatisch die neuesten Werke ziehen? Empfehlung: beides kombinierbar über ein einfaches Datenfeld `featured: true/false` pro Werk.

## 4. Seiten im Detail

### Startseite (`/`)
Wirkt wie ein Terminal/Root-Verzeichnis beim Öffnen: kurzer Boot-artiger Intro-Text (optional, dezent, kein Gimmick-Overkill), dann direkter Einstieg in den Ordnerbaum + darunter ein horizontal oder vertikal scrollender Streifen mit den neuesten/ausgewählten Werken (kleine Thumbnails, Klick öffnet Vollansicht).

### Jahres-Seiten (`/art-in-the-age-of-artificial-reproduction_2022-2026/[jahr]/`)
Grid oder vertikale Scroll-Galerie der Werke dieses Jahres. Jedes Werk: Titel, ggf. kurze Notiz, Klick → Lightbox/Detailansicht (großformatig, Bild im Zentrum, minimal-UI drumherum). Navigation zwischen Jahren einfach über die Sidebar oder Prev/Next-Pfeile am Seitenende.

### Selected Works (`/selected-works/`)
Endlos-/Lazy-Scroll durch eine kuratierte Auswahl quer durch alle Collections — das "coole scrollen" das du erwähnt hast. Technisch: Intersection Observer für Lazy Loading, sanftes Fade-in pro Bild, keine aufdringliche Animation.

### Character Creator (`/character-creator/`)
Platzhalter-Seite: „work in progress" im gleichen ASCII-Look, evtl. ein simpler Fortschrittsbalken oder Countdown-Ästhetik im Terminal-Stil, kein funktionaler Inhalt nötig für jetzt.

### About (`/about/`)
Kurztext zu dir/dem Projekt „Art in the Age of Artificial Reproduction" — Statement, künstlerischer Kontext, ggf. warum 2022–2026 als Zeitspanne gewählt ist.

### Info (`/info/`)
Enthält Impressum + Datenschutzerklärung als zwei Unterabschnitte oder Unterseiten (siehe Abschnitt 6).

## 5. Features / Interaktion

- **Scroll-Galerie**: Lazy-loaded, ruhige Fade-Transitions, keine Parallax-Spielereien (passt nicht zum minimalistischen Anspruch)
- **Lightbox**: Vollbild-Ansicht einzelner Werke, Tastatur-Navigation (←/→ wie in einem alten Dateibrowser), ESC zum Schließen
- **Ordner-Navigation**: Klickbare Pfade wie in einem Terminal (`cd`-artige Übergänge), Breadcrumb oben als `~/art-in-the-age.../collection-name`
- Optional, falls gewünscht (nicht zwingend): dezenter Scanline-/CRT-Flicker-Effekt als Toggle, kein Dauerzustand — leicht zu übertreiben, deshalb nur als optionales Extra einplanen
- Keine Cookie-Banner, keine externen Tracker (siehe Rechtliches) → Seite bleibt technisch schlank und rechtlich einfach

## 6. Rechtliches — konkret umzusetzen

**Impressum** (eigene Unterseite `/info/impressum/`):
Auch ohne Verkauf empfehlenswert/vermutlich erforderlich, da die Seite als "Werbung in eigener Sache" gilt. Pflichtangaben nach § 5 DDG:
- Vollständiger bürgerlicher Name — **nicht** nur „Moe P. Wellington" (Künstlername allein reicht laut Rechtsprechung nicht, LG Oldenburg 2020)
- Format: „[Bürgerlicher Name], handelnd unter dem Künstlernamen Moe P. Wellington"
- Ladungsfähige Anschrift (falls Privatadresse unerwünscht: kommerzieller Anschriften-Service als Alternative recherchieren)
- E-Mail-Adresse (Pflicht), Telefonnummer optional aber üblich
- *(Platzhaltertext im Code einbauen, den du final selbst ausfüllst — Claude Code sollte hier keinen Fantasienamen erfinden)*

**Datenschutzerklärung** (`/info/datenschutz/`):
Unabhängig vom Impressum immer nötig, sobald die Seite live ist. Muss abdecken:
- Server-Logs/Hosting (wer hostet, welche Daten werden technisch erfasst)
- Ob/welche Fonts extern geladen werden (Empfehlung: lokal hosten, dann entfällt der Punkt)
- Kein Kontaktformular vorgesehen → dieser Punkt entfällt komplett, Datenschutzerklärung bleibt entsprechend kurz
- Verlinkung zu Social-Media-Profilen: reiner Link, keine eingebetteten Social-Widgets/Follow-Buttons mit Tracking-Skripten (die würden die Datenschutzerklärung wieder komplizierter machen)
- Ob Analytics eingesetzt wird (Empfehlung: verzichten oder cookie-freie, self-hosted Lösung wie Plausible/Umami — dann kein Cookie-Banner nötig)
- Widerrufsrecht, Kontakt für Datenschutzanfragen (identisch zur Impressum-Person)

**Urheberrecht**: Werke sind deine eigenen — kein Handlungsbedarf, evtl. Copyright-Hinweis im Footer (`© [Jahr] Moe P. Wellington`). Da einige Werke KI-gestützt (Midjourney) entstanden sind: rechtlich in Deutschland aktuell keine Kennzeichnungspflicht für ein persönliches Kunstportfolio, aber als bewusste künstlerische Aussage evtl. im About-Text thematisierbar (Teil deines Konzepts "Art in the Age of Artificial Reproduction" — passt sogar inhaltlich).

## 7. Tech-Stack-Empfehlung für Claude Code

- **Framework**: Astro (statisch, sehr schnell, minimal JS-Overhead — passt zur "leichten" Terminal-Ästhetik) oder alternativ plain Vite + Vanilla JS, falls du komplett schlank bleiben willst
- **Content**: Werke als strukturierte Daten (JSON oder Markdown-Frontmatter pro Werk: Titel, Collection, Jahr, Bildpfad, `featured`-Flag) — so kannst du später Werke ergänzen, ohne Code anzufassen
- **Bilder**: Lazy Loading + responsive Formate (WebP/AVIF-Export), da deine Referenzbilder groß und detailreich sind
- **Fonts**: lokal einbinden (self-hosted), keine Google-Fonts-CDN-Anfrage
- **Hosting**: statisch deploybar (Vercel/Netlify/eigener Server) — Serverstandort ggf. für Datenschutzerklärung relevant
- **Kein** Tracking-/Analytics-Setup im ersten Wurf, oder cookie-freie Variante

## 8. Offene Fragen an dich (vor dem Claude-Code-Start klären)

1. Bürgerlicher Name + Adresse fürs Impressum (nicht an Claude Code als Klartext geben müssen — kann als `TODO`-Platzhalter im Code stehenbleiben)
2. Welche Social-Media-Profile sollen verlinkt werden (Instagram, Twitter/X, etc.)?
3. Reine Bildergalerie oder auch Text/Statements zu einzelnen Werken?
4. Domain schon vorhanden? (relevant für Hosting-Wahl)
5. Dark-Mode/Alt-Palette-Toggle: gewünscht für den ersten Launch oder später?
