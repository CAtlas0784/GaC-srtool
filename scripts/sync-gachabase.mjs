#!/usr/bin/env node
/**
 * Gachabase CLI Sync Utility for GaC-srtool & GaC-hkrpg-go
 * Automatically fetches the complete character and lightcone catalog from Gachabase,
 * detects new/updated items, and downloads high-res images to assets/.
 *
 * Usage:
 *   node scripts/sync-gachabase.mjs           # Syncs all characters & LCs, downloading missing assets
 *   node scripts/sync-gachabase.mjs --char 1511
 *   node scripts/sync-gachabase.mjs --lc 23065
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

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

function parseSvelteKitCatalog(html) {
  if (!html || typeof html !== 'string') return null;
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const s of scripts) {
    const text = s[1].trim();
    if (text.includes('resolve') && text.includes('entries')) {
      const startIdx = text.indexOf('() => ');
      if (startIdx !== -1) {
        let code = text.substring(startIdx + 6).trim();
        if (code.endsWith(');')) code = code.slice(0, -2);
        else if (code.endsWith(')')) code = code.slice(0, -1);
        try {
          const fn = new Function('return (' + code + ')');
          const res = fn();
          return res[0]?.data;
        } catch (e) {}
      }
    }
  }
  return null;
}

const GACHABASE_PATHS = {
  1: 'Destruction', 2: 'Hunt', 3: 'Erudition', 4: 'Harmony',
  5: 'Nihility', 6: 'Preservation', 7: 'Abundance', 8: 'Remembrance', 9: 'Elation'
};

const GACHABASE_ELEMENTS = {
  1: 'Physical', 2: 'Fire', 4: 'Ice', 8: 'Thunder',
  16: 'Wind', 32: 'Quantum', 64: 'Imaginary'
};

async function syncAllCatalog() {
  console.log('====================================================');
  console.log('🔄 Syncing full game database from Gachabase...');
  console.log('====================================================');

  // 1. Sync Characters
  console.log('\n[1/2] Fetching characters catalog...');
  const { body: charBody } = await fetchHttps('https://hsr.gachabase.net/characters?lang=en&branch=beta');
  const charData = parseSvelteKitCatalog(charBody);

  let newAvatarImages = 0;
  if (charData && Array.isArray(charData.entries)) {
    console.log(`Found ${charData.entries.length} characters in Gachabase catalog.`);
    const assets = charData.refs?.assets || {};
    const avatarDir = path.join(ROOT_DIR, 'assets', 'avatars');
    fs.mkdirSync(avatarDir, { recursive: true });

    for (const entry of charData.entries) {
      const aid = entry.id;
      const dest = path.join(avatarDir, `${aid}.png`);
      const exists = fs.existsSync(dest) && fs.statSync(dest).size > 1000;

      if (!exists) {
        const hash = entry.assets?.square_icon_path_hash || entry.assets?.round_icon_path_hash;
        const iconUrl = assets[hash]?.url;
        if (iconUrl) {
          process.stdout.write(`  Downloading icon for [${entry.rarity}★] ${entry.name?.text || aid} (ID: ${aid})... `);
          const ok = await downloadBinary(iconUrl, dest);
          if (ok) {
            console.log('OK');
            newAvatarImages++;
          } else {
            console.log('FAILED');
          }
        }
      }
    }
  }

  // 2. Sync Lightcones
  console.log('\n[2/2] Fetching lightcones catalog...');
  const { body: lcBody } = await fetchHttps('https://hsr.gachabase.net/lightcones?lang=en&branch=beta');
  const lcData = parseSvelteKitCatalog(lcBody);

  let newLcImages = 0;
  if (lcData && Array.isArray(lcData.entries)) {
    console.log(`Found ${lcData.entries.length} lightcones in Gachabase catalog.`);
    const assets = lcData.refs?.assets || {};
    const lcDir = path.join(ROOT_DIR, 'assets', 'lightcones');
    fs.mkdirSync(lcDir, { recursive: true });

    for (const entry of lcData.entries) {
      const lcid = entry.id;
      const dest = path.join(lcDir, `${lcid}.png`);
      const exists = fs.existsSync(dest) && fs.statSync(dest).size > 1000;

      // Only auto-download 5-star or missing special lightcones
      if (!exists && (entry.rarity === 5 || lcid === 23065)) {
        const hash = entry.assets?.thumbnail_art_path_hash || entry.assets?.full_art_path_hash;
        const iconUrl = assets[hash]?.url;
        if (iconUrl) {
          process.stdout.write(`  Downloading art for [${entry.rarity}★] ${entry.name?.text || lcid} (ID: ${lcid})... `);
          const ok = await downloadBinary(iconUrl, dest);
          if (ok) {
            console.log('OK');
            newLcImages++;
          } else {
            console.log('FAILED');
          }
        }
      }
    }
  }

  console.log('\n====================================================');
  console.log(`✅ Gachabase Catalog Sync Completed!`);
  console.log(`   New Avatars downloaded: ${newAvatarImages}`);
  console.log(`   New Lightcones downloaded: ${newLcImages}`);
  console.log('====================================================\n');
}

(async () => {
  const args = process.argv.slice(2);
  const charIdx = args.indexOf('--char');
  const lcIdx = args.indexOf('--lc');

  if (charIdx !== -1 && args[charIdx + 1]) {
    const aid = parseInt(args[charIdx + 1], 10);
    console.log(`Syncing single character: ${aid}`);
    const { body } = await fetchHttps(`https://hsr.gachabase.net/characters/${aid}/slug/beta?lang=en`);
    // Download icon
    const match = body.match(/https:\/\/cdn\.gachabase\.net\/hsr\/assets\/[a-f0-9]+\.png/);
    if (match) {
      const dest = path.join(ROOT_DIR, 'assets', 'avatars', `${aid}.png`);
      await downloadBinary(match[0], dest);
      console.log(`Saved icon to ${dest}`);
    }
    return;
  }

  if (lcIdx !== -1 && args[lcIdx + 1]) {
    const lcid = parseInt(args[lcIdx + 1], 10);
    console.log(`Syncing single lightcone: ${lcid}`);
    const { body } = await fetchHttps(`https://hsr.gachabase.net/lightcones/${lcid}/slug/beta?lang=en`);
    const match = body.match(/https:\/\/cdn\.gachabase\.net\/hsr\/assets\/[a-f0-9]+\.png/);
    if (match) {
      const dest = path.join(ROOT_DIR, 'assets', 'lightcones', `${lcid}.png`);
      await downloadBinary(match[0], dest);
      console.log(`Saved LC art to ${dest}`);
    }
    return;
  }

  // Default: Sync full catalog
  await syncAllCatalog();
})();
