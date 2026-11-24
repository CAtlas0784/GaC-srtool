// GaCy GO endgame catalog sync helpers.
//
// The web app owns the endgame data (assets/firefly-endgame.json) and pushes
// it to the server with PUT /api/endgame/catalog. The server answers with a
// status document that says, per group and stage, whether the room can be
// played and why not. Everything here is pure so node:test can cover it; the
// network calls live in app.js.

export const ENDGAME_SYNC_MODES = ['moc', 'pf', 'as', 'peak'];
export const ENDGAME_CATALOG_FORMAT_VERSION = 1;
export const ENDGAME_CATALOG_SOURCE_NAME = 'GaCy-Srtool';
export const ENDGAME_PLACEMENTS_URL = './assets/endgame-placements.json';
export const ENDGAME_CATALOG_PATH = '/api/endgame/catalog';

/**
 * Canonical JSON: object keys sorted at every depth, no whitespace. Strings
 * and numbers use JSON.stringify, which matches Go's encoder for this data
 * (no floats, and no < > & U+2028 U+2029 that Go would escape by default).
 */
export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') {
    const text = JSON.stringify(value);
    // undefined, functions and symbols have no JSON form; JSON.stringify
    // drops them from objects and turns them into null inside arrays.
    return text === undefined ? 'null' : text;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const keys = Object.keys(value).filter((key) => value[key] !== undefined && typeof value[key] !== 'function').sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
}

/** Characters Go's json.Marshal escapes by default; their presence would make the two hashes differ. */
export function findGoEscapedCharacters(text) {
  const found = new Set();
  for (const char of String(text)) {
    if (char === '<' || char === '>' || char === '&' || char === ' ' || char === ' ') found.add(char);
  }
  return [...found];
}

// Plain SHA-256 for pages served over plain http on a LAN address, where
// crypto.subtle does not exist.
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

export function sha256HexFallback(bytes) {
  const length = bytes.length;
  const padded = new Uint8Array(((length + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(length / 0x20000000), false);
  view.setUint32(padded.length - 4, (length << 3) >>> 0, false);
  const h = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const w = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i += 1) {
      const t1 = (hh + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) >>> 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h[0] += a; h[1] += b; h[2] += c; h[3] += d; h[4] += e; h[5] += f; h[6] += g; h[7] += hh;
  }
  return [...h].map((word) => word.toString(16).padStart(8, '0')).join('');
}

/** Hex SHA-256 of the UTF-8 bytes of `text`. */
export async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    const digest = new Uint8Array(await subtle.digest('SHA-256', bytes));
    return [...digest].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return sha256HexFallback(bytes);
}

/** The four modes exactly as firefly-endgame.json stores them. */
export function endgameModesForSync(catalog) {
  const modes = {};
  for (const mode of ENDGAME_SYNC_MODES) {
    const groups = catalog?.modes?.[mode]?.groups;
    modes[mode] = { groups: Array.isArray(groups) ? groups : [] };
  }
  return modes;
}

function positiveInt(value) {
  return Number.isInteger(value) && value > 0;
}

// Ids a placement key may name: a floor/level id or a battle stage id.
function knownStageIds(modes, mode) {
  const ids = new Set();
  for (const group of modes[mode]?.groups || []) {
    for (const level of group.levels || []) {
      ids.add(Number(level.id));
      for (const side of level.sides || []) ids.add(Number(side.stageId));
    }
    for (const stage of group.stages || []) {
      ids.add(Number(stage.id));
      ids.add(Number(stage.stageId));
    }
  }
  return ids;
}

/**
 * Keeps only placements that name all three ids and where they came from.
 * Placements must never be guessed, so an entry without a source is dropped,
 * and so is one for a stage the catalog does not have.
 * Returns { placements, dropped: [{ mode, stageId, reason }] }.
 */
export function verifiedPlacements(document, modes) {
  const placements = {};
  const dropped = [];
  const source = document?.placements && typeof document.placements === 'object' ? document.placements : {};
  for (const mode of ENDGAME_SYNC_MODES) {
    const entries = source[mode] && typeof source[mode] === 'object' ? source[mode] : {};
    const known = knownStageIds(modes, mode);
    for (const [stageId, entry] of Object.entries(entries)) {
      let reason = '';
      if (!/^[1-9]\d*$/.test(stageId) || !known.has(Number(stageId))) reason = 'unknown-stage';
      else if (!positiveInt(entry?.map_entrance_id) || !positiveInt(entry?.maze_group_id) || !positiveInt(entry?.npc_monster_id)) reason = 'missing-id';
      else if (typeof entry?.source !== 'string' || !entry.source.trim()) reason = 'missing-source';
      if (reason) {
        dropped.push({ mode, stageId, reason });
        continue;
      }
      placements[mode] ||= {};
      placements[mode][stageId] = {
        map_entrance_id: entry.map_entrance_id,
        maze_group_id: entry.maze_group_id,
        npc_monster_id: entry.npc_monster_id,
        source: entry.source.trim()
      };
    }
  }
  return { placements, dropped };
}

/**
 * Builds the PUT /api/endgame/catalog body. `sha256` covers the canonical
 * JSON of `modes` only, so it identifies the data regardless of placements.
 */
export async function buildEndgameCatalogPayload(catalog, placementsDocument) {
  const modes = endgameModesForSync(catalog);
  const canonical = canonicalJson(modes);
  const sha256 = await sha256Hex(canonical);
  const { placements, dropped } = verifiedPlacements(placementsDocument, modes);
  return {
    payload: {
      format_version: ENDGAME_CATALOG_FORMAT_VERSION,
      source: {
        name: ENDGAME_CATALOG_SOURCE_NAME,
        url: String(catalog?.source || ''),
        version: String(catalog?.version || ''),
        sha256
      },
      modes,
      placements
    },
    sha256,
    version: String(catalog?.version || ''),
    droppedPlacements: dropped,
    goEscaped: findGoEscapedCharacters(canonical)
  };
}

/**
 * Accepts the GET/PUT status document, or null when the body is not one (an
 * older server answers unknown paths with {"retcode":0}).
 */
export function parseEndgameStatus(body) {
  if (!body || typeof body !== 'object' || typeof body.stored !== 'boolean') return null;
  const modes = {};
  const rawModes = body.modes && typeof body.modes === 'object' ? body.modes : {};
  for (const [mode, value] of Object.entries(rawModes)) {
    const groups = Array.isArray(value?.groups) ? value.groups : [];
    modes[mode] = {
      groups: groups.map((group) => ({
        id: Number(group?.id) || 0,
        status: String(group?.status || ''),
        reason: group?.reason == null ? '' : String(group.reason),
        stages: (Array.isArray(group?.stages) ? group.stages : []).map((stage) => ({
          id: Number(stage?.id) || 0,
          status: String(stage?.status || ''),
          reason: stage?.reason == null ? '' : String(stage.reason)
        }))
      }))
    };
  }
  return {
    stored: body.stored,
    source: body.source && typeof body.source === 'object' ? body.source : null,
    received_at: body.received_at ?? null,
    modes
  };
}

/** Why the web should PUT: 'missing', 'changed', or '' when the server already has this data. */
export function endgamePushReason(status, localSha256) {
  if (!status || !status.stored || !status.source) return 'missing';
  return String(status.source.sha256 || '').toLowerCase() === String(localSha256 || '').toLowerCase() ? '' : 'changed';
}

/** The `errors` list of a 400 reply, as display strings. */
export function endgameCatalogErrors(body) {
  const errors = Array.isArray(body?.errors) ? body.errors : [];
  return errors.map((error) => {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object') {
      const where = error.path || error.field || error.pointer || '';
      const message = error.message || error.error || error.reason || JSON.stringify(error);
      return where ? `${where}: ${message}` : String(message);
    }
    return String(error);
  });
}

/** Per-mode counts for the summary chips. */
export function summarizeEndgameStatus(status) {
  const summary = {};
  for (const [mode, value] of Object.entries(status?.modes || {})) {
    const groups = value.groups || [];
    const stages = groups.flatMap((group) => group.stages || []);
    summary[mode] = {
      groups: groups.length,
      playableGroups: groups.filter((group) => group.status === 'playable').length,
      stages: stages.length,
      playableStages: stages.filter((stage) => stage.status === 'playable').length
    };
  }
  return summary;
}
