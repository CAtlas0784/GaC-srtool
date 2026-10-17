// Gachabase Data Fetcher, Catalog Sync & Image Engine for GaC-srtool
// Connects with hsr.gachabase.net to dynamically update characters, lightcones,
// and high-res assets whenever the game updates or new patches/betas drop.

export const GACHABASE_BASE_URL = 'https://hsr.gachabase.net';
export const GACHABASE_CDN_URL = 'https://cdn.gachabase.net';

// Pre-mapped known beta / newest assets from Gachabase CDN
export const KNOWN_GACHABASE_ASSETS = {
  avatars: {
    1501: 'https://cdn.gachabase.net/hsr/assets/09ee6e2618ac2a0dab2aec8d73b0bb01.png', // Sparxie
    1502: 'https://cdn.gachabase.net/hsr/assets/8ca2530c42791593b72d54a850fce97e.png', // Yao Guang
    1505: 'https://cdn.gachabase.net/hsr/assets/723a90e789fd354fb96b450a90c73e30.png', // Evanescia
    1506: 'https://cdn.gachabase.net/hsr/assets/0cbfb275bfef439b16ba6ff9f848eb3a.png', // Silver Wolf Collab
    1511: 'https://cdn.gachabase.net/hsr/assets/2be49dbbe7cfe8f77187dcfea51d9863.png', // Aeon ★ Aha
    1513: 'https://cdn.gachabase.net/hsr/assets/2fdf5d4fe6eb998064438ffd373ce95f.png', // Aventurine • Waveflair
  },
  avatarSplash: {
    1511: 'https://cdn.gachabase.net/hsr/assets/f8b5630e85022ab8b2761e4e3f614b42.png', // Aha Splash Art (2048x1914)
    1513: 'https://cdn.gachabase.net/hsr/assets/65b90212f8623ad92243d739ea1fc9ec.png', // Waveflair Splash
    1505: 'https://cdn.gachabase.net/hsr/assets/71cbe3943310cb233e8dbe6ef69caeb1.png', // Evanescia Splash
    1502: 'https://cdn.gachabase.net/hsr/assets/8ca2530c42791593b72d54a850fce97e.png', // Yao Guang
    1501: 'https://cdn.gachabase.net/hsr/assets/09ee6e2618ac2a0dab2aec8d73b0bb01.png', // Sparxie
  },
  lightcones: {
    23065: 'https://cdn.gachabase.net/hsr/assets/500cfc18698932759756f6b3ba4db417.png', // Upon the First Echo of "Aha" Full Art
  },
  lightconeThumbs: {
    23065: 'https://cdn.gachabase.net/hsr/assets/c794417a81e656bfdf1212202230f80f.png', // Aha LC Thumbnail
  }
};

// Global in-memory image cache populated dynamically from Gachabase catalogs
export const GACHABASE_IMAGE_CACHE = {
  avatars: { ...KNOWN_GACHABASE_ASSETS.avatars },
  avatarSplash: { ...KNOWN_GACHABASE_ASSETS.avatarSplash },
  lightcones: { ...KNOWN_GACHABASE_ASSETS.lightcones },
  lightconeThumbs: { ...KNOWN_GACHABASE_ASSETS.lightconeThumbs }
};

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
 * Fetches HTML from targetUrl via backend API proxy or direct fetch
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

  // 2. Direct fetch fallback
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
 * Parses SvelteKit streamed data payload from Gachabase catalog listing pages
 */
export function parseSvelteKitCatalog(html) {
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
        } catch (e) {
          console.warn('Failed to parse catalog script:', e);
        }
      }
    }
  }
  return null;
}

/**
 * Automatically synchronizes the full game database from Gachabase
 * Pulls all characters and lightcones, adds missing ones into metadata,
 * and caches all Gachabase CDN asset URLs for seamless rendering.
 */
export async function syncGachabaseDatabase({ apiUrl, branch = 'beta', lang = 'en', metadataContext }) {
  const {
    AVATAR_METADATA,
    LIGHTCONE_METADATA,
    SIGNATURE_LIGHTCONES,
    idbSet,
    idbGet
  } = metadataContext;

  const charactersUrl = `${GACHABASE_BASE_URL}/characters?lang=${lang}&branch=${branch}`;
  const lightconesUrl = `${GACHABASE_BASE_URL}/lightcones?lang=${lang}&branch=${branch}`;

  let newAvatarsCount = 0;
  let newLcsCount = 0;
  let totalAvatarsCount = 0;
  let totalLcsCount = 0;

  // 1. Fetch & Parse Characters Catalog
  try {
    const { html: charHtml } = await fetchGachabaseHtml(charactersUrl, apiUrl);
    const charData = parseSvelteKitCatalog(charHtml);

    if (charData && Array.isArray(charData.entries)) {
      totalAvatarsCount = charData.entries.length;
      const assetsMap = charData.refs?.assets || {};

      for (const entry of charData.entries) {
        const aid = entry.id;
        const hash = entry.assets?.square_icon_path_hash || entry.assets?.round_icon_path_hash;
        const iconUrl = assetsMap[hash]?.url || KNOWN_GACHABASE_ASSETS.avatars[aid] || `${GACHABASE_CDN_URL}/hsr/assets/${hash}.png`;

        if (iconUrl) {
          GACHABASE_IMAGE_CACHE.avatars[aid] = iconUrl;
        }

        // Register new / missing characters into AVATAR_METADATA
        if (AVATAR_METADATA && !AVATAR_METADATA[aid]) {
          const charName = entry.name?.text || entry.name || `Avatar ${aid}`;
          const pathName = GACHABASE_PATHS[entry.path_id] || 'Unknown';
          const elementName = GACHABASE_ELEMENTS[entry.type_id] || 'Unknown';

          AVATAR_METADATA[aid] = {
            names: {
              th: charName,
              en: charName,
              'zh-CN': charName
            },
            path: pathName,
            element: elementName,
            rarity: entry.rarity || 5,
            hasExRank: false,
            isGachabaseSync: true,
            images: {
              icon: iconUrl,
              square: iconUrl
            }
          };
          newAvatarsCount++;
        } else if (AVATAR_METADATA && AVATAR_METADATA[aid]) {
          // Enrich existing metadata with Gachabase CDN image
          AVATAR_METADATA[aid].images = AVATAR_METADATA[aid].images || {};
          if (iconUrl) AVATAR_METADATA[aid].images.icon = iconUrl;
        }
      }
    }
  } catch (err) {
    console.error('Failed to sync characters from Gachabase:', err);
    throw new Error('ไม่สามารถซิงค์ตัวละครจาก Gachabase ได้: ' + err.message);
  }

  // 2. Fetch & Parse Lightcones Catalog
  try {
    const { html: lcHtml } = await fetchGachabaseHtml(lightconesUrl, apiUrl);
    const lcData = parseSvelteKitCatalog(lcHtml);

    if (lcData && Array.isArray(lcData.entries)) {
      totalLcsCount = lcData.entries.length;
      const assetsMap = lcData.refs?.assets || {};

      for (const entry of lcData.entries) {
        const lcid = entry.id;
        const thumbHash = entry.assets?.thumbnail_art_path_hash || entry.assets?.small_icon_path_hash;
        const fullArtHash = entry.assets?.full_art_path_hash || entry.assets?.big_icon_path_hash;

        const thumbUrl = assetsMap[thumbHash]?.url || KNOWN_GACHABASE_ASSETS.lightconeThumbs[lcid];
        const fullArtUrl = assetsMap[fullArtHash]?.url || KNOWN_GACHABASE_ASSETS.lightcones[lcid];

        if (thumbUrl) GACHABASE_IMAGE_CACHE.lightconeThumbs[lcid] = thumbUrl;
        if (fullArtUrl) GACHABASE_IMAGE_CACHE.lightcones[lcid] = fullArtUrl;

        // Register new / missing lightcones into LIGHTCONE_METADATA
        if (LIGHTCONE_METADATA && !LIGHTCONE_METADATA[lcid]) {
          const lcName = entry.name?.text || entry.name || `Lightcone ${lcid}`;
          const pathName = GACHABASE_PATHS[entry.path_id] || 'Unknown';

          LIGHTCONE_METADATA[lcid] = {
            names: {
              th: lcName,
              en: lcName,
              'zh-CN': lcName
            },
            rarity: entry.rarity || 5,
            path: pathName,
            isGachabaseSync: true,
            images: {
              thumbnail: thumbUrl,
              fullArt: fullArtUrl
            }
          };
          newLcsCount++;
        } else if (LIGHTCONE_METADATA && LIGHTCONE_METADATA[lcid]) {
          LIGHTCONE_METADATA[lcid].images = LIGHTCONE_METADATA[lcid].images || {};
          if (thumbUrl) LIGHTCONE_METADATA[lcid].images.thumbnail = thumbUrl;
          if (fullArtUrl) LIGHTCONE_METADATA[lcid].images.fullArt = fullArtUrl;
        }
      }
    }
  } catch (err) {
    console.error('Failed to sync lightcones from Gachabase:', err);
    throw new Error('ไม่สามารถซิงค์กรวยแสงจาก Gachabase ได้: ' + err.message);
  }

  // 3. Save cache to IndexedDB
  if (idbSet) {
    try {
      await idbSet('gac_gachabase_image_cache', GACHABASE_IMAGE_CACHE);
      await idbSet('gac_gachabase_last_sync', {
        timestamp: Date.now(),
        newAvatarsCount,
        newLcsCount,
        totalAvatarsCount,
        totalLcsCount
      });
    } catch (e) {
      console.warn('Failed to cache Gachabase database to IndexedDB:', e);
    }
  }

  return {
    newAvatarsCount,
    newLcsCount,
    totalAvatarsCount,
    totalLcsCount
  };
}

/**
 * Loads cached Gachabase images and metadata from IndexedDB
 */
export async function loadCachedGachabaseData(metadataContext = {}) {
  const { idbGet, AVATAR_METADATA, LIGHTCONE_METADATA } = metadataContext;
  if (!idbGet) return;

  try {
    const cachedImages = await idbGet('gac_gachabase_image_cache');
    if (cachedImages) {
      if (cachedImages.avatars) Object.assign(GACHABASE_IMAGE_CACHE.avatars, cachedImages.avatars);
      if (cachedImages.avatarSplash) Object.assign(GACHABASE_IMAGE_CACHE.avatarSplash, cachedImages.avatarSplash);
      if (cachedImages.lightcones) Object.assign(GACHABASE_IMAGE_CACHE.lightcones, cachedImages.lightcones);
      if (cachedImages.lightconeThumbs) Object.assign(GACHABASE_IMAGE_CACHE.lightconeThumbs, cachedImages.lightconeThumbs);
    }

    // Attach cached image links to metadata
    if (AVATAR_METADATA) {
      for (const aid in GACHABASE_IMAGE_CACHE.avatars) {
        if (AVATAR_METADATA[aid]) {
          AVATAR_METADATA[aid].images = AVATAR_METADATA[aid].images || {};
          AVATAR_METADATA[aid].images.icon = GACHABASE_IMAGE_CACHE.avatars[aid];
        }
      }
    }
    if (LIGHTCONE_METADATA) {
      for (const lcid in GACHABASE_IMAGE_CACHE.lightcones) {
        if (LIGHTCONE_METADATA[lcid]) {
          LIGHTCONE_METADATA[lcid].images = LIGHTCONE_METADATA[lcid].images || {};
          LIGHTCONE_METADATA[lcid].images.fullArt = GACHABASE_IMAGE_CACHE.lightcones[lcid];
          LIGHTCONE_METADATA[lcid].images.thumbnail = GACHABASE_IMAGE_CACHE.lightconeThumbs[lcid];
        }
      }
    }
  } catch (err) {
    console.warn('Failed to restore Gachabase cache from IndexedDB:', err);
  }
}

/**
 * Image resolver for avatars
 * Prioritizes local asset, falls back to Gachabase CDN
 */
export function getAvatarIconUrl(avatarId) {
  const id = parseInt(avatarId, 10);
  if (GACHABASE_IMAGE_CACHE.avatars[id]) {
    return GACHABASE_IMAGE_CACHE.avatars[id];
  }
  if (KNOWN_GACHABASE_ASSETS.avatars[id]) {
    return KNOWN_GACHABASE_ASSETS.avatars[id];
  }
  return `./assets/avatars/${id}.png`;
}

/**
 * Image resolver for lightcones
 */
export function getLightconeArtUrl(lcId) {
  const id = parseInt(lcId, 10);
  if (GACHABASE_IMAGE_CACHE.lightcones[id]) {
    return GACHABASE_IMAGE_CACHE.lightcones[id];
  }
  if (KNOWN_GACHABASE_ASSETS.lightcones[id]) {
    return KNOWN_GACHABASE_ASSETS.lightcones[id];
  }
  if (id === 23065) {
    return './assets/lightcones/23065.png';
  }
  return `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/light_cone_preview/${id}.png`;
}

/**
 * Image resolver for lightcone thumbnails
 */
export function getLightconeThumbUrl(lcId) {
  const id = parseInt(lcId, 10);
  if (GACHABASE_IMAGE_CACHE.lightconeThumbs[id]) {
    return GACHABASE_IMAGE_CACHE.lightconeThumbs[id];
  }
  if (KNOWN_GACHABASE_ASSETS.lightconeThumbs[id]) {
    return KNOWN_GACHABASE_ASSETS.lightconeThumbs[id];
  }
  return getLightconeArtUrl(lcId);
}

/**
 * Robust error handler for Avatar images
 * Falls back through: Local Asset -> StarRailRes -> Gachabase CDN -> Letter Placeholder
 */
export function handleAvatarImgError(img, avatarId) {
  if (!img) return;
  const id = parseInt(avatarId, 10);
  const step = parseInt(img.getAttribute('data-err-step') || '0', 10);

  if (step === 0) {
    img.setAttribute('data-err-step', '1');
    img.src = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/avatar/${id}.png`;
  } else if (step === 1) {
    img.setAttribute('data-err-step', '2');
    const gachaUrl = GACHABASE_IMAGE_CACHE.avatars[id] || KNOWN_GACHABASE_ASSETS.avatars[id];
    if (gachaUrl && img.src !== gachaUrl) {
      img.src = gachaUrl;
    } else {
      img.style.display = 'none';
      if (img.nextElementSibling && img.nextElementSibling.classList.contains('avatar-icon-placeholder')) {
        img.nextElementSibling.style.display = 'flex';
      }
    }
  } else {
    img.style.display = 'none';
    if (img.nextElementSibling && img.nextElementSibling.classList.contains('avatar-icon-placeholder')) {
      img.nextElementSibling.style.display = 'flex';
    }
  }
}

/**
 * Robust error handler for Lightcone images
 * Falls back through: Local Asset -> StarRailRes -> Gachabase CDN -> Default Logo
 */
export function handleLcImgError(img, lcId) {
  if (!img) return;
  const id = parseInt(lcId, 10);
  const step = parseInt(img.getAttribute('data-err-step') || '0', 10);

  if (step === 0) {
    img.setAttribute('data-err-step', '1');
    img.src = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/light_cone_preview/${id}.png`;
  } else if (step === 1) {
    img.setAttribute('data-err-step', '2');
    const gachaUrl = GACHABASE_IMAGE_CACHE.lightcones[id] || KNOWN_GACHABASE_ASSETS.lightcones[id] || GACHABASE_IMAGE_CACHE.lightconeThumbs[id] || KNOWN_GACHABASE_ASSETS.lightconeThumbs[id];
    if (gachaUrl && img.src !== gachaUrl) {
      img.src = gachaUrl;
    } else {
      img.src = './assets/logo.png';
    }
  } else {
    img.src = './assets/logo.png';
  }
}
