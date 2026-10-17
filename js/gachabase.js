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
  return `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/image/light_cone_preview/${id}.png`;
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
 * Robust error handler for Avatar Full Portrait / Splash Art
 * Falls back through:
 *  0. jsDelivr StarRailRes character_portrait (2048x2048 splash)
 *  1. jsDelivr StarRailRes character_drawing (transparent full body art)
 *  2. Raw GitHub character_portrait
 *  3. Raw GitHub character_drawing
 *  4. Gachabase splash cache
 *  5. jsDelivr avatar icon (visual fallback rather than blank)
 */
export function handleAvatarPortraitError(img, avatarId) {
  if (!img) return;
  const id = parseInt(avatarId, 10);
  const step = parseInt(img.getAttribute('data-err-step') || '0', 10);

  if (step === 0) {
    img.setAttribute('data-err-step', '1');
    const portraitUrl = `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/image/character_portrait/${id}.png`;
    if (img.src !== portraitUrl) {
      img.src = portraitUrl;
      return;
    }
  }

  if (step <= 1) {
    img.setAttribute('data-err-step', '2');
    const drawingUrl = `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/image/character_drawing/${id}.png`;
    if (img.src !== drawingUrl) {
      img.src = drawingUrl;
      return;
    }
  }

  if (step <= 2) {
    img.setAttribute('data-err-step', '3');
    const rawPortrait = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/character_portrait/${id}.png`;
    if (img.src !== rawPortrait) {
      img.src = rawPortrait;
      return;
    }
  }

  if (step <= 3) {
    img.setAttribute('data-err-step', '4');
    const gachaSplash = GACHABASE_IMAGE_CACHE.avatarSplash?.[id] || KNOWN_GACHABASE_ASSETS.avatarSplash?.[id];
    if (gachaSplash && img.src !== gachaSplash) {
      img.src = gachaSplash;
      return;
    }
  }

  // Step 4+: Visual fallback to avatar icon rather than ever leaving the portrait black/blank
  img.setAttribute('data-err-step', '5');
  const iconUrl = `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/avatar/${id}.png`;
  if (img.src !== iconUrl) {
    img.src = iconUrl;
    img.style.objectFit = 'contain';
  }
}

/**
 * Robust error handler for Avatar images
 * Falls back through: jsDelivr StarRailRes -> Raw GitHub -> Gachabase CDN -> Letter Placeholder
 */
export function handleAvatarImgError(img, avatarId) {
  if (!img) return;
  const id = parseInt(avatarId, 10);
  const step = parseInt(img.getAttribute('data-err-step') || '0', 10);

  if (step === 0) {
    img.setAttribute('data-err-step', '1');
    img.src = `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/avatar/${id}.png`;
  } else if (step === 1) {
    img.setAttribute('data-err-step', '2');
    img.src = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/avatar/${id}.png`;
  } else if (step === 2) {
    img.setAttribute('data-err-step', '3');
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
 * Falls back through: jsDelivr StarRailRes -> Raw GitHub -> Gachabase CDN -> Default Logo
 */
export function handleLcImgError(img, lcId) {
  if (!img) return;
  const id = parseInt(lcId, 10);
  const step = parseInt(img.getAttribute('data-err-step') || '0', 10);

  if (step === 0) {
    img.setAttribute('data-err-step', '1');
    img.src = `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/image/light_cone_preview/${id}.png`;
  } else if (step === 1) {
    img.setAttribute('data-err-step', '2');
    img.src = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/light_cone_preview/${id}.png`;
  } else if (step === 2) {
    img.setAttribute('data-err-step', '3');
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
