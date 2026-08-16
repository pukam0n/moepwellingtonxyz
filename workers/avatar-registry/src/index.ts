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
      // stats/klasse: locker validiert, rein informativ (für restore)
      const stats =
        body.stats && typeof body.stats === 'object'
          ? Object.fromEntries(
              Object.entries(body.stats)
                .slice(0, 8)
                .map(([k, v]) => [String(k).slice(0, 24), Math.max(0, Math.min(9, Number(v) || 0))])
            )
          : undefined;
      const klass = body.klass ? String(body.klass).slice(0, 64) : undefined;
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

    if (url.pathname === '/me') {
      const token = url.searchParams.get('token') ?? '';
      if (!token) return json({ error: 'no_token' }, 400);
      const character = await storage.get<Character>('token:' + token);
      return character ? json(character) : json({ error: 'not_found' }, 404);
    }

    return json({ error: 'not_found' }, 404);
  }
}
