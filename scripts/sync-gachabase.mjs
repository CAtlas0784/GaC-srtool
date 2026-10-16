#!/usr/bin/env node
/**
 * Gachabase CLI Sync Utility for GaC-srtool & GaC-hkrpg-go
 * Fetches character/lightcone datamine from hsr.gachabase.net,
 * downloads assets, and outputs or updates metadata files.
 *
 * Usage:
 *   node scripts/sync-gachabase.mjs --char 1511
 *   node scripts/sync-gachabase.mjs --lc 23065
 *   node scripts/sync-gachabase.mjs --all-beta
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const KNOWN_BETA_CHARACTERS = [1501, 1502, 1505, 1511, 1513];
const KNOWN_BETA_LIGHTCONES = [23065];

function fetchHttps(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        let nextUrl = res.headers.location;
        if (nextUrl.startsWith('/')) nextUrl = 'https://hsr.gachabase.net' + nextUrl;
        return resolve(fetchHttps(nextUrl));
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

function downloadBinary(url, destPath) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(true);
        });
      } else {
        res.resume();
        resolve(false);
      }
    }).on('error', () => resolve(false));
  });
}

function cleanRichText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<color=[^>]+>/gi, '')
    .replace(/<\/color>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\\n/g, '\n')
    .trim();
}

const GACHABASE_PATHS = {
  1: 'Destruction',
  2: 'Hunt',
  3: 'Erudition',
  4: 'Harmony',
  5: 'Nihility',
  6: 'Preservation',
  7: 'Abundance',
  8: 'Remembrance',
  9: 'Elation'
};

const GACHABASE_ELEMENTS = {
  1: 'Physical',
  2: 'Fire',
  4: 'Ice',
  8: 'Thunder',
  16: 'Wind',
  32: 'Quantum',
  64: 'Imaginary'
};

async function syncItem(type, id, branch = 'beta', lang = 'en') {
  const typeSlug = type === 'lightcone' ? 'lightcones' : 'characters';
  const url = `https://hsr.gachabase.net/${typeSlug}/${id}/slug/${branch}?lang=${lang}`;
  console.log(`\n[Gachabase] Fetching ${type} ${id} from ${url}...`);

  const { status, body } = await fetchHttps(url);
  if (status !== 200) {
    console.error(`[Error] Failed to fetch ${type} ${id}: HTTP ${status}`);
    return null;
  }

  const kitMatch = body.match(/kit\.start\(app,\s*element,\s*(\{.*?\})\);\s*\}\);/s);
  if (!kitMatch) {
    console.error(`[Error] SvelteKit payload not found in page for ${type} ${id}`);
    return null;
  }

  const fn = new Function('return (' + kitMatch[1] + ')');
  const kitData = fn();

  let targetData = null;
  for (const entry of kitData.data) {
    if (!entry) continue;
    const cand = entry.data?.data?.data || entry.data?.data || entry.data;
    if (cand && (cand.dto || cand.refs)) {
      targetData = cand;
      break;
    }
  }

  if (!targetData || !targetData.dto) {
    console.error(`[Error] DTO not found for ${type} ${id}`);
    return null;
  }

  const dto = targetData.dto;
  const refs = targetData.refs || {};
  const assetsMap = refs.assets || {};

  const resolveAsset = (hash) => {
    if (!hash) return null;
    return assetsMap[hash]?.url || `https://cdn.gachabase.net/hsr/assets/${hash}.png`;
  };

  const name = dto.name?.text || dto.name || `${type} ${id}`;
  const pathName = refs.paths?.[dto.path_id]?.name?.text || GACHABASE_PATHS[dto.path_id] || 'Unknown';
  const elementName = refs.types?.[dto.type_id]?.name?.text || GACHABASE_ELEMENTS[dto.type_id] || 'Unknown';

  console.log(`✨ Successfully parsed: [${dto.rarity}★] ${name} (${pathName} / ${elementName})`);

  // Download Avatar Icon / Splash
  if (type === 'character') {
    const iconUrl = resolveAsset(dto.assets?.round_icon_path_hash) || resolveAsset(dto.assets?.square_icon_path_hash);
    if (iconUrl) {
      const dest = path.join(ROOT_DIR, 'assets', 'avatars', `${id}.png`);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const ok = await downloadBinary(iconUrl, dest);
      console.log(`   Icon saved -> assets/avatars/${id}.png: ${ok ? 'OK' : 'FAILED'}`);
    }
  } else if (type === 'lightcone') {
    const iconUrl = resolveAsset(dto.assets?.full_art_path_hash) || resolveAsset(dto.assets?.thumbnail_art_path_hash);
    if (iconUrl) {
      const dest = path.join(ROOT_DIR, 'assets', 'lightcones', `${id}.png`);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const ok = await downloadBinary(iconUrl, dest);
      console.log(`   Lightcone art saved -> assets/lightcones/${id}.png: ${ok ? 'OK' : 'FAILED'}`);
    }
  }

  return {
    id: dto.id,
    name,
    rarity: dto.rarity,
    path: pathName,
    element: elementName,
    dto
  };
}

(async () => {
  const args = process.argv.slice(2);
  const charIdx = args.indexOf('--char');
  const lcIdx = args.indexOf('--lc');
  const allBeta = args.includes('--all-beta');

  if (allBeta) {
    console.log('--- Starting Sync for All Known Beta Characters & Lightcones ---');
    for (const cid of KNOWN_BETA_CHARACTERS) {
      await syncItem('character', cid);
    }
    for (const lcid of KNOWN_BETA_LIGHTCONES) {
      await syncItem('lightcone', lcid);
    }
    console.log('\n--- Beta Sync Completed ---');
    return;
  }

  if (charIdx !== -1 && args[charIdx + 1]) {
    const cid = parseInt(args[charIdx + 1], 10);
    await syncItem('character', cid);
    return;
  }

  if (lcIdx !== -1 && args[lcIdx + 1]) {
    const lcid = parseInt(args[lcIdx + 1], 10);
    await syncItem('lightcone', lcid);
    return;
  }

  console.log('Usage:');
  console.log('  node scripts/sync-gachabase.mjs --char <id>');
  console.log('  node scripts/sync-gachabase.mjs --lc <id>');
  console.log('  node scripts/sync-gachabase.mjs --all-beta');
})();
