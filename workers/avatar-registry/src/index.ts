// avatar registry — zentrales "standesamt" für den character creator.
// jeder sprite ist pro generation nur 1x vergebbar, jeder name global 1x.
// besitznachweis ohne anmeldung: geheimes token, das nur der ersteller kennt.
//
// endpoints:
//   GET  /status          -> { count, gen, taken: ["041", ...], remaining }
//   POST /claim           -> body { sprite: "041", name: "..." }
//                            201 { num, gen, sprite, name, token, created }
//                            409 { error: "sprite_taken" | "name_taken" }
//   GET  /me?token=...    -> gespeicherter charakter oder 404
//   GET  /book            -> alle charaktere, öffentliche felder, neueste zuerst
//   POST /repair          -> body { token, stats?, klass? }
//                            trägt NUR fehlende attribute/klasse nach
//                            (für alte claims ohne stats) — nie überschreiben
//
// generationen: sind alle 266 sprites einer generation vergeben, beginnt die
// nächste — gleiche sprites, neue runde (gespiegelt / invertiert rendert der
// client). gen = floor(count / 266) + 1, da uniqueness pro gen erzwungen wird.

const SPRITE_COUNT = 266;
const NAME_MAX = 24;

const ALLOWED_ORIGINS = [
  'https://moepwellington.xyz',
  'https://www.moepwellington.xyz',
  'https://pukam0n.github.io',
  'http://localhost:4321',
];

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Cache-Control': 'no-store',
  };
}

export interface Env {
  REGISTRY: DurableObjectNamespace;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });
    // ein einziges globales register
    const stub = env.REGISTRY.get(env.REGISTRY.idFromName('main'));
    const res = await stub.fetch(req);
    const headers = new Headers(res.headers);
    for (const [k, v] of Object.entries(corsHeaders(req))) headers.set(k, v);
    return new Response(res.body, { status: res.status, headers });
  },
} satisfies ExportedHandler<Env>;

type Character = {
  num: number;
  gen: number;
  sprite: string;
  name: string;
  created: string;
  // vom client mitgeliefert, damit restore attribute + klasse wiederherstellt
  stats?: Record<string, number>;
  klass?: string;
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

// ---- attribute & klassen: server ist die einzige wahrheit ----
// spiegel der creator-logik (character-creator/index.astro) — klasse wird
// IMMER aus den stats abgeleitet, client-angaben werden ignoriert.
// stats sind nur gültig als exakt 5 werte 1..5 mit summe 15 (10 punkte + basis)
const STAT_KEYS = ['literacy', 'bandwidth', 'provenance', 'friction', 'patience'] as const;
type Stats = Record<(typeof STAT_KEYS)[number], number>;

function validStats(x: unknown): Stats | null {
  if (!x || typeof x !== 'object') return null;
  const out = {} as Stats;
  let sum = 0;
  for (const k of STAT_KEYS) {
    const v = Number((x as Record<string, unknown>)[k]);
    if (!Number.isInteger(v) || v < 1 || v > 5) return null;
    out[k] = v;
    sum += v;
  }
  return sum === 15 ? out : null;
}

const PAIR_CLASSES: Record<string, Record<string, string>> = {
  literacy: { bandwidth: 'the footnote maximalist', provenance: 'the meme historian', friction: 'the institutional critic', patience: 'the slow critic' },
  bandwidth: { literacy: 'the dataset scavenger', provenance: 'the contamination archivist', friction: 'the glitch auteur', patience: 'the render hermit' },
  provenance: { literacy: 'the forensic curator', bandwidth: 'the rights-holder', friction: 'the claimant', patience: 'the conservator' },
  friction: { literacy: 'the poor-image theologian', bandwidth: 'the compression ascetic', provenance: 'the material witness', patience: 'the craft fundamentalist' },
  patience: { literacy: 'the auteurist', bandwidth: 'the slop auteur', provenance: 'the labor romantic', friction: 'the director' },
};
const SPECIALS: Array<[(s: Stats) => boolean, string]> = [
  [(s) => s.literacy === 5 && s.friction === 5, 'the adversarial user'],
  [(s) => s.friction === 5 && s.bandwidth === 1, 'the refuser'],
  [(s) => s.bandwidth === 5 && s.provenance === 1, 'the middleman'],
  [(s) => s.patience === 5 && s.literacy === 1, 'the sleeper'],
  [(s) => s.provenance === 1 && s.literacy >= 4, 'the revisionist'],
  [(s) => s.bandwidth >= 4 && s.friction === 1, 'the normie'],
  [(s) => STAT_KEYS.every((k) => s[k] >= 2 && s[k] <= 4) && STAT_KEYS.filter((k) => s[k] === 4).length <= 1, 'the model citizen'],
];

function classOf(s: Stats): string {
  if (STAT_KEYS.every((k) => s[k] === 3)) return 'the reproduction';
  for (const [test, name] of SPECIALS) if (test(s)) return name;
  const order = [...STAT_KEYS].sort(
    (a, b) => s[b] - s[a] || STAT_KEYS.indexOf(a) - STAT_KEYS.indexOf(b)
  );
  return PAIR_CLASSES[order[0]][order[1]];
}

export class Registry {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  // durable objects arbeiten anfragen seriell ab (input gate) —
  // gleichzeitige claims können sich daher nicht überholen: atomar.
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const storage = this.state.storage;

    if (url.pathname === '/status') {
      const count = (await storage.get<number>('count')) ?? 0;
      const gen = Math.floor(count / SPRITE_COUNT) + 1;
      const takenMap = await storage.list({ prefix: `sprite:${gen}:` });
      const taken = [...takenMap.keys()].map((k) => k.split(':')[2]);
      return json({ count, gen, taken, remaining: SPRITE_COUNT - taken.length });
    }

    if (url.pathname === '/claim' && req.method === 'POST') {
      let body: { sprite?: string; name?: string; stats?: Record<string, number>; klass?: string };
      try {
        body = await req.json();
      } catch {
        return json({ error: 'bad_request' }, 400);
      }
      const sprite = String(body.sprite ?? '');
      const name = String(body.name ?? '').trim();
      // stats streng validieren (1..5, summe 15); klasse wird NICHT vom
      // client übernommen, sondern deterministisch abgeleitet — schummeln
      // per manipuliertem request ist damit zwecklos
      const stats = validStats(body.stats) ?? undefined;
      if (body.stats && !stats) return json({ error: 'bad_stats' }, 400);
      const klass = stats ? classOf(stats) : undefined;
      if (!/^\d{3}$/.test(sprite) || Number(sprite) >= SPRITE_COUNT) {
        return json({ error: 'bad_sprite' }, 400);
      }
      if (name.length < 1 || name.length > NAME_MAX) {
        return json({ error: 'bad_name' }, 400);
      }

      const count = (await storage.get<number>('count')) ?? 0;
      const gen = Math.floor(count / SPRITE_COUNT) + 1;
      const nameKey = 'name:' + name.toLowerCase().normalize('NFKC');
      const spriteKey = `sprite:${gen}:${sprite}`;

      if (await storage.get(spriteKey)) return json({ error: 'sprite_taken' }, 409);
      if (await storage.get(nameKey)) return json({ error: 'name_taken' }, 409);

      const num = count + 1;
      const token = crypto.randomUUID() + '-' + crypto.randomUUID();
      const character: Character = {
        num,
        gen,
        sprite,
        name,
        created: new Date().toISOString(),
        stats,
        klass,
      };
      await storage.put({
        count: num,
        [spriteKey]: num,
        [nameKey]: num,
        ['token:' + token]: character,
      });
      return json({ ...character, token }, 201);
    }

    if (url.pathname === '/book') {
      // öffentliches gästebuch: profil-felder inkl. stats — nie tokens
      const map = await storage.list<Character>({ prefix: 'token:' });
      const residents = [...map.values()]
        .map((c) => ({
          num: c.num,
          gen: c.gen,
          sprite: c.sprite,
          name: c.name,
          klass: c.klass ?? null,
          stats: validStats(c.stats) ?? null,
          created: c.created,
        }))
        .sort((a, b) => b.num - a.num);
      return json({ count: residents.length, residents });
    }

    if (url.pathname === '/repair' && req.method === 'POST') {
      // nachtrag für alte charaktere, deren claim noch keine attribute
      // gespeichert hat: füllt NUR fehlende felder auf — bestehende stats
      // und klasse sind unantastbar (entscheidung auf lebenszeit)
      let body: { token?: string; stats?: Record<string, number>; klass?: string };
      try {
        body = await req.json();
      } catch {
        return json({ error: 'bad_request' }, 400);
      }
      const key = 'token:' + String(body.token ?? '');
      const character = await storage.get<Character>(key);
      if (!character) return json({ error: 'not_found' }, 404);
      let changed = false;
      if (!validStats(character.stats)) {
        // nur wenn (gültige) stats fehlen: streng validiert nachtragen
        const stats = validStats(body.stats);
        if (!stats) return json({ error: 'bad_stats' }, 400);
        character.stats = stats;
        character.klass = classOf(stats);
        changed = true;
      } else if (!character.klass) {
        // stats vorhanden, klasse fehlt: deterministisch nachziehen
        character.klass = classOf(character.stats as Stats);
        changed = true;
      }
      if (changed) await storage.put(key, character);
      return json(character);
    }

    if (url.pathname === '/me') {
      const token = url.searchParams.get('token') ?? '';
      if (!token) return json({ error: 'no_token' }, 400);
      const character = await storage.get<Character>('token:' + token);
      return character ? json(character) : json({ error: 'not_found' }, 404);
    }

    return json({ error: 'not_found' }, 404);
  }
}
