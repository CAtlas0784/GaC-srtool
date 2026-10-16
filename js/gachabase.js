// Gachabase Data Fetcher, Parser & FreeSR Importer Module
// Supports fetching datamined/beta characters, lightcones, and relics from hsr.gachabase.net
// Integrates with GaC-srtool runtime metadata, IndexedDB cache, and FreeSR / persistent saves.

export const GACHABASE_BASE_URL = 'https://hsr.gachabase.net';
export const GACHABASE_CDN_URL = 'https://cdn.gachabase.net';

// Path ID mappings according to HSR engine / Gachabase
export const GACHABASE_PATHS = {
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

// Element / Type ID mappings
export const GACHABASE_ELEMENTS = {
  1: 'Physical',
  2: 'Fire',
  4: 'Ice',
  8: 'Thunder', // Lightning
  16: 'Wind',
  32: 'Quantum',
  64: 'Imaginary'
};

// Stat ID mappings
export const GACHABASE_STATS = {
  1: 'HP',
  2: 'ATK',
  3: 'DEF',
  21: 'HP%',
  22: 'ATK%',
  23: 'DEF%',
  31: 'Physical DMG%',
  32: 'Fire DMG%',
  33: 'Ice DMG%',
  34: 'Lightning DMG%',
  35: 'Wind DMG%',
  36: 'Quantum DMG%',
  37: 'Imaginary DMG%',
  41: 'Break Effect%',
  42: 'Outgoing Healing Boost%',
  43: 'Max Energy',
  44: 'Energy Regeneration Rate%',
  45: 'Effect Hit Rate%',
  46: 'Effect RES%',
  51: 'SPD',
  52: 'CRIT Rate%',
  53: 'CRIT DMG%'
};

/**
 * Strips rich-text tags like <color=#f29e38ff>, </color>, <b>, </b> from text strings
 */
export function cleanRichText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<color=[^>]+>/gi, '')
    .replace(/<\/color>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\\n/g, '\n')
    .trim();
}

/**
 * Parses user input into normalized search parameters
 * Handles full URLs or raw IDs
 */
export function parseGachabaseInput(input, typeHint = 'character', branch = 'beta', lang = 'en') {
  const trimmed = (input || '').trim();
  if (!trimmed) return null;

  // Check if input is a full URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const urlObj = new URL(trimmed);
      const pathname = urlObj.pathname.toLowerCase();
      let detectedType = typeHint;
      if (pathname.includes('/characters/') || pathname.includes('/character/')) detectedType = 'character';
      else if (pathname.includes('/lightcones/') || pathname.includes('/lightcone/')) detectedType = 'lightcone';
      else if (pathname.includes('/relics/') || pathname.includes('/relic/')) detectedType = 'relic';

      // Pattern: /type/:id/:slug?/:branch?
      const parts = pathname.split('/').filter(Boolean);
      // Expected: ['characters', '1511', 'aeon-aha', 'beta']
      let id = null;
      let detectedBranch = urlObj.searchParams.get('branch') || branch;
      let detectedLang = urlObj.searchParams.get('lang') || lang;

      if (parts.length >= 2) {
        id = parseInt(parts[1], 10);
      }
      if (parts.length >= 4) {
        detectedBranch = parts[3];
      }

      return {
        url: trimmed,
        id: id || null,
        type: detectedType,
        branch: detectedBranch || 'beta',
        lang: detectedLang || 'en'
      };
    } catch (e) {
      // Fall through to ID parsing
    }
  }

  // Treat as numeric ID
  const numId = parseInt(trimmed, 10);
  if (!isNaN(numId)) {
    let resolvedType = typeHint;
    // Auto-guess type if default wasn't explicitly changed
    if (numId >= 20000 && numId < 30000) resolvedType = 'lightcone';
    else if (numId < 1000) resolvedType = 'relic';
    else if (numId >= 1000 && numId < 9000) resolvedType = 'character';

    const typeSlug = resolvedType === 'lightcone' ? 'lightcones' : (resolvedType === 'relic' ? 'relics' : 'characters');
    const url = `${GACHABASE_BASE_URL}/${typeSlug}/${numId}/slug/${branch}?lang=${lang}`;

    return {
      url,
      id: numId,
      type: resolvedType,
      branch: branch || 'beta',
      lang: lang || 'en'
    };
  }

  return null;
}

/**
 * Fetches Gachabase HTML content
 * Uses GaC-hkrpg-go API proxy if available to avoid CORS, falls back to direct fetch
 */
export async function fetchGachabaseHtml(targetUrl, apiUrl = 'http://localhost:21000') {
  if (!targetUrl) throw new Error('Target URL is required for Gachabase fetch');

  // 1. Try Backend Proxy
  if (apiUrl) {
    try {
      const cleanApi = apiUrl.replace(/\/+$/, '');
      const proxyUrl = `${cleanApi}/api/gachabase/fetch?url=${encodeURIComponent(targetUrl)}`;
      const resp = await fetch(proxyUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (resp.ok) {
        const json = await resp.json();
        if (json && json.html) {
          return { html: json.html, finalUrl: json.url || targetUrl };
        }
      }
    } catch (err) {
      console.warn('Backend Gachabase proxy unreachable, attempting direct fetch...', err);
    }
  }

  // 2. Direct fetch fallback (works if user has CORS unblocker or runs in local browser environment)
  const directResp = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });
  if (!directResp.ok) {
    throw new Error(`Direct fetch failed with status ${directResp.status}`);
  }
  const html = await directResp.text();
  return { html, finalUrl: targetUrl };
}

/**
 * Extracts and parses serialized SvelteKit DTO and refs from Gachabase HTML
 */
export function parseGachabaseHtml(html, fallbackLang = 'en') {
  if (!html || typeof html !== 'string') {
    throw new Error('Invalid HTML content received from Gachabase');
  }

  // Look for kit.start(...) serialized state in <script>
  let kitJson = null;
  const kitMatch = html.match(/kit\.start\(app,\s*element,\s*(\{.*?\})\);\s*\}\);/s);
  if (kitMatch && kitMatch[1]) {
    kitJson = kitMatch[1];
  } else {
    // Alternate pattern in newer or minified builds
    const altMatch = html.match(/kit\.start\(app,\s*element,\s*(\{[\s\S]*?\})\s*\);/);
    if (altMatch && altMatch[1]) {
      kitJson = altMatch[1];
    }
  }

  if (!kitJson) {
    throw new Error('Could not find SvelteKit data payload in Gachabase HTML');
  }

  let kitData;
  try {
    const fn = new Function('return (' + kitJson + ')');
    kitData = fn();
  } catch (err) {
    throw new Error('Failed to evaluate Gachabase state payload: ' + err.message);
  }

  if (!kitData || !Array.isArray(kitData.data)) {
    throw new Error('Gachabase kitData does not contain data array');
  }

  // Search for the entry containing dto and refs
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
    throw new Error('Gachabase DTO object not found in payload');
  }

  const dto = targetData.dto;
  const refs = targetData.refs || {};
  const assetsMap = refs.assets || {};
  const pathsMap = refs.paths || {};
  const typesMap = refs.types || {};

  // Resolve CDN URL helper
  const resolveAsset = (hash) => {
    if (!hash) return null;
    if (assetsMap[hash] && assetsMap[hash].url) {
      return assetsMap[hash].url;
    }
    return `${GACHABASE_CDN_URL}/hsr/assets/${hash}.png`;
  };

  const id = dto.id;
  const rawName = dto.name?.text || dto.name || `Item ${id}`;
  const rarity = dto.rarity || 5;

  // Path resolution
  const pathId = dto.path_id || 0;
  const rawPath = pathsMap[pathId]?.name?.text || GACHABASE_PATHS[pathId] || 'Unknown';

  // Type / Element resolution
  const typeId = dto.type_id || 0;
  const rawElement = typesMap[typeId]?.name?.text || GACHABASE_ELEMENTS[typeId] || 'Unknown';

  // Determine Item Type
  let itemType = 'character';
  if (dto.skills !== undefined || dto.eidolons !== undefined || dto.max_energy !== undefined) {
    itemType = 'character';
  } else if (dto.skill !== undefined || (id >= 20000 && id < 30000)) {
    itemType = 'lightcone';
  } else if (id < 1000) {
    itemType = 'relic';
  }

  // Images resolution
  const images = {
    splash: resolveAsset(dto.assets?.splash_art_path_hash) || resolveAsset(dto.assets?.draw_card_art_path_hash),
    icon: resolveAsset(dto.assets?.round_icon_path_hash) || resolveAsset(dto.assets?.small_icon_path_hash) || resolveAsset(dto.assets?.icon_path_hash),
    square: resolveAsset(dto.assets?.square_icon_path_hash) || resolveAsset(dto.assets?.big_icon_path_hash),
    fullArt: resolveAsset(dto.assets?.full_art_path_hash) || resolveAsset(dto.assets?.splash_art_path_hash),
    thumbnail: resolveAsset(dto.assets?.thumbnail_art_path_hash) || resolveAsset(dto.assets?.big_icon_path_hash)
  };

  // Skills parsing (for characters)
  const skills = [];
  if (Array.isArray(dto.skills)) {
    dto.skills.forEach(s => {
      skills.push({
        id: s.id,
        type: s.type?.text || s.type || 'Skill',
        name: s.name?.text || s.name || '',
        tag: s.tag?.text || s.tag || '',
        description: cleanRichText(s.description?.text || s.description || ''),
        icon: resolveAsset(s.icon_path_hash)
      });
    });
  }

  // Eidolons parsing (for characters)
  const eidolons = [];
  if (Array.isArray(dto.eidolons)) {
    dto.eidolons.forEach((e, idx) => {
      eidolons.push({
        rank: e.rank || idx + 1,
        name: e.name?.text || e.name || `Eidolon ${idx + 1}`,
        description: cleanRichText(e.description?.text || e.description || ''),
        icon: resolveAsset(e.icon_path_hash) || resolveAsset(dto.assets?.[`eidolon_${idx + 1}_path_hash`])
      });
    });
  }

  // Lightcone skill (for lightcones)
  let lcSkill = null;
  if (dto.skill) {
    lcSkill = {
      name: dto.skill.name?.text || dto.skill.name || '',
      description: cleanRichText(dto.skill.description?.text || dto.skill.description || '')
    };
  }

  // Build recommendations
  const rec = dto.build_recommendations || {};
  const recommendedRelics = rec.relics?.relic_ids || [];
  const cavernSets = recommendedRelics.filter(rId => rId < 300);
  const planarSets = recommendedRelics.filter(rId => rId >= 300);

  // Recommended Lightcones
  const recommendedLcs = (Array.isArray(rec.lightcone_ids) ? rec.lightcone_ids : (rec.lightcones || []).map(lc => lc.lightcone_id)).filter(Boolean);

  // Main stats recommendations
  const mainStats = {};
  if (Array.isArray(rec.relics?.main_stats)) {
    rec.relics.main_stats.forEach(m => {
      const pieceId = m.piece_type_id; // 3=Body, 4=Boots, 5=Sphere, 6=Rope
      const stats = (m.stat_ids || []).map(sid => GACHABASE_STATS[sid] || `Stat ${sid}`);
      mainStats[pieceId] = stats;
    });
  }

  // Sub stats recommendations
  const subStats = (rec.relics?.sub_stat_ids || []).map(sid => GACHABASE_STATS[sid] || `Stat ${sid}`);

  return {
    id,
    type: itemType,
    name: rawName,
    rarity,
    path: rawPath,
    pathId,
    element: rawElement,
    typeId,
    maxEnergy: dto.max_energy || 0,
    images,
    skills,
    eidolons,
    lcSkill,
    recommended: {
      relicIds: recommendedRelics,
      cavernSets,
      planarSets,
      lightconeIds: recommendedLcs,
      signatureLcId: recommendedLcs[0] || null,
      mainStats,
      subStats
    },
    rawDto: dto
  };
}

/**
 * Registers parsed item into tool runtime metadata and saves to IndexedDB
 */
export async function registerGachabaseItem(parsedItem, metadataContext = {}) {
  const {
    AVATAR_METADATA,
    LIGHTCONE_METADATA,
    RELIC_SET_METADATA,
    SIGNATURE_LIGHTCONES,
    idbSet
  } = metadataContext;

  const id = parsedItem.id;
  const lang = parsedItem.lang || 'en';

  if (parsedItem.type === 'character' && AVATAR_METADATA) {
    if (!AVATAR_METADATA[id]) {
      AVATAR_METADATA[id] = {
        names: {
          th: parsedItem.name,
          en: parsedItem.name
        },
        path: parsedItem.path,
        element: parsedItem.element,
        rarity: parsedItem.rarity,
        hasExRank: false,
        isCustomGachabase: true,
        images: parsedItem.images
      };
    } else {
      // Update existing entry with high-res images and enriched data
      AVATAR_METADATA[id].names = AVATAR_METADATA[id].names || {};
      AVATAR_METADATA[id].names[lang] = parsedItem.name;
      AVATAR_METADATA[id].names.en = AVATAR_METADATA[id].names.en || parsedItem.name;
      AVATAR_METADATA[id].path = parsedItem.path;
      AVATAR_METADATA[id].element = parsedItem.element;
      AVATAR_METADATA[id].rarity = parsedItem.rarity;
      AVATAR_METADATA[id].images = parsedItem.images;
    }

    if (SIGNATURE_LIGHTCONES && parsedItem.recommended.signatureLcId) {
      SIGNATURE_LIGHTCONES[id] = parsedItem.recommended.signatureLcId;
    }
  } else if (parsedItem.type === 'lightcone' && LIGHTCONE_METADATA) {
    if (!LIGHTCONE_METADATA[id]) {
      LIGHTCONE_METADATA[id] = {
        names: {
          th: parsedItem.name,
          en: parsedItem.name
        },
        rarity: parsedItem.rarity,
        path: parsedItem.path,
        isCustomGachabase: true,
        images: parsedItem.images
      };
    } else {
      LIGHTCONE_METADATA[id].names = LIGHTCONE_METADATA[id].names || {};
      LIGHTCONE_METADATA[id].names[lang] = parsedItem.name;
      LIGHTCONE_METADATA[id].path = parsedItem.path;
      LIGHTCONE_METADATA[id].rarity = parsedItem.rarity;
      LIGHTCONE_METADATA[id].images = parsedItem.images;
    }
  }

  // Persist to IndexedDB
  if (idbSet) {
    try {
      const cacheKey = `gac_gachabase_item_${parsedItem.type}_${id}`;
      await idbSet(cacheKey, parsedItem);

      // Also append to custom items registry
      const regKey = 'gac_gachabase_registry';
      const existing = (await (metadataContext.idbGet ? metadataContext.idbGet(regKey) : null)) || [];
      const filtered = existing.filter(i => !(i.type === parsedItem.type && i.id === parsedItem.id));
      filtered.push({
        type: parsedItem.type,
        id: parsedItem.id,
        name: parsedItem.name,
        path: parsedItem.path,
        element: parsedItem.element,
        rarity: parsedItem.rarity,
        cacheKey
      });
      await idbSet(regKey, filtered);
    } catch (e) {
      console.warn('Failed to save Gachabase item to IndexedDB:', e);
    }
  }

  return parsedItem;
}

/**
 * Loads all cached Gachabase items from IndexedDB into runtime metadata
 */
export async function loadCachedGachabaseRegistry(metadataContext = {}) {
  const {
    AVATAR_METADATA,
    LIGHTCONE_METADATA,
    SIGNATURE_LIGHTCONES,
    idbGet
  } = metadataContext;

  if (!idbGet) return;

  try {
    const registry = await idbGet('gac_gachabase_registry');
    if (!Array.isArray(registry)) return;

    for (const itemMeta of registry) {
      const fullItem = await idbGet(itemMeta.cacheKey);
      if (fullItem) {
        await registerGachabaseItem(fullItem, metadataContext);
      }
    }
    console.log(`[Gachabase] Successfully loaded ${registry.length} cached items from IndexedDB.`);
  } catch (err) {
    console.warn('[Gachabase] Failed to restore cached items from IndexedDB:', err);
  }
}

/**
 * Applies parsed Gachabase character, lightcone, or relics into FreeSR data structure
 */
export function applyGachabaseToFreeSR(parsedItem, fullFreesrData, options = {}) {
  if (!fullFreesrData) {
    throw new Error('FreeSR data is not initialized');
  }

  fullFreesrData.avatars = fullFreesrData.avatars || {};
  fullFreesrData.lightcones = fullFreesrData.lightcones || [];
  fullFreesrData.relics = fullFreesrData.relics || [];

  const eLevel = options.eLevel !== undefined ? options.eLevel : 0; // 0 or 6
  const sLevel = options.sLevel !== undefined ? options.sLevel : 1; // 1 or 5
  const autoEquipLc = options.autoEquipLc !== false;
  const autoEquipRelics = options.autoEquipRelics !== false;

  const results = {
    avatarAdded: false,
    lcAdded: false,
    relicsAdded: 0
  };

  // If character:
  if (parsedItem.type === 'character') {
    const aid = parsedItem.id;

    // Generate maxed traces & skills map
    const skillsMap = {};
    if (Array.isArray(parsedItem.skills) && parsedItem.skills.length > 0) {
      parsedItem.skills.forEach(s => {
        if (s.id) {
          skillsMap[String(s.id)] = 10;
        }
      });
    }
    // Add standard fallback combat traces
    skillsMap[`${aid}001`] = 6;  // Basic ATK
    skillsMap[`${aid}002`] = 10; // Skill
    skillsMap[`${aid}003`] = 10; // Ultimate
    skillsMap[`${aid}004`] = 10; // Talent
    skillsMap[`${aid}007`] = 1;  // Technique

    if (!fullFreesrData.avatars[aid]) {
      fullFreesrData.avatars[aid] = {
        owner_uid: 0,
        avatar_id: aid,
        level: 80,
        promotion: 6,
        techniques: [],
        sp_max: parsedItem.maxEnergy || 140,
        sp_value: Math.floor((parsedItem.maxEnergy || 140) / 2),
        data: {
          rank: eLevel,
          skills: skillsMap
        }
      };
    } else {
      const av = fullFreesrData.avatars[aid];
      av.level = 80;
      av.promotion = 6;
      av.data = av.data || {};
      av.data.rank = eLevel;
      av.data.skills = Object.assign(av.data.skills || {}, skillsMap);
    }
    results.avatarAdded = true;

    // Equip Signature Lightcone if available
    const sigLcId = parsedItem.recommended.signatureLcId || (options.sigLcId || null);
    if (autoEquipLc && sigLcId) {
      // Check if this character already has an LC
      let existingLc = fullFreesrData.lightcones.find(l => l.equip_avatar === aid);
      if (existingLc) {
        existingLc.item_id = sigLcId;
        existingLc.level = 80;
        existingLc.promotion = 6;
        existingLc.rank = sLevel;
      } else {
        const nextUid = (fullFreesrData.lightcones.reduce((m, l) => Math.max(m, l.unique_id || 0), 0)) + 1;
        fullFreesrData.lightcones.push({
          unique_id: nextUid,
          item_id: sigLcId,
          level: 80,
          promotion: 6,
          rank: sLevel,
          equip_avatar: aid
        });
      }
      results.lcAdded = true;
    }

    // Equip Recommended Relics if available
    if (autoEquipRelics && (parsedItem.recommended.cavernSets.length > 0 || parsedItem.recommended.planarSets.length > 0)) {
      // Clear existing relics on this character
      fullFreesrData.relics = fullFreesrData.relics.filter(r => r.equip_avatar !== aid);

      const cavernSet = parsedItem.recommended.cavernSets[0] || 121;
      const planarSet = parsedItem.recommended.planarSets[0] || 310;
      let nextRelicUid = (fullFreesrData.relics.reduce((m, r) => Math.max(m, r.internal_uid || 0), 0)) + 1;

      // 6 relic slots
      for (let slot = 1; slot <= 6; slot++) {
        const setId = slot <= 4 ? cavernSet : planarSet;
        const relicId = 60000 + (setId * 10) + slot;

        // Default smart main stats
        let mainAffixId = 1;
        if (slot === 3) mainAffixId = 5; // CRIT Rate% / ATK%
        else if (slot === 4) mainAffixId = 5; // SPD / ATK%
        else if (slot === 5) mainAffixId = 6; // Elemental DMG%
        else if (slot === 6) mainAffixId = 4; // Energy Regen% / ATK%

        fullFreesrData.relics.push({
          internal_uid: nextRelicUid++,
          relic_id: relicId,
          level: 15,
          equip_avatar: aid,
          main_affix_id: mainAffixId,
          sub_affixes: [
            { sub_affix_id: 1, cnt: 2, step: 2 },
            { sub_affix_id: 2, cnt: 3, step: 2 },
            { sub_affix_id: 3, cnt: 2, step: 2 },
            { sub_affix_id: 4, cnt: 2, step: 2 }
          ]
        });
        results.relicsAdded++;
      }
    }
  } else if (parsedItem.type === 'lightcone') {
    // Add standalone lightcone to inventory
    const nextUid = (fullFreesrData.lightcones.reduce((m, l) => Math.max(m, l.unique_id || 0), 0)) + 1;
    fullFreesrData.lightcones.push({
      unique_id: nextUid,
      item_id: parsedItem.id,
      level: 80,
      promotion: 6,
      rank: sLevel,
      equip_avatar: 0
    });
    results.lcAdded = true;
  }

  return results;
}
